package com.zifang.z.task.core.domain.entity.base;

import com.baomidou.mybatisplus.annotation.FieldFill;
import com.baomidou.mybatisplus.annotation.TableField;
import com.zifang.z.boot.datasource.starter.AuditDO;

/**
 * 待办实体审计基类。
 *
 * <p>与 z-team 的 {@code TeamDetailAuditDO} 语义一致：继承 z-boot {@link AuditDO}
 * （含 {@code @TableLogic} 逻辑删除与审计字段自动填充），并额外携带操作人姓名。
 *
 * <p>⚠ **id 策略必须显式指定 {@code IdType.AUTO}**：
 * z-boot 的 {@link AuditDO} 默认是 {@code IdType.ASSIGN_ID}（雪花 ID），
 * 而待办两表沿用 z-team 的 {@code AUTO_INCREMENT} 自增主键。
 * 若不覆盖，插入时 MyBatis-Plus 会用雪花算法生成 id，
 * 存量数据搬迁后 id 值域将与旧表不一致 ⇒ 父子事项的 {@code parent_id}、
 * 事项的 {@code agent_session_id} 全部失配。
 *
 * @author z-task
 */
public abstract class TodoAuditDO extends AuditDO {

    private static final long serialVersionUID = 1L;

    @TableField(fill = FieldFill.INSERT)
    private String createByName;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private String updateByName;

    public TodoAuditDO() {
    }

    public String getCreateByName() {
        return createByName;
    }

    public void setCreateByName(String createByName) {
        this.createByName = createByName;
    }

    public String getUpdateByName() {
        return updateByName;
    }

    public void setUpdateByName(String updateByName) {
        this.updateByName = updateByName;
    }
}
