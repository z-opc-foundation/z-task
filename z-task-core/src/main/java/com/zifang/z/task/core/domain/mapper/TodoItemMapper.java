package com.zifang.z.task.core.domain.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zifang.z.task.core.domain.entity.TodoItem;

/**
 * 待办事项表 Mapper。
 *
 * <p>⚠ **必须在 {@code com.zifang.z.task.core.domain.mapper} 包下**：
 * {@code TaskMyBatisConfig} 的 {@code @MapperScan} 只扫这一个包，
 * 放到别处会**静默扫不到**。
 *
 * <p>Bean 名显式加 {@code zTask} 前缀，避免与 z-team 侧同名 mapper 在
 * 宿主应用里撞名。
 *
 * @author z-task
 */
@org.springframework.stereotype.Component("zTaskTodoItemMapper")
public interface TodoItemMapper extends BaseMapper<TodoItem> {
}
