import { createRequest as o } from "@yuku123/z-frontend-common";
const a = o({ baseURL: "/api" });
a.interceptors.request.use((s) => {
  const e = localStorage.getItem("userId");
  return e && (s.headers["X-User-Id"] = e), s;
});
function r(s) {
  s && s.apiBase !== void 0 && (a.defaults.baseURL = s.apiBase);
}
const i = (s) => a.post("/api/auth/login", s), n = (s) => a.get("/api/task/list", { params: { listId: s } }), c = (s) => a.get("/api/task/project/list", { params: { projectId: s } }), l = (s) => a.get("/api/task/assignee/list", { params: { userId: s } }), k = (s) => a.post("/api/task", s), u = (s, e, t) => a.put("/api/task/move", null, { params: { taskId: s, targetListId: e, position: t } }), m = (s, e) => a.post("/api/task/assignees/add", null, { params: { taskId: s, userId: e } }), g = (s, e) => a.post("/api/task/assignees/remove", null, { params: { taskId: s, userId: e } }), d = (s) => a.post("/api/task/complete", null, { params: { taskId: s } }), T = (s) => a.post("/api/task/reopen", null, { params: { taskId: s } }), j = (s) => a.get("/api/project/user/list", { params: { userId: s } }), L = (s) => a.post("/api/project", s), v = (s) => a.put(`/api/project/${s}/archive`);
export {
  m as a,
  v as b,
  d as c,
  r as d,
  L as e,
  k as f,
  j as g,
  l as h,
  n as i,
  c as j,
  T as k,
  i as l,
  u as m,
  a as n,
  g as r
};
