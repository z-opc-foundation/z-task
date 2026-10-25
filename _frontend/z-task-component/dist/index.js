import { j as e } from "./ComponentDoc-CZYjAF-k.js";
import { C as st } from "./ComponentDoc-CZYjAF-k.js";
import { Card as S, Space as k, Tag as w, Button as I, Select as L, Form as y, Input as B, Empty as Z, Spin as xe, Descriptions as T, List as q, Drawer as ue, message as g, Popconfirm as je, Typography as he, Modal as pe, DatePicker as be, Row as le, Col as N, Statistic as H, Progress as Ie } from "antd";
import { CheckCircleOutlined as W, EditOutlined as G, DeleteOutlined as ee, PlusOutlined as me, InboxOutlined as Te, CheckOutlined as te, UnorderedListOutlined as ke, EyeOutlined as we, ProjectOutlined as ve, ReloadOutlined as Pe, ClockCircleOutlined as ye, RocketOutlined as fe } from "@ant-design/icons";
import { ListTable as se, PageHeader as De, TableToolbar as Oe, ErrorState as re } from "@yuku123/z-frontend-common/ui";
import { useState as h, useEffect as $, useMemo as Ce } from "react";
import { createRequest as ze, authRequest as Le } from "@yuku123/z-frontend-common";
import { Routes as Se, Route as V, Navigate as Me } from "react-router-dom";
const Ae = {
  high: { color: "red", text: "高" },
  medium: { color: "orange", text: "中" },
  low: { color: "green", text: "低" }
}, Be = {
  pending: { color: "default", text: "待处理" },
  in_progress: { color: "blue", text: "进行中" },
  completed: { color: "green", text: "已完成" }
};
function Ye({ task: l, onEdit: r, onComplete: o }) {
  const i = Ae[l.priority] || { color: "default", text: l.priority }, n = Be[l.status] || { color: "default", text: l.status };
  return /* @__PURE__ */ e.jsx(S, { size: "small", title: l.title, extra: /* @__PURE__ */ e.jsxs(k, { children: [
    l.status !== "completed" && /* @__PURE__ */ e.jsx(I, { size: "small", icon: /* @__PURE__ */ e.jsx(W, {}), onClick: () => o == null ? void 0 : o(l), children: "完成" }),
    /* @__PURE__ */ e.jsx(I, { size: "small", icon: /* @__PURE__ */ e.jsx(G, {}), onClick: () => r == null ? void 0 : r(l), children: "编辑" })
  ] }), children: /* @__PURE__ */ e.jsxs(k, { orientation: "vertical", style: { width: "100%" }, children: [
    /* @__PURE__ */ e.jsxs("div", { children: [
      "项目：",
      l.projectName
    ] }),
    /* @__PURE__ */ e.jsxs(k, { children: [
      /* @__PURE__ */ e.jsx(w, { color: i.color, children: i.text }),
      /* @__PURE__ */ e.jsx(w, { color: n.color, children: n.text })
    ] }),
    l.dueDate && /* @__PURE__ */ e.jsxs("div", { children: [
      "截止：",
      l.dueDate
    ] })
  ] }) });
}
const Fe = { high: "red", medium: "orange", low: "green" }, Re = {
  pending: "default",
  in_progress: "blue",
  completed: "green"
};
function Je({ dataSource: l, loading: r, onEdit: o, onDelete: i, onComplete: n }) {
  const a = [
    { title: "任务名称", dataIndex: "title", key: "title" },
    { title: "项目", dataIndex: "projectName", key: "projectName" },
    {
      title: "优先级",
      dataIndex: "priority",
      key: "priority",
      render: (d) => /* @__PURE__ */ e.jsx(w, { color: Fe[d], children: d === "high" ? "高" : d === "medium" ? "中" : "低" })
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (d) => {
        const m = { pending: "待处理", in_progress: "进行中", completed: "已完成" };
        return /* @__PURE__ */ e.jsx(w, { color: Re[d], children: m[d] || d });
      }
    },
    { title: "截止日期", dataIndex: "dueDate", key: "dueDate" },
    {
      title: "操作",
      key: "action",
      render: (d, m) => /* @__PURE__ */ e.jsxs(k, { children: [
        m.status !== "completed" && /* @__PURE__ */ e.jsx(I, { size: "small", icon: /* @__PURE__ */ e.jsx(W, {}), onClick: () => n == null ? void 0 : n(m), children: "完成" }),
        /* @__PURE__ */ e.jsx(I, { size: "small", icon: /* @__PURE__ */ e.jsx(G, {}), onClick: () => o == null ? void 0 : o(m), children: "编辑" }),
        /* @__PURE__ */ e.jsx(I, { size: "small", danger: !0, icon: /* @__PURE__ */ e.jsx(ee, {}), onClick: () => i == null ? void 0 : i(m), children: "删除" })
      ] })
    }
  ];
  return /* @__PURE__ */ e.jsx(
    se,
    {
      columns: a,
      rows: l,
      loading: r,
      rowKey: "id",
      searchKeys: "title,projectName",
      searchPlaceholder: "按任务名称 / 项目过滤",
      emptyDescription: "当前还没有任务"
    }
  );
}
function Qe({ value: l, onChange: r, projects: o = [] }) {
  return /* @__PURE__ */ e.jsx(
    L,
    {
      value: l,
      onChange: r,
      placeholder: "请选择项目",
      style: { width: 200 },
      allowClear: !0,
      children: o.map((i) => /* @__PURE__ */ e.jsx(L.Option, { value: i.id, children: i.name }, i.id))
    }
  );
}
const z = ze("task"), b = {
  // === 项目 ===
  listMyProjects: () => Le.get("/project/user/list"),
  createProject: (l) => z.post("/project", l),
  updateProject: (l, r) => z.put(`/project/${l}`, r),
  archiveProject: (l) => z.put(`/project/${l}/archive`),
  // === 任务 ===
  listTasksByProject: (l) => z.get("/task/project/list", { params: { projectId: l } }),
  listTasksByList: (l) => z.get("/task/list", { params: { listId: l } }),
  createTask: (l) => z.post("/task", l),
  completeTask: (l) => z.post("/task/complete", null, { params: { taskId: l } }),
  moveTask: (l, r, o) => z.put("/task/move", null, { params: { taskId: l, targetListId: r, position: o } }),
  // === 任务详情 ===
  getTaskDetail: (l) => z.get(`/task/${l}`),
  updateTask: (l, r) => z.put(`/task/${l}`, r),
  deleteTask: (l) => z.delete(`/task/${l}`)
}, X = (l) => {
  if (!l) return "-";
  const r = String(l), o = r.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})/);
  return o ? o[1] : r;
};
function ae({ apiBaseURL: l }) {
  const [r, o] = h([]), [i, n] = h(!1), [a, d] = h(!1), [m, j] = h(null), [x, P] = h(null), [D, O] = h([]), [f, F] = h(!1), [C] = y.useForm(), c = async () => {
    n(!0);
    try {
      const t = await b.listMyProjects();
      o((t == null ? void 0 : t.data) || t || []);
    } catch (t) {
      g.error("加载项目失败: " + ((t == null ? void 0 : t.message) || t));
    } finally {
      n(!1);
    }
  };
  $(() => {
    c();
  }, []);
  const [p, v] = h(""), M = Ce(() => {
    const t = p.trim().toLowerCase();
    return t ? r.filter((s) => `${s.name || ""} ${s.status ?? ""} ${s.createdAt || ""}`.toLowerCase().includes(t)) : r;
  }, [r, p]), R = async (t) => {
    P(t), F(!0);
    try {
      const s = await b.listTasksByProject(t.id);
      O((s == null ? void 0 : s.data) || s || []);
    } catch (s) {
      g.error("加载任务失败: " + ((s == null ? void 0 : s.message) || s));
    } finally {
      F(!1);
    }
  }, E = async () => {
    if (x)
      try {
        const t = await b.listTasksByProject(x.id);
        O((t == null ? void 0 : t.data) || t || []);
      } catch (t) {
        g.error("刷新任务失败: " + ((t == null ? void 0 : t.message) || t));
      }
  }, _ = () => {
    j(null), C.resetFields(), C.setFieldsValue({ status: 1 }), d(!0);
  }, K = (t) => {
    j(t), C.setFieldsValue({ name: t.name, description: t.description, status: t.status ?? 1 }), d(!0);
  }, A = async () => {
    try {
      const t = await C.validateFields();
      m ? (await b.updateProject(m.id, t), g.success("项目已更新")) : (await b.createProject(t), g.success("项目已创建")), d(!1), c();
    } catch (t) {
      if (t != null && t.errorFields) return;
      g.error("保存失败: " + ((t == null ? void 0 : t.message) || t));
    }
  }, U = async (t) => {
    try {
      await b.archiveProject(t), g.success("项目已归档"), c(), (x == null ? void 0 : x.id) === t && (P(null), O([]));
    } catch (s) {
      g.error("归档失败: " + ((s == null ? void 0 : s.message) || s));
    }
  }, Y = async (t) => {
    try {
      await b.completeTask(t), g.success("任务已完成"), E();
    } catch (s) {
      g.error("操作失败: " + ((s == null ? void 0 : s.message) || s));
    }
  }, J = [
    {
      title: "项目名称",
      dataIndex: "name",
      render: (t, s) => /* @__PURE__ */ e.jsx(
        "a",
        {
          onClick: () => R(s),
          style: { fontWeight: (x == null ? void 0 : x.id) === s.id ? 600 : 400 },
          children: t
        }
      )
    },
    {
      title: "状态",
      dataIndex: "status",
      width: 80,
      render: (t) => t === 1 ? /* @__PURE__ */ e.jsx(w, { color: "green", children: "进行中" }) : /* @__PURE__ */ e.jsx(w, { children: "已归档" })
    },
    { title: "创建时间", dataIndex: "createdAt", width: 170, render: X },
    {
      title: "操作",
      width: 160,
      fixed: "right",
      render: (t, s) => /* @__PURE__ */ e.jsxs(k, { children: [
        /* @__PURE__ */ e.jsx(I, { size: "small", icon: /* @__PURE__ */ e.jsx(G, {}), onClick: () => K(s), children: "编辑" }),
        /* @__PURE__ */ e.jsx(je, { title: "确定归档该项目?", onConfirm: () => U(s.id), children: /* @__PURE__ */ e.jsx(I, { size: "small", danger: !0, icon: /* @__PURE__ */ e.jsx(ee, {}), children: "归档" }) })
      ] })
    }
  ], Q = (t) => {
    const u = {
      0: { text: "待办", color: "default" },
      1: { text: "进行中", color: "blue" },
      2: { text: "已完成", color: "green" }
    }[t] || { text: String(t), color: "default" };
    return /* @__PURE__ */ e.jsx(w, { color: u.color, children: u.text });
  };
  return /* @__PURE__ */ e.jsxs("div", { children: [
    /* @__PURE__ */ e.jsx("div", { style: { display: "flex", justifyContent: "flex-end", marginBottom: 12 }, children: /* @__PURE__ */ e.jsx(I, { type: "primary", icon: /* @__PURE__ */ e.jsx(me, {}), onClick: _, children: "新建项目" }) }),
    /* @__PURE__ */ e.jsxs("div", { style: { display: "flex", gap: 16, height: "calc(100vh - 220px)" }, children: [
      /* @__PURE__ */ e.jsx(
        se,
        {
          rows: M,
          columns: J,
          loading: i,
          rowKey: "id",
          cardTitle: /* @__PURE__ */ e.jsxs(k, { children: [
            /* @__PURE__ */ e.jsx(Te, {}),
            "项目管理"
          ] }),
          cardExtra: /* @__PURE__ */ e.jsx(k, { children: /* @__PURE__ */ e.jsx(
            B.Search,
            {
              allowClear: !0,
              placeholder: "按项目名称 / 状态 / 创建时间过滤",
              style: { width: 240 },
              onChange: (t) => v(t.target.value)
            }
          ) }),
          cardProps: {
            size: "small",
            style: { width: 520, flexShrink: 0 },
            styles: { body: { padding: 8, overflow: "auto", height: "calc(100% - 40px)" } }
          },
          tableProps: {
            rowClassName: (t) => (x == null ? void 0 : x.id) === t.id ? "ant-table-row-selected" : "",
            onRow: (t) => ({ onClick: () => R(t), style: { cursor: "pointer" } })
          },
          emptyDescription: "还没有项目，新建一个开始组织任务"
        }
      ),
      /* @__PURE__ */ e.jsx(
        S,
        {
          size: "small",
          style: { flex: 1, overflow: "auto" },
          styles: { body: { padding: 16 } },
          title: x ? /* @__PURE__ */ e.jsxs(k, { children: [
            /* @__PURE__ */ e.jsx(ke, {}),
            x.name,
            " · 任务列表"
          ] }) : "项目详情",
          children: x ? /* @__PURE__ */ e.jsxs(xe, { spinning: f, children: [
            /* @__PURE__ */ e.jsxs(T, { size: "small", bordered: !0, column: 2, style: { marginBottom: 16 }, children: [
              /* @__PURE__ */ e.jsx(T.Item, { label: "项目名称", span: 2, children: x.name }),
              /* @__PURE__ */ e.jsx(T.Item, { label: "描述", span: 2, children: x.description || "无" }),
              /* @__PURE__ */ e.jsx(T.Item, { label: "负责人", children: x.ownerId || "未指定" }),
              /* @__PURE__ */ e.jsx(T.Item, { label: "状态", children: x.status === 1 ? /* @__PURE__ */ e.jsx(w, { color: "green", children: "进行中" }) : /* @__PURE__ */ e.jsx(w, { children: "已归档" }) }),
              /* @__PURE__ */ e.jsx(
                T.Item,
                {
                  label: "创建时间",
                  children: X(x.createdAt)
                }
              ),
              /* @__PURE__ */ e.jsx(T.Item, { label: "项目ID", children: x.id })
            ] }),
            /* @__PURE__ */ e.jsx(
              q,
              {
                size: "small",
                header: /* @__PURE__ */ e.jsxs("b", { children: [
                  "任务项 (",
                  D.length,
                  ")"
                ] }),
                bordered: !0,
                dataSource: D,
                locale: { emptyText: "该项目下暂无任务" },
                renderItem: (t) => /* @__PURE__ */ e.jsx(
                  q.Item,
                  {
                    actions: [
                      /* @__PURE__ */ e.jsx(
                        I,
                        {
                          size: "small",
                          type: "primary",
                          icon: /* @__PURE__ */ e.jsx(te, {}),
                          disabled: t.status === 2,
                          onClick: () => Y(t.id),
                          children: "完成"
                        },
                        "complete"
                      )
                    ],
                    children: /* @__PURE__ */ e.jsx(
                      q.Item.Meta,
                      {
                        title: /* @__PURE__ */ e.jsxs(k, { children: [
                          t.title,
                          Q(t.status),
                          /* @__PURE__ */ e.jsxs(w, { children: [
                            "优先级 ",
                            t.priority ?? "-"
                          ] })
                        ] }),
                        description: /* @__PURE__ */ e.jsxs("span", { style: { color: "#888", fontSize: 12 }, children: [
                          "截止: ",
                          X(t.dueDate),
                          " · ID: ",
                          t.id
                        ] })
                      }
                    )
                  }
                )
              }
            )
          ] }) : /* @__PURE__ */ e.jsx(Z, { description: "请从左侧选择一个项目", style: { marginTop: 80 } })
        }
      )
    ] }),
    /* @__PURE__ */ e.jsx(
      ue,
      {
        title: m ? `编辑项目 - ${m.name}` : "新建项目",
        size: "large",
        open: a,
        onClose: () => d(!1),
        destroyOnHidden: !0,
        extra: /* @__PURE__ */ e.jsxs(k, { children: [
          /* @__PURE__ */ e.jsx(I, { onClick: () => d(!1), children: "取消" }),
          /* @__PURE__ */ e.jsx(I, { type: "primary", onClick: A, children: "保存" })
        ] }),
        children: /* @__PURE__ */ e.jsxs(y, { form: C, layout: "vertical", preserve: !1, children: [
          /* @__PURE__ */ e.jsx(y.Item, { name: "name", label: "项目名称", rules: [{ required: !0, message: "请输入项目名称" }], children: /* @__PURE__ */ e.jsx(B, { placeholder: "例如: 一人公司" }) }),
          /* @__PURE__ */ e.jsx(y.Item, { name: "description", label: "项目描述", children: /* @__PURE__ */ e.jsx(B.TextArea, { rows: 3, placeholder: "可选" }) }),
          /* @__PURE__ */ e.jsx(y.Item, { name: "status", label: "状态", initialValue: 1, children: /* @__PURE__ */ e.jsx(
            L,
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
const { Paragraph: $e } = he, ie = {
  0: { label: "待办", color: "default" },
  1: { label: "进行中", color: "blue" },
  2: { label: "已完成", color: "green" }
}, ne = {
  1: { label: "低", color: "default" },
  2: { label: "中", color: "orange" },
  3: { label: "高", color: "red" }
};
function Ee({ taskId: l, open: r, onClose: o, onChanged: i, onEdit: n }) {
  const [a, d] = h(null), [m, j] = h(!1);
  $(() => {
    !r || !l || (j(!0), b.getTaskDetail(l).then((f) => d((f == null ? void 0 : f.data) || f)).catch(() => d(null)).finally(() => j(!1)));
  }, [r, l]);
  const x = async () => {
    try {
      await b.completeTask(l), d((f) => ({ ...f, status: 2 })), i == null || i();
    } catch {
    }
  }, P = async () => {
    try {
      await b.deleteTask(l), i == null || i(), o == null || o();
    } catch {
    }
  }, D = ie[a == null ? void 0 : a.status] || ie[0], O = ne[a == null ? void 0 : a.priority] || ne[1];
  return /* @__PURE__ */ e.jsx(
    ue,
    {
      title: (a == null ? void 0 : a.title) || "任务详情",
      size: "large",
      open: r,
      onClose: o,
      loading: m,
      footer: /* @__PURE__ */ e.jsxs("div", { style: { display: "flex", justifyContent: "space-between" }, children: [
        /* @__PURE__ */ e.jsx(
          je,
          {
            title: "确认删除此任务?",
            onConfirm: P,
            okText: "删除",
            cancelText: "取消",
            okButtonProps: { danger: !0 },
            children: /* @__PURE__ */ e.jsx(I, { danger: !0, icon: /* @__PURE__ */ e.jsx(ee, {}), children: "删除" })
          }
        ),
        /* @__PURE__ */ e.jsxs(k, { children: [
          (a == null ? void 0 : a.status) !== 2 && /* @__PURE__ */ e.jsx(I, { type: "primary", icon: /* @__PURE__ */ e.jsx(te, {}), onClick: x, children: "完成任务" }),
          /* @__PURE__ */ e.jsx(I, { icon: /* @__PURE__ */ e.jsx(G, {}), onClick: () => n == null ? void 0 : n(a), children: "编辑" })
        ] })
      ] }),
      children: a && /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
        /* @__PURE__ */ e.jsxs(T, { column: 2, bordered: !0, size: "small", style: { marginBottom: 24 }, children: [
          /* @__PURE__ */ e.jsx(T.Item, { label: "状态", children: /* @__PURE__ */ e.jsx(w, { color: D.color, children: D.label }) }),
          /* @__PURE__ */ e.jsx(T.Item, { label: "优先级", children: /* @__PURE__ */ e.jsx(w, { color: O.color, children: O.label }) }),
          /* @__PURE__ */ e.jsx(T.Item, { label: "项目 ID", children: a.projectId }),
          /* @__PURE__ */ e.jsx(T.Item, { label: "列表 ID", children: a.listId }),
          /* @__PURE__ */ e.jsx(T.Item, { label: "截止时间", span: 2, children: a.dueDate || "未设置" }),
          /* @__PURE__ */ e.jsx(T.Item, { label: "创建时间", children: a.createdAt || "-" }),
          /* @__PURE__ */ e.jsx(T.Item, { label: "更新时间", children: a.updatedAt || "-" })
        ] }),
        a.description && /* @__PURE__ */ e.jsxs("div", { style: { marginBottom: 24 }, children: [
          /* @__PURE__ */ e.jsx("div", { style: { fontWeight: 600, marginBottom: 8 }, children: "描述" }),
          /* @__PURE__ */ e.jsx($e, { style: { whiteSpace: "pre-wrap", color: "#595959" }, children: a.description })
        ] })
      ] })
    }
  );
}
function _e({ open: l, task: r, projects: o, onClose: i, onSaved: n }) {
  const [a] = y.useForm(), d = !!(r != null && r.id);
  $(() => {
    l && r ? a.setFieldsValue({
      title: r.title,
      description: r.description,
      projectId: r.projectId,
      listId: r.listId,
      status: r.status,
      priority: r.priority,
      dueDate: r.dueDate
    }) : l && a.resetFields();
  }, [l, r, a]);
  const m = async () => {
    try {
      const j = await a.validateFields();
      d ? (await b.updateTask(r.id, j), g.success("任务已更新")) : (await b.createTask(j), g.success("任务已创建")), n == null || n(), i == null || i();
    } catch (j) {
      if (j != null && j.errorFields) return;
      g.error("保存失败: " + ((j == null ? void 0 : j.message) || j));
    }
  };
  return /* @__PURE__ */ e.jsx(
    pe,
    {
      title: d ? "编辑任务" : "新建任务",
      open: l,
      onCancel: i,
      onOk: m,
      destroyOnHidden: !0,
      size: "large",
      children: /* @__PURE__ */ e.jsxs(y, { form: a, layout: "vertical", preserve: !1, children: [
        /* @__PURE__ */ e.jsx(
          y.Item,
          {
            name: "title",
            label: "任务标题",
            rules: [{ required: !0, message: "请输入任务标题" }],
            children: /* @__PURE__ */ e.jsx(B, { placeholder: "例如: 实现 xx 功能" })
          }
        ),
        /* @__PURE__ */ e.jsx(y.Item, { name: "description", label: "描述", children: /* @__PURE__ */ e.jsx(B.TextArea, { rows: 3, placeholder: "任务描述 (可选)" }) }),
        /* @__PURE__ */ e.jsxs("div", { style: { display: "flex", gap: 16 }, children: [
          /* @__PURE__ */ e.jsx(
            y.Item,
            {
              name: "projectId",
              label: "所属项目",
              rules: [{ required: !0 }],
              style: { flex: 1 },
              children: /* @__PURE__ */ e.jsx(
                L,
                {
                  options: o.map((j) => ({ label: j.name, value: j.id })),
                  placeholder: "选择项目"
                }
              )
            }
          ),
          /* @__PURE__ */ e.jsx(y.Item, { name: "listId", label: "列表 ID", style: { flex: 1 }, children: /* @__PURE__ */ e.jsx(B, { type: "number", placeholder: "默认 1" }) })
        ] }),
        /* @__PURE__ */ e.jsxs("div", { style: { display: "flex", gap: 16 }, children: [
          /* @__PURE__ */ e.jsx(y.Item, { name: "status", label: "状态", initialValue: 0, style: { flex: 1 }, children: /* @__PURE__ */ e.jsx(
            L,
            {
              options: [
                { label: "待办", value: 0 },
                { label: "进行中", value: 1 },
                { label: "已完成", value: 2 }
              ]
            }
          ) }),
          /* @__PURE__ */ e.jsx(y.Item, { name: "priority", label: "优先级", initialValue: 1, style: { flex: 1 }, children: /* @__PURE__ */ e.jsx(
            L,
            {
              options: [
                { label: "低", value: 1 },
                { label: "中", value: 2 },
                { label: "高", value: 3 }
              ]
            }
          ) })
        ] }),
        /* @__PURE__ */ e.jsx(y.Item, { name: "dueDate", label: "截止时间", children: /* @__PURE__ */ e.jsx(be, { style: { width: "100%" }, placeholder: "选择截止日期" }) })
      ] })
    }
  );
}
function ce({ apiBaseURL: l, back: r }) {
  const [o, i] = h([]), [n, a] = h(null), [d, m] = h([]), [j, x] = h(!1), [P, D] = h(null), [O, f] = h(null), [F, C] = h(!1), [c, p] = h(!1), [v, M] = h(!1), [R, E] = h(null), [_] = y.useForm(), K = async () => {
    try {
      const s = await b.listMyProjects(), u = (s == null ? void 0 : s.data) || s || [];
      i(u), f(null), u.length > 0 && !n && a(u[0].id);
    } catch (s) {
      f((s == null ? void 0 : s.message) || "加载项目失败");
    }
  }, A = async (s) => {
    if (!s) {
      m([]);
      return;
    }
    x(!0), D(null);
    try {
      const u = await b.listTasksByProject(s);
      m((u == null ? void 0 : u.data) || u || []);
    } catch (u) {
      D((u == null ? void 0 : u.message) || "加载任务失败");
    } finally {
      x(!1);
    }
  };
  $(() => {
    K();
  }, []), $(() => {
    A(n);
  }, [n]);
  const U = () => {
    if (!n) {
      g.warning("请先选择项目");
      return;
    }
    _.resetFields(), _.setFieldsValue({ projectId: n, listId: 1, status: 1, priority: 1 }), C(!0);
  }, Y = async () => {
    try {
      const s = await _.validateFields();
      await b.createTask(s), g.success("任务已创建"), C(!1), A(n);
    } catch (s) {
      if (s != null && s.errorFields) return;
      g.error("创建失败: " + ((s == null ? void 0 : s.message) || s));
    }
  }, J = async (s) => {
    try {
      await b.completeTask(s), g.success("任务已完成"), A(n);
    } catch (u) {
      g.error("操作失败: " + ((u == null ? void 0 : u.message) || u));
    }
  }, Q = [
    { title: "ID", dataIndex: "id", width: 60 },
    { title: "标题", dataIndex: "title" },
    { title: "项目ID", dataIndex: "projectId", width: 80 },
    {
      title: "状态",
      dataIndex: "status",
      width: 100,
      render: (s) => {
        const u = { 0: "待办", 1: "进行中", 2: "已完成" }, ge = { 0: "default", 1: "blue", 2: "green" }[s] || "default";
        return /* @__PURE__ */ e.jsx(w, { color: ge, children: u[s] || s });
      }
    },
    { title: "优先级", dataIndex: "priority", width: 80 },
    { title: "截止时间", dataIndex: "dueDate", width: 180 },
    {
      title: "操作",
      width: 200,
      fixed: "right",
      render: (s, u) => /* @__PURE__ */ e.jsxs(k, { children: [
        /* @__PURE__ */ e.jsx(
          I,
          {
            size: "small",
            icon: /* @__PURE__ */ e.jsx(we, {}),
            onClick: () => {
              E(u), p(!0);
            },
            children: "查看"
          }
        ),
        /* @__PURE__ */ e.jsx(
          I,
          {
            size: "small",
            type: "primary",
            icon: /* @__PURE__ */ e.jsx(te, {}),
            onClick: () => J(u.id),
            disabled: u.status === 2,
            children: "完成"
          }
        )
      ] })
    }
  ], t = !j && !P && !!n && d.length === 0;
  return /* @__PURE__ */ e.jsxs("div", { children: [
    /* @__PURE__ */ e.jsx(
      De,
      {
        title: "任务管理",
        breadcrumb: [{ label: "任务中心" }, { label: "任务列表" }],
        back: !!r
      }
    ),
    /* @__PURE__ */ e.jsx(
      Oe,
      {
        left: /* @__PURE__ */ e.jsx(
          L,
          {
            value: n,
            onChange: a,
            style: { width: 240 },
            placeholder: "选择项目",
            options: o.map((s) => ({ label: s.name, value: s.id }))
          }
        ),
        right: /* @__PURE__ */ e.jsx(I, { type: "primary", icon: /* @__PURE__ */ e.jsx(me, {}), onClick: U, children: "新建任务" })
      }
    ),
    O && /* @__PURE__ */ e.jsx("div", { style: { marginBottom: 16 }, children: /* @__PURE__ */ e.jsx(
      re,
      {
        error: O,
        onRetry: K,
        title: "加载项目列表失败"
      }
    ) }),
    P && /* @__PURE__ */ e.jsx("div", { style: { marginBottom: 16 }, children: /* @__PURE__ */ e.jsx(re, { error: P, onRetry: () => A(n) }) }),
    /* @__PURE__ */ e.jsx(
      se,
      {
        rows: d,
        columns: Q,
        loading: j,
        rowKey: "id",
        searchKeys: "title",
        searchPlaceholder: "按任务标题过滤",
        emptyTitle: t ? "该项目下还没有任务" : "暂无数据",
        emptyDescription: t ? "把目标拆解成可执行的任务, 一项项推进" : void 0,
        emptyActionText: t ? "新建第一个任务" : void 0,
        emptyOnAction: t ? U : void 0
      }
    ),
    /* @__PURE__ */ e.jsx(
      pe,
      {
        title: "新建任务",
        open: F,
        onCancel: () => C(!1),
        onOk: Y,
        destroyOnHidden: !0,
        children: /* @__PURE__ */ e.jsxs(y, { form: _, layout: "vertical", preserve: !1, children: [
          /* @__PURE__ */ e.jsx(y.Item, { name: "title", label: "任务标题", rules: [{ required: !0, message: "请输入任务标题" }], children: /* @__PURE__ */ e.jsx(B, { placeholder: "例如: 实现 xx 功能" }) }),
          /* @__PURE__ */ e.jsx(y.Item, { name: "projectId", label: "所属项目", rules: [{ required: !0 }], children: /* @__PURE__ */ e.jsx(
            L,
            {
              options: o.map((s) => ({ label: s.name, value: s.id })),
              placeholder: "从数据库捞出的项目列表"
            }
          ) }),
          /* @__PURE__ */ e.jsx(y.Item, { name: "listId", label: "列表ID", rules: [{ required: !0 }], children: /* @__PURE__ */ e.jsx(B, { type: "number", placeholder: "默认 1" }) }),
          /* @__PURE__ */ e.jsx(y.Item, { name: "priority", label: "优先级", initialValue: 1, children: /* @__PURE__ */ e.jsx(L, { options: [{ label: "低", value: 1 }, { label: "中", value: 2 }, { label: "高", value: 3 }] }) })
        ] })
      }
    ),
    /* @__PURE__ */ e.jsx(
      Ee,
      {
        taskId: R == null ? void 0 : R.id,
        open: c,
        onClose: () => {
          p(!1), E(null);
        },
        onChanged: A,
        onEdit: (s) => {
          E(s), p(!1), M(!0);
        }
      }
    ),
    /* @__PURE__ */ e.jsx(
      _e,
      {
        open: v,
        task: R,
        projects: o,
        onClose: () => {
          M(!1), E(null);
        },
        onSaved: A
      }
    )
  ] });
}
const { Text: oe, Title: Xe } = he, de = {
  0: { text: "待办", color: "default", icon: /* @__PURE__ */ e.jsx(ye, {}) },
  1: { text: "进行中", color: "blue", icon: /* @__PURE__ */ e.jsx(fe, {}) },
  2: { text: "已完成", color: "green", icon: /* @__PURE__ */ e.jsx(W, {}) }
};
function Ve({ apiBaseURL: l }) {
  const [r, o] = h([]), [i, n] = h(null), [a, d] = h([]), [m, j] = h(!1), [x, P] = h(!1), D = async () => {
    P(!0);
    try {
      const c = await b.listMyProjects(), p = (c == null ? void 0 : c.data) || c || [];
      o(p), p.length > 0 && !i && n(p[0].id);
    } catch {
      o([]);
    } finally {
      P(!1);
    }
  }, O = async (c) => {
    if (!c) {
      d([]);
      return;
    }
    j(!0);
    try {
      const p = await b.listTasksByProject(c);
      d((p == null ? void 0 : p.data) || p || []);
    } catch {
      d([]);
    } finally {
      j(!1);
    }
  };
  $(() => {
    D();
  }, []), $(() => {
    O(i);
  }, [i]);
  const f = a.reduce((c, p) => {
    c.total += 1;
    const v = p.status ?? 0;
    return v === 0 ? c.todo += 1 : v === 1 ? c.doing += 1 : v === 2 && (c.done += 1), c;
  }, { total: 0, todo: 0, doing: 0, done: 0 }), F = f.total > 0 ? Math.round(f.done / f.total * 100) : 0, C = [1, 2, 3].map((c) => ({
    priority: c,
    list: a.filter((p) => (p.priority ?? 1) === c)
  }));
  return /* @__PURE__ */ e.jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 16 }, children: [
    /* @__PURE__ */ e.jsx(S, { children: /* @__PURE__ */ e.jsxs(k, { wrap: !0, children: [
      /* @__PURE__ */ e.jsx(ve, { style: { fontSize: 18, color: "#1677ff" } }),
      /* @__PURE__ */ e.jsx(oe, { strong: !0, children: "选择项目：" }),
      /* @__PURE__ */ e.jsx(
        L,
        {
          value: i,
          onChange: n,
          style: { width: 280 },
          loading: x,
          placeholder: "选择项目",
          options: r.map((c) => ({ label: c.name, value: c.id }))
        }
      ),
      /* @__PURE__ */ e.jsxs("a", { onClick: () => D(), children: [
        /* @__PURE__ */ e.jsx(Pe, {}),
        " 刷新项目"
      ] })
    ] }) }),
    /* @__PURE__ */ e.jsxs(xe, { spinning: m, children: [
      /* @__PURE__ */ e.jsxs(le, { gutter: 16, children: [
        /* @__PURE__ */ e.jsx(N, { span: 6, children: /* @__PURE__ */ e.jsx(S, { children: /* @__PURE__ */ e.jsx(H, { title: "总任务数", value: f.total }) }) }),
        /* @__PURE__ */ e.jsx(N, { span: 6, children: /* @__PURE__ */ e.jsx(S, { children: /* @__PURE__ */ e.jsx(
          H,
          {
            title: "待办",
            value: f.todo,
            styles: { content: { color: "#8c8c8c" } },
            prefix: /* @__PURE__ */ e.jsx(ye, {})
          }
        ) }) }),
        /* @__PURE__ */ e.jsx(N, { span: 6, children: /* @__PURE__ */ e.jsx(S, { children: /* @__PURE__ */ e.jsx(
          H,
          {
            title: "进行中",
            value: f.doing,
            styles: { content: { color: "#1677ff" } },
            prefix: /* @__PURE__ */ e.jsx(fe, {})
          }
        ) }) }),
        /* @__PURE__ */ e.jsx(N, { span: 6, children: /* @__PURE__ */ e.jsx(S, { children: /* @__PURE__ */ e.jsx(
          H,
          {
            title: "已完成",
            value: f.done,
            styles: { content: { color: "#52c41a" } },
            prefix: /* @__PURE__ */ e.jsx(W, {})
          }
        ) }) })
      ] }),
      /* @__PURE__ */ e.jsx(S, { style: { marginTop: 16 }, title: "完成率", children: /* @__PURE__ */ e.jsx(Ie, { percent: F, status: F === 100 ? "success" : "active" }) }),
      /* @__PURE__ */ e.jsx(le, { gutter: 16, style: { marginTop: 16 }, children: C.map(({ priority: c, list: p }) => /* @__PURE__ */ e.jsx(N, { span: 8, children: /* @__PURE__ */ e.jsx(S, { size: "small", title: /* @__PURE__ */ e.jsxs(k, { children: [
        /* @__PURE__ */ e.jsx(w, { color: c === 3 ? "red" : c === 2 ? "orange" : "default", children: c === 3 ? "高" : c === 2 ? "中" : "低" }),
        /* @__PURE__ */ e.jsxs("span", { children: [
          "优先级 (",
          p.length,
          ")"
        ] })
      ] }), children: p.length === 0 ? /* @__PURE__ */ e.jsx(Z, { image: Z.PRESENTED_IMAGE_SIMPLE, description: "无任务" }) : /* @__PURE__ */ e.jsx(
        q,
        {
          size: "small",
          dataSource: p.slice(0, 8),
          renderItem: (v) => {
            const M = de[v.status ?? 0] || de[0];
            return /* @__PURE__ */ e.jsx(q.Item, { children: /* @__PURE__ */ e.jsx(
              q.Item.Meta,
              {
                avatar: M.icon,
                title: /* @__PURE__ */ e.jsxs(k, { children: [
                  /* @__PURE__ */ e.jsx(oe, { children: v.title }),
                  /* @__PURE__ */ e.jsx(w, { color: M.color, style: { margin: 0 }, children: M.text })
                ] }),
                description: v.dueDate ? `截止: ${v.dueDate}` : "无截止时间"
              }
            ) });
          }
        }
      ) }) }, c)) })
    ] })
  ] });
}
function Ze() {
  return /* @__PURE__ */ e.jsxs(Se, { children: [
    /* @__PURE__ */ e.jsx(V, { index: !0, element: /* @__PURE__ */ e.jsx(Me, { to: "dashboard", replace: !0 }) }),
    /* @__PURE__ */ e.jsx(V, { path: "dashboard", element: /* @__PURE__ */ e.jsx(Ve, {}) }),
    /* @__PURE__ */ e.jsx(V, { path: "project", element: /* @__PURE__ */ e.jsx(ae, {}) }),
    /* @__PURE__ */ e.jsx(V, { path: "project/*", element: /* @__PURE__ */ e.jsx(ae, {}) }),
    /* @__PURE__ */ e.jsx(V, { path: "task", element: /* @__PURE__ */ e.jsx(ce, {}) }),
    /* @__PURE__ */ e.jsx(V, { path: "task/*", element: /* @__PURE__ */ e.jsx(ce, {}) })
  ] });
}
export {
  st as ComponentDocPage,
  ae as ProjectList,
  Qe as ProjectSelect,
  Ze as TaskApp,
  Ye as TaskCard,
  Ve as TaskDashboard,
  ce as TaskList,
  Je as TaskTable,
  b as api,
  b as taskApi
};
