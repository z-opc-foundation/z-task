package com.zifang.z.task.core.domain.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zifang.z.task.core.domain.entity.Board;

/**
 * 看板表 Mapper
 *
 * @author zifang
 */
@org.springframework.stereotype.Component("zTaskBoardMapper")
public interface BoardMapper extends BaseMapper<Board> {
}
