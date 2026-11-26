package com.zifang.z.task.core.domain.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zifang.z.task.core.domain.entity.SyncUser;

/**
 * 用户同步表 Mapper
 *
 * @author zifang
 */
@org.springframework.stereotype.Component("zTaskSyncUserMapper")
public interface SyncUserMapper extends BaseMapper<SyncUser> {
}
