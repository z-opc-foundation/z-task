import { j as e } from "./jsx-runtime-z6PQ6F3d.js";
import { Card as C, Space as w, Tag as v, Button as T, Table as Z, Select as M, Form as f, Empty as X, Spin as de, Descriptions as k, List as N, Drawer as xe, Input as A, message as b, Popconfirm as ue, Typography as je, Modal as he, DatePicker as be, Row as se, Col as U, Statistic as G, Progress as Ie } from "antd";
import { CheckCircleOutlined as Y, EditOutlined as J, DeleteOutlined as ee, PlusOutlined as pe, InboxOutlined as Te, CheckOutlined as te, UnorderedListOutlined as ke, EyeOutlined as ve, ProjectOutlined as we, ReloadOutlined as Pe, ClockCircleOutlined as me, RocketOutlined as ye } from "@ant-design/icons";
import { useState as h, useEffect as E } from "react";
import { createRequest as De, authRequest as Se } from "@yuku123/z-frontend-common";
import { PageHeader as ze, TableToolbar as Oe, ErrorState as le, EmptyState as Le } from "@yuku123/z-frontend-common/ui";
import { Routes as Ce, Route as q, Navigate as Me } from "react-router-dom";
const Re = {
  high: { color: "red", text: "高" },
  medium: { color: "orange", text: "中" },
  low: { color: "green", text: "低" }
}, Be = {
  pending: { color: "default", text: "待处理" },
  in_progress: { color: "blue", text: "进行中" },
  completed: { color: "green", text: "已完成" }
};
function Ye({ task: s, onEdit: l, onComplete: o }) {
  const i = Re[s.priority] || { color: "default", text: s.priority }, n = Be[s.status] || { color: "default", text: s.status };
  return /* @__PURE__ */ e.jsx(C, { size: "small", title: s.title, extra: /* @__PURE__ */ e.jsxs(w, { children: [
    s.status !== "completed" && /* @__PURE__ */ e.jsx(T, { size: "small", icon: /* @__PURE__ */ e.jsx(Y, {}), onClick: () => o == null ? void 0 : o(s), children: "完成" }),
    /* @__PURE__ */ e.jsx(T, { size: "small", icon: /* @__PURE__ */ e.jsx(J, {}), onClick: () => l == null ? void 0 : l(s), children: "编辑" })
  ] }), children: /* @__PURE__ */ e.jsxs(w, { orientation: "vertical", style: { width: "100%" }, children: [
    /* @__PURE__ */ e.jsxs("div", { children: [
      "项目：",
      s.projectName
    ] }),
    /* @__PURE__ */ e.jsxs(w, { children: [
      /* @__PURE__ */ e.jsx(v, { color: i.color, children: i.text }),
      /* @__PURE__ */ e.jsx(v, { color: n.color, children: n.text })
    ] }),
    s.dueDate && /* @__PURE__ */ e.jsxs("div", { children: [
      "截止：",
      s.dueDate
    ] })
  ] }) });
}
const Fe = { high: "red", medium: "orange", low: "green" }, Ae = {
  pending: "default",
  in_progress: "blue",
  completed: "green"
};
function Je({ dataSource: s, loading: l, onEdit: o, onDelete: i, onComplete: n }) {
  const r = [
    { title: "任务名称", dataIndex: "title", key: "title" },
    { title: "项目", dataIndex: "projectName", key: "projectName" },
    {
      title: "优先级",
      dataIndex: "priority",
      key: "priority",
      render: (d) => /* @__PURE__ */ e.jsx(v, { color: Fe[d], children: d === "high" ? "高" : d === "medium" ? "中" : "低" })
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (d) => {
        const y = { pending: "待处理", in_progress: "进行中", completed: "已完成" };
        return /* @__PURE__ */ e.jsx(v, { color: Ae[d], children: y[d] || d });
      }
    },
    { title: "截止日期", dataIndex: "dueDate", key: "dueDate" },
    {
      title: "操作",
      key: "action",
      render: (d, y) => /* @__PURE__ */ e.jsxs(w, { children: [
        y.status !== "completed" && /* @__PURE__ */ e.jsx(T, { size: "small", icon: /* @__PURE__ */ e.jsx(Y, {}), onClick: () => n == null ? void 0 : n(y), children: "完成" }),
        /* @__PURE__ */ e.jsx(T, { size: "small", icon: /* @__PURE__ */ e.jsx(J, {}), onClick: () => o == null ? void 0 : o(y), children: "编辑" }),
        /* @__PURE__ */ e.jsx(T, { size: "small", danger: !0, icon: /* @__PURE__ */ e.jsx(ee, {}), onClick: () => i == null ? void 0 : i(y), children: "删除" })
      ] })
    }
  ];
  return /* @__PURE__ */ e.jsx(
    Z,
    {
      columns: r,
      dataSource: s,
      loading: l,
      rowKey: "id",
      pagination: { pageSize: 10 }
    }
  );
}
function Qe({ value: s, onChange: l, projects: o = [] }) {
  return /* @__PURE__ */ e.jsx(
    M,
    {
      value: s,
      onChange: l,
      placeholder: "请选择项目",
      style: { width: 200 },
      allowClear: !0,
      children: o.map((i) => /* @__PURE__ */ e.jsx(M.Option, { value: i.id, children: i.name }, i.id))
    }
  );
}
const L = De("task"), I = {
  // === 项目 ===
  listMyProjects: () => Se.get("/project/user/list"),
  createProject: (s) => L.post("/project", s),
  updateProject: (s, l) => L.put(`/project/${s}`, l),
  archiveProject: (s) => L.put(`/project/${s}/archive`),
  // === 任务 ===
  listTasksByProject: (s) => L.get("/task/project/list", { params: { projectId: s } }),
  listTasksByList: (s) => L.get("/task/list", { params: { listId: s } }),
  createTask: (s) => L.post("/task", s),
  completeTask: (s) => L.post("/task/complete", null, { params: { taskId: s } }),
  moveTask: (s, l, o) => L.put("/task/move", null, { params: { taskId: s, targetListId: l, position: o } }),
  // === 任务详情 ===
  getTaskDetail: (s) => L.get(`/task/${s}`),
  updateTask: (s, l) => L.put(`/task/${s}`, l),
  deleteTask: (s) => L.delete(`/task/${s}`)
}, Q = (s) => {
  if (!s) return "-";
  const l = String(s), o = l.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})/);
  return o ? o[1] : l;
};
function re({ apiBaseURL: s }) {
  const [l, o] = h([]), [i, n] = h(!1), [r, d] = h(!1), [y, j] = h(null), [u, D] = h(null), [S, z] = h([]), [g, F] = h(!1), [O] = f.useForm(), c = async () => {
    n(!0);
    try {
      const t = await I.listMyProjects();
      o((t == null ? void 0 : t.data) || t || []);
    } catch (t) {
      b.error("加载项目失败: " + ((t == null ? void 0 : t.message) || t));
    } finally {
      n(!1);
    }
  };
  E(() => {
    c();
  }, []);
  const p = async (t) => {
    D(t), F(!0);
    try {
      const x = await I.listTasksByProject(t.id);
      z((x == null ? void 0 : x.data) || x || []);
    } catch (x) {
      b.error("加载任务失败: " + ((x == null ? void 0 : x.message) || x));
    } finally {
      F(!1);
    }
  }, P = async () => {
    if (u)
      try {
        const t = await I.listTasksByProject(u.id);
        z((t == null ? void 0 : t.data) || t || []);
      } catch (t) {
        b.error("刷新任务失败: " + ((t == null ? void 0 : t.message) || t));
      }
  }, R = () => {
    j(null), O.resetFields(), O.setFieldsValue({ status: 1 }), d(!0);
  }, _ = (t) => {
    j(t), O.setFieldsValue({ name: t.name, description: t.description, status: t.status ?? 1 }), d(!0);
  }, V = async () => {
    try {
      const t = await O.validateFields();
      y ? (await I.updateProject(y.id, t), b.success("项目已更新")) : (await I.createProject(t), b.success("项目已创建")), d(!1), c();
    } catch (t) {
      if (t != null && t.errorFields) return;
      b.error("保存失败: " + ((t == null ? void 0 : t.message) || t));
    }
  }, $ = async (t) => {
    try {
      await I.archiveProject(t), b.success("项目已归档"), c(), (u == null ? void 0 : u.id) === t && (D(null), z([]));
    } catch (x) {
      b.error("归档失败: " + ((x == null ? void 0 : x.message) || x));
    }
  }, H = async (t) => {
    try {
      await I.completeTask(t), b.success("任务已完成"), P();
    } catch (x) {
      b.error("操作失败: " + ((x == null ? void 0 : x.message) || x));
    }
  }, B = [
    {
      title: "项目名称",
      dataIndex: "name",
      render: (t, x) => /* @__PURE__ */ e.jsx(
        "a",
        {
          onClick: () => p(x),
          style: { fontWeight: (u == null ? void 0 : u.id) === x.id ? 600 : 400 },
          children: t
        }
      )
    },
    {
      title: "状态",
      dataIndex: "status",
      width: 80,
      render: (t) => t === 1 ? /* @__PURE__ */ e.jsx(v, { color: "green", children: "进行中" }) : /* @__PURE__ */ e.jsx(v, { children: "已归档" })
    },
    { title: "创建时间", dataIndex: "createdAt", width: 170, render: Q },
    {
      title: "操作",
      width: 160,
      fixed: "right",
      render: (t, x) => /* @__PURE__ */ e.jsxs(w, { children: [
        /* @__PURE__ */ e.jsx(T, { size: "small", icon: /* @__PURE__ */ e.jsx(J, {}), onClick: () => _(x), children: "编辑" }),
        /* @__PURE__ */ e.jsx(ue, { title: "确定归档该项目?", onConfirm: () => $(x.id), children: /* @__PURE__ */ e.jsx(T, { size: "small", danger: !0, icon: /* @__PURE__ */ e.jsx(ee, {}), children: "归档" }) })
      ] })
    }
  ], K = (t) => {
    const W = {
      0: { text: "待办", color: "default" },
      1: { text: "进行中", color: "blue" },
      2: { text: "已完成", color: "green" }
    }[t] || { text: String(t), color: "default" };
    return /* @__PURE__ */ e.jsx(v, { color: W.color, children: W.text });
  };
  return /* @__PURE__ */ e.jsxs("div", { children: [
    /* @__PURE__ */ e.jsx("div", { style: { display: "flex", justifyContent: "flex-end", marginBottom: 12 }, children: /* @__PURE__ */ e.jsx(T, { type: "primary", icon: /* @__PURE__ */ e.jsx(pe, {}), onClick: R, children: "新建项目" }) }),
    /* @__PURE__ */ e.jsxs("div", { style: { display: "flex", gap: 16, height: "calc(100vh - 220px)" }, children: [
      /* @__PURE__ */ e.jsx(
        C,
        {
          size: "small",
          title: /* @__PURE__ */ e.jsxs(w, { children: [
            /* @__PURE__ */ e.jsx(Te, {}),
            "项目管理"
          ] }),
          style: { width: 520, flexShrink: 0 },
          styles: { body: { padding: 8, overflow: "auto", height: "calc(100% - 40px)" } },
          children: /* @__PURE__ */ e.jsx(
            Z,
            {
              rowKey: "id",
              columns: B,
              dataSource: l,
              loading: i,
              pagination: { pageSize: 10, size: "small" },
              size: "small",
              rowClassName: (t) => (u == null ? void 0 : u.id) === t.id ? "ant-table-row-selected" : "",
              onRow: (t) => ({ onClick: () => p(t), style: { cursor: "pointer" } }),
              locale: { emptyText: "暂无项目" }
            }
          )
        }
      ),
      /* @__PURE__ */ e.jsx(
        C,
        {
          size: "small",
          style: { flex: 1, overflow: "auto" },
          styles: { body: { padding: 16 } },
          title: u ? /* @__PURE__ */ e.jsxs(w, { children: [
            /* @__PURE__ */ e.jsx(ke, {}),
            u.name,
            " · 任务列表"
          ] }) : "项目详情",
          children: u ? /* @__PURE__ */ e.jsxs(de, { spinning: g, children: [
            /* @__PURE__ */ e.jsxs(k, { size: "small", bordered: !0, column: 2, style: { marginBottom: 16 }, children: [
              /* @__PURE__ */ e.jsx(k.Item, { label: "项目名称", span: 2, children: u.name }),
              /* @__PURE__ */ e.jsx(k.Item, { label: "描述", span: 2, children: u.description || "无" }),
              /* @__PURE__ */ e.jsx(k.Item, { label: "负责人", children: u.ownerId || "未指定" }),
              /* @__PURE__ */ e.jsx(k.Item, { label: "状态", children: u.status === 1 ? /* @__PURE__ */ e.jsx(v, { color: "green", children: "进行中" }) : /* @__PURE__ */ e.jsx(v, { children: "已归档" }) }),
              /* @__PURE__ */ e.jsx(
                k.Item,
                {
                  label: "创建时间",
                  children: Q(u.createdAt)
                }
              ),
              /* @__PURE__ */ e.jsx(k.Item, { label: "项目ID", children: u.id })
            ] }),
            /* @__PURE__ */ e.jsx(
              N,
              {
                size: "small",
                header: /* @__PURE__ */ e.jsxs("b", { children: [
                  "任务项 (",
                  S.length,
                  ")"
                ] }),
                bordered: !0,
                dataSource: S,
                locale: { emptyText: "该项目下暂无任务" },
                renderItem: (t) => /* @__PURE__ */ e.jsx(
                  N.Item,
                  {
                    actions: [
                      /* @__PURE__ */ e.jsx(
                        T,
                        {
                          size: "small",
                          type: "primary",
                          icon: /* @__PURE__ */ e.jsx(te, {}),
                          disabled: t.status === 2,
                          onClick: () => H(t.id),
                          children: "完成"
                        },
                        "complete"
                      )
                    ],
                    children: /* @__PURE__ */ e.jsx(
                      N.Item.Meta,
                      {
                        title: /* @__PURE__ */ e.jsxs(w, { children: [
                          t.title,
                          K(t.status),
                          /* @__PURE__ */ e.jsxs(v, { children: [
                            "优先级 ",
                            t.priority ?? "-"
                          ] })
                        ] }),
                        description: /* @__PURE__ */ e.jsxs("span", { style: { color: "#888", fontSize: 12 }, children: [
                          "截止: ",
                          Q(t.dueDate),
                          " · ID: ",
                          t.id
                        ] })
                      }
                    )
                  }
                )
              }
            )
          ] }) : /* @__PURE__ */ e.jsx(X, { description: "请从左侧选择一个项目", style: { marginTop: 80 } })
        }
      )
    ] }),
    /* @__PURE__ */ e.jsx(
      xe,
      {
        title: y ? `编辑项目 - ${y.name}` : "新建项目",
        size: "large",
        open: r,
        onClose: () => d(!1),
        destroyOnHidden: !0,
        extra: /* @__PURE__ */ e.jsxs(w, { children: [
          /* @__PURE__ */ e.jsx(T, { onClick: () => d(!1), children: "取消" }),
          /* @__PURE__ */ e.jsx(T, { type: "primary", onClick: V, children: "保存" })
        ] }),
        children: /* @__PURE__ */ e.jsxs(f, { form: O, layout: "vertical", preserve: !1, children: [
          /* @__PURE__ */ e.jsx(f.Item, { name: "name", label: "项目名称", rules: [{ required: !0, message: "请输入项目名称" }], children: /* @__PURE__ */ e.jsx(A, { placeholder: "例如: 一人公司" }) }),
          /* @__PURE__ */ e.jsx(f.Item, { name: "description", label: "项目描述", children: /* @__PURE__ */ e.jsx(A.TextArea, { rows: 3, placeholder: "可选" }) }),
          /* @__PURE__ */ e.jsx(f.Item, { name: "status", label: "状态", initialValue: 1, children: /* @__PURE__ */ e.jsx(
            M,
            {
              options: [
                { label: "进行中", value: 1 },
                { label: "已归档", value: 0 }
              ]
            }
          ) })
        ] })
      }
    )
  ] });
}
const { Paragraph: Ee } = je, ae = {
  0: { label: "待办", color: "default" },
  1: { label: "进行中", color: "blue" },
  2: { label: "已完成", color: "green" }
}, ie = {
  1: { label: "低", color: "default" },
  2: { label: "中", color: "orange" },
  3: { label: "高", color: "red" }
};
function _e({ taskId: s, open: l, onClose: o, onChanged: i, onEdit: n }) {
  const [r, d] = h(null), [y, j] = h(!1);
  E(() => {
    !l || !s || (j(!0), I.getTaskDetail(s).then((g) => d((g == null ? void 0 : g.data) || g)).catch(() => d(null)).finally(() => j(!1)));
  }, [l, s]);
  const u = async () => {
    try {
      await I.completeTask(s), d((g) => ({ ...g, status: 2 })), i == null || i();
    } catch {
    }
  }, D = async () => {
    try {
      await I.deleteTask(s), i == null || i(), o == null || o();
    } catch {
    }
  }, S = ae[r == null ? void 0 : r.status] || ae[0], z = ie[r == null ? void 0 : r.priority] || ie[1];
  return /* @__PURE__ */ e.jsx(
    xe,
    {
      title: (r == null ? void 0 : r.title) || "任务详情",
      size: "large",
      open: l,
      onClose: o,
      loading: y,
      footer: /* @__PURE__ */ e.jsxs("div", { style: { display: "flex", justifyContent: "space-between" }, children: [
        /* @__PURE__ */ e.jsx(
          ue,
          {
            title: "确认删除此任务?",
            onConfirm: D,
            okText: "删除",
            cancelText: "取消",
            okButtonProps: { danger: !0 },
            children: /* @__PURE__ */ e.jsx(T, { danger: !0, icon: /* @__PURE__ */ e.jsx(ee, {}), children: "删除" })
          }
        ),
        /* @__PURE__ */ e.jsxs(w, { children: [
          (r == null ? void 0 : r.status) !== 2 && /* @__PURE__ */ e.jsx(T, { type: "primary", icon: /* @__PURE__ */ e.jsx(te, {}), onClick: u, children: "完成任务" }),
          /* @__PURE__ */ e.jsx(T, { icon: /* @__PURE__ */ e.jsx(J, {}), onClick: () => n == null ? void 0 : n(r), children: "编辑" })
        ] })
      ] }),
      children: r && /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
        /* @__PURE__ */ e.jsxs(k, { column: 2, bordered: !0, size: "small", style: { marginBottom: 24 }, children: [
          /* @__PURE__ */ e.jsx(k.Item, { label: "状态", children: /* @__PURE__ */ e.jsx(v, { color: S.color, children: S.label }) }),
          /* @__PURE__ */ e.jsx(k.Item, { label: "优先级", children: /* @__PURE__ */ e.jsx(v, { color: z.color, children: z.label }) }),
          /* @__PURE__ */ e.jsx(k.Item, { label: "项目 ID", children: r.projectId }),
          /* @__PURE__ */ e.jsx(k.Item, { label: "列表 ID", children: r.listId }),
          /* @__PURE__ */ e.jsx(k.Item, { label: "截止时间", span: 2, children: r.dueDate || "未设置" }),
          /* @__PURE__ */ e.jsx(k.Item, { label: "创建时间", children: r.createdAt || "-" }),
          /* @__PURE__ */ e.jsx(k.Item, { label: "更新时间", children: r.updatedAt || "-" })
        ] }),
        r.description && /* @__PURE__ */ e.jsxs("div", { style: { marginBottom: 24 }, children: [
          /* @__PURE__ */ e.jsx("div", { style: { fontWeight: 600, marginBottom: 8 }, children: "描述" }),
          /* @__PURE__ */ e.jsx(Ee, { style: { whiteSpace: "pre-wrap", color: "#595959" }, children: r.description })
        ] })
      ] })
    }
  );
}
function Ve({ open: s, task: l, projects: o, onClose: i, onSaved: n }) {
  const [r] = f.useForm(), d = !!(l != null && l.id);
  E(() => {
    s && l ? r.setFieldsValue({
      title: l.title,
      description: l.description,
      projectId: l.projectId,
      listId: l.listId,
      status: l.status,
      priority: l.priority,
      dueDate: l.dueDate
    }) : s && r.resetFields();
  }, [s, l, r]);
  const y = async () => {
    try {
      const j = await r.validateFields();
      d ? (await I.updateTask(l.id, j), b.success("任务已更新")) : (await I.createTask(j), b.success("任务已创建")), n == null || n(), i == null || i();
    } catch (j) {
      if (j != null && j.errorFields) return;
      b.error("保存失败: " + ((j == null ? void 0 : j.message) || j));
    }
  };
  return /* @__PURE__ */ e.jsx(
    he,
    {
      title: d ? "编辑任务" : "新建任务",
      open: s,
      onCancel: i,
      onOk: y,
      destroyOnHidden: !0,
      size: "large",
      children: /* @__PURE__ */ e.jsxs(f, { form: r, layout: "vertical", preserve: !1, children: [
        /* @__PURE__ */ e.jsx(
          f.Item,
          {
            name: "title",
            label: "任务标题",
            rules: [{ required: !0, message: "请输入任务标题" }],
            children: /* @__PURE__ */ e.jsx(A, { placeholder: "例如: 实现 xx 功能" })
          }
        ),
        /* @__PURE__ */ e.jsx(f.Item, { name: "description", label: "描述", children: /* @__PURE__ */ e.jsx(A.TextArea, { rows: 3, placeholder: "任务描述 (可选)" }) }),
        /* @__PURE__ */ e.jsxs("div", { style: { display: "flex", gap: 16 }, children: [
          /* @__PURE__ */ e.jsx(
            f.Item,
            {
              name: "projectId",
              label: "所属项目",
              rules: [{ required: !0 }],
              style: { flex: 1 },
              children: /* @__PURE__ */ e.jsx(
                M,
                {
                  options: o.map((j) => ({ label: j.name, value: j.id })),
                  placeholder: "选择项目"
                }
              )
            }
          ),
          /* @__PURE__ */ e.jsx(f.Item, { name: "listId", label: "列表 ID", style: { flex: 1 }, children: /* @__PURE__ */ e.jsx(A, { type: "number", placeholder: "默认 1" }) })
        ] }),
        /* @__PURE__ */ e.jsxs("div", { style: { display: "flex", gap: 16 }, children: [
          /* @__PURE__ */ e.jsx(f.Item, { name: "status", label: "状态", initialValue: 0, style: { flex: 1 }, children: /* @__PURE__ */ e.jsx(
            M,
            {
              options: [
                { label: "待办", value: 0 },
                { label: "进行中", value: 1 },
                { label: "已完成", value: 2 }
              ]
            }
          ) }),
          /* @__PURE__ */ e.jsx(f.Item, { name: "priority", label: "优先级", initialValue: 1, style: { flex: 1 }, children: /* @__PURE__ */ e.jsx(
            M,
            {
              options: [
                { label: "低", value: 1 },
                { label: "中", value: 2 },
                { label: "高", value: 3 }
              ]
            }
          ) })
        ] }),
        /* @__PURE__ */ e.jsx(f.Item, { name: "dueDate", label: "截止时间", children: /* @__PURE__ */ e.jsx(be, { style: { width: "100%" }, placeholder: "选择截止日期" }) })
      ] })
    }
  );
}
function ne({ apiBaseURL: s, back: l }) {
  const [o, i] = h([]), [n, r] = h(null), [d, y] = h([]), [j, u] = h(!1), [D, S] = h(null), [z, g] = h(null), [F, O] = h(!1), [c, p] = h(!1), [P, R] = h(!1), [_, V] = h(null), [$] = f.useForm(), H = async () => {
    try {
      const a = await I.listMyProjects(), m = (a == null ? void 0 : a.data) || a || [];
      i(m), g(null), m.length > 0 && !n && r(m[0].id);
    } catch (a) {
      g((a == null ? void 0 : a.message) || "加载项目失败");
    }
  }, B = async (a) => {
    if (!a) {
      y([]);
      return;
    }
    u(!0), S(null);
    try {
      const m = await I.listTasksByProject(a);
      y((m == null ? void 0 : m.data) || m || []);
    } catch (m) {
      S((m == null ? void 0 : m.message) || "加载任务失败");
    } finally {
      u(!1);
    }
  };
  E(() => {
    H();
  }, []), E(() => {
    B(n);
  }, [n]);
  const K = () => {
    if (!n) {
      b.warning("请先选择项目");
      return;
    }
    $.resetFields(), $.setFieldsValue({ projectId: n, listId: 1, status: 1, priority: 1 }), O(!0);
  }, t = async () => {
    try {
      const a = await $.validateFields();
      await I.createTask(a), b.success("任务已创建"), O(!1), B(n);
    } catch (a) {
      if (a != null && a.errorFields) return;
      b.error("创建失败: " + ((a == null ? void 0 : a.message) || a));
    }
  }, x = async (a) => {
    try {
      await I.completeTask(a), b.success("任务已完成"), B(n);
    } catch (m) {
      b.error("操作失败: " + ((m == null ? void 0 : m.message) || m));
    }
  }, W = [
    { title: "ID", dataIndex: "id", width: 60 },
    { title: "标题", dataIndex: "title" },
    { title: "项目ID", dataIndex: "projectId", width: 80 },
    {
      title: "状态",
      dataIndex: "status",
      width: 100,
      render: (a) => {
        const m = { 0: "待办", 1: "进行中", 2: "已完成" }, ge = { 0: "default", 1: "blue", 2: "green" }[a] || "default";
        return /* @__PURE__ */ e.jsx(v, { color: ge, children: m[a] || a });
      }
    },
    { title: "优先级", dataIndex: "priority", width: 80 },
    { title: "截止时间", dataIndex: "dueDate", width: 180 },
    {
      title: "操作",
      width: 200,
      fixed: "right",
      render: (a, m) => /* @__PURE__ */ e.jsxs(w, { children: [
        /* @__PURE__ */ e.jsx(
          T,
          {
            size: "small",
            icon: /* @__PURE__ */ e.jsx(ve, {}),
            onClick: () => {
              V(m), p(!0);
            },
            children: "查看"
          }
        ),
        /* @__PURE__ */ e.jsx(
          T,
          {
            size: "small",
            type: "primary",
            icon: /* @__PURE__ */ e.jsx(te, {}),
            onClick: () => x(m.id),
            disabled: m.status === 2,
            children: "完成"
          }
        )
      ] })
    }
  ], fe = !j && !D && d.length === 0 && n;
  return /* @__PURE__ */ e.jsxs("div", { children: [
    /* @__PURE__ */ e.jsx(
      ze,
      {
        title: "任务管理",
        subtitle: "按项目维度组织任务, 支持新建、完成等操作",
        breadcrumb: [{ label: "任务中心" }, { label: "任务列表" }],
        back: !!l
      }
    ),
    /* @__PURE__ */ e.jsx(
      Oe,
      {
        left: /* @__PURE__ */ e.jsx(
          M,
          {
            value: n,
            onChange: r,
            style: { width: 240 },
            placeholder: "选择项目",
            options: o.map((a) => ({ label: a.name, value: a.id }))
          }
        ),
        right: /* @__PURE__ */ e.jsx(T, { type: "primary", icon: /* @__PURE__ */ e.jsx(pe, {}), onClick: K, children: "新建任务" })
      }
    ),
    z && /* @__PURE__ */ e.jsx("div", { style: { marginBottom: 16 }, children: /* @__PURE__ */ e.jsx(
      le,
      {
        error: z,
        onRetry: H,
        title: "加载项目列表失败"
      }
    ) }),
    D && /* @__PURE__ */ e.jsx("div", { style: { marginBottom: 16 }, children: /* @__PURE__ */ e.jsx(le, { error: D, onRetry: () => B(n) }) }),
    /* @__PURE__ */ e.jsx("div", { style: {
      background: "#ffffff",
      borderRadius: 16,
      padding: 20,
      boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04), 0 1px 2px rgba(15, 23, 42, 0.06)"
    }, children: fe ? /* @__PURE__ */ e.jsx(
      Le,
      {
        title: "该项目下还没有任务",
        description: "把目标拆解成可执行的任务, 一项项推进",
        actionText: "新建第一个任务",
        onAction: K
      }
    ) : /* @__PURE__ */ e.jsx(
      Z,
      {
        rowKey: "id",
        columns: W,
        dataSource: d,
        loading: j,
        pagination: { pageSize: 10 }
      }
    ) }),
    /* @__PURE__ */ e.jsx(
      he,
      {
        title: "新建任务",
        open: F,
        onCancel: () => O(!1),
        onOk: t,
        destroyOnHidden: !0,
        children: /* @__PURE__ */ e.jsxs(f, { form: $, layout: "vertical", preserve: !1, children: [
          /* @__PURE__ */ e.jsx(f.Item, { name: "title", label: "任务标题", rules: [{ required: !0, message: "请输入任务标题" }], children: /* @__PURE__ */ e.jsx(A, { placeholder: "例如: 实现 xx 功能" }) }),
          /* @__PURE__ */ e.jsx(f.Item, { name: "projectId", label: "所属项目", rules: [{ required: !0 }], children: /* @__PURE__ */ e.jsx(
            M,
            {
              options: o.map((a) => ({ label: a.name, value: a.id })),
              placeholder: "从数据库捞出的项目列表"
            }
          ) }),
          /* @__PURE__ */ e.jsx(f.Item, { name: "listId", label: "列表ID", rules: [{ required: !0 }], children: /* @__PURE__ */ e.jsx(A, { type: "number", placeholder: "默认 1" }) }),
          /* @__PURE__ */ e.jsx(f.Item, { name: "priority", label: "优先级", initialValue: 1, children: /* @__PURE__ */ e.jsx(M, { options: [{ label: "低", value: 1 }, { label: "中", value: 2 }, { label: "高", value: 3 }] }) })
        ] })
      }
    ),
    /* @__PURE__ */ e.jsx(
      _e,
      {
        taskId: _ == null ? void 0 : _.id,
        open: c,
        onClose: () => {
          p(!1), V(null);
        },
        onChanged: B,
        onEdit: (a) => {
          V(a), p(!1), R(!0);
        }
      }
    ),
    /* @__PURE__ */ e.jsx(
      Ve,
      {
        open: P,
        task: _,
        projects: o,
        onClose: () => {
          R(!1), V(null);
        },
        onSaved: B
      }
    )
  ] });
}
const { Text: ce, Title: Xe } = je, oe = {
  0: { text: "待办", color: "default", icon: /* @__PURE__ */ e.jsx(me, {}) },
  1: { text: "进行中", color: "blue", icon: /* @__PURE__ */ e.jsx(ye, {}) },
  2: { text: "已完成", color: "green", icon: /* @__PURE__ */ e.jsx(Y, {}) }
};
function $e({ apiBaseURL: s }) {
  const [l, o] = h([]), [i, n] = h(null), [r, d] = h([]), [y, j] = h(!1), [u, D] = h(!1), S = async () => {
    D(!0);
    try {
      const c = await I.listMyProjects(), p = (c == null ? void 0 : c.data) || c || [];
      o(p), p.length > 0 && !i && n(p[0].id);
    } catch {
      o([]);
    } finally {
      D(!1);
    }
  }, z = async (c) => {
    if (!c) {
      d([]);
      return;
    }
    j(!0);
    try {
      const p = await I.listTasksByProject(c);
      d((p == null ? void 0 : p.data) || p || []);
    } catch {
      d([]);
    } finally {
      j(!1);
    }
  };
  E(() => {
    S();
  }, []), E(() => {
    z(i);
  }, [i]);
  const g = r.reduce((c, p) => {
    c.total += 1;
    const P = p.status ?? 0;
    return P === 0 ? c.todo += 1 : P === 1 ? c.doing += 1 : P === 2 && (c.done += 1), c;
  }, { total: 0, todo: 0, doing: 0, done: 0 }), F = g.total > 0 ? Math.round(g.done / g.total * 100) : 0, O = [1, 2, 3].map((c) => ({
    priority: c,
    list: r.filter((p) => (p.priority ?? 1) === c)
  }));
  return /* @__PURE__ */ e.jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 16 }, children: [
    /* @__PURE__ */ e.jsx(C, { children: /* @__PURE__ */ e.jsxs(w, { wrap: !0, children: [
      /* @__PURE__ */ e.jsx(we, { style: { fontSize: 18, color: "#1677ff" } }),
      /* @__PURE__ */ e.jsx(ce, { strong: !0, children: "选择项目：" }),
      /* @__PURE__ */ e.jsx(
        M,
        {
          value: i,
          onChange: n,
          style: { width: 280 },
          loading: u,
          placeholder: "选择项目",
          options: l.map((c) => ({ label: c.name, value: c.id }))
        }
      ),
      /* @__PURE__ */ e.jsxs("a", { onClick: () => S(), children: [
        /* @__PURE__ */ e.jsx(Pe, {}),
        " 刷新项目"
      ] })
    ] }) }),
    /* @__PURE__ */ e.jsxs(de, { spinning: y, children: [
      /* @__PURE__ */ e.jsxs(se, { gutter: 16, children: [
        /* @__PURE__ */ e.jsx(U, { span: 6, children: /* @__PURE__ */ e.jsx(C, { children: /* @__PURE__ */ e.jsx(G, { title: "总任务数", value: g.total }) }) }),
        /* @__PURE__ */ e.jsx(U, { span: 6, children: /* @__PURE__ */ e.jsx(C, { children: /* @__PURE__ */ e.jsx(
          G,
          {
            title: "待办",
            value: g.todo,
            styles: { content: { color: "#8c8c8c" } },
            prefix: /* @__PURE__ */ e.jsx(me, {})
          }
        ) }) }),
        /* @__PURE__ */ e.jsx(U, { span: 6, children: /* @__PURE__ */ e.jsx(C, { children: /* @__PURE__ */ e.jsx(
          G,
          {
            title: "进行中",
            value: g.doing,
            styles: { content: { color: "#1677ff" } },
            prefix: /* @__PURE__ */ e.jsx(ye, {})
          }
        ) }) }),
        /* @__PURE__ */ e.jsx(U, { span: 6, children: /* @__PURE__ */ e.jsx(C, { children: /* @__PURE__ */ e.jsx(
          G,
          {
            title: "已完成",
            value: g.done,
            styles: { content: { color: "#52c41a" } },
            prefix: /* @__PURE__ */ e.jsx(Y, {})
          }
        ) }) })
      ] }),
      /* @__PURE__ */ e.jsx(C, { style: { marginTop: 16 }, title: "完成率", children: /* @__PURE__ */ e.jsx(Ie, { percent: F, status: F === 100 ? "success" : "active" }) }),
      /* @__PURE__ */ e.jsx(se, { gutter: 16, style: { marginTop: 16 }, children: O.map(({ priority: c, list: p }) => /* @__PURE__ */ e.jsx(U, { span: 8, children: /* @__PURE__ */ e.jsx(C, { size: "small", title: /* @__PURE__ */ e.jsxs(w, { children: [
        /* @__PURE__ */ e.jsx(v, { color: c === 3 ? "red" : c === 2 ? "orange" : "default", children: c === 3 ? "高" : c === 2 ? "中" : "低" }),
        /* @__PURE__ */ e.jsxs("span", { children: [
          "优先级 (",
          p.length,
          ")"
        ] })
      ] }), children: p.length === 0 ? /* @__PURE__ */ e.jsx(X, { image: X.PRESENTED_IMAGE_SIMPLE, description: "无任务" }) : /* @__PURE__ */ e.jsx(
        N,
        {
          size: "small",
          dataSource: p.slice(0, 8),
          renderItem: (P) => {
            const R = oe[P.status ?? 0] || oe[0];
            return /* @__PURE__ */ e.jsx(N.Item, { children: /* @__PURE__ */ e.jsx(
              N.Item.Meta,
              {
                avatar: R.icon,
                title: /* @__PURE__ */ e.jsxs(w, { children: [
                  /* @__PURE__ */ e.jsx(ce, { children: P.title }),
                  /* @__PURE__ */ e.jsx(v, { color: R.color, style: { margin: 0 }, children: R.text })
                ] }),
                description: P.dueDate ? `截止: ${P.dueDate}` : "无截止时间"
              }
            ) });
          }
        }
      ) }) }, c)) })
    ] })
  ] });
}
function Ze() {
  return /* @__PURE__ */ e.jsxs(Ce, { children: [
    /* @__PURE__ */ e.jsx(q, { index: !0, element: /* @__PURE__ */ e.jsx(Me, { to: "dashboard", replace: !0 }) }),
    /* @__PURE__ */ e.jsx(q, { path: "dashboard", element: /* @__PURE__ */ e.jsx($e, {}) }),
    /* @__PURE__ */ e.jsx(q, { path: "project", element: /* @__PURE__ */ e.jsx(re, {}) }),
    /* @__PURE__ */ e.jsx(q, { path: "project/*", element: /* @__PURE__ */ e.jsx(re, {}) }),
    /* @__PURE__ */ e.jsx(q, { path: "task", element: /* @__PURE__ */ e.jsx(ne, {}) }),
    /* @__PURE__ */ e.jsx(q, { path: "task/*", element: /* @__PURE__ */ e.jsx(ne, {}) })
  ] });
}
export {
  re as ProjectList,
  Qe as ProjectSelect,
  Ze as TaskApp,
  Ye as TaskCard,
  $e as TaskDashboard,
  ne as TaskList,
  Je as TaskTable,
  I as api,
  I as taskApi
};
