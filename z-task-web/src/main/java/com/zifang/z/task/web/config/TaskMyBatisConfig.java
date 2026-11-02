package com.zifang.z.task.web.config;

import com.baomidou.mybatisplus.core.config.GlobalConfig;
import com.baomidou.mybatisplus.core.handlers.MetaObjectHandler;
import com.baomidou.mybatisplus.extension.spring.MybatisSqlSessionFactoryBean;
import com.zifang.z.boot.datasource.starter.ModuleDataSourceTemplate;
import org.apache.ibatis.session.SqlSessionFactory;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.beans.factory.NoSuchBeanDefinitionException;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;

import javax.sql.DataSource;

/**
 * z-task 域的 MyBatis-Plus 装配：数据源 + SqlSessionFactory + Mapper 扫描。
 *
 * <p>⚠ {@code @MapperScan} 只扫 {@code com.zifang.z.task.core.domain.mapper} 一个包。
 * 新增 mapper **必须**放在这个包下，否则**静默扫不到**（启动不报错，运行时才炸）。
 */
@Configuration
@MapperScan(basePackages = "com.zifang.z.task.core.domain.mapper", sqlSessionFactoryRef = "sqlSessionFactoryTask")
public class TaskMyBatisConfig extends ModuleDataSourceTemplate {

    @Bean("dataSourceTask")
    public DataSource dataSource(Environment env) {
        return buildDataSource(env, "task");
    }

    /**
     * 带 GlobalConfig / 分页插件的 SqlSessionFactory。
     *
     * <p>⚠ **为什么必须显式装配 GlobalConfig 与 MetaObjectHandler**：
     * 本仓的 {@code application.yml} 显式排除了 {@code MybatisPlusAutoConfiguration}，
     * 于是 Spring Boot 不会替我们建 GlobalConfig ⇒ 没有 MetaObjectHandler
     * ⇒ {@code create_time} / {@code update_time} / {@code create_by} 不会被自动填充。
     * 待办两表（{@code z_task_todo_project} / {@code z_task_todo_item}）的
     * {@code create_time} 是 {@code NOT NULL} ⇒ 插入会直接失败。
     *
     * <p>⚠ **分页插件同理**：排除 AutoConfiguration 后没有任何地方注册
     * {@code MybatisPlusInterceptor} ⇒ {@code selectPage} 会把满足条件的全部行塞进一页
     * 且 total 恒 0。
     */
    @Bean("sqlSessionFactoryTask")
    public SqlSessionFactory taskSqlSessionFactory(
            @org.springframework.beans.factory.annotation.Qualifier("dataSourceTask") DataSource dataSourceTask,
            ApplicationContext applicationContext) throws Exception {
        MybatisSqlSessionFactoryBean factoryBean = new MybatisSqlSessionFactoryBean();
        factoryBean.setDataSource(dataSourceTask);
        factoryBean.setMapperLocations(
                new PathMatchingResourcePatternResolver().getResources("classpath*:/mapper/**/*.xml"));
        factoryBean.setTypeAliasesPackage("com.zifang.z.task.core.domain.entity");

        // 审计字段自动填充（createTime/updateTime/createBy/updateBy/deleted）
        GlobalConfig globalConfig = new GlobalConfig();
        try {
            MetaObjectHandler handler =
                    applicationContext.getBean(MetaObjectHandler.class);
            globalConfig.setMetaObjectHandler(handler);
        } catch (NoSuchBeanDefinitionException ignore) {
            // 找不到 MetaObjectHandler 时不设置，允许表 NOT NULL 字段由业务侧填充
        }
        factoryBean.setGlobalConfig(globalConfig);

        // 分页插件
        com.baomidou.mybatisplus.extension.plugins.MybatisPlusInterceptor interceptor =
                new com.baomidou.mybatisplus.extension.plugins.MybatisPlusInterceptor();
        interceptor.addInnerInterceptor(
                new com.baomidou.mybatisplus.extension.plugins.inner.PaginationInnerInterceptor(
                        com.baomidou.mybatisplus.annotation.DbType.MYSQL));
        factoryBean.setPlugins(interceptor);
        return factoryBean.getObject();
    }
}
