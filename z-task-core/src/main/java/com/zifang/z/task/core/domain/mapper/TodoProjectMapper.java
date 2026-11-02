package com.zifang.z.task.core.domain.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zifang.z.task.core.domain.entity.TodoProject;

/**
 * 待办项目表 Mapper。
 *
 * <p>⚠ **必须在 {@code com.zifang.z.task.core.domain.mapper} 包下**：
 * {@code TaskMyBatisConfig} 的 {@code @MapperScan(basePackages = "com.zifang.z.task.core.domain.mapper",
 * sqlSessionFactoryRef = "sqlSessionFactoryTask")} 只扫这一个包。
 * 放到别的包 ⇒ **静默扫不到**（启动不报错，运行时才炸）。
 *
 * <p>Bean 名显式加 {@code zTask} 前缀，避免与 z-team 侧同名 mapper 在
 * 宿主应用里撞名（z-team 的 {@code MapperNameConflictGuard} 会检出并 WARN）。
 *
 * @author z-task
 */
@org.springframework.stereotype.Component("zTaskTodoProjectMapper")
public interface TodoProjectMapper extends BaseMapper<TodoProject> {
}
