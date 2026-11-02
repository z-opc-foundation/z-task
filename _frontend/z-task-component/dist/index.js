import { jsx as e, jsxs as i, Fragment as xe } from "react/jsx-runtime";
import { Card as z, Space as w, Tag as v, Button as k, Select as S, Form as g, Input as R, Empty as ee, Spin as he, Descriptions as j, List as q, Drawer as pe, message as T, Popconfirm as me, Typography as ye, Modal as fe, DatePicker as ke, Row as ae, Col as U, Statistic as G, Progress as je } from "antd";
import { CheckCircleOutlined as W, EditOutlined as Y, DeleteOutlined as te, PlusOutlined as ge, InboxOutlined as we, CheckOutlined as le, UnorderedListOutlined as ve, EyeOutlined as Pe, ProjectOutlined as De, ReloadOutlined as Oe, ClockCircleOutlined as be, RocketOutlined as Ie } from "@ant-design/icons";
import { ListTable as re, PageHeader as Le, TableToolbar as Ce, ErrorState as ie } from "@yuku123/z-frontend-common/ui";
import { useState as y, useEffect as E, useMemo as Me } from "react";
import { createRequest as Se, authRequest as ze } from "@yuku123/z-frontend-common";
import { Routes as Ae, Route as V, Navigate as Be } from "react-router-dom";
import { C as at, D as it, a as st, T as nt, b as ot, c as ct, d as dt, e as ut, f as ht, g as pt, h as mt, i as yt, l as ft, r as gt, j as bt, k as It, m as Tt, n as xt, t as kt, o as jt } from "./ComponentDoc-BAAWP_t3.js";
const Re = {
  high: { color: "red", text: "高" },
  medium: { color: "orange", text: "中" },
  low: { color: "green", text: "低" }
}, Fe = {
  pending: { color: "default", text: "待处理" },
  in_progress: { color: "blue", text: "进行中" },
  completed: { color: "green", text: "已完成" }
};
function Qe({ task: r, onEdit: a, onComplete: d }) {
  const n = Re[r.priority] || { color: "default", text: r.priority }, o = Fe[r.status] || { color: "default", text: r.status };
  return /* @__PURE__ */ e(z, { size: "small", title: r.title, extra: /* @__PURE__ */ i(w, { children: [
    r.status !== "completed" && /* @__PURE__ */ e(k, { size: "small", icon: /* @__PURE__ */ e(W, {}), onClick: () => d == null ? void 0 : d(r), children: "完成" }),
    /* @__PURE__ */ e(k, { size: "small", icon: /* @__PURE__ */ e(Y, {}), onClick: () => a == null ? void 0 : a(r), children: "编辑" })
  ] }), children: /* @__PURE__ */ i(w, { orientation: "vertical", style: { width: "100%" }, children: [
    /* @__PURE__ */ i("div", { children: [
      "项目：",
      r.projectName
    ] }),
    /* @__PURE__ */ i(w, { children: [
      /* @__PURE__ */ e(v, { color: n.color, children: n.text }),
      /* @__PURE__ */ e(v, { color: o.color, children: o.text })
    ] }),
    r.dueDate && /* @__PURE__ */ i("div", { children: [
      "截止：",
      r.dueDate
    ] })
  ] }) });
}
const _e = { high: "red", medium: "orange", low: "green" }, Ee = {
  pending: "default",
  in_progress: "blue",
  completed: "green"
};
function Xe({ dataSource: r, loading: a, onEdit: d, onDelete: n, onComplete: o }) {
  return /* @__PURE__ */ e(
    re,
    {
      columns: [
        { title: "任务名称", dataIndex: "title", key: "title" },
        { title: "项目", dataIndex: "projectName", key: "projectName" },
        {
          title: "优先级",
          dataIndex: "priority",
          key: "priority",
          render: (u) => /* @__PURE__ */ e(v, { color: _e[u], children: u === "high" ? "高" : u === "medium" ? "中" : "低" })
        },
        {
          title: "状态",
          dataIndex: "status",
          key: "status",
          render: (u) => {
            const b = { pending: "待处理", in_progress: "进行中", completed: "已完成" };
            return /* @__PURE__ */ e(v, { color: Ee[u], children: b[u] || u });
          }
        },
        { title: "截止日期", dataIndex: "dueDate", key: "dueDate" },
        {
          title: "操作",
          key: "action",
          render: (u, b) => /* @__PURE__ */ i(w, { children: [
            b.status !== "completed" && /* @__PURE__ */ e(k, { size: "small", icon: /* @__PURE__ */ e(W, {}), onClick: () => o == null ? void 0 : o(b), children: "完成" }),
            /* @__PURE__ */ e(k, { size: "small", icon: /* @__PURE__ */ e(Y, {}), onClick: () => d == null ? void 0 : d(b), children: "编辑" }),
            /* @__PURE__ */ e(k, { size: "small", danger: !0, icon: /* @__PURE__ */ e(te, {}), onClick: () => n == null ? void 0 : n(b), children: "删除" })
          ] })
        }
      ],
      rows: r,
      loading: a,
      rowKey: "id",
      searchKeys: "title,projectName",
      searchPlaceholder: "按任务名称 / 项目过滤",
      emptyDescription: "当前还没有任务"
    }
  );
}
function Ze({ value: r, onChange: a, projects: d = [] }) {
  return /* @__PURE__ */ e(
    S,
    {
      value: r,
      onChange: a,
      placeholder: "请选择项目",
      style: { width: 200 },
      allowClear: !0,
      children: d.map((n) => /* @__PURE__ */ e(S.Option, { value: n.id, children: n.name }, n.id))
    }
  );
}
const M = Se("task"), x = {
  // === 项目 ===
  listMyProjects: () => ze.get("/project/user/list"),
  createProject: (r) => M.post("/project", r),
  updateProject: (r, a) => M.put(`/project/${r}`, a),
  archiveProject: (r) => M.put(`/project/${r}/archive`),
  // === 任务 ===
  listTasksByProject: (r) => M.get("/task/project/list", { params: { projectId: r } }),
  listTasksByList: (r) => M.get("/task/list", { params: { listId: r } }),
  createTask: (r) => M.post("/task", r),
  completeTask: (r) => M.post("/task/complete", null, { params: { taskId: r } }),
  moveTask: (r, a, d) => M.put("/task/move", null, { params: { taskId: r, targetListId: a, position: d } }),
  // === 任务详情 ===
  getTaskDetail: (r) => M.get(`/task/${r}`),
  updateTask: (r, a) => M.put(`/task/${r}`, a),
  deleteTask: (r) => M.delete(`/task/${r}`)
}, Z = (r) => {
  if (!r) return "-";
  const a = String(r), d = a.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})/);
  return d ? d[1] : a;
};
function se({ apiBaseURL: r }) {
  const [a, d] = y([]), [n, o] = y(!1), [s, u] = y(!1), [b, m] = y(null), [h, D] = y(null), [O, L] = y([]), [I, F] = y(!1), [C] = g.useForm(), c = async () => {
    o(!0);
    try {
      const t = await x.listMyProjects();
      d((t == null ? void 0 : t.data) || t || []);
    } catch (t) {
      T.error("加载项目失败: " + ((t == null ? void 0 : t.message) || t));
    } finally {
      o(!1);
    }
  };
  E(() => {
    c();
  }, []);
  const [f, P] = y(""), A = Me(() => {
    const t = f.trim().toLowerCase();
    return t ? a.filter((l) => `${l.name || ""} ${l.status ?? ""} ${l.createdAt || ""}`.toLowerCase().includes(t)) : a;
  }, [a, f]), _ = async (t) => {
    D(t), F(!0);
    try {
      const l = await x.listTasksByProject(t.id);
      L((l == null ? void 0 : l.data) || l || []);
    } catch (l) {
      T.error("加载任务失败: " + ((l == null ? void 0 : l.message) || l));
    } finally {
      F(!1);
    }
  }, $ = async () => {
    if (h)
      try {
        const t = await x.listTasksByProject(h.id);
        L((t == null ? void 0 : t.data) || t || []);
      } catch (t) {
        T.error("刷新任务失败: " + ((t == null ? void 0 : t.message) || t));
      }
  }, N = () => {
    m(null), C.resetFields(), C.setFieldsValue({ status: 1 }), u(!0);
  }, K = (t) => {
    m(t), C.setFieldsValue({ name: t.name, description: t.description, status: t.status ?? 1 }), u(!0);
  }, B = async () => {
    try {
      const t = await C.validateFields();
      b ? (await x.updateProject(b.id, t), T.success("项目已更新")) : (await x.createProject(t), T.success("项目已创建")), u(!1), c();
    } catch (t) {
      if (t != null && t.errorFields) return;
      T.error("保存失败: " + ((t == null ? void 0 : t.message) || t));
    }
  }, H = async (t) => {
    try {
      await x.archiveProject(t), T.success("项目已归档"), c(), (h == null ? void 0 : h.id) === t && (D(null), L([]));
    } catch (l) {
      T.error("归档失败: " + ((l == null ? void 0 : l.message) || l));
    }
  }, J = async (t) => {
    try {
      await x.completeTask(t), T.success("任务已完成"), $();
    } catch (l) {
      T.error("操作失败: " + ((l == null ? void 0 : l.message) || l));
    }
  }, Q = [
    {
      title: "项目名称",
      dataIndex: "name",
      render: (t, l) => /* @__PURE__ */ e(
        "a",
        {
          onClick: () => _(l),
          style: { fontWeight: (h == null ? void 0 : h.id) === l.id ? 600 : 400 },
          children: t
        }
      )
    },
    {
      title: "状态",
      dataIndex: "status",
      width: 80,
      render: (t) => t === 1 ? /* @__PURE__ */ e(v, { color: "green", children: "进行中" }) : /* @__PURE__ */ e(v, { children: "已归档" })
    },
    { title: "创建时间", dataIndex: "createdAt", width: 170, render: Z },
    {
      title: "操作",
      width: 160,
      fixed: "right",
      render: (t, l) => /* @__PURE__ */ i(w, { children: [
        /* @__PURE__ */ e(k, { size: "small", icon: /* @__PURE__ */ e(Y, {}), onClick: () => K(l), children: "编辑" }),
        /* @__PURE__ */ e(me, { title: "确定归档该项目?", onConfirm: () => H(l.id), children: /* @__PURE__ */ e(k, { size: "small", danger: !0, icon: /* @__PURE__ */ e(te, {}), children: "归档" }) })
      ] })
    }
  ], X = (t) => {
    const p = {
      0: { text: "待办", color: "default" },
      1: { text: "进行中", color: "blue" },
      2: { text: "已完成", color: "green" }
    }[t] || { text: String(t), color: "default" };
    return /* @__PURE__ */ e(v, { color: p.color, children: p.text });
  };
  return /* @__PURE__ */ i("div", { children: [
    /* @__PURE__ */ e("div", { style: { display: "flex", justifyContent: "flex-end", marginBottom: 12 }, children: /* @__PURE__ */ e(k, { type: "primary", icon: /* @__PURE__ */ e(ge, {}), onClick: N, children: "新建项目" }) }),
    /* @__PURE__ */ i("div", { style: { display: "flex", gap: 16, height: "calc(100vh - 220px)" }, children: [
      /* @__PURE__ */ e(
        re,
        {
          rows: A,
          columns: Q,
          loading: n,
          rowKey: "id",
          cardTitle: /* @__PURE__ */ i(w, { children: [
            /* @__PURE__ */ e(we, {}),
            "项目管理"
          ] }),
          cardExtra: /* @__PURE__ */ e(w, { children: /* @__PURE__ */ e(
            R.Search,
            {
              allowClear: !0,
              placeholder: "按项目名称 / 状态 / 创建时间过滤",
              style: { width: 240 },
              onChange: (t) => P(t.target.value)
            }
          ) }),
          cardProps: {
            size: "small",
            style: { width: 520, flexShrink: 0 },
            styles: { body: { padding: 8, overflow: "auto", height: "calc(100% - 40px)" } }
          },
          tableProps: {
            rowClassName: (t) => (h == null ? void 0 : h.id) === t.id ? "ant-table-row-selected" : "",
            onRow: (t) => ({ onClick: () => _(t), style: { cursor: "pointer" } })
          },
          emptyDescription: "还没有项目，新建一个开始组织任务"
        }
      ),
      /* @__PURE__ */ e(
        z,
        {
          size: "small",
          style: { flex: 1, overflow: "auto" },
          styles: { body: { padding: 16 } },
          title: h ? /* @__PURE__ */ i(w, { children: [
            /* @__PURE__ */ e(ve, {}),
            h.name,
            " · 任务列表"
          ] }) : "项目详情",
          children: h ? /* @__PURE__ */ i(he, { spinning: I, children: [
            /* @__PURE__ */ i(j, { size: "small", bordered: !0, column: 2, style: { marginBottom: 16 }, children: [
              /* @__PURE__ */ e(j.Item, { label: "项目名称", span: 2, children: h.name }),
              /* @__PURE__ */ e(j.Item, { label: "描述", span: 2, children: h.description || "无" }),
              /* @__PURE__ */ e(j.Item, { label: "负责人", children: h.ownerId || "未指定" }),
              /* @__PURE__ */ e(j.Item, { label: "状态", children: h.status === 1 ? /* @__PURE__ */ e(v, { color: "green", children: "进行中" }) : /* @__PURE__ */ e(v, { children: "已归档" }) }),
              /* @__PURE__ */ e(
                j.Item,
                {
                  label: "创建时间",
                  children: Z(h.createdAt)
                }
              ),
              /* @__PURE__ */ e(j.Item, { label: "项目ID", children: h.id })
            ] }),
            /* @__PURE__ */ e(
              q,
              {
                size: "small",
                header: /* @__PURE__ */ i("b", { children: [
                  "任务项 (",
                  O.length,
                  ")"
                ] }),
                bordered: !0,
                dataSource: O,
                locale: { emptyText: "该项目下暂无任务" },
                renderItem: (t) => /* @__PURE__ */ e(
                  q.Item,
                  {
                    actions: [
                      /* @__PURE__ */ e(
                        k,
                        {
                          size: "small",
                          type: "primary",
                          icon: /* @__PURE__ */ e(le, {}),
                          disabled: t.status === 2,
                          onClick: () => J(t.id),
                          children: "完成"
                        },
                        "complete"
                      )
                    ],
                    children: /* @__PURE__ */ e(
                      q.Item.Meta,
                      {
                        title: /* @__PURE__ */ i(w, { children: [
                          t.title,
                          X(t.status),
                          /* @__PURE__ */ i(v, { children: [
                            "优先级 ",
                            t.priority ?? "-"
                          ] })
                        ] }),
                        description: /* @__PURE__ */ i("span", { style: { color: "#888", fontSize: 12 }, children: [
                          "截止: ",
                          Z(t.dueDate),
                          " · ID: ",
                          t.id
                        ] })
                      }
                    )
                  }
                )
              }
            )
          ] }) : /* @__PURE__ */ e(ee, { description: "请从左侧选择一个项目", style: { marginTop: 80 } })
        }
      )
    ] }),
    /* @__PURE__ */ e(
      pe,
      {
        title: b ? `编辑项目 - ${b.name}` : "新建项目",
        size: "large",
        open: s,
        onClose: () => u(!1),
        destroyOnHidden: !0,
        extra: /* @__PURE__ */ i(w, { children: [
          /* @__PURE__ */ e(k, { onClick: () => u(!1), children: "取消" }),
          /* @__PURE__ */ e(k, { type: "primary", onClick: B, children: "保存" })
        ] }),
        children: /* @__PURE__ */ i(g, { form: C, layout: "vertical", preserve: !1, children: [
          /* @__PURE__ */ e(g.Item, { name: "name", label: "项目名称", rules: [{ required: !0, message: "请输入项目名称" }], children: /* @__PURE__ */ e(R, { placeholder: "例如: 一人公司" }) }),
          /* @__PURE__ */ e(g.Item, { name: "description", label: "项目描述", children: /* @__PURE__ */ e(R.TextArea, { rows: 3, placeholder: "可选" }) }),
          /* @__PURE__ */ e(g.Item, { name: "status", label: "状态", initialValue: 1, children: /* @__PURE__ */ e(
            S,
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
const { Paragraph: $e } = ye, ne = {
  0: { label: "待办", color: "default" },
  1: { label: "进行中", color: "blue" },
  2: { label: "已完成", color: "green" }
}, oe = {
  1: { label: "低", color: "default" },
  2: { label: "中", color: "orange" },
  3: { label: "高", color: "red" }
};
function Ne({ taskId: r, open: a, onClose: d, onChanged: n, onEdit: o }) {
  const [s, u] = y(null), [b, m] = y(!1);
  E(() => {
    !a || !r || (m(!0), x.getTaskDetail(r).then((I) => u((I == null ? void 0 : I.data) || I)).catch(() => u(null)).finally(() => m(!1)));
  }, [a, r]);
  const h = async () => {
    try {
      await x.completeTask(r), u((I) => ({ ...I, status: 2 })), n == null || n();
    } catch {
    }
  }, D = async () => {
    try {
      await x.deleteTask(r), n == null || n(), d == null || d();
    } catch {
    }
  }, O = ne[s == null ? void 0 : s.status] || ne[0], L = oe[s == null ? void 0 : s.priority] || oe[1];
  return /* @__PURE__ */ e(
    pe,
    {
      title: (s == null ? void 0 : s.title) || "任务详情",
      size: "large",
      open: a,
      onClose: d,
      loading: b,
      footer: /* @__PURE__ */ i("div", { style: { display: "flex", justifyContent: "space-between" }, children: [
        /* @__PURE__ */ e(
          me,
          {
            title: "确认删除此任务?",
            onConfirm: D,
            okText: "删除",
            cancelText: "取消",
            okButtonProps: { danger: !0 },
            children: /* @__PURE__ */ e(k, { danger: !0, icon: /* @__PURE__ */ e(te, {}), children: "删除" })
          }
        ),
        /* @__PURE__ */ i(w, { children: [
          (s == null ? void 0 : s.status) !== 2 && /* @__PURE__ */ e(k, { type: "primary", icon: /* @__PURE__ */ e(le, {}), onClick: h, children: "完成任务" }),
          /* @__PURE__ */ e(k, { icon: /* @__PURE__ */ e(Y, {}), onClick: () => o == null ? void 0 : o(s), children: "编辑" })
        ] })
      ] }),
      children: s && /* @__PURE__ */ i(xe, { children: [
        /* @__PURE__ */ i(j, { column: 2, bordered: !0, size: "small", style: { marginBottom: 24 }, children: [
          /* @__PURE__ */ e(j.Item, { label: "状态", children: /* @__PURE__ */ e(v, { color: O.color, children: O.label }) }),
          /* @__PURE__ */ e(j.Item, { label: "优先级", children: /* @__PURE__ */ e(v, { color: L.color, children: L.label }) }),
          /* @__PURE__ */ e(j.Item, { label: "项目 ID", children: s.projectId }),
          /* @__PURE__ */ e(j.Item, { label: "列表 ID", children: s.listId }),
          /* @__PURE__ */ e(j.Item, { label: "截止时间", span: 2, children: s.dueDate || "未设置" }),
          /* @__PURE__ */ e(j.Item, { label: "创建时间", children: s.createdAt || "-" }),
          /* @__PURE__ */ e(j.Item, { label: "更新时间", children: s.updatedAt || "-" })
        ] }),
        s.description && /* @__PURE__ */ i("div", { style: { marginBottom: 24 }, children: [
          /* @__PURE__ */ e("div", { style: { fontWeight: 600, marginBottom: 8 }, children: "描述" }),
          /* @__PURE__ */ e($e, { style: { whiteSpace: "pre-wrap", color: "#595959" }, children: s.description })
        ] })
      ] })
    }
  );
}
function Ve({ open: r, task: a, projects: d, onClose: n, onSaved: o }) {
  const [s] = g.useForm(), u = !!(a != null && a.id);
  return E(() => {
    r && a ? s.setFieldsValue({
      title: a.title,
      description: a.description,
      projectId: a.projectId,
      listId: a.listId,
      status: a.status,
      priority: a.priority,
      dueDate: a.dueDate
    }) : r && s.resetFields();
  }, [r, a, s]), /* @__PURE__ */ e(
    fe,
    {
      title: u ? "编辑任务" : "新建任务",
      open: r,
      onCancel: n,
      onOk: async () => {
        try {
          const m = await s.validateFields();
          u ? (await x.updateTask(a.id, m), T.success("任务已更新")) : (await x.createTask(m), T.success("任务已创建")), o == null || o(), n == null || n();
        } catch (m) {
          if (m != null && m.errorFields) return;
          T.error("保存失败: " + ((m == null ? void 0 : m.message) || m));
        }
      },
      destroyOnHidden: !0,
      size: "large",
      children: /* @__PURE__ */ i(g, { form: s, layout: "vertical", preserve: !1, children: [
        /* @__PURE__ */ e(
          g.Item,
          {
            name: "title",
            label: "任务标题",
            rules: [{ required: !0, message: "请输入任务标题" }],
            children: /* @__PURE__ */ e(R, { placeholder: "例如: 实现 xx 功能" })
          }
        ),
        /* @__PURE__ */ e(g.Item, { name: "description", label: "描述", children: /* @__PURE__ */ e(R.TextArea, { rows: 3, placeholder: "任务描述 (可选)" }) }),
        /* @__PURE__ */ i("div", { style: { display: "flex", gap: 16 }, children: [
          /* @__PURE__ */ e(
            g.Item,
            {
              name: "projectId",
              label: "所属项目",
              rules: [{ required: !0 }],
              style: { flex: 1 },
              children: /* @__PURE__ */ e(
                S,
                {
                  options: d.map((m) => ({ label: m.name, value: m.id })),
                  placeholder: "选择项目"
                }
              )
            }
          ),
          /* @__PURE__ */ e(g.Item, { name: "listId", label: "列表 ID", style: { flex: 1 }, children: /* @__PURE__ */ e(R, { type: "number", placeholder: "默认 1" }) })
        ] }),
        /* @__PURE__ */ i("div", { style: { display: "flex", gap: 16 }, children: [
          /* @__PURE__ */ e(g.Item, { name: "status", label: "状态", initialValue: 0, style: { flex: 1 }, children: /* @__PURE__ */ e(
            S,
            {
              options: [
                { label: "待办", value: 0 },
                { label: "进行中", value: 1 },
                { label: "已完成", value: 2 }
              ]
            }
          ) }),
          /* @__PURE__ */ e(g.Item, { name: "priority", label: "优先级", initialValue: 1, style: { flex: 1 }, children: /* @__PURE__ */ e(
            S,
            {
              options: [
                { label: "低", value: 1 },
                { label: "中", value: 2 },
                { label: "高", value: 3 }
              ]
            }
          ) })
        ] }),
        /* @__PURE__ */ e(g.Item, { name: "dueDate", label: "截止时间", children: /* @__PURE__ */ e(ke, { style: { width: "100%" }, placeholder: "选择截止日期" }) })
      ] })
    }
  );
}
function ce({ apiBaseURL: r, back: a }) {
  const [d, n] = y([]), [o, s] = y(null), [u, b] = y([]), [m, h] = y(!1), [D, O] = y(null), [L, I] = y(null), [F, C] = y(!1), [c, f] = y(!1), [P, A] = y(!1), [_, $] = y(null), [N] = g.useForm(), K = async () => {
    try {
      const l = await x.listMyProjects(), p = (l == null ? void 0 : l.data) || l || [];
      n(p), I(null), p.length > 0 && !o && s(p[0].id);
    } catch (l) {
      I((l == null ? void 0 : l.message) || "加载项目失败");
    }
  }, B = async (l) => {
    if (!l) {
      b([]);
      return;
    }
    h(!0), O(null);
    try {
      const p = await x.listTasksByProject(l);
      b((p == null ? void 0 : p.data) || p || []);
    } catch (p) {
      O((p == null ? void 0 : p.message) || "加载任务失败");
    } finally {
      h(!1);
    }
  };
  E(() => {
    K();
  }, []), E(() => {
    B(o);
  }, [o]);
  const H = () => {
    if (!o) {
      T.warning("请先选择项目");
      return;
    }
    N.resetFields(), N.setFieldsValue({ projectId: o, listId: 1, status: 1, priority: 1 }), C(!0);
  }, J = async () => {
    try {
      const l = await N.validateFields();
      await x.createTask(l), T.success("任务已创建"), C(!1), B(o);
    } catch (l) {
      if (l != null && l.errorFields) return;
      T.error("创建失败: " + ((l == null ? void 0 : l.message) || l));
    }
  }, Q = async (l) => {
    try {
      await x.completeTask(l), T.success("任务已完成"), B(o);
    } catch (p) {
      T.error("操作失败: " + ((p == null ? void 0 : p.message) || p));
    }
  }, X = [
    { title: "ID", dataIndex: "id", width: 60 },
    { title: "标题", dataIndex: "title" },
    { title: "项目ID", dataIndex: "projectId", width: 80 },
    {
      title: "状态",
      dataIndex: "status",
      width: 100,
      render: (l) => {
        const p = { 0: "待办", 1: "进行中", 2: "已完成" }, Te = { 0: "default", 1: "blue", 2: "green" }[l] || "default";
        return /* @__PURE__ */ e(v, { color: Te, children: p[l] || l });
      }
    },
    { title: "优先级", dataIndex: "priority", width: 80 },
    { title: "截止时间", dataIndex: "dueDate", width: 180 },
    {
      title: "操作",
      width: 200,
      fixed: "right",
      render: (l, p) => /* @__PURE__ */ i(w, { children: [
        /* @__PURE__ */ e(
          k,
          {
            size: "small",
            icon: /* @__PURE__ */ e(Pe, {}),
            onClick: () => {
              $(p), f(!0);
            },
            children: "查看"
          }
        ),
        /* @__PURE__ */ e(
          k,
          {
            size: "small",
            type: "primary",
            icon: /* @__PURE__ */ e(le, {}),
            onClick: () => Q(p.id),
            disabled: p.status === 2,
            children: "完成"
          }
        )
      ] })
    }
  ], t = !m && !D && !!o && u.length === 0;
  return /* @__PURE__ */ i("div", { children: [
    /* @__PURE__ */ e(
      Le,
      {
        title: "任务管理",
        breadcrumb: [{ label: "任务中心" }, { label: "任务列表" }],
        back: !!a
      }
    ),
    /* @__PURE__ */ e(
      Ce,
      {
        left: /* @__PURE__ */ e(
          S,
          {
            value: o,
            onChange: s,
            style: { width: 240 },
            placeholder: "选择项目",
            options: d.map((l) => ({ label: l.name, value: l.id }))
          }
        ),
        right: /* @__PURE__ */ e(k, { type: "primary", icon: /* @__PURE__ */ e(ge, {}), onClick: H, children: "新建任务" })
      }
    ),
    L && /* @__PURE__ */ e("div", { style: { marginBottom: 16 }, children: /* @__PURE__ */ e(
      ie,
      {
        error: L,
        onRetry: K,
        title: "加载项目列表失败"
      }
    ) }),
    D && /* @__PURE__ */ e("div", { style: { marginBottom: 16 }, children: /* @__PURE__ */ e(ie, { error: D, onRetry: () => B(o) }) }),
    /* @__PURE__ */ e(
      re,
      {
        rows: u,
        columns: X,
        loading: m,
        rowKey: "id",
        searchKeys: "title",
        searchPlaceholder: "按任务标题过滤",
        emptyTitle: t ? "该项目下还没有任务" : "暂无数据",
        emptyDescription: t ? "把目标拆解成可执行的任务, 一项项推进" : void 0,
        emptyActionText: t ? "新建第一个任务" : void 0,
        emptyOnAction: t ? H : void 0
      }
    ),
    /* @__PURE__ */ e(
      fe,
      {
        title: "新建任务",
        open: F,
        onCancel: () => C(!1),
        onOk: J,
        destroyOnHidden: !0,
        children: /* @__PURE__ */ i(g, { form: N, layout: "vertical", preserve: !1, children: [
          /* @__PURE__ */ e(g.Item, { name: "title", label: "任务标题", rules: [{ required: !0, message: "请输入任务标题" }], children: /* @__PURE__ */ e(R, { placeholder: "例如: 实现 xx 功能" }) }),
          /* @__PURE__ */ e(g.Item, { name: "projectId", label: "所属项目", rules: [{ required: !0 }], children: /* @__PURE__ */ e(
            S,
            {
              options: d.map((l) => ({ label: l.name, value: l.id })),
              placeholder: "从数据库捞出的项目列表"
            }
          ) }),
          /* @__PURE__ */ e(g.Item, { name: "listId", label: "列表ID", rules: [{ required: !0 }], children: /* @__PURE__ */ e(R, { type: "number", placeholder: "默认 1" }) }),
          /* @__PURE__ */ e(g.Item, { name: "priority", label: "优先级", initialValue: 1, children: /* @__PURE__ */ e(S, { options: [{ label: "低", value: 1 }, { label: "中", value: 2 }, { label: "高", value: 3 }] }) })
        ] })
      }
    ),
    /* @__PURE__ */ e(
      Ne,
      {
        taskId: _ == null ? void 0 : _.id,
        open: c,
        onClose: () => {
          f(!1), $(null);
        },
        onChanged: B,
        onEdit: (l) => {
          $(l), f(!1), A(!0);
        }
      }
    ),
    /* @__PURE__ */ e(
      Ve,
      {
        open: P,
        task: _,
        projects: d,
        onClose: () => {
          A(!1), $(null);
        },
        onSaved: B
      }
    )
  ] });
}
const { Text: de, Title: et } = ye, ue = {
  0: { text: "待办", color: "default", icon: /* @__PURE__ */ e(be, {}) },
  1: { text: "进行中", color: "blue", icon: /* @__PURE__ */ e(Ie, {}) },
  2: { text: "已完成", color: "green", icon: /* @__PURE__ */ e(W, {}) }
};
function qe({ apiBaseURL: r }) {
  const [a, d] = y([]), [n, o] = y(null), [s, u] = y([]), [b, m] = y(!1), [h, D] = y(!1), O = async () => {
    D(!0);
    try {
      const c = await x.listMyProjects(), f = (c == null ? void 0 : c.data) || c || [];
      d(f), f.length > 0 && !n && o(f[0].id);
    } catch {
      d([]);
    } finally {
      D(!1);
    }
  }, L = async (c) => {
    if (!c) {
      u([]);
      return;
    }
    m(!0);
    try {
      const f = await x.listTasksByProject(c);
      u((f == null ? void 0 : f.data) || f || []);
    } catch {
      u([]);
    } finally {
      m(!1);
    }
  };
  E(() => {
    O();
  }, []), E(() => {
    L(n);
  }, [n]);
  const I = s.reduce((c, f) => {
    c.total += 1;
    const P = f.status ?? 0;
    return P === 0 ? c.todo += 1 : P === 1 ? c.doing += 1 : P === 2 && (c.done += 1), c;
  }, { total: 0, todo: 0, doing: 0, done: 0 }), F = I.total > 0 ? Math.round(I.done / I.total * 100) : 0, C = [1, 2, 3].map((c) => ({
    priority: c,
    list: s.filter((f) => (f.priority ?? 1) === c)
  }));
  return /* @__PURE__ */ i("div", { style: { display: "flex", flexDirection: "column", gap: 16 }, children: [
    /* @__PURE__ */ e(z, { children: /* @__PURE__ */ i(w, { wrap: !0, children: [
      /* @__PURE__ */ e(De, { style: { fontSize: 18, color: "#1677ff" } }),
      /* @__PURE__ */ e(de, { strong: !0, children: "选择项目：" }),
      /* @__PURE__ */ e(
        S,
        {
          value: n,
          onChange: o,
          style: { width: 280 },
          loading: h,
          placeholder: "选择项目",
          options: a.map((c) => ({ label: c.name, value: c.id }))
        }
      ),
      /* @__PURE__ */ i("a", { onClick: () => O(), children: [
        /* @__PURE__ */ e(Oe, {}),
        " 刷新项目"
      ] })
    ] }) }),
    /* @__PURE__ */ i(he, { spinning: b, children: [
      /* @__PURE__ */ i(ae, { gutter: 16, children: [
        /* @__PURE__ */ e(U, { span: 6, children: /* @__PURE__ */ e(z, { children: /* @__PURE__ */ e(G, { title: "总任务数", value: I.total }) }) }),
        /* @__PURE__ */ e(U, { span: 6, children: /* @__PURE__ */ e(z, { children: /* @__PURE__ */ e(
          G,
          {
            title: "待办",
            value: I.todo,
            styles: { content: { color: "#8c8c8c" } },
            prefix: /* @__PURE__ */ e(be, {})
          }
        ) }) }),
        /* @__PURE__ */ e(U, { span: 6, children: /* @__PURE__ */ e(z, { children: /* @__PURE__ */ e(
          G,
          {
            title: "进行中",
            value: I.doing,
            styles: { content: { color: "#1677ff" } },
            prefix: /* @__PURE__ */ e(Ie, {})
          }
        ) }) }),
        /* @__PURE__ */ e(U, { span: 6, children: /* @__PURE__ */ e(z, { children: /* @__PURE__ */ e(
          G,
          {
            title: "已完成",
            value: I.done,
            styles: { content: { color: "#52c41a" } },
            prefix: /* @__PURE__ */ e(W, {})
          }
        ) }) })
      ] }),
      /* @__PURE__ */ e(z, { style: { marginTop: 16 }, title: "完成率", children: /* @__PURE__ */ e(je, { percent: F, status: F === 100 ? "success" : "active" }) }),
      /* @__PURE__ */ e(ae, { gutter: 16, style: { marginTop: 16 }, children: C.map(({ priority: c, list: f }) => /* @__PURE__ */ e(U, { span: 8, children: /* @__PURE__ */ e(z, { size: "small", title: /* @__PURE__ */ i(w, { children: [
        /* @__PURE__ */ e(v, { color: c === 3 ? "red" : c === 2 ? "orange" : "default", children: c === 3 ? "高" : c === 2 ? "中" : "低" }),
        /* @__PURE__ */ i("span", { children: [
          "优先级 (",
          f.length,
          ")"
        ] })
      ] }), children: f.length === 0 ? /* @__PURE__ */ e(ee, { image: ee.PRESENTED_IMAGE_SIMPLE, description: "无任务" }) : /* @__PURE__ */ e(
        q,
        {
          size: "small",
          dataSource: f.slice(0, 8),
          renderItem: (P) => {
            const A = ue[P.status ?? 0] || ue[0];
            return /* @__PURE__ */ e(q.Item, { children: /* @__PURE__ */ e(
              q.Item.Meta,
              {
                avatar: A.icon,
                title: /* @__PURE__ */ i(w, { children: [
                  /* @__PURE__ */ e(de, { children: P.title }),
                  /* @__PURE__ */ e(v, { color: A.color, style: { margin: 0 }, children: A.text })
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
function tt() {
  return /* @__PURE__ */ i(Ae, { children: [
    /* @__PURE__ */ e(V, { index: !0, element: /* @__PURE__ */ e(Be, { to: "dashboard", replace: !0 }) }),
    /* @__PURE__ */ e(V, { path: "dashboard", element: /* @__PURE__ */ e(qe, {}) }),
    /* @__PURE__ */ e(V, { path: "project", element: /* @__PURE__ */ e(se, {}) }),
    /* @__PURE__ */ e(V, { path: "project/*", element: /* @__PURE__ */ e(se, {}) }),
    /* @__PURE__ */ e(V, { path: "task", element: /* @__PURE__ */ e(ce, {}) }),
    /* @__PURE__ */ e(V, { path: "task/*", element: /* @__PURE__ */ e(ce, {}) })
  ] });
}
export {
  at as ComponentDocPage,
  it as DRAG_COLUMN_MIME,
  st as DRAG_ITEM_MIME,
  se as ProjectList,
  Ze as ProjectSelect,
  tt as TaskApp,
  Qe as TaskCard,
  qe as TaskDashboard,
  ce as TaskList,
  Xe as TaskTable,
  nt as TodoTab,
  ot as addNoteLink,
  x as api,
  ct as apiBase,
  dt as buildTodoProjectContext,
  ut as configureApiBase,
  ht as configureTask,
  pt as configureTodoStore,
  mt as findTodosLinkedToNote,
  yt as flattenTodoOptions,
  ft as linkedTodoChipLabel,
  gt as readCurrentUser,
  bt as readToken,
  It as removeNoteLink,
  Tt as removeProjectLink,
  xt as resetTodoStore,
  x as taskApi,
  kt as todoHasNoteLink,
  jt as todoProjectLabel
};
