package com.zifang.z.task.core.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zifang.util.core.meta.ResultCode;
import com.zifang.z.task.core.common.exception.BusinessException;
import com.zifang.z.task.core.domain.entity.Board;
import com.zifang.z.task.core.domain.mapper.BoardMapper;
import com.zifang.z.task.core.service.BoardService;
import com.zifang.z.task.core.service.ProjectMemberService;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 看板表 Service 实现
 *
 * @author zifang
 */
@Service("zTaskBoardServiceImpl")
public class BoardServiceImpl extends ServiceImpl<BoardMapper, Board> implements BoardService {
    private final Logger log = LogManager.getLogger(this.getClass());

    @Autowired
    private ProjectMemberService projectMemberService;

    @Override
    public Board createBoard(Board board, String userId) {
        // 检查是否是项目成员
        if (!projectMemberService.isMember(board.getProjectId(), userId)) {
            throw new BusinessException(ResultCode.REQ_REJECT, "无权限在该项目下创建看板");
        }

        // 设置默认类型
        if (board.getType() == null) {
            board.setType(0); // 标准看板
        }

        // 设置排序号
        Long maxOrder = baseMapper.selectCount(
                new LambdaQueryWrapper<Board>().eq(Board::getProjectId, board.getProjectId())
        );
        board.setSortOrder(maxOrder);

        board.setCreatedAt(LocalDateTime.now());
        board.setUpdatedAt(LocalDateTime.now());

        this.save(board);
        log.info("创建看板成功: boardId={}, name={}, projectId={}", board.getId(), board.getName(), board.getProjectId());
        return board;
    }

    @Override
    public List<Board> getBoardsByProject(Long projectId) {
        LambdaQueryWrapper<Board> wrapper = new LambdaQueryWrapper<Board>();
        wrapper.eq(Board::getProjectId, projectId);
        wrapper.orderByAsc(Board::getSortOrder);
        return this.list(wrapper);
    }

    @Override
    public boolean updateSortOrder(Long boardId, Long sortOrder) {
        Board board = this.getById(boardId);
        if (board == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "看板不存在");
        }
        board.setSortOrder(sortOrder);
        board.setUpdatedAt(LocalDateTime.now());
        return this.updateById(board);
    }
}
