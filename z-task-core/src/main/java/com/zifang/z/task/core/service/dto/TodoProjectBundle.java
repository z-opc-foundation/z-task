package com.zifang.z.task.core.service.dto;

import com.zifang.z.task.core.domain.entity.TodoProject;

import java.util.List;

/**
 * 待办项目列表返回：我拥有的 + 我加入的两组，各含未完成事项计数。
 *
 * <p>2026-11-02 自 z-team 迁入（原 {@code com.zifang.z.team.core.service.todo.dto.TodoProjectBundle}）。
 *
 * @author z-task
 */
public class TodoProjectBundle {

    /**
     * 我拥有的项目（owner = 当前用户）
     */
    private List<TodoProjectSummary> owned;

    /**
     * 我加入的共享项目（owner 是别人）
     */
    private List<TodoProjectSummary> joined;

    public TodoProjectBundle() {
    }

    public List<TodoProjectSummary> getOwned() {
        return owned;
    }

    public void setOwned(List<TodoProjectSummary> owned) {
        this.owned = owned;
    }

    public List<TodoProjectSummary> getJoined() {
        return joined;
    }

    public void setJoined(List<TodoProjectSummary> joined) {
        this.joined = joined;
    }

    /**
     * 项目 + 未完成计数 + 成员明细。
     */
    public static class TodoProjectSummary extends TodoProject {

        private static final long serialVersionUID = 1L;

        /**
         * 未完成事项数（TODO+DOING）
         */
        private long openCount;

        /**
         * 成员明细 [{userId,userName}]（解析自 members JSON）
         */
        private List<TodoMember> memberDetails;

        public long getOpenCount() {
            return openCount;
        }

        public void setOpenCount(long openCount) {
            this.openCount = openCount;
        }

        public List<TodoMember> getMemberDetails() {
            return memberDetails;
        }

        public void setMemberDetails(List<TodoMember> memberDetails) {
            this.memberDetails = memberDetails;
        }
    }

    /**
     * 项目成员（members JSON 数组元素）。
     */
    public static class TodoMember {

        private String userId;
        private String userName;

        public TodoMember() {
        }

        public TodoMember(String userId, String userName) {
            this.userId = userId;
            this.userName = userName;
        }

        public String getUserId() {
            return userId;
        }

        public void setUserId(String userId) {
            this.userId = userId;
        }

        public String getUserName() {
            return userName;
        }

        public void setUserName(String userName) {
            this.userName = userName;
        }
    }
}
