package com.zifang.z.task.core.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.zifang.z.task.core.domain.entity.SyncUser;

/**
 * 用户同步表 Service
 *
 * @author zifang
 */
public interface SyncUserService extends IService<SyncUser> {

    /**
     * 根据 userId 查询用户
     *
     * @param userId zb-ctc 用户ID
     * @return 用户信息
     */
    SyncUser getByUserId(String userId);

    /**
     * 同步或更新用户信息
     *
     * @param syncUser 用户信息
     * @return 是否成功
     */
    boolean syncUser(SyncUser syncUser);
}
