package com.zifang.z.task.core.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.zifang.z.task.core.domain.entity.Board;

import java.util.List;

/**
 * 看板表 Service
 *
 * @author zifang
 */
public interface BoardService extends IService<Board> {

    /**
     * 创建看板
     *
     * @param board  看板信息
     * @param userId 创建者ID
     * @return 创建后的看板
     */
    Board createBoard(Board board, String userId);

    /**
     * 获取项目下的所有看板
     *
     * @param projectId 项目ID
     * @return 看板列表
     */
    List<Board> getBoardsByProject(Long projectId);

    /**
     * 更新看板排序
     *
     * @param boardId   看板ID
     * @param sortOrder 排序号
     * @return 是否成功
     */
    boolean updateSortOrder(Long boardId, Long sortOrder);
}
