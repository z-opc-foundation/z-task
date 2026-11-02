import { jsx as n, jsxs as c, Fragment as ft } from "react/jsx-runtime";
import { MessageOutlined as xe, CloseOutlined as _t, FileTextOutlined as it, BarsOutlined as fa, ShareAltOutlined as _a, StarFilled as ba, StarOutlined as ga, RobotOutlined as ya, PlusOutlined as Se, DeleteOutlined as bt, LinkOutlined as Ca, InboxOutlined as gt, MoreOutlined as Ia, CalendarOutlined as jt, FolderOutlined as vt, UserOutlined as lt, HolderOutlined as Na, TeamOutlined as Je, ClockCircleOutlined as St, CheckSquareOutlined as wt, EditOutlined as Ta } from "@ant-design/icons";
import { Modal as De, Input as Te, Select as je, DatePicker as xt, message as k, Button as _e, Spin as Bt, Segmented as Ht, Tooltip as Ke, Space as Ge, Tag as ct, Typography as Dt, Drawer as ja, Checkbox as dt, Dropdown as zt, Popconfirm as va, Empty as We } from "antd";
import Be from "dayjs";
import { useState as g, useEffect as Ce, useMemo as pe, useRef as we, useCallback as ie, Fragment as st } from "react";
import { MarkdownLiveEditor as Ft } from "@yuku123/z-markdown-component";
import { createRequest as Sa } from "@yuku123/z-frontend-common";
import { ComponentDoc as wa } from "@yuku123/z-frontend-common/ui";
function se(e) {
  return e == null || e === "" ? "" : typeof e == "string" ? e : String(e);
}
function q(e, t) {
  return se(e) === se(t);
}
function ve(e) {
  const t = se(e);
  return t !== "" && Da(t, "0") > 0;
}
function Da(e, t) {
  const s = se(e), r = se(t);
  if (s === r)
    return 0;
  if (s === "")
    return 1;
  if (r === "")
    return -1;
  try {
    const o = BigInt(s), d = BigInt(r);
    return o < d ? -1 : 1;
  } catch {
    return s < r ? -1 : 1;
  }
}
const La = 200, ka = "/z-team/api";
let ut = ka;
function vi(e) {
  return e && typeof e == "string" && (ut = e.replace(/\/$/, "")), ut;
}
function J() {
  return ut;
}
const K = { credentials: "include" };
let Lt = !1;
const kt = "登录已失效，请重新登录";
function Aa(e) {
  if (!e) return !1;
  if (Number(e.code) === 401) return !0;
  const t = typeof e.message == "string" ? e.message : "";
  return /登录(?:已)?(?:失效|过期)|重新登录|未登录/.test(t);
}
function At() {
  if (!Lt) {
    Lt = !0;
    try {
      localStorage.removeItem("token");
    } catch {
    }
    try {
      window.location.replace("/z-task/login");
    } catch {
    }
  }
  throw {
    _apiUserError: !0,
    userMessage: kt,
    message: kt
  };
}
function $t(e, t) {
  return e.status === 401 ? "登录已失效，请重新登录" : e.status === 403 ? "没有权限访问该资源" : e.status === 404 ? "接口不存在，请确认后端已启动且路径为 /api" : e.status >= 500 ? "服务暂时不可用，请稍后重试" : (e.status >= 400, t);
}
async function X(e, t) {
  const s = {
    Accept: "application/json",
    ...t && t.headers ? t.headers : {}
  }, r = localStorage.getItem("userId");
  r && (s["X-User-Id"] = r);
  let o;
  try {
    o = await fetch(e, { ...K, ...t || {}, headers: s });
  } catch {
    const i = "无法连接服务器，请确认 z-task 后端已启动（如 127.0.0.1:8082）";
    throw { _apiUserError: !0, userMessage: i, message: i };
  }
  return o;
}
async function ye(e, t, s) {
  e.status === 401 && At();
  const r = await e.text().catch(() => "");
  let o = {};
  if (r)
    try {
      o = JSON.parse(r);
    } catch {
      if (!e.ok) {
        const _ = $t(e, t);
        throw { _apiUserError: !0, userMessage: _, message: _ };
      }
      const i = e.url ? `（${e.url}）` : "", m = `${t}：接口返回的不是 JSON${i} —— 通常是该路径不存在、被网关/前端兜底成了 index.html。`;
      throw { _apiUserError: !0, userMessage: m, message: m };
    }
  if (Aa(o) && At(), o.success === !0 || Number(o.code) === La)
    return o.data !== void 0 ? o.data : !0;
  if (o.success === !1 || o.code !== void 0) {
    const i = o.message || o.msg || o.detail || t;
    throw { _apiUserError: !0, userMessage: i, message: i };
  }
  if (!e.ok) {
    const i = o.detail || o.message || $t(e, t);
    throw { _apiUserError: !0, userMessage: i, message: i };
  }
  return o;
}
async function me(e, t) {
  return pt(await ye(e, t));
}
const $a = /_+([a-z0-9])/gi;
function pt(e) {
  if (Array.isArray(e)) return e.map((t) => pt(t));
  if (e && typeof e == "object" && !(e instanceof Date)) {
    const t = {};
    for (const [s, r] of Object.entries(e))
      t[s.replace($a, (o, d) => d.toUpperCase())] = pt(r);
    return t;
  }
  return e;
}
const Pe = [
  { status: "TODO", label: "待办" },
  { status: "DOING", label: "进行中" },
  { status: "DONE", label: "已完成" }
];
function Xe(e) {
  if (!e || !String(e).trim()) return [...Pe];
  try {
    const t = JSON.parse(e), s = Array.isArray(t && t.statusColumns) ? t.statusColumns : null;
    if (!s) return [...Pe];
    const r = s.map((o) => {
      const d = o ?? {}, i = String(d.status ?? "").trim().toUpperCase(), m = String(d.label ?? "").trim();
      return i && m ? { status: i, label: m } : null;
    }).filter((o) => o != null);
    return r.length > 0 ? r : [...Pe];
  } catch {
    return [...Pe];
  }
}
function Oa(e) {
  if (e == null) return !0;
  const t = String(e).trim();
  return t === "" || t === "0";
}
function ke(e) {
  const t = e ?? {}, s = (m) => {
    if (typeof m != "string" || !m.trim()) return [];
    try {
      const _ = JSON.parse(m);
      return Array.isArray(_) ? _.filter((T) => typeof T == "string") : [];
    } catch {
      return [];
    }
  }, r = (m) => {
    if (typeof m != "string" || !m.trim()) return [];
    try {
      const _ = JSON.parse(m);
      return Array.isArray(_) ? _.filter((T) => !!T && typeof T == "object" && typeof T.type == "string") : [];
    } catch {
      return [];
    }
  }, o = () => {
    const m = t.assigneeUserIds;
    let _ = null;
    if (Array.isArray(m))
      _ = m;
    else if (typeof m == "string" && m.trim())
      try {
        const D = JSON.parse(m);
        _ = Array.isArray(D) ? D : null;
      } catch {
        _ = m.split(",");
      }
    if (_) {
      const D = _.map((P) => String(P ?? "").trim()).filter(Boolean);
      if (D.length > 0) return Array.from(new Set(D));
    }
    const T = t.assigneeUserId == null ? "" : String(t.assigneeUserId);
    return T.trim() ? [T.trim()] : [];
  }, d = (m) => {
    const _ = t.assignees, T = Array.isArray(_) ? _.map((D) => {
      const P = D ?? {}, f = String(P.userId ?? "").trim();
      return f ? { userId: f, name: String(P.name ?? "").trim() || f } : null;
    }).filter((D) => D != null) : [];
    return T.length > 0 ? T : m.map((D) => ({ userId: D, name: D }));
  }, i = o();
  return {
    id: se(t.id),
    projectId: t.projectId == null ? null : se(t.projectId),
    userId: String(t.userId ?? ""),
    title: String(t.title ?? ""),
    detail: t.detail == null ? null : String(t.detail),
    status: t.status ?? "TODO",
    priority: t.priority ?? "MEDIUM",
    dueDate: t.dueDate == null ? null : String(t.dueDate).slice(0, 10),
    assigneeUserId: i[0] ?? null,
    assigneeUserIds: i,
    assignees: d(i),
    projectTitle: t.projectTitle == null || !String(t.projectTitle).trim() ? null : String(t.projectTitle),
    tags: s(t.tags),
    links: r(t.links),
    // ⚠ 顶层必须是空串（falsy），见文件头说明
    parentId: Oa(t.parentId) ? "" : se(t.parentId),
    sortOrder: t.sortOrder == null ? 0 : Number(t.sortOrder),
    completedAt: t.completedAt == null ? null : String(t.completedAt),
    completedBy: t.completedBy == null ? null : String(t.completedBy),
    createByName: t.createByName == null ? null : String(t.createByName),
    updateTime: t.updateTime == null ? null : String(t.updateTime),
    agentId: t.agentId == null ? null : se(t.agentId),
    agentSessionId: t.agentSessionId == null ? null : se(t.agentSessionId)
  };
}
function He(e) {
  const t = e ?? {};
  return {
    id: se(t.id),
    userId: String(t.userId ?? ""),
    title: String(t.title ?? ""),
    icon: t.icon == null ? null : String(t.icon),
    description: t.description == null ? null : String(t.description),
    visibility: t.visibility === "shared" ? "shared" : "private",
    sortOrder: t.sortOrder == null ? 0 : Number(t.sortOrder),
    extraInfo: t.extraInfo == null ? null : String(t.extraInfo),
    createByName: t.createByName == null ? null : String(t.createByName)
  };
}
function Ot(e) {
  const t = e ?? {}, s = Array.isArray(t.memberDetails) ? t.memberDetails : [];
  return {
    ...He(t),
    openCount: t.openCount == null ? 0 : Number(t.openCount),
    memberDetails: s.map((r) => {
      const o = r ?? {}, d = String(o.userId ?? "").trim();
      return d ? { userId: d, userName: String(o.userName ?? "").trim() || d } : null;
    }).filter((r) => r != null)
  };
}
function Ma(e) {
  const t = e ?? {};
  return {
    todoId: se(t.todoId),
    sessionId: t.sessionId == null ? null : se(t.sessionId),
    agentId: t.agentId == null ? null : se(t.agentId),
    projectSpaceId: t.projectSpaceId == null ? 0 : se(t.projectSpaceId),
    projectSpaceTitle: String(t.projectSpaceTitle ?? ""),
    status: String(t.status ?? ""),
    kickoff: String(t.kickoff ?? ""),
    spaceEntries: Array.isArray(t.spaceEntries) ? t.spaceEntries.map((s) => ({
      path: String(s.path ?? ""),
      name: String(s.name ?? ""),
      dir: !!s.dir,
      size: s.size == null ? 0 : Number(s.size)
    })) : []
  };
}
async function Pa(e = "") {
  const t = e ? `?token=${encodeURIComponent(e)}` : "", s = await X(`${J()}/todo/projects${t}`, K), r = await me(s, "获取待办项目失败");
  return {
    owned: ((r == null ? void 0 : r.owned) ?? []).map(Ot),
    joined: ((r == null ? void 0 : r.joined) ?? []).map(Ot)
  };
}
async function Ra(e, t = "") {
  const s = t ? `?token=${encodeURIComponent(t)}` : "", r = await X(`${J()}/todo/projects${s}`, {
    ...K,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(e)
  }), o = await me(r, "新建项目失败");
  return He(o);
}
async function Gt(e, t, s = "") {
  const r = s ? `?token=${encodeURIComponent(s)}` : "", o = await X(`${J()}/todo/projects/${e}${r}`, {
    ...K,
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t)
  }), d = await me(o, "更新项目失败");
  return He(d);
}
async function Ea(e, t = "") {
  const s = t ? `?token=${encodeURIComponent(t)}` : "", r = await X(`${J()}/todo/projects/${e}${s}`, {
    ...K,
    method: "DELETE"
  });
  return ye(r, "删除项目失败");
}
async function Wt(e, t, s = "") {
  const r = s ? `?token=${encodeURIComponent(s)}` : "", o = await X(`${J()}/todo/projects/${e}/members${r}`, {
    ...K,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t)
  }), d = await me(o, "添加成员失败");
  return He(d);
}
async function Ua(e, t, s = "") {
  const r = s ? `?token=${encodeURIComponent(s)}` : "", o = await X(
    `${J()}/todo/projects/${e}/members/${encodeURIComponent(t)}${r}`,
    { ...K, method: "DELETE" }
  ), d = await me(o, "移除成员失败");
  return He(d);
}
async function rt(e = {}, t = "") {
  const s = new URLSearchParams();
  t && s.set("token", t), e.view && s.set("view", e.view), e.projectId != null && s.set("projectId", String(e.projectId)), e.status && s.set("status", e.status), e.keyword && s.set("keyword", e.keyword);
  const r = s.toString() ? `?${s.toString()}` : "", o = await X(`${J()}/todo/items${r}`, K);
  return (await me(o, "获取事项失败") ?? []).map(ke);
}
async function qt(e, t = "") {
  const s = t ? `?token=${encodeURIComponent(t)}` : "", r = await X(`${J()}/todo/items${s}`, {
    ...K,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(e)
  }), o = await me(r, "新建事项失败");
  return ke(o);
}
async function Ye(e, t, s = "") {
  const r = s ? `?token=${encodeURIComponent(s)}` : "", o = await X(`${J()}/todo/items/${e}${r}`, {
    ...K,
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t)
  }), d = await me(o, "更新事项失败");
  return ke(d);
}
async function mt(e, t = "", s = "") {
  const r = s ? `?token=${encodeURIComponent(s)}` : "", o = await X(`${J()}/todo/items/${e}/complete${r}`, {
    ...K,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ result: t })
  }), d = await me(o, "完成事项失败");
  return ke(d);
}
async function Jt(e, t = "") {
  const s = t ? `?token=${encodeURIComponent(t)}` : "", r = await X(`${J()}/todo/items/${e}/reopen${s}`, {
    ...K,
    method: "POST"
  }), o = await me(r, "重开事项失败");
  return ke(o);
}
async function xa(e, t, s = "") {
  const r = s ? `?token=${encodeURIComponent(s)}` : "", o = await X(`${J()}/todo/items/${e}/reorder${r}`, {
    ...K,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t)
  }), d = await me(o, "调整排序失败");
  return ke(d);
}
async function Ba(e, t = "") {
  const s = t ? `?token=${encodeURIComponent(t)}` : "", r = await X(`${J()}/todo/items/reorder-batch${s}`, {
    ...K,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ updates: e })
  });
  return ye(r, "调整排序失败");
}
async function Ha(e, t = "") {
  const s = t ? `?token=${encodeURIComponent(t)}` : "", r = await X(`${J()}/todo/projects/reorder-batch${s}`, {
    ...K,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ updates: e })
  });
  return ye(r, "调整项目排序失败");
}
async function Kt(e, t = "") {
  const s = t ? `?token=${encodeURIComponent(t)}` : "", r = await X(`${J()}/todo/items/${e}${s}`, {
    ...K,
    method: "DELETE"
  });
  return ye(r, "删除事项失败");
}
async function za(e, t, s = "") {
  const r = s ? `?token=${encodeURIComponent(s)}` : "", o = await X(`${J()}/todo/items/${e}/dispatch${r}`, {
    ...K,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ agentId: t })
  }), d = await me(o, "派发给 Agent 失败");
  return Ma(d);
}
async function Fa(e, t = "") {
  const s = t ? `?token=${encodeURIComponent(t)}` : "", r = await X(`${J()}/todo/items/${e}/undispatch${s}`, {
    ...K,
    method: "POST"
  }), o = await me(r, "取消派发失败");
  return ke(o);
}
async function Ga(e = "", t = !1) {
  const s = new URLSearchParams();
  e && s.set("token", e), t && s.set("allUsers", "true");
  const r = s.toString() ? `?${s.toString()}` : "", o = await X(`${J()}/personal-note/tree${r}`, K);
  return me(o, "获取笔记文件树失败");
}
async function Wa(e, t = "") {
  const s = t ? `?token=${encodeURIComponent(t)}` : "", r = await X(`${J()}/personal-note/${e}${s}`, K);
  return me(r, "获取笔记内容失败");
}
async function qa(e, t, s = "") {
  const r = s ? `?token=${encodeURIComponent(s)}` : "", o = await X(`${J()}/personal-note/${e}${r}`, {
    ...K,
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t)
  });
  return ye(o, "保存笔记失败");
}
async function Ja(e, t = "") {
  const s = t ? `?token=${encodeURIComponent(t)}` : "", r = await X(`${J()}/personal-note/${e}/share${s}`, {
    ...K,
    method: "POST"
  });
  return ye(r, "生成分享链接失败");
}
async function Ka(e = "") {
  const t = e ? `?token=${encodeURIComponent(e)}` : "", s = await X(`${J()}/personal-note/favorites${t}`, K);
  return me(s, "获取收藏列表失败");
}
async function Xa(e, t = "") {
  const s = t ? `?token=${encodeURIComponent(t)}` : "", r = await X(`${J()}/personal-note/${e}/favorite${s}`, {
    ...K,
    method: "POST"
  });
  return ye(r, "收藏笔记失败");
}
async function Ya(e, t = "") {
  const s = t ? `?token=${encodeURIComponent(t)}` : "", r = await X(`${J()}/personal-note/${e}/favorite${s}`, {
    ...K,
    method: "DELETE"
  });
  return ye(r, "取消收藏失败");
}
function Va(e) {
  const t = e ?? {}, s = (...o) => {
    for (const d of o) {
      const i = t[d];
      if (i != null && i !== "") return String(i);
    }
    return "";
  }, r = (...o) => {
    for (const d of o)
      if (t[d] != null) return se(t[d]);
    return null;
  };
  return {
    id: t.id,
    userId: s("user_id", "userId"),
    agentHubAgentId: r("agent_hub_agent_id", "agenthub_agent_id", "agentHubAgentId", "agenthubAgentId"),
    agentCode: s("agent_code", "agentCode"),
    displayName: s("display_name", "displayName"),
    avatar: t.avatar == null ? null : String(t.avatar),
    shared: t.shared == null ? void 0 : Number(t.shared),
    isLocal: t.isLocal,
    localAgentId: t.localAgentId,
    localAgentType: t.localAgentType,
    createTime: t.create_time == null ? t.createTime : String(t.create_time),
    updateTime: t.update_time == null ? t.updateTime : String(t.update_time)
  };
}
async function Za(e = "") {
  const t = e ? `?token=${encodeURIComponent(e)}` : "", s = await X(`${J()}/personal-agents${t}`, K), r = await ye(s, "获取个人 Agent 列表失败");
  return (Array.isArray(r) ? r : Array.isArray(r == null ? void 0 : r.items) ? r.items : []).map(Va);
}
async function Xt(e, t = "", s = "") {
  const r = new URLSearchParams();
  t && r.set("keyword", t), s && r.set("token", s);
  const o = await X(
    `${J()}/personal-agents/${e}/schedules/staff-search?${r.toString()}`,
    K
  );
  return (await ye(o, "搜索员工失败") ?? []).map((i) => {
    const m = (i == null ? void 0 : i.extend) ?? {};
    return {
      userId: String((i == null ? void 0 : i.userId) ?? (i == null ? void 0 : i.id) ?? ""),
      name: String((i == null ? void 0 : i.name) ?? ""),
      accountNo: String((i == null ? void 0 : i.accountNo) ?? ""),
      jobNumber: String((i == null ? void 0 : i.jobNumber) ?? ""),
      flowerName: String((m == null ? void 0 : m.flowerName) ?? "")
    };
  });
}
async function Qa(e = "", t) {
  const s = new URLSearchParams();
  e && s.set("token", e);
  const r = s.toString(), o = await X(
    `${J()}/scenario-instances/${r ? `?${r}` : ""}`,
    K
  );
  return ye(o, "获取项目列表失败");
}
async function en(e, t = "") {
  const s = t ? `?token=${encodeURIComponent(t)}` : "", r = {
    ...e,
    extend_params: { ...e.extend_params, skip_init_task: "true" }
  }, o = await X(`${J()}/scenario-instances/${s}`, {
    ...K,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(r)
  });
  return ye(o, "创建项目失败");
}
async function Yt(e) {
  const t = new FormData();
  t.append("file", e);
  const s = await X(`${J()}/common/upload-image`, {
    method: "POST",
    body: t
  }), r = await ye(s, "上传图片失败"), o = typeof (r == null ? void 0 : r.url) == "string" ? r.url : "";
  if (!o) {
    const d = "上传图片失败：响应缺少图片地址";
    throw { _apiUserError: !0, userMessage: d, message: d };
  }
  return o;
}
function tn() {
  return typeof localStorage > "u" ? "" : localStorage.getItem("token") || localStorage.getItem("z_team_token") || "";
}
function an() {
  if (typeof localStorage > "u") return null;
  const e = localStorage.getItem("userInfo");
  if (!e) return null;
  try {
    const t = JSON.parse(e);
    return !t || typeof t != "object" ? null : (t.id == null && t.userId != null && (t.id = t.userId), t);
  } catch {
    return null;
  }
}
function Vt() {
  return tn();
}
function Zt() {
  return an();
}
let Re = {
  useToken: Vt,
  useCurrentUser: Zt
};
function Si(e) {
  return e && typeof e == "object" && (typeof e.useToken == "function" && (Re.useToken = e.useToken), typeof e.useCurrentUser == "function" && (Re.useCurrentUser = e.useCurrentUser)), { ...Re };
}
function wi() {
  Re = { useToken: Vt, useCurrentUser: Zt };
}
function nn() {
  return Re.useToken() || "";
}
function sn() {
  return Re.useCurrentUser() ?? null;
}
function ht(e) {
  const t = nn(), s = sn();
  return e({ token: t, currentUser: s });
}
const rn = "_container_b4j29_4", on = "_detailDrawer_b4j29_6", ln = "_detailDropdown_b4j29_7", cn = "_addModal_b4j29_8", dn = "_addModalDropdown_b4j29_9", un = "_addModalPicker_b4j29_10", pn = "_membersModal_b4j29_11", mn = "_columnModal_b4j29_12", hn = "_sidebar_b4j29_39", fn = "_sidebarSection_b4j29_46", _n = "_sidebarTitle_b4j29_49", bn = "_sidebarTitleAction_b4j29_59", gn = "_sideItem_b4j29_70", yn = "_sideItemActive_b4j29_91", Cn = "_sideItemIcon_b4j29_97", In = "_sideItemLabel_b4j29_107", Nn = "_sideItemCount_b4j29_114", Tn = "_sideGroupLabel_b4j29_127", jn = "_main_b4j29_134", vn = "_header_b4j29_142", Sn = "_headerTitle_b4j29_148", wn = "_headerSubtitle_b4j29_158", Dn = "_headerMembers_b4j29_164", Ln = "_toolbar_b4j29_192", kn = "_toolbarSpacer_b4j29_199", An = "_toolbarSearch_b4j29_202", $n = "_groupSeg_b4j29_215", On = "_listScroll_b4j29_256", Mn = "_boardWrap_b4j29_264", Pn = "_boardCol_b4j29_273", Rn = "_boardColDropOver_b4j29_283", En = "_boardColHeader_b4j29_288", Un = "_boardColTitle_b4j29_297", xn = "_boardColCount_b4j29_302", Bn = "_boardColSpacer_b4j29_310", Hn = "_boardColAdd_b4j29_313", zn = "_addRow_b4j29_329", Fn = "_boardColBody_b4j29_349", Gn = "_boardColEmpty_b4j29_358", Wn = "_boardColAddRow_b4j29_365", qn = "_boardAddColumn_b4j29_386", Jn = "_boardColHeaderMovable_b4j29_408", Kn = "_boardColDragging_b4j29_411", Xn = "_boardColDropBefore_b4j29_414", Yn = "_boardColDropAfter_b4j29_417", Vn = "_columnModalField_b4j29_421", Zn = "_columnModalLabel_b4j29_427", Qn = "_columnModalControl_b4j29_433", es = "_dropLine_b4j29_437", ts = "_itemCard_b4j29_443", as = "_itemCardDone_b4j29_467", ns = "_cardStripe_b4j29_471", ss = "_cardStripeHigh_b4j29_476", rs = "_cardStripeMedium_b4j29_479", os = "_cardStripeLow_b4j29_482", is = "_cardMain_b4j29_485", ls = "_cardHead_b4j29_493", cs = "_cardCheck_b4j29_501", ds = "_cardTitle_b4j29_525", us = "_cardTitleDone_b4j29_536", ps = "_cardDel_b4j29_540", ms = "_cardMeta_b4j29_555", hs = "_cardFoot_b4j29_556", fs = "_cardFootSpacer_b4j29_567", _s = "_cardChip_b4j29_571", bs = "_cardChipMuted_b4j29_588", gs = "_cardChipDue_b4j29_594", ys = "_cardChipOverdue_b4j29_598", Cs = "_cardChipToday_b4j29_604", Is = "_cardChipTag_b4j29_610", Ns = "_cardAvatars_b4j29_616", Ts = "_cardAvatar_b4j29_616", js = "_cardAvatarMore_b4j29_639", vs = "_cardAssigneeName_b4j29_644", Ss = "_cardUnassigned_b4j29_652", ws = "_dragHandle_b4j29_657", Ds = "_itemRow_b4j29_666", Ls = "_itemRowDragging_b4j29_672", ks = "_sideItemWrap_b4j29_681", As = "_sideDropLine_b4j29_684", $s = "_sideItemDropOver_b4j29_690", Os = "_itemCheck_b4j29_712", Ms = "_priorityDot_b4j29_738", Ps = "_priorityHigh_b4j29_744", Rs = "_priorityMedium_b4j29_747", Es = "_priorityLow_b4j29_750", Us = "_itemBody_b4j29_753", xs = "_itemTitle_b4j29_760", Bs = "_itemTitleDone_b4j29_770", Hs = "_itemMetaRow_b4j29_774", zs = "_tagChip_b4j29_784", Fs = "_dueChip_b4j29_795", Gs = "_dueChipOverdue_b4j29_803", Ws = "_dueChipToday_b4j29_807", qs = "_assigneeChip_b4j29_827", Js = "_statusChip_b4j29_835", Ks = "_statusTodo_b4j29_846", Xs = "_statusProgress_b4j29_851", Ys = "_statusDone_b4j29_856", Vs = "_projectChip_b4j29_862", Zs = "_linkIcon_b4j29_872", Qs = "_rowActions_b4j29_883", er = "_rowActionBtn_b4j29_892", tr = "_rowActionBtnDanger_b4j29_904", ar = "_childCount_b4j29_909", nr = "_projectGroup_b4j29_915", sr = "_projectGroupHeader_b4j29_918", rr = "_projectGroupTitle_b4j29_926", or = "_projectGroupCount_b4j29_934", ir = "_emptyWrap_b4j29_944", lr = "_emptyHint_b4j29_949", cr = "_detailThreeCol_b4j29_998", dr = "_detailCol_b4j29_1004", ur = "_detailColMain_b4j29_1011", pr = "_detailColLinksPanel_b4j29_1020", mr = "_detailColLinksPanelWithEditor_b4j29_1025", hr = "_detailColLinksSide_b4j29_1029", fr = "_detailColNotes_b4j29_1032", _r = "_detailColNotesExpanded_b4j29_1043", br = "_detailColHeaderActions_b4j29_1048", gr = "_detailPanelToggleBtn_b4j29_1054", yr = "_detailColHeader_b4j29_1048", Cr = "_detailColBody_b4j29_1075", Ir = "_detailColBodyFlush_b4j29_1081", Nr = "_detailColToolbar_b4j29_1089", Tr = "_detailColToolbarSelect_b4j29_1098", jr = "_detailColCenterSpin_b4j29_1108", vr = "_detailNoteLayout_b4j29_1117", Sr = "_detailNoteSidebar_b4j29_1123", wr = "_detailNoteSidebarToolbar_b4j29_1132", Dr = "_detailNoteSidebarSelect_b4j29_1138", Lr = "_detailNoteSidebarList_b4j29_1141", kr = "_detailNoteSidebarItem_b4j29_1146", Ar = "_detailNoteSidebarItemActive_b4j29_1164", $r = "_detailNoteSidebarItemIcon_b4j29_1168", Or = "_detailNoteSidebarItemTitle_b4j29_1177", Mr = "_detailNoteSidebarItemRemove_b4j29_1182", Pr = "_detailNoteSidebarEmpty_b4j29_1197", Rr = "_detailNoteLayoutListOnly_b4j29_1203", Er = "_detailNoteMain_b4j29_1207", Ur = "_detailNoteToolbar_b4j29_1215", xr = "_detailNoteTitleInput_b4j29_1225", Br = "_detailNoteReadOnlyTag_b4j29_1239", Hr = "_detailNoteEditorBody_b4j29_1244", zr = "_detailNoteTocPanel_b4j29_1253", Fr = "_detailNoteTocHeader_b4j29_1262", Gr = "_detailNoteTocList_b4j29_1269", Wr = "_detailNoteTocItem_b4j29_1274", qr = "_detailNoteTocEmpty_b4j29_1287", Jr = "_detailChatList_b4j29_1293", Kr = "_detailChatListItem_b4j29_1298", Xr = "_detailChatListItemIcon_b4j29_1316", Yr = "_detailChatListItemTitle_b4j29_1321", Vr = "_detailChatListItemRemove_b4j29_1328", Zr = "_detailChatEmpty_b4j29_1342", Qr = "_detailTitleInput_b4j29_1549", eo = "_detailAttrGrid_b4j29_1578", to = "_detailAttrFull_b4j29_1584", ao = "_detailAttrField_b4j29_1587", no = "_detailAttrLabel_b4j29_1593", so = "_detailTagRow_b4j29_1598", ro = "_detailTagInput_b4j29_1613", oo = "_detailInputPrefix_b4j29_1618", io = "_detailSection_b4j29_1622", lo = "_detailSectionTitle_b4j29_1625", co = "_detailHint_b4j29_1631", uo = "_detailChildRow_b4j29_1636", po = "_detailChildTitle_b4j29_1642", mo = "_detailChildTitleDone_b4j29_1651", ho = "_detailLinkList_b4j29_1683", fo = "_detailLinkListItem_b4j29_1694", _o = "_detailLinkListItemIcon_b4j29_1716", bo = "_detailLinkListItemTitle_b4j29_1721", go = "_detailLinkListItemActions_b4j29_1728", yo = "_detailLinkListItemRemove_b4j29_1739", Co = "_detailFullWidth_b4j29_1806", Io = "_detailSaveBtn_b4j29_1817", No = "_detailEditorWrap_b4j29_1823", To = "_addModalBody_b4j29_2075", jo = "_addModalRow_b4j29_2080", vo = "_addModalProject_b4j29_2085", So = "_addModalPriority_b4j29_2088", wo = "_addModalDue_b4j29_2091", Do = "_addModalHint_b4j29_2094", Lo = "_membersTitleIcon_b4j29_2152", ko = "_membersSection_b4j29_2156", Ao = "_membersLabel_b4j29_2161", $o = "_membersList_b4j29_2166", Oo = "_membersRow_b4j29_2171", Mo = "_membersAvatar_b4j29_2185", Po = "_membersAvatarOwner_b4j29_2195", Ro = "_membersName_b4j29_2199", Eo = "_membersRole_b4j29_2209", Uo = "_membersRoleOwner_b4j29_2217", xo = "_membersRemove_b4j29_2221", Bo = "_membersEmpty_b4j29_2241", Ho = "_membersSelect_b4j29_2248", zo = "_membersDenied_b4j29_2251", a = {
  container: rn,
  detailDrawer: on,
  detailDropdown: ln,
  addModal: cn,
  addModalDropdown: dn,
  addModalPicker: un,
  membersModal: pn,
  columnModal: mn,
  sidebar: hn,
  sidebarSection: fn,
  sidebarTitle: _n,
  sidebarTitleAction: bn,
  sideItem: gn,
  sideItemActive: yn,
  sideItemIcon: Cn,
  sideItemLabel: In,
  sideItemCount: Nn,
  sideGroupLabel: Tn,
  main: jn,
  header: vn,
  headerTitle: Sn,
  headerSubtitle: wn,
  headerMembers: Dn,
  toolbar: Ln,
  toolbarSpacer: kn,
  toolbarSearch: An,
  groupSeg: $n,
  listScroll: On,
  boardWrap: Mn,
  boardCol: Pn,
  boardColDropOver: Rn,
  boardColHeader: En,
  boardColTitle: Un,
  boardColCount: xn,
  boardColSpacer: Bn,
  boardColAdd: Hn,
  addRow: zn,
  boardColBody: Fn,
  boardColEmpty: Gn,
  boardColAddRow: Wn,
  boardAddColumn: qn,
  boardColHeaderMovable: Jn,
  boardColDragging: Kn,
  boardColDropBefore: Xn,
  boardColDropAfter: Yn,
  columnModalField: Vn,
  columnModalLabel: Zn,
  columnModalControl: Qn,
  dropLine: es,
  itemCard: ts,
  itemCardDone: as,
  cardStripe: ns,
  cardStripeHigh: ss,
  cardStripeMedium: rs,
  cardStripeLow: os,
  cardMain: is,
  cardHead: ls,
  cardCheck: cs,
  cardTitle: ds,
  cardTitleDone: us,
  cardDel: ps,
  cardMeta: ms,
  cardFoot: hs,
  cardFootSpacer: fs,
  cardChip: _s,
  cardChipMuted: bs,
  cardChipDue: gs,
  cardChipOverdue: ys,
  cardChipToday: Cs,
  cardChipTag: Is,
  cardAvatars: Ns,
  cardAvatar: Ts,
  cardAvatarMore: js,
  cardAssigneeName: vs,
  cardUnassigned: Ss,
  dragHandle: ws,
  itemRow: Ds,
  itemRowDragging: Ls,
  sideItemWrap: ks,
  sideDropLine: As,
  sideItemDropOver: $s,
  itemCheck: Os,
  priorityDot: Ms,
  priorityHigh: Ps,
  priorityMedium: Rs,
  priorityLow: Es,
  itemBody: Us,
  itemTitle: xs,
  itemTitleDone: Bs,
  itemMetaRow: Hs,
  tagChip: zs,
  dueChip: Fs,
  dueChipOverdue: Gs,
  dueChipToday: Ws,
  assigneeChip: qs,
  statusChip: Js,
  statusTodo: Ks,
  statusProgress: Xs,
  statusDone: Ys,
  projectChip: Vs,
  linkIcon: Zs,
  rowActions: Qs,
  rowActionBtn: er,
  rowActionBtnDanger: tr,
  childCount: ar,
  projectGroup: nr,
  projectGroupHeader: sr,
  projectGroupTitle: rr,
  projectGroupCount: or,
  emptyWrap: ir,
  emptyHint: lr,
  detailThreeCol: cr,
  detailCol: dr,
  detailColMain: ur,
  detailColLinksPanel: pr,
  detailColLinksPanelWithEditor: mr,
  detailColLinksSide: hr,
  detailColNotes: fr,
  detailColNotesExpanded: _r,
  detailColHeaderActions: br,
  detailPanelToggleBtn: gr,
  detailColHeader: yr,
  detailColBody: Cr,
  detailColBodyFlush: Ir,
  detailColToolbar: Nr,
  detailColToolbarSelect: Tr,
  detailColCenterSpin: jr,
  detailNoteLayout: vr,
  detailNoteSidebar: Sr,
  detailNoteSidebarToolbar: wr,
  detailNoteSidebarSelect: Dr,
  detailNoteSidebarList: Lr,
  detailNoteSidebarItem: kr,
  detailNoteSidebarItemActive: Ar,
  detailNoteSidebarItemIcon: $r,
  detailNoteSidebarItemTitle: Or,
  detailNoteSidebarItemRemove: Mr,
  detailNoteSidebarEmpty: Pr,
  detailNoteLayoutListOnly: Rr,
  detailNoteMain: Er,
  detailNoteToolbar: Ur,
  detailNoteTitleInput: xr,
  detailNoteReadOnlyTag: Br,
  detailNoteEditorBody: Hr,
  detailNoteTocPanel: zr,
  detailNoteTocHeader: Fr,
  detailNoteTocList: Gr,
  detailNoteTocItem: Wr,
  detailNoteTocEmpty: qr,
  detailChatList: Jr,
  detailChatListItem: Kr,
  detailChatListItemIcon: Xr,
  detailChatListItemTitle: Yr,
  detailChatListItemRemove: Vr,
  detailChatEmpty: Zr,
  detailTitleInput: Qr,
  detailAttrGrid: eo,
  detailAttrFull: to,
  detailAttrField: ao,
  detailAttrLabel: no,
  detailTagRow: so,
  detailTagInput: ro,
  detailInputPrefix: oo,
  detailSection: io,
  detailSectionTitle: lo,
  detailHint: co,
  detailChildRow: uo,
  detailChildTitle: po,
  detailChildTitleDone: mo,
  detailLinkList: ho,
  detailLinkListItem: fo,
  detailLinkListItemIcon: _o,
  detailLinkListItemTitle: bo,
  detailLinkListItemActions: go,
  detailLinkListItemRemove: yo,
  detailFullWidth: Co,
  detailSaveBtn: Io,
  detailEditorWrap: No,
  addModalBody: To,
  addModalRow: jo,
  addModalProject: vo,
  addModalPriority: So,
  addModalDue: wo,
  addModalHint: Do,
  membersTitleIcon: Lo,
  membersSection: ko,
  membersLabel: Ao,
  membersList: $o,
  membersRow: Oo,
  membersAvatar: Mo,
  membersAvatarOwner: Po,
  membersName: Ro,
  membersRole: Eo,
  membersRoleOwner: Uo,
  membersRemove: xo,
  membersEmpty: Bo,
  membersSelect: Ho,
  membersDenied: zo
}, Fo = /* @__PURE__ */ n("span", { children: "取消" });
function Go({
  open: e,
  token: t,
  myUserId: s,
  viewProject: r,
  bundle: o,
  preset: d,
  onCancel: i,
  onCreated: m
}) {
  const [_, T] = g(""), [D, P] = g(""), [f, U] = g(Ie), [v, F] = g("MEDIUM"), [R, Y] = g(null), [h, y] = g([]), [A, H] = g([]), [Z, Q] = g(!1);
  Ce(() => {
    e && (T(""), P(""), U(d.projectId ?? (r == null ? void 0 : r.id) ?? Ie), F(d.priority ?? "MEDIUM"), Y(null), y(d.assigneeUserIds ?? []), H([]));
  }, [e]);
  const V = pe(
    () => ve(f) ? [...(o == null ? void 0 : o.owned) ?? [], ...(o == null ? void 0 : o.joined) ?? []].find(
      (L) => L.id === f
    ) ?? null : null,
    [f, o]
  ), $ = pe(() => {
    const L = V ? [
      {
        userId: V.userId,
        name: V.createByName || "项目 owner"
      },
      ...(V.memberDetails ?? []).map((E) => ({
        userId: E.userId,
        name: E.userName
      }))
    ] : [], ae = new Set(L.map((E) => E.userId));
    for (const E of A)
      ae.has(E.userId) || L.push(E);
    return L;
  }, [V, A]), ee = async (L) => {
    if (!L.trim()) {
      H([]);
      return;
    }
    try {
      const ae = await Xt("", L.trim(), t);
      H(
        (ae ?? []).map((E) => ({
          userId: String(E.userId),
          name: String(E.name)
        }))
      );
    } catch {
      H([]);
    }
  }, z = async () => {
    const L = _.trim();
    if (!L) {
      k.warning("请输入事项标题");
      return;
    }
    const ae = [];
    if (h.length > 0 && V)
      for (const E of h) {
        if (E === V.userId || (V.memberDetails ?? []).some((te) => te.userId === E)) continue;
        if (V.userId !== s) {
          k.warning(
            "指派对象必须是项目成员，仅项目 owner 可添加新成员，请先请 owner 添加"
          );
          return;
        }
        const oe = $.find((te) => te.userId === E);
        ae.push({ userId: E, userName: (oe == null ? void 0 : oe.name) ?? E });
      }
    Q(!0);
    try {
      if (V)
        for (const le of ae)
          await Wt(V.id, le, t);
      const E = await qt(
        {
          title: L,
          detail: D.trim() || void 0,
          priority: v,
          dueDate: R ? R.format("YYYY-MM-DD") : void 0,
          projectId: ve(f) ? f : void 0,
          assigneeUserIds: h,
          // z-team 后端当前仅支持单指派人：首位兜底
          assigneeUserId: h[0]
        },
        t
      );
      d.status && d.status !== "TODO" && await Ye(E.id, { status: d.status }, t), k.success("事项已添加"), m();
    } catch (E) {
      k.error((E == null ? void 0 : E.userMessage) ?? "添加失败");
    } finally {
      Q(!1);
    }
  }, W = [...(o == null ? void 0 : o.owned) ?? [], ...(o == null ? void 0 : o.joined) ?? []];
  return /* @__PURE__ */ n(
    De,
    {
      title: "新建事项",
      open: e,
      width: 440,
      className: a.addModal,
      onCancel: i,
      onOk: z,
      okText: /* @__PURE__ */ n("span", { children: "添加" }),
      cancelText: Fo,
      confirmLoading: Z,
      destroyOnHidden: !0,
      children: /* @__PURE__ */ c("div", { className: a.addModalBody, children: [
        /* @__PURE__ */ n(
          Te,
          {
            placeholder: "事项标题",
            value: _,
            onChange: (L) => T(L.target.value),
            onPressEnter: z,
            maxLength: 200,
            autoFocus: !0
          }
        ),
        /* @__PURE__ */ n(
          Te.TextArea,
          {
            rows: 3,
            placeholder: "补充描述（可选）",
            value: D,
            onChange: (L) => P(L.target.value)
          }
        ),
        /* @__PURE__ */ c("div", { className: a.addModalRow, children: [
          /* @__PURE__ */ n(
            je,
            {
              className: a.addModalProject,
              dropdownClassName: a.addModalDropdown,
              value: f,
              onChange: (L) => {
                U(L), y([]);
              },
              options: [
                { value: Ie, label: "收集箱" },
                ...W.map((L) => ({
                  value: L.id,
                  label: L.title
                }))
              ]
            }
          ),
          /* @__PURE__ */ n(
            je,
            {
              className: a.addModalPriority,
              dropdownClassName: a.addModalDropdown,
              value: v,
              onChange: (L) => F(L),
              options: [
                { value: "HIGH", label: "高优先级" },
                { value: "MEDIUM", label: "中优先级" },
                { value: "LOW", label: "低优先级" }
              ]
            }
          ),
          /* @__PURE__ */ n(
            xt,
            {
              className: a.addModalDue,
              dropdownClassName: a.addModalPicker,
              allowClear: !0,
              placeholder: "截止日期",
              value: R,
              onChange: (L) => Y(L)
            }
          )
        ] }),
        /* @__PURE__ */ n(
          je,
          {
            mode: "multiple",
            popupClassName: a.addModalDropdown,
            virtual: !1,
            allowClear: !0,
            showSearch: !0,
            filterOption: !1,
            disabled: !ve(f),
            value: h,
            onChange: (L) => y(L ?? []),
            onSearch: ee,
            options: $.map((L) => ({
              value: L.userId,
              label: L.name
            })),
            notFoundContent: "输入姓名/工号搜索员工",
            placeholder: ve(f) ? "指派给（可多选，可搜全部员工，非项目成员将自动加入项目）" : "收集箱事项不支持指派，请先选择所属项目"
          }
        )
      ] })
    }
  );
}
const Wo = [
  { status: "TODO", label: "待办" },
  { status: "DOING", label: "进行中" },
  { status: "DONE", label: "已完成" },
  { status: "ARCHIVED", label: "已归档" }
], Me = "__custom__";
function qo() {
  const e = Math.random().toString(36).slice(2, 8).toUpperCase(), t = Date.now().toString(36).slice(-2).toUpperCase();
  return `C_${e}${t}`.slice(0, 10);
}
function Jo({
  preset: e,
  columns: t,
  onCancel: s,
  onSubmit: r
}) {
  const [o, d] = g(Me), [i, m] = g(""), [_, T] = g(""), [D, P] = g(!1);
  if (Ce(() => {
    e && (e.mode === "rename" ? T(e.label) : (d(Me), m(""), T("")));
  }, [e]), !e) return null;
  const f = e.mode === "rename", U = new Set(t.map((h) => String(h.status))), v = Wo.filter(
    (h) => !U.has(h.status)
  ).map((h) => ({ value: h.status, label: `内置状态：${h.label}` })), F = _.trim() || i.trim(), R = async () => {
    if (e.mode === "rename") {
      const y = _.trim();
      if (!y) return;
      if (y === e.label) {
        s();
        return;
      }
      P(!0);
      try {
        await r({ status: e.status, label: y });
      } finally {
        P(!1);
      }
      return;
    }
    if (!F) return;
    const h = o === Me ? qo() : o;
    P(!0);
    try {
      await r({ status: h, label: F });
    } finally {
      P(!1);
    }
  }, Y = f ? !_.trim() : !F;
  return /* @__PURE__ */ c(
    De,
    {
      open: !0,
      width: 400,
      className: a.columnModal,
      title: f ? "重命名列" : "新增看板列",
      okText: f ? "保存" : "新增",
      cancelText: "取消",
      okButtonProps: { disabled: Y, loading: D },
      onOk: () => {
        R();
      },
      onCancel: s,
      destroyOnHidden: !0,
      children: [
        !f && /* @__PURE__ */ c("div", { className: a.columnModalField, children: [
          /* @__PURE__ */ n("span", { className: a.columnModalLabel, children: "绑定状态" }),
          /* @__PURE__ */ n(
            je,
            {
              className: a.columnModalControl,
              value: o,
              onChange: (h) => d(h),
              options: [
                { value: Me, label: "＋ 新建自定义状态" },
                ...v
              ]
            }
          )
        ] }),
        !f && o === Me && /* @__PURE__ */ c("div", { className: a.columnModalField, children: [
          /* @__PURE__ */ n("span", { className: a.columnModalLabel, children: "状态名称" }),
          /* @__PURE__ */ n(
            Te,
            {
              className: a.columnModalControl,
              placeholder: "如：待验收、测试中",
              maxLength: 16,
              value: i,
              onChange: (h) => m(h.target.value)
            }
          )
        ] }),
        /* @__PURE__ */ c("div", { className: a.columnModalField, children: [
          /* @__PURE__ */ n("span", { className: a.columnModalLabel, children: "列名" }),
          /* @__PURE__ */ n(
            Te,
            {
              className: a.columnModalControl,
              placeholder: f ? "输入新的列名" : o === Me ? "默认与状态名称一致" : "默认与状态名一致",
              maxLength: 16,
              value: _,
              onChange: (h) => T(h.target.value),
              onPressEnter: () => {
                Y || R();
              }
            }
          )
        ] })
      ]
    }
  );
}
function Di(e) {
  const t = /* @__PURE__ */ new Map(), s = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Map();
  if (e)
    for (const o of [...e.owned, ...e.joined]) {
      t.set(o.id, o), o.createByName && o.userId && s.set(o.userId, o.createByName);
      for (const d of o.memberDetails ?? [])
        s.set(d.userId, d.userName);
      for (const d of Xe(o.extraInfo))
        r.has(d.status) || r.set(d.status, d.label);
    }
  return { byId: t, userNameById: s, statusLabelByKey: r };
}
function Qt(e, t) {
  var s;
  return e.projectId == null ? "收集箱" : ((s = t.byId.get(e.projectId)) == null ? void 0 : s.title) ?? `项目#${e.projectId}`;
}
function Li(e, t, s = []) {
  const r = new Set(s);
  return e.filter((o) => !o.parentId && !r.has(o.id)).map((o) => {
    const d = Qt(o, t), i = Ze[o.status] ?? o.status;
    return {
      value: o.id,
      label: `[${d}] ${o.title} · ${i}`
    };
  });
}
function ki(e, t) {
  return e.filter(
    (s) => s.links.some((r) => r.type === "note" && q(r.id, t))
  );
}
function Ai(e, t) {
  return e.links.some((s) => s.type === "note" && q(s.id, t));
}
function Ko(e, t, s) {
  return e.some((r) => r.type === "note" && q(r.id, t)) ? e : [...e, { type: "note", id: t, title: s }];
}
function Xo(e, t) {
  return e.filter((s) => !(s.type === "note" && q(s.id, t)));
}
function Yo(e, t) {
  return e.filter(
    (s) => !(s.type === "project" && q(s.id, t))
  );
}
function $i(e, t) {
  const s = Qt(e, t), r = Ze[e.status] ?? e.status;
  return `[${s}] ${e.title} · ${r}`;
}
const Vo = "super_common";
function Mt(e) {
  window.open(
    `${window.location.origin}/workspace?projectId=${e}`,
    "_blank",
    "noopener,noreferrer"
  );
}
function Zo({
  item: e,
  projectLinks: t,
  chatOptions: s,
  token: r,
  onPatchLinks: o
}) {
  const [d, i] = g(!1), [m, _] = g(e.title), [T, D] = g(!1), P = async () => {
    const f = m.trim() || e.title;
    D(!0);
    try {
      const U = await en(
        {
          name: f,
          description: `由工作待办事项「${e.title}」发起`,
          workspace_path: "",
          scenario_code: Vo,
          // 溯源信息必须走 extend_params：后端 ScenarioInstanceCreateRequest
          // 只有 name/description/workspacePath/scenarioCode/source/extendParams
          // 六个字段，原先传的 tags 不在其中，会被 Jackson 静默丢弃
          // （该值类型还是 object，而 extend_params 约定是 Record<string,string>）。
          extend_params: { source: "work_todo", todo_item_id: String(e.id) }
        },
        r
      );
      o([
        ...e.links,
        { type: "project", id: se(U.id), title: f }
      ]), i(!1), k.success("群聊已创建"), Mt(se(U.id));
    } catch (U) {
      k.error(
        (U == null ? void 0 : U.userMessage) ?? "创建群聊失败"
      );
    } finally {
      D(!1);
    }
  };
  return /* @__PURE__ */ c(ft, { children: [
    /* @__PURE__ */ c("div", { className: a.detailColToolbar, children: [
      /* @__PURE__ */ n(
        je,
        {
          size: "small",
          className: a.detailColToolbarSelect,
          dropdownClassName: a.detailDropdown,
          showSearch: !0,
          placeholder: "关联已有群聊",
          optionFilterProp: "label",
          options: s,
          value: null,
          onChange: (f) => {
            const U = s.find((v) => v.value === f);
            if (U) {
              if (e.links.some(
                (v) => v.type === "project" && q(v.id, f)
              )) {
                k.info("该群聊已关联");
                return;
              }
              o([
                ...e.links,
                // Select 选中回调的 v 类型含 null；此处已由 opt 判空保证有效值
                { type: "project", id: f ?? void 0, title: U.label }
              ]);
            }
          }
        }
      ),
      /* @__PURE__ */ n(
        _e,
        {
          size: "small",
          icon: /* @__PURE__ */ n(xe, {}),
          onClick: () => {
            _(e.title), i(!0);
          },
          children: "发起群聊"
        }
      )
    ] }),
    t.length > 0 ? /* @__PURE__ */ n("div", { className: a.detailChatList, children: t.map((f) => {
      const U = se(f.id);
      return /* @__PURE__ */ c(
        "div",
        {
          className: a.detailChatListItem,
          onClick: () => Mt(U),
          children: [
            /* @__PURE__ */ n(xe, { className: a.detailChatListItemIcon }),
            /* @__PURE__ */ n(
              "span",
              {
                className: a.detailChatListItemTitle,
                title: f.title,
                children: f.title
              }
            ),
            /* @__PURE__ */ n(
              _t,
              {
                className: a.detailChatListItemRemove,
                onClick: (v) => {
                  v.stopPropagation(), o(Yo(e.links, U));
                }
              }
            )
          ]
        },
        `project-${f.id}`
      );
    }) }) : /* @__PURE__ */ n("div", { className: a.detailChatEmpty, children: "暂无关联群聊" }),
    /* @__PURE__ */ n(
      De,
      {
        title: "发起全能群聊",
        open: d,
        width: 420,
        className: a.addModal,
        onCancel: () => i(!1),
        onOk: P,
        okText: "创建并打开",
        cancelText: "取消",
        confirmLoading: T,
        destroyOnHidden: !0,
        children: /* @__PURE__ */ c("div", { className: a.addModalBody, children: [
          /* @__PURE__ */ n(
            Te,
            {
              placeholder: "群聊名称（默认取事项标题）",
              value: m,
              onChange: (f) => _(f.target.value)
            }
          ),
          /* @__PURE__ */ n("div", { className: a.addModalHint, children: "使用全能场景（super_common）：故障排查、知识咨询、数据分析等均可直接在群内提问， 由超级场景总控自动路由。创建后将自动关联到本事项并在新标签页打开群聊。" })
        ] })
      }
    )
  ] });
}
function Qo(e) {
  const t = [], s = e.split(`
`);
  let r = 0, o = 0;
  for (const d of s) {
    const i = d.match(/^(#{1,6})\s+(.+?)\s*$/);
    if (i) {
      const m = i[1].length, _ = i[2].replace(/[#*_`~]/g, "").trim();
      t.push({ level: m, text: _, index: o++, offset: r });
    }
    r += d.length + 1;
  }
  return t;
}
function ei({
  noteLinks: e,
  noteOptions: t,
  token: s,
  onAddNote: r,
  onRemoveNote: o,
  onEditorOpenChange: d
}) {
  const [i, m] = g(null), [_, T] = g(!1), [D, P] = g(""), [f, U] = g(""), [v, F] = g(!1), [R, Y] = g(!1), [h, y] = g("idle"), [A, H] = g("live"), [Z, Q] = g(!1), [V, $] = g(!1), [ee, z] = g(!1), [W, L] = g(!1), [ae, E] = g(!1), le = we(null), oe = we(null), te = we(null), de = we(""), I = we("");
  Ce(() => {
    te.current = i;
  }, [i]), Ce(() => {
    i != null && !e.some((C) => q(C.id, i)) && (m(null), E(!1));
  }, [e, i]);
  const M = ie(
    async (C = !1) => {
      const G = te.current;
      if (!(!G || v || !R && !C)) {
        y("saving");
        try {
          await qa(
            G,
            { title: de.current, content: I.current },
            s
          ), Y(!1), y("saved"), setTimeout(() => {
            y((ue) => ue === "saved" ? "idle" : ue);
          }, 3e3);
        } catch {
          y("error"), k.error("保存失败");
        }
      }
    },
    [v, R, s]
  ), b = ie(() => {
    v || (Y(!0), y("unsaved"), oe.current && clearTimeout(oe.current), oe.current = setTimeout(() => {
      M();
    }, 2e3));
  }, [v, M]), l = ie(async () => {
    oe.current && (clearTimeout(oe.current), oe.current = null), await M(!0);
  }, [M]), N = ie(
    async (C) => {
      T(!0), E(!1), Y(!1), y("idle"), H("live"), Q(!1), z(!1), m(C), te.current = C;
      try {
        const G = await Wa(C, s);
        if (!q(te.current, C)) return;
        de.current = G.title, I.current = G.content ?? "", P(G.title), U(G.content ?? ""), F(!1), E(!0);
        const ue = await Ka(s).catch(() => []);
        if (te.current !== C) return;
        z(
          Array.isArray(ue) && ue.some((be) => be.refId === C)
        );
      } catch {
        q(te.current, C) && (k.error("加载笔记失败"), E(!1));
      } finally {
        q(te.current, C) && T(!1);
      }
    },
    [s]
  ), S = ie(async () => {
    R && !v && await l(), m(null), te.current = null, E(!1), T(!1), Y(!1), y("idle");
  }, [R, v, l]), x = ie(
    async (C) => {
      if (q(i, C) && (ae || _)) {
        await S();
        return;
      }
      i && !q(i, C) && R && !v && await l(), await N(C);
    },
    [
      i,
      ae,
      _,
      R,
      v,
      l,
      N,
      S
    ]
  ), he = ie(async () => {
    const C = te.current;
    if (C) {
      $(!0);
      try {
        const G = await Ja(C, s), ue = `${window.location.origin}/note/shared?token=${G}`;
        let be = !1;
        try {
          await navigator.clipboard.writeText(ue), be = !0;
        } catch {
          const fe = document.createElement("textarea");
          fe.value = ue, fe.style.cssText = "position:fixed;opacity:0;", document.body.appendChild(fe), fe.select();
          try {
            document.execCommand("copy"), be = !0;
          } catch {
          }
          document.body.removeChild(fe);
        }
        k.success(
          be ? "分享链接已复制到剪贴板" : "复制失败，请手动复制链接"
        );
      } catch {
        k.error("生成分享链接失败");
      } finally {
        $(!1);
      }
    }
  }, [s]), ce = ie(async () => {
    const C = te.current;
    if (C != null) {
      L(!0);
      try {
        ee ? (await Ya(C, s), z(!1), k.success("已取消收藏")) : (await Xa(C, s), z(!0), k.success("已收藏到个人面板"));
      } catch {
        k.error(ee ? "取消收藏失败" : "收藏失败");
      } finally {
        L(!1);
      }
    }
  }, [ee, s]), u = pe(() => Qo(f), [f]), w = ie(
    (C) => {
      var G, ue, be;
      if (A === "source") {
        const fe = (G = le.current) == null ? void 0 : G.getTextarea();
        fe && (fe.focus(), fe.setSelectionRange(C.offset, C.offset));
      } else {
        const fe = (ue = le.current) == null ? void 0 : ue.getLiveRoot(), Ee = fe == null ? void 0 : fe.querySelectorAll("h1,h2,h3,h4,h5,h6");
        (be = Ee == null ? void 0 : Ee[C.index]) == null || be.scrollIntoView({ behavior: "smooth" });
      }
    },
    [A]
  ), B = !!(i && (_ || ae));
  return Ce(() => {
    d == null || d(B);
  }, [B, d]), /* @__PURE__ */ c(
    "div",
    {
      className: `${a.detailNoteLayout} ${B ? "" : a.detailNoteLayoutListOnly}`,
      children: [
        /* @__PURE__ */ c("aside", { className: a.detailNoteSidebar, children: [
          /* @__PURE__ */ n("div", { className: a.detailNoteSidebarToolbar, children: /* @__PURE__ */ n(
            je,
            {
              size: "small",
              className: a.detailNoteSidebarSelect,
              dropdownClassName: a.detailDropdown,
              showSearch: !0,
              placeholder: "关联个人笔记",
              optionFilterProp: "label",
              options: t,
              filterOption: (C, G) => ((G == null ? void 0 : G.label) ?? "").toLowerCase().includes(C.toLowerCase()),
              value: null,
              onChange: (C) => {
                if (C == null) return;
                const G = t.find((be) => q(be.value, C));
                if (!G) return;
                const ue = G.label.split("/").pop() ?? G.label;
                r(C, ue), x(C);
              }
            }
          ) }),
          e.length > 0 ? /* @__PURE__ */ n("div", { className: a.detailNoteSidebarList, children: e.map((C) => {
            const G = se(C.id), ue = q(i, G);
            return /* @__PURE__ */ c(
              "div",
              {
                className: `${a.detailNoteSidebarItem} ${ue ? a.detailNoteSidebarItemActive : ""}`,
                onClick: () => void x(G),
                children: [
                  /* @__PURE__ */ n(
                    it,
                    {
                      className: a.detailNoteSidebarItemIcon
                    }
                  ),
                  /* @__PURE__ */ n(
                    "span",
                    {
                      className: a.detailNoteSidebarItemTitle,
                      title: C.title,
                      children: C.title
                    }
                  ),
                  /* @__PURE__ */ n(
                    _t,
                    {
                      className: a.detailNoteSidebarItemRemove,
                      onClick: (be) => {
                        be.stopPropagation(), q(i, G) && S(), o(G);
                      }
                    }
                  )
                ]
              },
              `note-${C.id}`
            );
          }) }) : /* @__PURE__ */ n("div", { className: a.detailNoteSidebarEmpty, children: "暂无关联笔记" })
        ] }),
        B && /* @__PURE__ */ n("div", { className: a.detailNoteMain, children: _ ? /* @__PURE__ */ n("div", { className: a.detailColCenterSpin, children: /* @__PURE__ */ n(Bt, {}) }) : ae && i ? /* @__PURE__ */ c(ft, { children: [
          /* @__PURE__ */ c("div", { className: a.detailNoteToolbar, children: [
            /* @__PURE__ */ n(
              "input",
              {
                className: a.detailNoteTitleInput,
                value: D,
                disabled: v,
                placeholder: "文档标题",
                onChange: (C) => {
                  const G = C.target.value;
                  P(G), de.current = G, b();
                }
              }
            ),
            !v && /* @__PURE__ */ n(
              Ht,
              {
                size: "small",
                value: A,
                onChange: (C) => H(C),
                options: [
                  { label: "预览", value: "live" },
                  { label: "源码", value: "source" }
                ]
              }
            ),
            /* @__PURE__ */ n(Ke, { title: "大纲", children: /* @__PURE__ */ n(
              _e,
              {
                size: "small",
                type: Z ? "primary" : "text",
                icon: /* @__PURE__ */ n(fa, {}),
                onClick: () => Q((C) => !C)
              }
            ) }),
            /* @__PURE__ */ n(Ke, { title: "分享链接", children: /* @__PURE__ */ n(
              _e,
              {
                size: "small",
                type: "text",
                icon: /* @__PURE__ */ n(_a, {}),
                loading: V,
                onClick: () => void he()
              }
            ) }),
            !v && /* @__PURE__ */ n(
              _e,
              {
                size: "small",
                icon: ee ? /* @__PURE__ */ n(ba, {}) : /* @__PURE__ */ n(ga, {}),
                loading: W,
                onClick: () => void ce(),
                children: ee ? "已收藏" : "收藏"
              }
            ),
            !v && /* @__PURE__ */ n(
              _e,
              {
                size: "small",
                type: "primary",
                loading: h === "saving",
                onClick: () => void l(),
                children: "保存"
              }
            ),
            v && /* @__PURE__ */ n("span", { className: a.detailNoteReadOnlyTag, children: "只读" })
          ] }),
          /* @__PURE__ */ c("div", { className: a.detailNoteEditorBody, children: [
            /* @__PURE__ */ n(
              Ft,
              {
                ref: le,
                mode: A,
                value: f,
                readOnly: v,
                onChange: (C) => {
                  U(C), I.current = C, b();
                },
                onUploadImage: Yt,
                onSave: l,
                placeholder: "笔记内容（支持 Markdown，可直接粘贴图片）"
              },
              i
            ),
            Z && /* @__PURE__ */ c("div", { className: a.detailNoteTocPanel, children: [
              /* @__PURE__ */ n("div", { className: a.detailNoteTocHeader, children: "大纲" }),
              /* @__PURE__ */ n("div", { className: a.detailNoteTocList, children: u.length === 0 ? /* @__PURE__ */ n("span", { className: a.detailNoteTocEmpty, children: "暂无标题" }) : u.map((C) => /* @__PURE__ */ n(
                "div",
                {
                  className: a.detailNoteTocItem,
                  style: { paddingLeft: 8 + (C.level - 1) * 14 },
                  onClick: () => w(C),
                  title: C.text,
                  children: C.text
                },
                C.index
              )) })
            ] })
          ] })
        ] }) : null })
      ]
    }
  );
}
function ti({
  item: e,
  token: t,
  onChanged: s,
  onOpenSession: r
}) {
  const [o, d] = g([]), [i, m] = g(), [_, T] = g(!1), [D, P] = g(null), f = !!e.agentSessionId, U = !ve(e.projectId), v = !f && !U;
  Ce(() => {
    if (!v || o.length > 0) return;
    let y = !0;
    return Za(t).then((A) => {
      if (!y) return;
      const H = Array.isArray(A) ? A : [];
      d(H);
      const Z = H[0];
      Z && m(String(Z.id));
    }).catch(() => {
    }), () => {
      y = !1;
    };
  }, [v, o.length, t]);
  const F = (y) => {
    if (!y) return "";
    const A = o.find((H) => q(H.id, y));
    return (A == null ? void 0 : A.displayName) || `Agent #${y}`;
  }, R = ie(async () => {
    if (!i) {
      k.warning("先选一个 Agent");
      return;
    }
    T(!0);
    try {
      const y = await za(e.id, i, t);
      P(y), s();
    } catch (y) {
      k.error(y instanceof Error ? y.message : "派发失败");
    } finally {
      T(!1);
    }
  }, [e.id, i, t, s]), Y = ie(async () => {
    T(!0);
    try {
      await Fa(e.id, t), k.success("已取消派发（会话仍保留在项目空间的聊天记录里）"), s();
    } catch (y) {
      k.error(y instanceof Error ? y.message : "取消派发失败");
    } finally {
      T(!1);
    }
  }, [e.id, t, s]), h = ie(async () => {
    var y;
    if (D)
      try {
        await ((y = navigator.clipboard) == null ? void 0 : y.writeText(D.kickoff)), k.success("任务书已复制");
      } catch {
        k.warning("复制失败，请手动选中复制");
      }
  }, [D]);
  return /* @__PURE__ */ c("div", { className: a.detailSection, children: [
    /* @__PURE__ */ c("div", { className: a.detailSectionTitle, children: [
      /* @__PURE__ */ n(ya, {}),
      " Agent"
    ] }),
    f ? /* @__PURE__ */ c(Ge, { direction: "vertical", size: 6, style: { width: "100%" }, children: [
      /* @__PURE__ */ c(Ge, { size: 6, wrap: !0, children: [
        /* @__PURE__ */ c(ct, { color: "processing", children: [
          "已交给 ",
          F(e.agentId) || "Agent"
        ] }),
        /* @__PURE__ */ c(Dt.Text, { type: "secondary", style: { fontSize: 12 }, children: [
          "会话 #",
          e.agentSessionId
        ] })
      ] }),
      /* @__PURE__ */ c(Ge, { size: 6, wrap: !0, children: [
        r && e.agentId ? /* @__PURE__ */ n(
          _e,
          {
            size: "small",
            onClick: () => r(e.agentSessionId, e.agentId),
            children: "打开会话"
          }
        ) : null,
        /* @__PURE__ */ n(_e, { size: "small", danger: !0, loading: _, onClick: Y, children: "取消派发" })
      ] }),
      /* @__PURE__ */ n("div", { className: a.detailHint, children: "会话在「聊天记录」的项目空间分组里，随时可以继续追问或纠偏。" })
    ] }) : U ? /* @__PURE__ */ n("div", { className: a.detailHint, children: "收集箱待办没有项目空间。先把它归到某个项目，Agent 才有地方读文件、写产出。" }) : /* @__PURE__ */ c(Ge, { size: 6, wrap: !0, children: [
      /* @__PURE__ */ n(
        je,
        {
          size: "small",
          style: { minWidth: 180 },
          placeholder: "选择 Agent",
          value: i,
          onChange: (y) => m(y),
          options: o.map((y) => ({
            value: String(y.id),
            label: y.displayName || `Agent #${y.id}`
          })),
          notFoundContent: "还没有个人 Agent"
        }
      ),
      /* @__PURE__ */ n(Ke, { title: "会开一个归属于本项目的会话，并把任务书交给你确认后发出", children: /* @__PURE__ */ n(_e, { type: "primary", size: "small", loading: _, onClick: R, children: "交给 Agent" }) })
    ] }),
    /* @__PURE__ */ c(
      De,
      {
        open: !!D,
        title: "任务书已生成",
        width: 720,
        onCancel: () => P(null),
        footer: [
          /* @__PURE__ */ n(_e, { onClick: h, children: "复制任务书" }, "copy"),
          /* @__PURE__ */ n(_e, { type: "primary", onClick: () => P(null), children: "知道了" }, "ok")
        ],
        children: [
          /* @__PURE__ */ c(Dt.Paragraph, { type: "secondary", style: { fontSize: 12 }, children: [
            "会话已创建并归组到项目「",
            D == null ? void 0 : D.projectSpaceTitle,
            "」。把下面这段发给它，就等于把活派清楚了 —— 里面已经带了项目空间的文件清单和同项目其它待办。"
          ] }),
          /* @__PURE__ */ n(
            "pre",
            {
              style: {
                maxHeight: 380,
                overflow: "auto",
                background: "rgba(0,0,0,0.03)",
                padding: 12,
                borderRadius: 8,
                fontSize: 12,
                whiteSpace: "pre-wrap",
                margin: 0
              },
              children: D == null ? void 0 : D.kickoff
            }
          )
        ]
      }
    )
  ] });
}
const Pt = 520, ai = 340;
function ni({
  item: e,
  allItems: t,
  projectCtx: s,
  bundle: r,
  token: o,
  myUserId: d,
  onClose: i,
  onChanged: m,
  onOpenSession: _
}) {
  const [T, D] = g(e.title), [P, f] = g(e.detail ?? ""), [U, v] = g(!1), [F, R] = g(""), [Y, h] = g([]), [y, A] = g([]), [H, Z] = g([]), [Q, V] = g(!1), [$, ee] = g(!1), z = e.projectId != null ? s.byId.get(e.projectId) : void 0;
  Ce(() => {
    V(!1), ee(!1);
  }, [e.id]), Ce(() => {
    D(e.title), f(e.detail ?? ""), Z(e.assigneeUserId ? [e.assigneeUserId] : []);
  }, [e.id, e.title, e.detail, e.assigneeUserId]), Ce(() => {
    Ga(o, !1).then((u) => h(ea(u))).catch(() => {
    });
  }, [o]), Ce(() => {
    Qa(o).then((u) => {
      const w = Array.isArray(u) ? u : [];
      A(
        w.map((B) => ({
          value: String(B.id ?? ""),
          label: String(B.name ?? "")
        }))
      );
    }).catch(() => {
    });
  }, [o]);
  const W = ie(
    async (u) => {
      try {
        await Ye(e.id, u, o), m();
      } catch (w) {
        k.error(
          (w == null ? void 0 : w.userMessage) ?? "保存失败"
        );
      }
    },
    [e.id, o, m]
  ), L = ie(
    (u) => W({ links: u }),
    [W]
  ), ae = ie(async () => {
    v(!0), await W({ detail: P }), v(!1);
  }, [W, P]), E = async (u) => {
    try {
      u === "DONE" && e.status !== "DONE" ? await mt(e.id, "", o) : await Ye(
        e.id,
        { status: u },
        o
      ), m();
    } catch (w) {
      k.error(
        (w == null ? void 0 : w.userMessage) ?? "状态更新失败"
      );
    }
  }, le = pe(
    () => t.filter((u) => q(u.parentId, e.id)),
    [t, e.id]
  ), oe = async () => {
    const u = F.trim();
    if (u)
      try {
        await qt(
          {
            title: u,
            parentId: e.id,
            projectId: e.projectId ?? void 0
          },
          o
        ), R(""), m();
      } catch {
        k.error("添加子事项失败");
      }
  }, te = e.links.filter((u) => u.type === "note"), de = e.links.filter((u) => u.type === "project"), I = e.links.filter((u) => u.type === "url"), M = [...(r == null ? void 0 : r.owned) ?? [], ...(r == null ? void 0 : r.joined) ?? []], b = e.projectId ?? Ie, l = [
    { value: Ie, label: "收集箱" },
    ...M.map((u) => ({ value: u.id, label: u.title }))
  ];
  ve(b) && !l.some((u) => q(u.value, b)) && l.push({
    value: b,
    // normalizeTodoItem 不产出 projectTitle，后端 TodoItem 实体也无该列，
    // 原 `?? item.projectTitle` 恒为 undefined。删掉后由 id 兜底。
    label: `项目 ${b}`
  });
  const N = pe(() => {
    const u = Object.entries(
      Ze
    ).map(([B, C]) => ({ value: B, label: C })), w = new Set(u.map((B) => B.value));
    for (const B of Xe(z == null ? void 0 : z.extraInfo)) {
      const C = String(B.status);
      w.has(C) || (u.push({ value: C, label: B.label }), w.add(C));
    }
    return w.has(e.status) || u.push({
      value: e.status,
      label: Qe(e.status, s)
    }), u;
  }, [z, e.status, s]), S = aa(e, s), x = (() => {
    if (!z) return [];
    const u = [], w = /* @__PURE__ */ new Set();
    z.userId && (u.push({
      value: z.userId,
      label: z.createByName || "项目 owner"
    }), w.add(z.userId));
    for (const B of z.memberDetails ?? [])
      w.has(B.userId) || (u.push({ value: B.userId, label: B.userName }), w.add(B.userId));
    return u;
  })(), he = new Set(x.map((u) => u.value));
  for (const u of S)
    he.has(u.userId) || (x.push({ value: u.userId, label: u.name }), he.add(u.userId));
  const ce = pe(() => Q ? $ ? "92%" : Pt + ai * 2 : Pt, [Q, $]);
  return /* @__PURE__ */ n(
    ja,
    {
      open: !0,
      width: ce,
      className: a.detailDrawer,
      title: `事项详情${z ? ` · ${z.title}` : " · 收集箱"}`,
      onClose: i,
      destroyOnHidden: !0,
      children: /* @__PURE__ */ c("div", { className: a.detailThreeCol, children: [
        /* @__PURE__ */ c("div", { className: `${a.detailCol} ${a.detailColMain}`, children: [
          /* @__PURE__ */ c("div", { className: a.detailColHeader, children: [
            /* @__PURE__ */ n("span", { children: "事项详情" }),
            /* @__PURE__ */ n("div", { className: a.detailColHeaderActions, children: /* @__PURE__ */ n(
              Ke,
              {
                title: Q ? "收起群聊/笔记面板" : "展开群聊与笔记",
                children: /* @__PURE__ */ c(
                  _e,
                  {
                    size: "small",
                    type: Q ? "primary" : "default",
                    className: Q ? void 0 : a.detailPanelToggleBtn,
                    icon: /* @__PURE__ */ n(xe, {}),
                    onClick: () => {
                      V((u) => (u && ee(!1), !u));
                    },
                    children: [
                      "群聊/笔记",
                      te.length + de.length > 0 ? ` ${te.length + de.length}` : ""
                    ]
                  }
                )
              }
            ) })
          ] }),
          /* @__PURE__ */ c("div", { className: a.detailColBody, children: [
            /* @__PURE__ */ n(
              Te,
              {
                className: a.detailTitleInput,
                value: T,
                onChange: (u) => D(u.target.value),
                onBlur: () => {
                  T.trim() && T.trim() !== e.title && W({ title: T.trim() });
                },
                onPressEnter: () => {
                  T.trim() && T.trim() !== e.title && W({ title: T.trim() });
                }
              }
            ),
            /* @__PURE__ */ c("div", { className: a.detailAttrGrid, children: [
              /* @__PURE__ */ c("div", { className: a.detailAttrField, children: [
                /* @__PURE__ */ n("span", { className: a.detailAttrLabel, children: "状态" }),
                /* @__PURE__ */ n(
                  je,
                  {
                    size: "small",
                    className: a.detailFullWidth,
                    dropdownClassName: a.detailDropdown,
                    value: e.status,
                    onChange: E,
                    options: N
                  }
                )
              ] }),
              /* @__PURE__ */ c("div", { className: a.detailAttrField, children: [
                /* @__PURE__ */ n("span", { className: a.detailAttrLabel, children: "优先级" }),
                /* @__PURE__ */ n(
                  je,
                  {
                    size: "small",
                    className: a.detailFullWidth,
                    dropdownClassName: a.detailDropdown,
                    value: e.priority,
                    onChange: (u) => W({ priority: u }),
                    options: [
                      { value: "HIGH", label: "高优先级" },
                      { value: "MEDIUM", label: "中优先级" },
                      { value: "LOW", label: "低优先级" }
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ c("div", { className: a.detailAttrField, children: [
                /* @__PURE__ */ n("span", { className: a.detailAttrLabel, children: "截止日期" }),
                /* @__PURE__ */ n(
                  xt,
                  {
                    size: "small",
                    allowClear: !0,
                    className: a.detailFullWidth,
                    placeholder: "未设置",
                    value: e.dueDate ? Be(e.dueDate) : null,
                    onChange: (u) => W({
                      dueDate: u ? u.format("YYYY-MM-DD") : ""
                    })
                  }
                )
              ] }),
              /* @__PURE__ */ c("div", { className: a.detailAttrField, children: [
                /* @__PURE__ */ n("span", { className: a.detailAttrLabel, children: "所属项目" }),
                /* @__PURE__ */ n(
                  je,
                  {
                    size: "small",
                    className: a.detailFullWidth,
                    dropdownClassName: a.detailDropdown,
                    placeholder: "所属项目",
                    value: b,
                    onChange: (u) => W({ projectId: u }),
                    options: l
                  }
                )
              ] }),
              (ve(b) || H.length > 0) && /* @__PURE__ */ c(
                "div",
                {
                  className: `${a.detailAttrField} ${a.detailAttrFull}`,
                  children: [
                    /* @__PURE__ */ n("span", { className: a.detailAttrLabel, children: "指派成员（可多选）" }),
                    /* @__PURE__ */ n(
                      je,
                      {
                        mode: "multiple",
                        size: "small",
                        className: a.detailFullWidth,
                        popupClassName: a.detailDropdown,
                        virtual: !1,
                        disabled: !ve(b),
                        placeholder: ve(b) ? "未指派" : "收集箱事项不支持指派",
                        allowClear: !0,
                        optionFilterProp: "label",
                        value: H,
                        onChange: (u) => {
                          const w = u ?? [];
                          Z(w), W({ assigneeUserIds: w, assigneeUserId: w[0] ?? "" });
                        },
                        options: x
                      }
                    )
                  ]
                }
              ),
              e.completedAt && /* @__PURE__ */ c(ct, { color: "green", className: a.detailAttrFull, children: [
                e.completedBy === d ? "我" : e.completedBy || "已",
                "完成 · ",
                e.completedAt.slice(0, 16).replace("T", " ")
              ] })
            ] }),
            /* @__PURE__ */ n(ti, { item: e, token: o, onChanged: m, onOpenSession: _ }),
            /* @__PURE__ */ c("div", { className: a.detailTagRow, children: [
              e.tags.map((u) => /* @__PURE__ */ c(
                ct,
                {
                  closable: !0,
                  onClose: () => W({ tags: e.tags.filter((w) => w !== u) }),
                  children: [
                    "#",
                    u
                  ]
                },
                u
              )),
              /* @__PURE__ */ n(
                Te,
                {
                  size: "small",
                  className: a.detailTagInput,
                  placeholder: "标签 回车",
                  prefix: /* @__PURE__ */ n(Se, { className: a.detailInputPrefix }),
                  onPressEnter: (u) => {
                    const w = u.target.value.trim();
                    w && !e.tags.includes(w) && (W({ tags: [...e.tags, w] }), u.target.value = "");
                  }
                }
              )
            ] }),
            /* @__PURE__ */ c("div", { className: a.detailSection, children: [
              /* @__PURE__ */ n("div", { className: a.detailSectionTitle, children: "子事项" }),
              le.length === 0 && /* @__PURE__ */ n("div", { className: a.detailHint, children: "暂无子事项" }),
              le.map((u) => /* @__PURE__ */ c("div", { className: a.detailChildRow, children: [
                /* @__PURE__ */ n(
                  dt,
                  {
                    checked: u.status === "DONE",
                    onChange: async () => {
                      try {
                        u.status === "DONE" ? await Jt(u.id, o) : await mt(u.id, "", o), m();
                      } catch {
                        k.error("操作失败");
                      }
                    }
                  }
                ),
                /* @__PURE__ */ n(
                  "span",
                  {
                    className: `${a.detailChildTitle} ${u.status === "DONE" ? a.detailChildTitleDone : ""}`,
                    children: u.title
                  }
                ),
                /* @__PURE__ */ n(
                  _e,
                  {
                    type: "text",
                    size: "small",
                    danger: !0,
                    icon: /* @__PURE__ */ n(bt, {}),
                    onClick: async () => {
                      try {
                        await Kt(u.id, o), m();
                      } catch {
                        k.error("删除失败");
                      }
                    }
                  }
                )
              ] }, u.id)),
              /* @__PURE__ */ n(
                Te,
                {
                  size: "small",
                  className: a.detailFullWidth,
                  placeholder: "子事项 回车",
                  prefix: /* @__PURE__ */ n(Se, { className: a.detailInputPrefix }),
                  value: F,
                  onChange: (u) => R(u.target.value),
                  onPressEnter: oe
                }
              )
            ] }),
            /* @__PURE__ */ c("div", { className: a.detailSection, children: [
              /* @__PURE__ */ n("div", { className: a.detailSectionTitle, children: "链接" }),
              I.length > 0 && /* @__PURE__ */ n("div", { className: a.detailLinkList, children: I.map((u) => /* @__PURE__ */ c(
                "div",
                {
                  className: a.detailLinkListItem,
                  onClick: () => u.url && window.open(u.url, "_blank"),
                  children: [
                    /* @__PURE__ */ n(Ca, { className: a.detailLinkListItemIcon }),
                    /* @__PURE__ */ n(
                      "span",
                      {
                        className: a.detailLinkListItemTitle,
                        title: u.title,
                        children: u.title
                      }
                    ),
                    /* @__PURE__ */ n("span", { className: a.detailLinkListItemActions, children: /* @__PURE__ */ n(
                      _t,
                      {
                        className: a.detailLinkListItemRemove,
                        onClick: (w) => {
                          w.stopPropagation(), L(
                            e.links.filter(
                              (B) => !(B.type === "url" && B.url === u.url && B.title === u.title)
                            )
                          );
                        }
                      }
                    ) })
                  ]
                },
                `url-${u.title}-${u.url}`
              )) }),
              /* @__PURE__ */ n(
                Te,
                {
                  size: "small",
                  className: a.detailFullWidth,
                  placeholder: "粘贴链接回车，自动取标题",
                  onPressEnter: (u) => {
                    const w = u.target, B = w.value.trim();
                    if (!B) return;
                    let C = B;
                    try {
                      C = decodeURIComponent(
                        B.split("/").pop() || B
                      ).slice(0, 60);
                    } catch {
                    }
                    L([...e.links, { type: "url", title: C, url: B }]), w.value = "";
                  }
                }
              )
            ] }),
            /* @__PURE__ */ c("div", { className: a.detailSection, children: [
              /* @__PURE__ */ n("div", { className: a.detailSectionTitle, children: "补充描述" }),
              /* @__PURE__ */ n("div", { className: a.detailEditorWrap, children: /* @__PURE__ */ n(
                Ft,
                {
                  mode: "live",
                  value: P,
                  onChange: f,
                  onUploadImage: Yt,
                  onSave: ae,
                  placeholder: "补充描述，支持 Markdown，可直接粘贴图片"
                },
                e.id
              ) }),
              P !== (e.detail ?? "") && /* @__PURE__ */ n(
                _e,
                {
                  size: "small",
                  type: "primary",
                  className: a.detailSaveBtn,
                  loading: U,
                  onClick: ae,
                  children: "保存描述"
                }
              )
            ] })
          ] })
        ] }),
        Q && /* @__PURE__ */ c(
          "div",
          {
            className: `${a.detailColLinksPanel} ${$ ? a.detailColLinksPanelWithEditor : ""}`,
            children: [
              /* @__PURE__ */ n("div", { className: `${a.detailCol} ${a.detailColLinksSide}`, children: /* @__PURE__ */ n("div", { className: a.detailColBodyFlush, children: /* @__PURE__ */ n(
                Zo,
                {
                  item: e,
                  projectLinks: de,
                  chatOptions: y,
                  token: o,
                  onPatchLinks: L
                }
              ) }) }),
              /* @__PURE__ */ n(
                "div",
                {
                  className: `${a.detailCol} ${a.detailColNotes} ${$ ? a.detailColNotesExpanded : a.detailColLinksSide}`,
                  children: /* @__PURE__ */ n("div", { className: a.detailColBodyFlush, children: /* @__PURE__ */ n(
                    ei,
                    {
                      noteLinks: te,
                      noteOptions: Y,
                      token: o,
                      onEditorOpenChange: ee,
                      onAddNote: (u, w) => {
                        L(Ko(e.links, u, w));
                      },
                      onRemoveNote: (u) => {
                        L(Xo(e.links, u));
                      }
                    }
                  ) })
                }
              )
            ]
          }
        )
      ] })
    }
  );
}
function ea(e, t = "") {
  var r;
  const s = [];
  for (const o of e) {
    const d = t ? `${t}/${o.title}` : o.title;
    o.type === "note" && s.push({ value: o.id, label: d }), (r = o.children) != null && r.length && s.push(
      ...ea(o.children, o.type === "folder" ? d : t)
    );
  }
  return s;
}
const si = {
  priority: ["优先级：高", "优先级：中", "优先级：低"]
};
function ri({
  items: e,
  groupBy: t,
  projectCtx: s,
  flat: r,
  hideAdd: o,
  statusColumns: d,
  canManageColumns: i,
  onToggle: m,
  onOpenDetail: _,
  onDeleted: T,
  onItemDropped: D,
  onAddInGroup: P,
  onAddColumn: f,
  onRenameColumn: U,
  onDeleteColumn: v,
  onMoveColumn: F
}) {
  const [R, Y] = g(null), [h, y] = g(null), [A, H] = g(null), [Z, Q] = g(null), V = pe(
    () => r ? e : e.filter((I) => !I.parentId),
    [e, r]
  ), $ = pe(
    () => r ? [[null, V]] : sa(V, t, s, d),
    [V, t, s, r, d]
  ), ee = pe(() => {
    if (r || t === "none") return $;
    const I = t === "status" ? d.map((b) => String(b.status)) : si[t] ?? [];
    return [
      ...I.map(
        (b) => {
          var l;
          return [b, ((l = $.find(([N]) => N === b)) == null ? void 0 : l[1]) ?? []];
        }
      ),
      ...$.filter(
        (b) => b[0] != null && !I.includes(b[0])
      )
    ];
  }, [$, t, r, d]), z = !r, W = (I) => z && I.dataTransfer.types.includes(Le), L = !!i && t === "status", ae = () => {
    Y(null), y(null), H(null), Q(null);
  }, E = (I, M) => R != null && h != null && h.group === I && h.index === M, le = (I, M, b) => ({
    onDragStart: (l) => {
      l.dataTransfer.setData(Le, String(I.id)), l.dataTransfer.effectAllowed = "move", Y(I.id);
    },
    onDragEnd: ae,
    onDragOver: (l) => {
      if (!W(l)) return;
      l.preventDefault(), l.stopPropagation();
      const N = l.currentTarget.getBoundingClientRect(), S = l.clientY < N.top + N.height / 2;
      y({ group: M, index: S ? b : b + 1 });
    },
    onDrop: (l) => {
      if (!W(l)) return;
      l.preventDefault(), l.stopPropagation();
      const N = se(l.dataTransfer.getData(Le));
      if (N !== "") {
        const S = l.currentTarget.getBoundingClientRect(), x = l.clientY < S.top + S.height / 2;
        D(N, M, x ? b : b + 1);
      }
      ae();
    }
  }), oe = (I, M) => ({
    onDragOver: (b) => {
      W(b) && (b.preventDefault(), y({ group: I, index: M }));
    },
    onDrop: (b) => {
      if (!W(b)) return;
      b.preventDefault();
      const l = se(b.dataTransfer.getData(Le));
      l !== "" && D(l, I, (h == null ? void 0 : h.index) ?? M), ae();
    }
  }), te = (I, M, b) => {
    const l = ee.map(([x]) => x), N = l.indexOf(I);
    if (N < 0) return;
    l.splice(N, 1);
    const S = l.indexOf(M);
    S < 0 || (l.splice(b ? S : S + 1, 0, I), F == null || F(l));
  }, de = (I, M) => ({
    onDragOver: (b) => {
      if (L && b.dataTransfer.types.includes(qe)) {
        b.preventDefault(), b.stopPropagation();
        const l = b.currentTarget.getBoundingClientRect();
        Q({
          key: I,
          before: b.clientX < l.left + l.width / 2
        });
        return;
      }
      W(b) && (b.preventDefault(), y({ group: I, index: M }));
    },
    onDrop: (b) => {
      if (L && b.dataTransfer.types.includes(qe)) {
        b.preventDefault(), b.stopPropagation();
        const N = b.dataTransfer.getData(qe);
        if (N) {
          const S = b.currentTarget.getBoundingClientRect();
          te(N, I, b.clientX < S.left + S.width / 2);
        }
        ae();
        return;
      }
      if (!W(b)) return;
      b.preventDefault();
      const l = se(b.dataTransfer.getData(Le));
      l !== "" && D(l, I, (h == null ? void 0 : h.index) ?? M), ae();
    }
  });
  if (r || t === "none") {
    const [I, M] = $[0];
    return /* @__PURE__ */ c("div", { ...oe(I, M.length), children: [
      !r && !o && /* @__PURE__ */ c(
        "button",
        {
          type: "button",
          className: a.addRow,
          onClick: () => P(null),
          children: [
            /* @__PURE__ */ n(Se, {}),
            " 添加事项"
          ]
        }
      ),
      !r && M.length === 0 && /* @__PURE__ */ n("div", { className: a.boardColEmpty, children: "暂无事项" }),
      E(I, 0) && /* @__PURE__ */ n("div", { className: a.dropLine }),
      M.map((b, l) => /* @__PURE__ */ c(st, { children: [
        /* @__PURE__ */ n(
          ot,
          {
            item: b,
            variant: "row",
            projectCtx: s,
            dragging: q(R, b.id),
            draggable: z,
            onToggle: m,
            onOpenDetail: _,
            onDeleted: T,
            ...le(b, I, l)
          }
        ),
        E(I, l + 1) && /* @__PURE__ */ n("div", { className: a.dropLine })
      ] }, b.id))
    ] });
  }
  return t === "project" ? /* @__PURE__ */ c("div", { children: [
    !o && /* @__PURE__ */ c(
      "button",
      {
        type: "button",
        className: a.addRow,
        onClick: () => P(null),
        children: [
          /* @__PURE__ */ n(Se, {}),
          " 添加事项"
        ]
      }
    ),
    $.map(([I, M]) => {
      const b = /^p:(.+)$/.exec(I ?? ""), l = b ? s.byId.get(b[1]) ?? null : null;
      return /* @__PURE__ */ c("div", { className: a.projectGroup, children: [
        /* @__PURE__ */ c("div", { className: a.projectGroupHeader, children: [
          /* @__PURE__ */ c("span", { className: a.projectGroupTitle, children: [
            l ? l.icon || "📁" : /* @__PURE__ */ n(gt, {}),
            l ? l.title : "收集箱"
          ] }),
          /* @__PURE__ */ n("span", { className: a.projectGroupCount, children: M.length })
        ] }),
        /* @__PURE__ */ c("div", { ...oe(I, M.length), children: [
          E(I, 0) && /* @__PURE__ */ n("div", { className: a.dropLine }),
          M.map((N, S) => /* @__PURE__ */ c(st, { children: [
            /* @__PURE__ */ n(
              ot,
              {
                item: N,
                variant: "row",
                hideProject: !0,
                projectCtx: s,
                dragging: q(R, N.id),
                draggable: z,
                onToggle: m,
                onOpenDetail: _,
                onDeleted: T,
                ...le(N, I, S)
              }
            ),
            E(I, S + 1) && /* @__PURE__ */ n("div", { className: a.dropLine })
          ] }, N.id))
        ] })
      ] }, I);
    })
  ] }) : /* @__PURE__ */ c("div", { className: a.boardWrap, children: [
    ee.map(([I, M]) => {
      const b = R != null && (h == null ? void 0 : h.group) === I, l = A != null && (Z == null ? void 0 : Z.key) === I ? Z.before ? "before" : "after" : null, N = t === "status" ? Qe(I, s) : I;
      return /* @__PURE__ */ c(
        "div",
        {
          className: `${a.boardCol} ${b ? a.boardColDropOver : ""} ${A === I ? a.boardColDragging : ""} ${l === "before" ? a.boardColDropBefore : l === "after" ? a.boardColDropAfter : ""}`,
          ...de(I, M.length),
          children: [
            /* @__PURE__ */ c(
              "div",
              {
                className: `${a.boardColHeader} ${L ? a.boardColHeaderMovable : ""}`,
                title: L ? "拖拽调整列顺序" : void 0,
                ...L ? {
                  draggable: !0,
                  onDragStart: (S) => {
                    S.dataTransfer.setData(qe, I), S.dataTransfer.effectAllowed = "move", H(I);
                  },
                  onDragEnd: ae
                } : {},
                children: [
                  /* @__PURE__ */ n("span", { className: a.boardColTitle, children: N }),
                  /* @__PURE__ */ n("span", { className: a.boardColCount, children: M.length }),
                  /* @__PURE__ */ n("span", { className: a.boardColSpacer }),
                  i && t === "status" && /* @__PURE__ */ n(
                    zt,
                    {
                      trigger: ["click"],
                      menu: {
                        // antd6 迁移：Dropdown 的 `menu` 收 MenuProps 对象。
                        // 原先 `overlay={<Menu onClick=...><Menu.Item/></Menu>}`，
                        // 而 antd6 的 dropdown.js 只解构 `menu`、从不读 `overlay`
                        // ⇒ 列头下拉点开是空的。children 形式一并转成 items。
                        items: [
                          { key: "rename", label: "重命名列" },
                          { key: "delete", label: "删除列", danger: !0 }
                        ],
                        onClick: ({ key: S, domEvent: x }) => {
                          x.stopPropagation(), S === "rename" ? U == null || U(I, N) : S === "delete" && (v == null || v(I));
                        }
                      },
                      children: /* @__PURE__ */ n(
                        "button",
                        {
                          type: "button",
                          className: a.boardColAdd,
                          title: "列设置",
                          onClick: (S) => S.stopPropagation(),
                          children: /* @__PURE__ */ n(Ia, {})
                        }
                      )
                    }
                  ),
                  /* @__PURE__ */ n(
                    "button",
                    {
                      type: "button",
                      className: a.boardColAdd,
                      title: "在此列新建事项",
                      onClick: () => P(I),
                      children: /* @__PURE__ */ n(Se, {})
                    }
                  )
                ]
              }
            ),
            /* @__PURE__ */ c("div", { className: a.boardColBody, children: [
              M.length === 0 && !b && /* @__PURE__ */ n("div", { className: a.boardColEmpty, children: "拖拽事项到这里" }),
              E(I, 0) && /* @__PURE__ */ n("div", { className: a.dropLine }),
              M.map((S, x) => /* @__PURE__ */ c(st, { children: [
                /* @__PURE__ */ n(
                  ot,
                  {
                    item: S,
                    variant: "card",
                    projectCtx: s,
                    dragging: q(R, S.id),
                    draggable: !0,
                    onToggle: m,
                    onOpenDetail: _,
                    onDeleted: T,
                    ...le(S, I, x)
                  }
                ),
                E(I, x + 1) && /* @__PURE__ */ n("div", { className: a.dropLine })
              ] }, S.id))
            ] }),
            !o && /* @__PURE__ */ c(
              "button",
              {
                type: "button",
                className: a.boardColAddRow,
                onClick: () => P(I),
                children: [
                  /* @__PURE__ */ n(Se, {}),
                  " 添加事项"
                ]
              }
            )
          ]
        },
        I
      );
    }),
    i && t === "status" && f && /* @__PURE__ */ c(
      "button",
      {
        type: "button",
        className: a.boardAddColumn,
        onClick: f,
        children: [
          /* @__PURE__ */ n(Se, {}),
          " 新增列"
        ]
      }
    )
  ] });
}
function ot({
  item: e,
  variant: t,
  hideProject: s,
  projectCtx: r,
  dragging: o,
  draggable: d,
  onToggle: i,
  onOpenDetail: m,
  onDeleted: _,
  onDragStart: T,
  onDragEnd: D,
  onDragOver: P,
  onDrop: f
}) {
  var V;
  const U = t === "card", v = e.status === "DONE", F = !v && hi(e.dueDate), R = !v && fi(e.dueDate), Y = e.projectId != null ? (V = r.byId.get(e.projectId)) == null ? void 0 : V.title : null, h = e.links.find(($) => $.type === "note"), y = e.links.filter(($) => $.type === "project"), A = aa(e, r), H = A.length ? `指派给：${A.map(($) => $.name).join("、")}` : "未指派", Z = {
    draggable: d,
    onDragStart: d ? T : void 0,
    onDragEnd: D,
    onDragOver: P,
    onDrop: f
  }, Q = ($) => /* @__PURE__ */ n(
    va,
    {
      title: /* @__PURE__ */ c("span", { children: [
        "删除该事项？",
        /* @__PURE__ */ n("br", {}),
        "子事项将一并删除"
      ] }),
      okText: "删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onConfirm: async (ee) => {
        ee == null || ee.stopPropagation();
        try {
          await Kt(e.id), k.success("已删除"), _();
        } catch {
          k.error("删除失败");
        }
      },
      children: /* @__PURE__ */ n(
        "span",
        {
          className: $,
          onClick: (ee) => ee.stopPropagation(),
          title: "删除",
          children: /* @__PURE__ */ n(bt, {})
        }
      )
    }
  );
  return U ? /* @__PURE__ */ c(
    "div",
    {
      className: `${a.itemCard} ${v ? a.itemCardDone : ""} ${o ? a.itemRowDragging : ""}`,
      ...Z,
      onClick: () => m(e.id),
      role: "presentation",
      children: [
        /* @__PURE__ */ n(
          "span",
          {
            className: `${a.cardStripe} ${e.priority === "HIGH" ? a.cardStripeHigh : e.priority === "LOW" ? a.cardStripeLow : a.cardStripeMedium}`,
            title: `优先级：${Ve[e.priority] ?? e.priority}`
          }
        ),
        /* @__PURE__ */ c("div", { className: a.cardMain, children: [
          /* @__PURE__ */ c("div", { className: a.cardHead, children: [
            /* @__PURE__ */ n(
              "span",
              {
                className: a.cardCheck,
                onClick: ($) => {
                  $.stopPropagation(), i(e);
                },
                children: /* @__PURE__ */ n(dt, { checked: v })
              }
            ),
            /* @__PURE__ */ n(
              "span",
              {
                className: `${a.cardTitle} ${v ? a.cardTitleDone : ""}`,
                title: e.title,
                children: e.title
              }
            ),
            Q(a.cardDel)
          ] }),
          /* @__PURE__ */ c("div", { className: a.cardMeta, children: [
            e.dueDate && /* @__PURE__ */ c(
              "span",
              {
                className: `${a.cardChip} ${a.cardChipDue} ${F ? a.cardChipOverdue : R ? a.cardChipToday : ""}`,
                title: `截止 ${e.dueDate}`,
                children: [
                  /* @__PURE__ */ n(jt, {}),
                  e.dueDate.slice(5),
                  F ? " 逾期" : ""
                ]
              }
            ),
            !s && /* @__PURE__ */ c(
              "span",
              {
                className: `${a.cardChip} ${a.cardChipMuted}`,
                title: "所属项目",
                children: [
                  e.projectId ? /* @__PURE__ */ n(vt, {}) : /* @__PURE__ */ n(gt, {}),
                  ui(e, r)
                ]
              }
            ),
            e.tags.slice(0, 2).map(($) => /* @__PURE__ */ c(
              "span",
              {
                className: `${a.cardChip} ${a.cardChipTag}`,
                title: `#${$}`,
                children: [
                  "#",
                  $
                ]
              },
              $
            )),
            e.tags.length > 2 && /* @__PURE__ */ c(
              "span",
              {
                className: a.cardAvatarMore,
                title: e.tags.map(($) => `#${$}`).join(" "),
                children: [
                  "+",
                  e.tags.length - 2
                ]
              }
            )
          ] }),
          /* @__PURE__ */ c("div", { className: a.cardFoot, children: [
            A.length > 0 ? /* @__PURE__ */ c(ft, { children: [
              /* @__PURE__ */ c("span", { className: a.cardAvatars, title: H, children: [
                A.slice(0, 3).map(($) => /* @__PURE__ */ n(
                  "span",
                  {
                    className: a.cardAvatar,
                    title: $.name,
                    children: $.name.slice(0, 1)
                  },
                  $.userId
                )),
                A.length > 3 && /* @__PURE__ */ c("span", { className: a.cardAvatarMore, children: [
                  "+",
                  A.length - 3
                ] })
              ] }),
              A.length === 1 && /* @__PURE__ */ n("span", { className: a.cardAssigneeName, children: A[0].name })
            ] }) : /* @__PURE__ */ c("span", { className: a.cardUnassigned, title: H, children: [
              /* @__PURE__ */ n(lt, {}),
              " 未指派"
            ] }),
            /* @__PURE__ */ n("span", { className: a.cardFootSpacer }),
            e.parentId ? /* @__PURE__ */ n("span", { className: a.cardAvatarMore, title: "子事项", children: "子事项" }) : null,
            h && /* @__PURE__ */ n(
              "span",
              {
                className: `${a.cardChip} ${a.cardChipMuted}`,
                title: `关联笔记：${h.title}`,
                children: /* @__PURE__ */ n(it, {})
              }
            ),
            y.length > 0 && /* @__PURE__ */ c(
              "span",
              {
                className: `${a.cardChip} ${a.cardChipMuted}`,
                title: `关联群聊×${y.length}`,
                children: [
                  /* @__PURE__ */ n(xe, {}),
                  y.length
                ]
              }
            )
          ] })
        ] })
      ]
    }
  ) : /* @__PURE__ */ c(
    "div",
    {
      className: `${a.itemRow} ${o ? a.itemRowDragging : ""}`,
      ...Z,
      onClick: () => m(e.id),
      role: "presentation",
      children: [
        /* @__PURE__ */ n("span", { className: a.dragHandle, title: "拖拽排序 / 移动到项目", children: /* @__PURE__ */ n(Na, {}) }),
        /* @__PURE__ */ n(
          "span",
          {
            className: a.itemCheck,
            onClick: ($) => {
              $.stopPropagation(), i(e);
            },
            children: /* @__PURE__ */ n(dt, { checked: v })
          }
        ),
        /* @__PURE__ */ n(
          "span",
          {
            className: `${a.priorityDot} ${e.priority === "HIGH" ? a.priorityHigh : e.priority === "LOW" ? a.priorityLow : a.priorityMedium}`,
            title: `优先级：${Ve[e.priority] ?? e.priority}`
          }
        ),
        /* @__PURE__ */ c("div", { className: a.itemBody, children: [
          /* @__PURE__ */ n(
            "span",
            {
              className: `${a.itemTitle} ${v ? a.itemTitleDone : ""}`,
              title: e.title,
              children: e.title
            }
          ),
          /* @__PURE__ */ c("div", { className: a.itemMetaRow, children: [
            /* @__PURE__ */ n(
              "span",
              {
                className: `${a.statusChip} ${e.status === "DONE" ? a.statusDone : e.status === "DOING" ? a.statusProgress : a.statusTodo}`,
                children: Qe(e.status, r)
              }
            ),
            e.dueDate && /* @__PURE__ */ c(
              "span",
              {
                className: `${a.dueChip} ${F ? a.dueChipOverdue : R ? a.dueChipToday : ""}`,
                children: [
                  /* @__PURE__ */ n(jt, {}),
                  e.dueDate.slice(5),
                  F ? " 逾期" : ""
                ]
              }
            ),
            A.length > 0 && /* @__PURE__ */ c("span", { className: a.assigneeChip, title: H, children: [
              /* @__PURE__ */ n(lt, {}),
              A[0].name,
              A.length > 1 ? ` +${A.length - 1}` : ""
            ] }),
            Y && !s && /* @__PURE__ */ c("span", { className: a.projectChip, title: "所属项目", children: [
              /* @__PURE__ */ n(vt, {}),
              Y
            ] }),
            e.tags.slice(0, 2).map(($) => /* @__PURE__ */ c("span", { className: a.tagChip, children: [
              "#",
              $
            ] }, $)),
            e.tags.length > 2 && /* @__PURE__ */ c("span", { className: a.tagChip, children: [
              "+",
              e.tags.length - 2
            ] }),
            e.parentId ? /* @__PURE__ */ n("span", { className: a.childCount, title: "子事项", children: "子事项" }) : null,
            h && /* @__PURE__ */ n("span", { className: a.linkIcon, title: `笔记：${h.title}`, children: /* @__PURE__ */ n(it, {}) }),
            y.length > 0 && /* @__PURE__ */ c(
              "span",
              {
                className: a.linkIcon,
                title: `群聊×${y.length}`,
                children: [
                  /* @__PURE__ */ n(xe, {}),
                  y.length > 1 ? y.length : ""
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ n("div", { className: a.rowActions, children: Q(`${a.rowActionBtn} ${a.rowActionBtnDanger}`) })
      ]
    }
  );
}
function Rt(e) {
  const t = (e ?? "").trim();
  return t ? t.slice(0, 1) : "?";
}
function oi({
  open: e,
  token: t,
  project: s,
  myUserId: r,
  onClose: o,
  onChanged: d
}) {
  const [i, m] = g(""), [_, T] = g([]), [D, P] = g(!1), f = !!s && s.userId === r, U = async (h) => {
    if (m(h), !h.trim()) {
      T([]);
      return;
    }
    try {
      const y = await Xt("", h.trim(), t);
      T(
        (y ?? []).map((A) => ({
          userId: String(A.userId),
          name: String(A.name)
        }))
      );
    } catch {
      T([]);
    }
  }, v = async (h) => {
    if (!s) return;
    const y = _.find((A) => A.userId === h);
    P(!0);
    try {
      await Wt(
        s.id,
        { userId: h, userName: (y == null ? void 0 : y.name) ?? h },
        t
      ), k.success("成员已添加，项目已转为共享"), m(""), T([]), d();
    } catch (A) {
      k.error((A == null ? void 0 : A.userMessage) ?? "添加失败");
    } finally {
      P(!1);
    }
  }, F = async (h) => {
    if (s) {
      P(!0);
      try {
        await Ua(s.id, h, t), k.success("已移除"), d();
      } catch (y) {
        k.error((y == null ? void 0 : y.userMessage) ?? "移除失败");
      } finally {
        P(!1);
      }
    }
  }, R = (s == null ? void 0 : s.memberDetails) ?? [], Y = (s == null ? void 0 : s.createByName) || "owner";
  return /* @__PURE__ */ n(
    De,
    {
      title: /* @__PURE__ */ c("span", { children: [
        /* @__PURE__ */ n(Je, { className: a.membersTitleIcon }),
        "项目成员 · ",
        (s == null ? void 0 : s.title) ?? ""
      ] }),
      open: e,
      width: 400,
      className: `${a.addModal} ${a.membersModal}`,
      onCancel: o,
      footer: null,
      destroyOnHidden: !0,
      children: /* @__PURE__ */ c("div", { className: a.addModalBody, children: [
        /* @__PURE__ */ c("div", { className: a.membersSection, children: [
          /* @__PURE__ */ c("span", { className: a.membersLabel, children: [
            "成员 · ",
            1 + R.length
          ] }),
          /* @__PURE__ */ c("div", { className: a.membersList, children: [
            /* @__PURE__ */ c("div", { className: a.membersRow, children: [
              /* @__PURE__ */ n(
                "span",
                {
                  className: `${a.membersAvatar} ${a.membersAvatarOwner}`,
                  children: Rt(Y)
                }
              ),
              /* @__PURE__ */ n("span", { className: a.membersName, children: Y }),
              /* @__PURE__ */ n(
                "span",
                {
                  className: `${a.membersRole} ${a.membersRoleOwner}`,
                  children: "owner"
                }
              )
            ] }),
            R.map((h) => /* @__PURE__ */ c("div", { className: a.membersRow, children: [
              /* @__PURE__ */ n("span", { className: a.membersAvatar, children: Rt(h.userName) }),
              /* @__PURE__ */ n("span", { className: a.membersName, title: h.userName, children: h.userName }),
              /* @__PURE__ */ n("span", { className: a.membersRole, children: "成员" }),
              f && /* @__PURE__ */ n(
                "button",
                {
                  type: "button",
                  className: a.membersRemove,
                  disabled: D,
                  onClick: () => F(h.userId),
                  children: "移除"
                }
              )
            ] }, h.userId)),
            R.length === 0 && /* @__PURE__ */ n("div", { className: a.membersEmpty, children: "暂无其他成员" })
          ] })
        ] }),
        f ? /* @__PURE__ */ n(
          je,
          {
            className: a.membersSelect,
            dropdownClassName: a.addModalDropdown,
            showSearch: !0,
            filterOption: !1,
            value: i || void 0,
            onSearch: U,
            onChange: v,
            disabled: D,
            options: _.map((h) => ({
              value: h.userId,
              label: h.name
            })),
            notFoundContent: i ? "未找到员工" : "输入姓名/工号搜索",
            placeholder: "从员工库搜索添加成员（apex）"
          }
        ) : /* @__PURE__ */ n("div", { className: a.membersDenied, children: "仅项目 owner 可添加/移除成员" }),
        /* @__PURE__ */ n("div", { className: a.addModalHint, children: "添加成员后项目自动转为共享，成员在侧栏「加入的」分组可见，可协作事项并接受指派。" })
      ] })
    }
  );
}
const Et = "application/x-ft-todo-project", ii = [
  { key: "today", label: "今天", icon: /* @__PURE__ */ n(St, {}) },
  { key: "week", label: "最近 7 天", icon: /* @__PURE__ */ n(St, {}) },
  { key: "all", label: "全部事项", icon: /* @__PURE__ */ n(wt, {}) },
  { key: "assigned", label: "指派给我的", icon: /* @__PURE__ */ n(lt, {}) },
  { key: "completed", label: "已完成", icon: /* @__PURE__ */ n(wt, {}) }
], Ut = /* @__PURE__ */ n("span", { children: "取消" });
function li({
  bundle: e,
  view: t,
  onViewChange: s,
  onReload: r,
  inboxCount: o,
  onItemDroppedToProject: d,
  onProjectsReordered: i,
  onManageMembers: m
}) {
  const [_, T] = g(!1), [D, P] = g(""), [f, U] = g(!1), [v, F] = g(null), [R, Y] = g(""), [h, y] = g(!1), A = ht((l) => l.token), [H, Z] = g(null), [Q, V] = g(null), [$, ee] = g(null), z = (e == null ? void 0 : e.owned) ?? [], W = (e == null ? void 0 : e.joined) ?? [], L = async () => {
    const l = D.trim();
    if (!l) {
      k.warning("请输入项目名");
      return;
    }
    U(!0);
    try {
      await Ra({ title: l }, A), k.success("项目已创建"), T(!1), P(""), r();
    } catch {
      k.error("创建项目失败");
    } finally {
      U(!1);
    }
  }, ae = (l) => t.type === "view" && t.key === l, E = (l) => l.dataTransfer.types.includes(Le), le = (l) => l.dataTransfer.types.includes(Et), oe = (l) => ({
    onDragOver: (N) => {
      E(N) && (N.preventDefault(), N.stopPropagation(), ee(l));
    },
    onDragLeave: () => {
      ee((N) => N === l ? null : N);
    },
    onDrop: (N) => {
      if (!E(N)) return;
      N.preventDefault(), N.stopPropagation();
      const S = se(N.dataTransfer.getData(Le));
      ee(null), S !== "" && d(S, l);
    }
  }), te = () => {
    if (H == null || Q == null) {
      de();
      return;
    }
    const l = z.map((he) => he.id), N = l.indexOf(H);
    if (N < 0) {
      de();
      return;
    }
    const S = [...l];
    S.splice(N, 1);
    let x = Q;
    N < x && (x -= 1), x = Math.max(0, Math.min(x, S.length)), S.splice(x, 0, H), de(), S.some((he, ce) => !q(he, l[ce])) && i(S);
  }, de = () => {
    Z(null), V(null);
  }, I = async () => {
    if (!v) return;
    const l = R.trim();
    if (!l) {
      k.warning("请输入项目名");
      return;
    }
    if (l === v.title) {
      F(null);
      return;
    }
    y(!0);
    try {
      await Gt(v.id, { title: l }, A), k.success("已重命名"), F(null), r();
    } catch (N) {
      k.error(
        (N == null ? void 0 : N.userMessage) ?? "重命名失败"
      );
    } finally {
      y(!1);
    }
  }, M = (l) => {
    De.confirm({
      title: `删除项目「${l.title}」？`,
      content: "项目下的所有事项将一并删除，不可恢复。",
      okText: "删除",
      okButtonProps: { danger: !0 },
      cancelText: "取消",
      onOk: async () => {
        try {
          await Ea(l.id, A), k.success("项目已删除"), t.type === "project" && q(t.id, l.id) && s({ type: "view", key: "all" }), r();
        } catch (N) {
          k.error(
            (N == null ? void 0 : N.userMessage) ?? "删除项目失败"
          );
        }
      }
    });
  }, b = (l, N, S) => {
    const x = q($, l.id) ? a.sideItemDropOver : "", he = t.type === "project" && q(t.id, l.id) ? a.sideItemActive : "", ce = N ? {
      items: [
        {
          key: "rename",
          icon: /* @__PURE__ */ n(Ta, {}),
          label: "重命名",
          onClick: () => {
            F({ id: l.id, title: l.title }), Y(l.title);
          }
        },
        {
          key: "members",
          icon: /* @__PURE__ */ n(Je, {}),
          label: "成员管理",
          onClick: () => m == null ? void 0 : m(l.id)
        },
        { type: "divider" },
        {
          key: "delete",
          icon: /* @__PURE__ */ n(bt, {}),
          label: "删除项目",
          danger: !0,
          onClick: () => M(l)
        }
      ]
    } : null, u = /* @__PURE__ */ c(
      "button",
      {
        type: "button",
        className: `${a.sideItem} ${he} ${x}`,
        draggable: N,
        onDragStart: (w) => {
          N && (w.dataTransfer.setData(Et, String(l.id)), w.dataTransfer.effectAllowed = "move", Z(l.id));
        },
        onDragEnd: de,
        onDragOver: (w) => {
          if (le(w) && N) {
            w.preventDefault(), w.stopPropagation();
            const B = w.currentTarget.getBoundingClientRect(), C = w.clientY < B.top + B.height / 2;
            V(C ? S : S + 1);
            return;
          }
          oe(l.id).onDragOver(w);
        },
        onDragLeave: oe(l.id).onDragLeave,
        onDrop: (w) => {
          if (le(w) && N) {
            w.preventDefault(), w.stopPropagation(), te();
            return;
          }
          oe(l.id).onDrop(w);
        },
        onClick: () => s({ type: "project", id: l.id }),
        title: N ? "点击进入 · 可拖拽排序 · 可接收拖入事项 · 右键管理（重命名/成员/删除）" : "点击进入 · 可接收拖入事项",
        children: [
          /* @__PURE__ */ n("span", { className: a.sideItemIcon, children: l.icon || "📁" }),
          /* @__PURE__ */ c("span", { className: a.sideItemLabel, children: [
            l.visibility === "shared" && /* @__PURE__ */ n(Je, { style: { marginRight: 4 } }),
            l.title
          ] }),
          (l.openCount ?? 0) > 0 && /* @__PURE__ */ n("span", { className: a.sideItemCount, children: l.openCount })
        ]
      }
    );
    return /* @__PURE__ */ c("div", { className: a.sideItemWrap, children: [
      H != null && Q === S && /* @__PURE__ */ n("div", { className: a.sideDropLine }),
      ce ? /* @__PURE__ */ n(zt, { menu: ce, trigger: ["contextMenu"], children: u }) : u
    ] }, l.id);
  };
  return /* @__PURE__ */ c("div", { className: a.sidebar, children: [
    /* @__PURE__ */ n("div", { className: a.sidebarSection, children: ii.map((l) => /* @__PURE__ */ c(
      "button",
      {
        type: "button",
        className: `${a.sideItem} ${ae(l.key) ? a.sideItemActive : ""}`,
        onClick: () => s({ type: "view", key: l.key }),
        children: [
          /* @__PURE__ */ n("span", { className: a.sideItemIcon, children: l.icon }),
          /* @__PURE__ */ n("span", { className: a.sideItemLabel, children: l.label })
        ]
      },
      l.key
    )) }),
    /* @__PURE__ */ c("div", { className: a.sidebarSection, children: [
      /* @__PURE__ */ c("div", { className: a.sidebarTitle, children: [
        /* @__PURE__ */ n("span", { children: "项目" }),
        /* @__PURE__ */ c(
          "button",
          {
            type: "button",
            className: a.sidebarTitleAction,
            onClick: () => T(!0),
            children: [
              /* @__PURE__ */ n(Se, {}),
              " 新建"
            ]
          }
        )
      ] }),
      z.length > 0 && /* @__PURE__ */ n("div", { className: a.sideGroupLabel, children: "我拥有的" }),
      z.map((l, N) => b(l, !0, N)),
      H != null && Q === z.length && /* @__PURE__ */ n("div", { className: a.sideDropLine }),
      W.length > 0 && /* @__PURE__ */ n("div", { className: a.sideGroupLabel, children: "加入的" }),
      W.map((l) => b(l, !1, -1)),
      z.length === 0 && W.length === 0 && /* @__PURE__ */ n("div", { style: { fontSize: 12, color: "#bfbfbf", padding: "4px 8px" }, children: "还没有项目，点击「新建」创建" })
    ] }),
    /* @__PURE__ */ n("div", { className: a.sidebarSection, children: /* @__PURE__ */ c(
      "button",
      {
        type: "button",
        className: `${a.sideItem} ${t.type === "inbox" ? a.sideItemActive : ""} ${q($, Ie) ? a.sideItemDropOver : ""}`,
        ...oe(Ie),
        onClick: () => s({ type: "inbox" }),
        title: "点击进入 · 可接收拖入事项",
        children: [
          /* @__PURE__ */ n("span", { className: a.sideItemIcon, children: /* @__PURE__ */ n(gt, {}) }),
          /* @__PURE__ */ n("span", { className: a.sideItemLabel, children: "收集箱" }),
          o > 0 && /* @__PURE__ */ n("span", { className: a.sideItemCount, children: o })
        ]
      }
    ) }),
    /* @__PURE__ */ n(
      De,
      {
        title: "新建项目",
        open: _,
        width: 400,
        className: a.addModal,
        onCancel: () => T(!1),
        onOk: L,
        okText: /* @__PURE__ */ n("span", { children: "创建" }),
        cancelText: Ut,
        confirmLoading: f,
        destroyOnHidden: !0,
        children: /* @__PURE__ */ c("div", { className: a.addModalBody, children: [
          /* @__PURE__ */ n(
            Te,
            {
              placeholder: "项目名称，如：XX版本发布跟进",
              value: D,
              onChange: (l) => P(l.target.value),
              onPressEnter: L,
              maxLength: 128,
              autoFocus: !0
            }
          ),
          /* @__PURE__ */ n("div", { className: a.addModalHint, children: "项目创建后默认私有，可在详情中添加成员转为共享（成员可编辑、可被指派）。" })
        ] })
      }
    ),
    /* @__PURE__ */ n(
      De,
      {
        title: "重命名项目",
        open: !!v,
        width: 400,
        className: a.addModal,
        onCancel: () => F(null),
        onOk: I,
        okText: /* @__PURE__ */ n("span", { children: "保存" }),
        cancelText: Ut,
        confirmLoading: h,
        destroyOnHidden: !0,
        children: /* @__PURE__ */ n(
          Te,
          {
            placeholder: "项目名称",
            value: R,
            onChange: (l) => Y(l.target.value),
            onPressEnter: I,
            maxLength: 128,
            autoFocus: !0
          }
        )
      }
    )
  ] });
}
const Le = "application/x-ft-todo-item", qe = "application/x-ft-todo-column", ci = {
  today: "今天",
  week: "最近 7 天",
  all: "全部事项",
  assigned: "指派给我的",
  completed: "已完成",
  inbox: "收集箱"
}, Ze = {
  TODO: "待办",
  DOING: "进行中",
  DONE: "已完成",
  ARCHIVED: "已归档"
}, Ve = {
  HIGH: "高",
  MEDIUM: "中",
  LOW: "低"
}, ta = {
  "优先级：高": "HIGH",
  "优先级：中": "MEDIUM",
  "优先级：低": "LOW"
}, di = 1e6;
function Qe(e, t) {
  return t.statusLabelByKey.get(e) ?? Ze[e] ?? e;
}
function aa(e, t) {
  return (e.assigneeUserId ? [e.assigneeUserId] : []).map((r) => ({
    userId: r,
    name: t.userNameById.get(r) ?? r
  }));
}
function ui(e, t) {
  var s;
  return e.projectId == null || e.projectId === Ie ? "收集箱" : ((s = t.byId.get(e.projectId)) == null ? void 0 : s.title) ?? String(e.projectId);
}
const et = "inbox", Ie = "0";
function na(e) {
  return e.projectId != null ? `p:${e.projectId}` : et;
}
function sa(e, t, s, r) {
  if (t === "none")
    return [["全部", e]];
  const o = /* @__PURE__ */ new Map();
  for (const i of e) {
    let m;
    t === "status" ? m = i.status : t === "priority" ? m = `优先级：${Ve[i.priority] ?? i.priority}` : t === "project" ? m = na(i) : m = i.assigneeUserId ? `指派给：${s.userNameById.get(i.assigneeUserId) ?? i.assigneeUserId}` : "未指派", o.has(m) || o.set(m, []), o.get(m).push(i);
  }
  const d = Array.from(o.entries());
  if (t === "status") {
    const i = (r ?? Pe).map(
      (m) => String(m.status)
    );
    d.sort((m, _) => {
      const T = i.indexOf(m[0]), D = i.indexOf(_[0]);
      return (T < 0 ? i.length : T) - (D < 0 ? i.length : D);
    });
  } else if (t === "priority")
    d.sort(
      (i, m) => ["优先级：高", "优先级：中", "优先级：低", "未指派"].indexOf(i[0]) - ["优先级：高", "优先级：中", "优先级：低", "未指派"].indexOf(m[0])
    );
  else if (t === "project") {
    const i = Array.from(s.byId.keys()), m = (_) => _ === et ? Number.MAX_SAFE_INTEGER : i.indexOf(_.slice(2));
    d.sort((_, T) => m(_[0]) - m(T[0]));
  }
  return d;
}
function pi(e, t, s) {
  return t === "status" ? e.status : t === "priority" ? `优先级：${Ve[e.priority] ?? e.priority}` : t === "project" ? na(e) : t === "assignee" ? e.assigneeUserId ? `指派给：${s.userNameById.get(e.assigneeUserId) ?? e.assigneeUserId}` : "未指派" : "全部";
}
function mi(e, t, s) {
  if (e === "status")
    return t ? { status: t } : null;
  if (e === "priority") {
    const r = ta[t];
    return r ? { priority: r } : null;
  }
  if (e === "assignee") {
    if (t === "未指派")
      return { assigneeUserId: "", assigneeUserIds: [] };
    const r = s[0];
    return r != null && r.assigneeUserId ? {
      assigneeUserId: r.assigneeUserId,
      assigneeUserIds: [r.assigneeUserId]
    } : null;
  }
  if (e === "project") {
    if (t === et) return { projectId: Ie };
    const r = /^p:(.+)$/.exec(t);
    return r ? { projectId: r[1] } : null;
  }
  return null;
}
function Oi({
  onOpenProject: e,
  onOpenNote: t,
  onOpenAgentSession: s,
  openTodoId: r
}) {
  var Nt;
  const o = ht((p) => p.token), d = ht((p) => p.currentUser), [i, m] = g(null), [_, T] = g([]), [D, P] = g(!0), [f, U] = g({ type: "view", key: "today" }), [v, F] = g(""), [R, Y] = g(""), [h, y] = g("status"), [A, H] = g(null), [Z, Q] = g(
    null
  ), [V, $] = g(!1), [ee, z] = g({}), [W, L] = g(!1), [ae, E] = g(0), le = we(!1), oe = 600, te = we(/* @__PURE__ */ new Set()), de = we(/* @__PURE__ */ new Map()), I = ie(
    async (p, j) => {
      const O = { view: "all" };
      p.type === "view" && (O.view = p.key), p.type === "inbox" && (O.projectId = Ie), p.type === "project" && (O.projectId = p.id), j.trim() && (O.keyword = j.trim());
      const ne = await rt(O, o);
      T(ne);
    },
    [o]
  ), M = ie(async () => {
    const p = await Pa(o);
    return m(p), p;
  }, [o]), b = ie(async () => {
    try {
      const p = await rt({ view: "all", projectId: Ie }, o);
      E(p.filter((j) => !j.parentId).length);
    } catch {
    }
  }, [o]), l = ie(async () => {
    try {
      await Promise.all([
        M(),
        I(f, R),
        b()
      ]);
    } catch {
    }
  }, [M, I, b, f, R]), N = ie(
    async (p = f, j = R) => {
      P(!0);
      try {
        await Promise.all([
          M(),
          I(p, j),
          b()
        ]);
      } catch {
        k.error("加载工作待办失败");
      } finally {
        P(!1);
      }
    },
    [f, R, M, I, b]
  );
  Ce(() => {
    y(f.type === "view" ? "project" : "status"), N(f, R);
  }, [f]), Ce(() => {
    if (v === R) return;
    const p = setTimeout(() => {
      Y(v), I(f, v).catch(() => {
      });
    }, 300);
    return () => clearTimeout(p);
  }, [v]), Ce(() => {
    if (!(r != null && r.id)) return;
    const p = r.id;
    H(p);
    let j = !1;
    return (async () => {
      try {
        const O = await rt({ view: "all" }, o);
        if (j) return;
        const ne = O.find((re) => re.id === p) ?? null;
        ne && (Q(ne), ne.projectId != null ? U({ type: "project", id: ne.projectId }) : U({ type: "inbox" })), T(O);
      } catch {
      }
    })(), () => {
      j = !0;
    };
  }, [r == null ? void 0 : r.id, r == null ? void 0 : r.ts]);
  const S = pe(() => {
    const p = /* @__PURE__ */ new Map(), j = /* @__PURE__ */ new Map(), O = /* @__PURE__ */ new Map(), ne = [...(i == null ? void 0 : i.owned) ?? [], ...(i == null ? void 0 : i.joined) ?? []];
    for (const re of ne) {
      p.set(re.id, re), re.createByName && j.set(re.userId, re.createByName);
      for (const ge of re.memberDetails ?? [])
        j.set(ge.userId, ge.userName);
      for (const ge of Xe(re.extraInfo))
        O.has(ge.status) || O.set(ge.status, ge.label);
    }
    return { byId: p, userNameById: j, statusLabelByKey: O };
  }, [i]), x = pe(() => f.type !== "project" ? null : S.byId.get(f.id) ?? null, [f, S]), he = pe(
    () => {
      var p, j, O;
      return (d == null ? void 0 : d.id) != null && String(d.id) || ((j = (p = i == null ? void 0 : i.owned) == null ? void 0 : p[0]) == null ? void 0 : j.userId) || ((O = _.find((ne) => ne.projectId == null)) == null ? void 0 : O.userId) || "";
    },
    [d, i, _]
  ), ce = pe(() => x ? Xe(x.extraInfo) : Pe, [x]), u = !!x && x.userId === he, w = ie(
    async (p) => {
      if (x)
        try {
          await Gt(x.id, {
            extraInfo: JSON.stringify({ statusColumns: p })
          }), await M(), k.success("看板列已保存");
        } catch (j) {
          console.error("保存看板列失败:", j), k.error("保存看板列失败");
        }
    },
    [x, M]
  ), [B, C] = g(null), G = async (p) => {
    const j = [...ce], O = j.findIndex((ne) => ne.status === "DONE");
    O >= 0 ? j.splice(O, 0, p) : j.push(p), await w(j);
  }, ue = async (p, j) => {
    await w(
      ce.map(
        (O) => String(O.status) === p ? { ...O, label: j } : O
      )
    );
  }, be = async (p) => {
    if (_.some((O) => O.status === p)) {
      k.warning("该列还有事项，请先移出或完成后再删除");
      return;
    }
    await w(
      ce.filter((O) => String(O.status) !== p)
    );
  }, fe = async (p) => {
    const j = new Map(ce.map((re) => [String(re.status), re])), O = p.map(
      (re) => j.get(re) ?? {
        status: re,
        label: Qe(re, S)
      }
    );
    O.length === ce.length && O.every(
      (re, ge) => String(re.status) === String(ce[ge].status)
    ) || await w(O);
  }, Ee = pe(() => {
    if (f.type === "project") {
      const p = S.byId.get(f.id);
      return p ? `${p.icon ? `${p.icon} ` : ""}${p.title}` : "项目";
    }
    return ci[f.type === "view" ? f.key : "inbox"];
  }, [f, S]), yt = (p) => {
    const j = {};
    if (p != null && h === "status")
      j.status = p;
    else if (p != null && h === "priority") {
      const O = ta[p];
      O && (j.priority = O);
    } else if (p != null && h === "assignee") {
      const O = Array.from(S.userNameById.entries()).find(
        ([, ne]) => `指派给：${ne}` === p
      );
      O && (j.assigneeUserIds = [O[0]]);
    } else if (p != null && h === "project")
      if (p === et)
        j.projectId = Ie;
      else {
        const O = /^p:(.+)$/.exec(p);
        O && (j.projectId = O[1]);
      }
    z(j), $(!0);
  }, oa = async (p) => {
    const j = String(p.id);
    if (te.current.has(j)) return;
    const O = de.current.get(j);
    if (!(O != null && Date.now() - O < oe)) {
      te.current.add(j);
      try {
        const ne = p.status === "DONE" ? await Jt(p.id, o) : await mt(p.id, "", o);
        T((re) => re.map((ge) => q(ge.id, ne.id) ? ne : ge)), de.current.set(j, Date.now()), M().catch(() => {
        }), b().catch(() => {
        });
      } catch {
        k.error("操作失败");
      } finally {
        te.current.delete(j);
      }
    }
  }, ia = async (p, j, O) => {
    if (le.current) return;
    const ne = _.find((Ne) => Ne.id === p);
    if (!ne) return;
    const re = _.filter((Ne) => !Ne.parentId), ge = sa(
      re,
      h,
      S,
      ce
    ), Tt = j == null ? ["全部", re] : ge.find(([Ne]) => Ne === j) ?? [j, []];
    if (!Tt) return;
    const tt = Tt[1], ze = tt.findIndex((Ne) => Ne.id === p), Fe = [...tt];
    let $e = O;
    ze >= 0 && (Fe.splice(ze, 1), ze < $e && ($e -= 1)), $e = Math.max(0, Math.min($e, Fe.length)), Fe.splice($e, 0, ne);
    let Oe = null;
    if (!(h !== "none" && j != null && pi(ne, h, S) !== j && (Oe = mi(h, j, tt), !Oe)) && !(!Oe && ze === $e)) {
      le.current = !0;
      try {
        Oe && (T(
          (at) => at.map((Ue) => q(Ue.id, p) ? { ...Ue, ...Oe } : Ue)
        ), await Ye(p, Oe, o));
        const Ne = [];
        ge.forEach(([at, Ue], ua) => {
          const pa = at === j ? Fe : Ue.filter((nt) => nt.id !== p), ma = h === "none" || j == null ? 0 : ua * di;
          pa.forEach((nt, ha) => {
            Ne.push({ id: nt.id, sortOrder: ma + ha * 10 });
          });
        }), Ne.length > 0 && await Ba(Ne, o), await l();
      } catch {
        k.error("调整顺序失败"), await l();
      } finally {
        le.current = !1;
      }
    }
  }, la = async (p, j) => {
    const O = _.find((ne) => ne.id === p);
    if (O && !q(O.projectId, j))
      try {
        await xa(p, { projectId: j }, o), k.success(j === Ie ? "已移入收集箱" : "已移动到项目"), await l();
      } catch {
        k.error("移动失败");
      }
  }, ca = async (p) => {
    if (p.length !== 0) {
      try {
        await Ha(
          p.map((j, O) => ({ id: j, sortOrder: (O + 1) * 10 })),
          o
        );
      } catch {
        k.error("项目排序失败");
      }
      M().catch(() => {
      });
    }
  }, da = async () => {
    await N();
  }, Ct = pe(() => {
    if (A == null) return null;
    const p = _.find((j) => j.id === A);
    return p || ((Z == null ? void 0 : Z.id) === A ? Z : null);
  }, [_, A, Z]), Ae = !!R.trim(), It = pe(
    () => Ae ? _.length : _.filter((p) => !p.parentId).length,
    [_, Ae]
  );
  return /* @__PURE__ */ c("div", { className: a.container, children: [
    /* @__PURE__ */ n(
      li,
      {
        bundle: i,
        view: f,
        onViewChange: U,
        onReload: () => N(),
        inboxCount: ae,
        onItemDroppedToProject: la,
        onProjectsReordered: ca,
        onManageMembers: (p) => {
          U({ type: "project", id: p }), L(!0);
        }
      }
    ),
    /* @__PURE__ */ c("div", { className: a.main, children: [
      /* @__PURE__ */ c("div", { className: a.header, children: [
        /* @__PURE__ */ c("div", { children: [
          /* @__PURE__ */ n("h2", { className: a.headerTitle, children: Ee }),
          (x == null ? void 0 : x.visibility) === "shared" && /* @__PURE__ */ c("div", { className: a.headerSubtitle, children: [
            "共享项目 · owner",
            " ",
            x.createByName ?? x.userId
          ] })
        ] }),
        x && /* @__PURE__ */ c(
          _e,
          {
            size: "small",
            className: a.headerMembers,
            icon: /* @__PURE__ */ n(Je, {}),
            onClick: () => L(!0),
            title: "管理项目成员（添加后对方可见并协作）",
            children: [
              "成员 · ",
              1 + (((Nt = x.memberDetails) == null ? void 0 : Nt.length) ?? 0)
            ]
          }
        )
      ] }),
      /* @__PURE__ */ c("div", { className: a.toolbar, children: [
        /* @__PURE__ */ n(
          Ht,
          {
            size: "small",
            className: a.groupSeg,
            value: h,
            onChange: (p) => y(p),
            options: [
              ...f.type === "view" ? [{ label: "按项目", value: "project" }] : [],
              { label: "按状态", value: "status" },
              { label: "按优先级", value: "priority" },
              { label: "按指派人", value: "assignee" },
              { label: "列表", value: "none" }
            ]
          }
        ),
        /* @__PURE__ */ n("div", { className: a.toolbarSpacer }),
        /* @__PURE__ */ n(
          Te,
          {
            className: a.toolbarSearch,
            size: "small",
            allowClear: !0,
            placeholder: "搜索事项标题",
            value: v,
            onChange: (p) => F(p.target.value)
          }
        )
      ] }),
      /* @__PURE__ */ n("div", { className: a.listScroll, children: D ? /* @__PURE__ */ n("div", { className: a.emptyWrap, children: /* @__PURE__ */ n(Bt, {}) }) : Ae && It === 0 ? /* @__PURE__ */ n("div", { className: a.emptyWrap, children: /* @__PURE__ */ n(
        We,
        {
          image: We.PRESENTED_IMAGE_SIMPLE,
          description: "没有匹配的事项"
        }
      ) }) : !Ae && It === 0 ? (
        /**
         * ⚠ 零数据时的空态（第 17 轮 M1 实测补上）。
         *
         * 改之前：列表区在**一条事项都没有**时是**完全空白** ——
         *   「按项目」分组的分组来自事项本身 ⇒ 0 条 ⇒ 连一个分组都没有 ⇒
         *   整块区域只剩一个「添加事项」按钮，**没有任何文字说明**。
         *   ⇒ 用户看到一片空白，分不清是「真的没有事项」还是「加载失败」。
         *   （实测：body 里既没有「没有匹配的事项」也没有「暂无事项」，列表区 HTML
         *     只剩一个 addRow 按钮。）
         * ⇒ 现在给一句可读说明 + 保留唯一的创建入口。
         */
        /* @__PURE__ */ n("div", { className: a.emptyWrap, children: /* @__PURE__ */ n(
          We,
          {
            image: We.PRESENTED_IMAGE_SIMPLE,
            description: /* @__PURE__ */ c("span", { children: [
              "还没有任何事项",
              /* @__PURE__ */ n("span", { className: a.emptyHint, children: "点击下方按钮创建第一条，或切换左侧视图查看其它事项" })
            ] }),
            children: /* @__PURE__ */ n(
              _e,
              {
                type: "primary",
                onClick: () => yt(null),
                children: "新建事项"
              }
            )
          }
        ) })
      ) : /* @__PURE__ */ n(
        ri,
        {
          items: _,
          groupBy: h,
          projectCtx: S,
          flat: Ae,
          hideAdd: f.type === "view" && f.key === "completed",
          statusColumns: ce,
          canManageColumns: u && h === "status" && !Ae,
          onToggle: oa,
          onOpenDetail: (p) => H(p),
          onDeleted: () => N(),
          onItemDropped: ia,
          onAddInGroup: yt,
          onAddColumn: () => C({ mode: "add" }),
          onRenameColumn: (p, j) => C({ mode: "rename", status: p, label: j }),
          onDeleteColumn: (p) => {
            be(p).catch(
              () => k.error("删除列失败")
            );
          },
          onMoveColumn: (p) => {
            fe(p).catch(
              () => k.error("调整列顺序失败")
            );
          }
        }
      ) })
    ] }),
    /* @__PURE__ */ n(
      Go,
      {
        open: V,
        token: o,
        myUserId: he,
        viewProject: x,
        bundle: i,
        preset: ee,
        onCancel: () => $(!1),
        onCreated: () => {
          $(!1), l();
        }
      }
    ),
    /* @__PURE__ */ n(
      Jo,
      {
        preset: B,
        columns: ce,
        onCancel: () => C(null),
        onSubmit: async (p) => {
          try {
            (B == null ? void 0 : B.mode) === "rename" && B.status ? await ue(B.status, p.label) : await G(p), C(null);
          } catch {
            k.error("保存看板列失败");
          }
        }
      }
    ),
    /* @__PURE__ */ n(
      oi,
      {
        open: W,
        token: o,
        project: x,
        myUserId: he,
        onClose: () => L(!1),
        onChanged: () => M().catch(() => {
        })
      }
    ),
    Ct && /* @__PURE__ */ n(
      ni,
      {
        item: Ct,
        allItems: _,
        projectCtx: S,
        bundle: i,
        token: o,
        myUserId: he,
        onClose: () => {
          H(null), Q(null);
        },
        onChanged: da,
        onOpenNote: t,
        onOpenProject: e,
        onOpenSession: s
      }
    )
  ] });
}
function hi(e) {
  return e ? Be(e).isBefore(Be(), "day") : !1;
}
function fi(e) {
  return e ? Be(e).isSame(Be(), "day") : !1;
}
const ra = Sa({ baseURL: "/api" });
ra.interceptors.request.use((e) => {
  const t = localStorage.getItem("userId");
  return t && (e.headers["X-User-Id"] = t), e;
});
function Mi(e) {
  e && e.apiBase !== void 0 && (ra.defaults.baseURL = e.apiBase);
}
const _i = "# z-task-component\n\nz-task（任务管理）跨仓唯一前端面：把「任务管理 / 项目管理 / 用户管理 / 仪表盘」这一整套任务页面\n收敛成一个可复用的 React 组件包。\n\n- **npm 包名**：`@yuku123/z-task-component`\n- **宿主接入**：`@yuku123/z-task-component/pages`（manifest + 页面），主壳可只取 `ComponentDocPage`\n- **后端**：z-task 的 `/api/task/**`、`/api/project/**`、`/api/auth/login`\n- **技术栈**：React 19 + antd 6 + react-router-dom 7 + vite（library mode，双入口 `.` / `./pages`）\n\n---\n\n## 一、能力概览\n\n路由前缀 `/z-task`，菜单在 `src/appMeta.jsx`，路由在 `src/pages-manifest.jsx`（**两者分开**）。\n\n| 页面 | 路由（相对 `/z-task/*`） | 源文件 | 能力 |\n|------|--------------------------|--------|------|\n| 登录 | `login` | `pages/Login.jsx` / `pages/LoginPage.jsx` | 登录（`POST /api/auth/login`） |\n| 首页 | `home` | `pages/HomePage.jsx` | 入口卡片页 |\n| 仪表盘 | `dashboard` | `pages/Dashboard.jsx` | 总任务数 / 待办 / 进行中 / 已完成四张统计卡 |\n| 任务管理 | `task` | `pages/task/TaskList.jsx` | 任务列表 + 完成任务 / 重新打开（基座 `ListTable`） |\n| 任务编辑 | `task/edit/:id?` | `pages/task/TaskEdit.jsx` | 任务新建 / 编辑表单 |\n| 项目管理 | `project` | `pages/project/ProjectList.jsx` | 项目列表 + 新建 / 归档（基座 `ListTable`） |\n| 用户管理 | `user` | `pages/user/UserList.jsx` | 用户列表（基座 `ListTable`） |\n| 组件文档 | `docs` | `pages/ComponentDoc.jsx` | 本文件渲染页（左侧 240px TOC + 右侧正文） |\n\n`src/pages/TaskApp.jsx` 是 `/z-task/*` 的子路由容器（`dashboard` / `task` / `task/edit/:id?` /\n`project` / `user`，index 重定向到 `task`），被 `routes` 里的 `/z-task/:rest*` 承接。\n\n### 1.1 可复用子组件（`src/components/`）\n\n| 组件 | 说明 |\n|------|------|\n| `TaskCard` | 任务卡片 |\n| `TaskTable` | 任务表格 |\n| `ProjectSelect` | 项目选择器 |\n| `ProjectList` | 项目列表组件版 |\n| `TaskList` | 任务列表组件版 |\n| `TaskDashboard` | 任务仪表盘组件版 |\n| `TaskApp` | 域内路由容器组件版 |\n| `TaskDetailDrawer` | 任务详情抽屉 |\n| `TaskEditModal` | 任务编辑弹窗 |\n\n这组组件从包根 `src/index.js` 导出（宿主可直接用，不必走 manifest）。\n\n## 二、导出面\n\n```js\n// 主入口（. 桶）：可复用组件 + taskApi\nimport {TaskCard, TaskTable, ProjectSelect, TaskApp, taskApi, ComponentDocPage} from '@yuku123/z-task-component'\n\n// 宿主组装面（./pages 桶）：manifest + 页面\nimport {menuItems, routes, HomePage, LoginPage, TaskList, TaskEdit, ProjectList, UserList} from '@yuku123/z-task-component/pages'\n```\n\n`./pages` 桶 = 一组具名再导出 + `export * from './pages-manifest.jsx'` 的整份转发。\n**不要再手挑名字** —— 之前手挑过一次，manifest 新增的 `HomePage` / `LoginPage` 没被转发，\nrollup 直接报 `LoginPage is not exported by dist/pages.js`。\n\n## 三、API 端点\n\n包内有**两套 API 客户端**，路径写法不同，详见「已知限制」。\n\n### 3.1 `src/api.js`（`taskApi`，包根导出，components/ 下的组件用这套）\n\n请求实例 `createRequest('task')`，`baseURL` 落到默认的 `/api`。\n\n| 方法 | 路径 | 说明 |\n|---|---|---|\n| GET | `/project/user/list` | 我的项目列表 |\n| POST | `/project` | 创建项目 |\n| PUT | `/project/{id}` | 更新项目 |\n| PUT | `/project/{id}/archive` | 归档项目 |\n| GET | `/task/project/list?projectId=` | 项目下的任务 |\n| GET | `/task/list?listId=` | 列表下的任务 |\n| POST | `/task` | 创建任务 |\n| POST | `/task/complete?taskId=` | 完成任务 |\n| PUT | `/task/move?taskId=&targetListId=&position=` | 移动任务 |\n| GET | `/task/{id}` | 任务详情 |\n| PUT | `/task/{id}` | 更新任务 |\n| DELETE | `/task/{id}` | 删除任务 |\n\n### 3.2 `src/services/api.js`（页面用这套）\n\n请求实例 `src/services/request.js`，`baseURL='/api'`，并注入 `X-User-Id` 头。\n\n| 方法 | 路径 | 说明 |\n|---|---|---|\n| POST | `/api/auth/login` | 登录（后端是 `/api/auth/login`，**不是** `/api/user/login`） |\n| GET | `/api/task/list?listId=` | 按列表取任务 |\n| GET | `/api/task/project/list?projectId=` | 按项目取任务 |\n| GET | `/api/task/assignee/list?userId=` | 按负责人取任务 |\n| POST | `/api/task` | 创建任务 |\n| PUT | `/api/task/move?taskId=&targetListId=&position=` | 移动任务 |\n| POST | `/api/task/assignees/add?taskId=&userId=` | 加负责人（后端是 POST，不是 DELETE） |\n| POST | `/api/task/assignees/remove?taskId=&userId=` | 移除负责人（后端是 POST） |\n| POST | `/api/task/complete?taskId=` | 完成任务（后端是 `POST /api/task/complete`，不是 `/api/task/{id}/complete`） |\n| POST | `/api/task/reopen?taskId=` | 重新打开任务 |\n| GET | `/api/project/user/list?userId=` | 我的项目列表 |\n| POST | `/api/project` | 创建项目 |\n| PUT | `/api/project/{projectId}/archive` | 归档项目 |\n\n## 四、页面说明\n\n### 4.1 仪表盘\n\n按当前负责人取任务（`getTaskListByAssignee`），渲染总任务数 / 待办 / 进行中 / 已完成四张统计卡。\n\n### 4.2 任务管理\n\n任务列表（`getTaskListByList`），行内可**完成任务**（`completeTask`）与**重新打开**（`reopenTask`）。\n过滤交给基座 `ListTable` 内置的搜索框 —— 原来页面上那个 antd `Search` 没接 `onChange`，是死的，已去掉。\n\n### 4.3 任务编辑\n\n任务新建 / 编辑表单（路由 `task/edit/:id?`，`:id` 可选 ⇒ 同一条路由兼做新建）。\n\n### 4.4 项目管理\n\n项目列表 + 新建项目 + 归档项目，统一用基座 `ListTable`。\n\n### 4.5 用户管理\n\n用户列表，用基座 `ListTable`。\n\n### 4.6 组件文档\n\n本文件。内容以 `?raw` 在编译期内联，零额外请求；左侧 240px TOC 随滚动联动。\n\n## 五、配置\n\n| 配置项 | 默认值 | 说明 |\n|---|---|---|\n| `configureTask({apiBase})` | `'/api'` | 改写 `src/services/request.js` 实例的 `baseURL` |\n| `X-User-Id` 头 | localStorage `userId` | `services/request.js` 的拦截器自动附加（`ProjectController.create` 等接口要） |\n| 登录态判据 | localStorage `token` | `isAuthenticated()` 与 suit 的 `ProtectedShell` 都用它 |\n| token 注入 | `Authorization: Bearer` | 基座拦截器统一处理 |\n\n## 六、已知限制\n\n- **菜单在 `src/appMeta.jsx`，不在 `pages-manifest.jsx`**。这是为了断开循环依赖：\n  `HomePage` 要 import `menuItems`，而 manifest 又 import `HomePage` ⇒ 循环会让 `menuItems`\n  落进 TDZ，浏览器报 `Cannot access 'X' before initialization`，整页白屏且控制台无日志。\n  页面组件直接在 manifest 里 import，不要绕道 `pages.js` 再转发。\n- ⚠ **菜单项 `/z-task/overview` 没有对应路由**（路由是 `/z-task/dashboard`）——\n  点「仪表盘」会落到 `/z-task/:rest*` → `TaskApp` → 没有 `overview` 子路由 ⇒ 空白页。\n- **包内有两套 API 客户端，路径口径不同**：\n  `src/api.js`（`taskApi`）写的是**不带** `/api` 前缀的路径，配 `baseURL='/api'` ⇒ 实际 `/api/xxx`；\n  `src/services/api.js` 写的是**带** `/api` 前缀的路径，也配 `baseURL='/api'` ⇒ 实际拼成 `/api/api/xxx`。\n  改后端契约时要认准自己动的是哪一套。\n- `src/api.js` 里写的是 `createRequest('task')`（传了字符串而不是配置对象）——\n  `createRequest` 取 `options.baseURL` 时拿到 `undefined`，于是回落到默认 `/api`。\n  结果碰巧是对的，但这是笔误，复制这个写法会踩坑。\n- `routes` 里 dashboard / task / project / user 四条的 `Component` 是 `null`，\n  实际由 `TaskApp` 接管 —— **suit 侧渲染 null 路由时必须跳过**，否则会炸。\n- 登录页有两份（`pages/Login.jsx` 与 `pages/LoginPage.jsx`），manifest 导出的是 `Login`（前者）\n  与 `LoginPage`（后者），宿主按需取。\n- 组件包必须 external 基座；`vite.config.js` 的 `external` 是精确字符串匹配，\n  `@yuku123/z-frontend-common/ui` 与 `/ui/echarts` 两个子路径必须逐个列出，漏了基座会被复制进 dist。\n\n## 七、变更记录\n\n| 版本 | 变更 |\n|---|---|\n| 0.1.1 | 新增组件文档页 `ComponentDocPage`（lead 008 §7）：`src/DOC.md` + 基座 `ComponentDoc` 薄包装 |\n| 0.1.1 | `appMeta` / `menuItems` 从 `pages-manifest.jsx` 拆到 `appMeta.jsx`，断掉模块循环 |\n| 0.1.0 | 首版：任务 / 项目 / 用户页面集 + manifest + 两套 API 客户端 |\n";
function Pi() {
  return /* @__PURE__ */ n(wa, { markdown: _i, title: "组件文档 — z-task" });
}
export {
  Pi as C,
  qe as D,
  Oi as T,
  Le as a,
  Ko as b,
  J as c,
  Di as d,
  vi as e,
  Mi as f,
  Si as g,
  ki as h,
  Li as i,
  tn as j,
  Xo as k,
  $i as l,
  Yo as m,
  wi as n,
  Qt as o,
  ra as p,
  an as r,
  Ai as t
};
