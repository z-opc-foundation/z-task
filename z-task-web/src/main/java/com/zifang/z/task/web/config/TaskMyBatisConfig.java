package com.zifang.z.task.web.config;

import com.baomidou.mybatisplus.extension.spring.MybatisSqlSessionFactoryBean;
import com.zifang.z.boot.datasource.starter.ModuleDataSourceTemplate;
import org.apache.ibatis.session.SqlSessionFactory;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;

import javax.sql.DataSource;

@Configuration
@MapperScan(basePackages = "com.zifang.z.task.core.domain.mapper", sqlSessionFactoryRef = "sqlSessionFactoryTask")
public class TaskMyBatisConfig extends ModuleDataSourceTemplate {

    @Bean("dataSourceTask")
    public DataSource dataSource(Environment env) {
        return buildDataSource(env, "task");
    }

    @Bean("sqlSessionFactoryTask")
    public SqlSessionFactory sqlSessionFactoryTask(DataSource dataSourceTask) throws Exception {
        MybatisSqlSessionFactoryBean factoryBean = new MybatisSqlSessionFactoryBean();
        factoryBean.setDataSource(dataSourceTask);
        factoryBean.setMapperLocations(new PathMatchingResourcePatternResolver().getResources("classpath*:/mapper/**/*.xml"));
        factoryBean.setTypeAliasesPackage("com.zifang.z.task.core.domain.entity");
        return factoryBean.getObject();
    }
}