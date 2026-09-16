package com.zifang.z.task.core.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zifang.z.task.core.domain.entity.SyncUser;
import com.zifang.z.task.core.domain.mapper.SyncUserMapper;
import com.zifang.z.task.core.service.SyncUserService;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * 用户同步表 Service 实现
 *
 * @author zifang
 */
@Service("zTaskSyncUserServiceImpl")
public class SyncUserServiceImpl extends ServiceImpl<SyncUserMapper, SyncUser> implements SyncUserService {

    private static final Logger log = LogManager.getLogger(SyncUserServiceImpl.class);

    @Override
    public SyncUser getByUserId(String userId) {
        LambdaQueryWrapper<SyncUser> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SyncUser::getUserId, userId);
        return this.getOne(wrapper);
    }

    @Override
    public boolean syncUser(SyncUser syncUser) {
        if (syncUser == null || syncUser.getUserId() == null) {
            log.warn("同步用户信息失败: 用户信息为空");
            return false;
        }

        // 设置同步时间
        syncUser.setLastSyncAt(LocalDateTime.now());

        // 查询是否已存在
        SyncUser existUser = this.getByUserId(syncUser.getUserId());

        if (existUser == null) {
            // 新增用户
            syncUser.setCreatedAt(LocalDateTime.now());
            syncUser.setUpdatedAt(LocalDateTime.now());
            boolean success = this.save(syncUser);
            if (success) {
                log.info("同步用户新增成功: userId={}, username={}", syncUser.getUserId(), syncUser.getUsername());
            }
            return success;
        } else {
            // 更新用户
            syncUser.setId(existUser.getId());
            syncUser.setCreatedAt(existUser.getCreatedAt());
            syncUser.setUpdatedAt(LocalDateTime.now());
            boolean success = this.updateById(syncUser);
            if (success) {
                log.info("同步用户更新成功: userId={}, username={}", syncUser.getUserId(), syncUser.getUsername());
            }
            return success;
        }
    }
}
