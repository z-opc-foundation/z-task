import { j as e } from "./jsx-runtime-z6PQ6F3d.js";
import { Card as B, Space as T, Tag as z, Button as b, Table as ee, Select as R, Form as y, Empty as Z, Spin as xe, Descriptions as w, List as q, Drawer as ue, Input as F, message as I, Popconfirm as je, Breadcrumb as Te, Typography as he, Modal as pe, DatePicker as we, Row as le, Col as H, Statistic as G, Progress as ze } from "antd";
import { CheckCircleOutlined as J, EditOutlined as Q, DeleteOutlined as te, PlusOutlined as me, InboxOutlined as fe, CheckOutlined as se, UnorderedListOutlined as Pe, ExclamationCircleOutlined as Se, ReloadOutlined as ye, EyeOutlined as De, ProjectOutlined as Ce, ClockCircleOutlined as ge, RocketOutlined as be } from "@ant-design/icons";
import { useState as p, useEffect as W } from "react";
import { createRequest as Oe, authRequest as Be } from "@yuku123/z-frontend-common";
import { useNavigate as Re, Routes as Me, Route as V, Navigate as Ae } from "react-router-dom";
const Le = {
  high: { color: "red", text: "高" },
  medium: { color: "orange", text: "中" },
  low: { color: "green", text: "低" }
}, Fe = {
  pending: { color: "default", text: "待处理" },
  in_progress: { color: "blue", text: "进行中" },
  completed: { color: "green", text: "已完成" }
};
function Ze({ task: t, onEdit: l, onComplete: i }) {
  const n = Le[t.priority] || { color: "default", text: t.priority }, c = Fe[t.status] || { color: "default", text: t.status };
  return /* @__PURE__ */ e.jsx(B, { size: "small", title: t.title, extra: /* @__PURE__ */ e.jsxs(T, { children: [
    t.status !== "completed" && /* @__PURE__ */ e.jsx(b, { size: "small", icon: /* @__PURE__ */ e.jsx(J, {}), onClick: () => i == null ? void 0 : i(t), children: "完成" }),
    /* @__PURE__ */ e.jsx(b, { size: "small", icon: /* @__PURE__ */ e.jsx(Q, {}), onClick: () => l == null ? void 0 : l(t), children: "编辑" })
  ] }), children: /* @__PURE__ */ e.jsxs(T, { orientation: "vertical", style: { width: "100%" }, children: [
    /* @__PURE__ */ e.jsxs("div", { children: [
      "项目：",
      t.projectName
    ] }),
    /* @__PURE__ */ e.jsxs(T, { children: [
      /* @__PURE__ */ e.jsx(z, { color: n.color, children: n.text }),
      /* @__PURE__ */ e.jsx(z, { color: c.color, children: c.text })
    ] }),
    t.dueDate && /* @__PURE__ */ e.jsxs("div", { children: [
      "截止：",
      t.dueDate
    ] })
  ] }) });
}
const We = { high: "red", medium: "orange", low: "green" }, $e = {
  pending: "default",
  in_progress: "blue",
  completed: "green"
};
function et({ dataSource: t, loading: l, onEdit: i, onDelete: n, onComplete: c }) {
  const r = [
    { title: "任务名称", dataIndex: "title", key: "title" },
    { title: "项目", dataIndex: "projectName", key: "projectName" },
    {
      title: "优先级",
      dataIndex: "priority",
      key: "priority",
      render: (u) => /* @__PURE__ */ e.jsx(z, { color: We[u], children: u === "high" ? "高" : u === "medium" ? "中" : "低" })
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (u) => {
        const o = { pending: "待处理", in_progress: "进行中", completed: "已完成" };
        return /* @__PURE__ */ e.jsx(z, { color: $e[u], children: o[u] || u });
      }
    },
    { title: "截止日期", dataIndex: "dueDate", key: "dueDate" },
    {
      title: "操作",
      key: "action",
      render: (u, o) => /* @__PURE__ */ e.jsxs(T, { children: [
        o.status !== "completed" && /* @__PURE__ */ e.jsx(b, { size: "small", icon: /* @__PURE__ */ e.jsx(J, {}), onClick: () => c == null ? void 0 : c(o), children: "完成" }),
        /* @__PURE__ */ e.jsx(b, { size: "small", icon: /* @__PURE__ */ e.jsx(Q, {}), onClick: () => i == null ? void 0 : i(o), children: "编辑" }),
        /* @__PURE__ */ e.jsx(b, { size: "small", danger: !0, icon: /* @__PURE__ */ e.jsx(te, {}), onClick: () => n == null ? void 0 : n(o), children: "删除" })
      ] })
    }
  ];
  return /* @__PURE__ */ e.jsx(
    ee,
    {
      columns: r,
      dataSource: t,
      loading: l,
      rowKey: "id",
      pagination: { pageSize: 10 }
    }
  );
}
function tt({ value: t, onChange: l, projects: i = [] }) {
  return /* @__PURE__ */ e.jsx(
    R,
    {
      value: t,
      onChange: l,
      placeholder: "请选择项目",
      style: { width: 200 },
      allowClear: !0,
      children: i.map((n) => /* @__PURE__ */ e.jsx(R.Option, { value: n.id, children: n.name }, n.id))
    }
  );
}
const O = Oe("task"), v = {
  // === 项目 ===
  listMyProjects: () => Be.get("/project/user/list"),
  createProject: (t) => O.post("/project", t),
  updateProject: (t, l) => O.put(`/project/${t}`, l),
  archiveProject: (t) => O.put(`/project/${t}/archive`),
  // === 任务 ===
  listTasksByProject: (t) => O.get("/task/project/list", { params: { projectId: t } }),
  listTasksByList: (t) => O.get("/task/list", { params: { listId: t } }),
  createTask: (t) => O.post("/task", t),
  completeTask: (t) => O.post("/task/complete", null, { params: { taskId: t } }),
  moveTask: (t, l, i) => O.put("/task/move", null, { params: { taskId: t, targetListId: l, position: i } }),
  // === 任务详情 ===
  getTaskDetail: (t) => O.get(`/task/${t}`),
  updateTask: (t, l) => O.put(`/task/${t}`, l),
  deleteTask: (t) => O.delete(`/task/${t}`)
}, X = (t) => {
  if (!t) return "-";
  const l = String(t), i = l.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})/);
  return i ? i[1] : l;
};
function re({ apiBaseURL: t }) {
  const [l, i] = p([]), [n, c] = p(!1), [r, u] = p(!1), [o, a] = p(null), [d, k] = p(null), [P, S] = p([]), [g, L] = p(!1), [C] = y.useForm(), j = async () => {
    c(!0);
    try {
      const s = await v.listMyProjects();
      i((s == null ? void 0 : s.data) || s || []);
    } catch (s) {
      I.error("加载项目失败: " + ((s == null ? void 0 : s.message) || s));
    } finally {
      c(!1);
    }
  };
  W(() => {
    j();
  }, []);
  const m = async (s) => {
    k(s), L(!0);
    try {
      const h = await v.listTasksByProject(s.id);
      S((h == null ? void 0 : h.data) || h || []);
    } catch (h) {
      I.error("加载任务失败: " + ((h == null ? void 0 : h.message) || h));
    } finally {
      L(!1);
    }
  }, D = async () => {
    if (d)
      try {
        const s = await v.listTasksByProject(d.id);
        S((s == null ? void 0 : s.data) || s || []);
      } catch (s) {
        I.error("刷新任务失败: " + ((s == null ? void 0 : s.message) || s));
      }
  }, M = () => {
    a(null), C.resetFields(), C.setFieldsValue({ status: 1 }), u(!0);
  }, $ = (s) => {
    a(s), C.setFieldsValue({ name: s.name, description: s.description, status: s.status ?? 1 }), u(!0);
  }, E = async () => {
    try {
      const s = await C.validateFields();
      o ? (await v.updateProject(o.id, s), I.success("项目已更新")) : (await v.createProject(s), I.success("项目已创建")), u(!1), j();
    } catch (s) {
      if (s != null && s.errorFields) return;
      I.error("保存失败: " + ((s == null ? void 0 : s.message) || s));
    }
  }, _ = async (s) => {
    try {
      await v.archiveProject(s), I.success("项目已归档"), j(), (d == null ? void 0 : d.id) === s && (k(null), S([]));
    } catch (h) {
      I.error("归档失败: " + ((h == null ? void 0 : h.message) || h));
    }
  }, N = async (s) => {
    try {
      await v.completeTask(s), I.success("任务已完成"), D();
    } catch (h) {
      I.error("操作失败: " + ((h == null ? void 0 : h.message) || h));
    }
  }, A = [
    {
      title: "项目名称",
      dataIndex: "name",
      render: (s, h) => /* @__PURE__ */ e.jsx(
        "a",
        {
          onClick: () => m(h),
          style: { fontWeight: (d == null ? void 0 : d.id) === h.id ? 600 : 400 },
          children: s
        }
      )
    },
    {
      title: "状态",
      dataIndex: "status",
      width: 80,
      render: (s) => s === 1 ? /* @__PURE__ */ e.jsx(z, { color: "green", children: "进行中" }) : /* @__PURE__ */ e.jsx(z, { children: "已归档" })
    },
    { title: "创建时间", dataIndex: "createdAt", width: 170, render: X },
    {
      title: "操作",
      width: 160,
      fixed: "right",
      render: (s, h) => /* @__PURE__ */ e.jsxs(T, { children: [
        /* @__PURE__ */ e.jsx(b, { size: "small", icon: /* @__PURE__ */ e.jsx(Q, {}), onClick: () => $(h), children: "编辑" }),
        /* @__PURE__ */ e.jsx(je, { title: "确定归档该项目?", onConfirm: () => _(h.id), children: /* @__PURE__ */ e.jsx(b, { size: "small", danger: !0, icon: /* @__PURE__ */ e.jsx(te, {}), children: "归档" }) })
      ] })
    }
  ], U = (s) => {
    const K = {
      0: { text: "待办", color: "default" },
      1: { text: "进行中", color: "blue" },
      2: { text: "已完成", color: "green" }
    }[s] || { text: String(s), color: "default" };
    return /* @__PURE__ */ e.jsx(z, { color: K.color, children: K.text });
  };
  return /* @__PURE__ */ e.jsxs("div", { children: [
    /* @__PURE__ */ e.jsx("div", { style: { display: "flex", justifyContent: "flex-end", marginBottom: 12 }, children: /* @__PURE__ */ e.jsx(b, { type: "primary", icon: /* @__PURE__ */ e.jsx(me, {}), onClick: M, children: "新建项目" }) }),
    /* @__PURE__ */ e.jsxs("div", { style: { display: "flex", gap: 16, height: "calc(100vh - 220px)" }, children: [
      /* @__PURE__ */ e.jsx(
        B,
        {
          size: "small",
          title: /* @__PURE__ */ e.jsxs(T, { children: [
            /* @__PURE__ */ e.jsx(fe, {}),
            "项目管理"
          ] }),
          style: { width: 520, flexShrink: 0 },
          styles: { body: { padding: 8, overflow: "auto", height: "calc(100% - 40px)" } },
          children: /* @__PURE__ */ e.jsx(
            ee,
            {
              rowKey: "id",
              columns: A,
              dataSource: l,
              loading: n,
              pagination: { pageSize: 10, size: "small" },
              size: "small",
              rowClassName: (s) => (d == null ? void 0 : d.id) === s.id ? "ant-table-row-selected" : "",
              onRow: (s) => ({ onClick: () => m(s), style: { cursor: "pointer" } }),
              locale: { emptyText: "暂无项目" }
            }
          )
        }
      ),
      /* @__PURE__ */ e.jsx(
        B,
        {
          size: "small",
          style: { flex: 1, overflow: "auto" },
          styles: { body: { padding: 16 } },
          title: d ? /* @__PURE__ */ e.jsxs(T, { children: [
            /* @__PURE__ */ e.jsx(Pe, {}),
            d.name,
            " · 任务列表"
          ] }) : "项目详情",
          children: d ? /* @__PURE__ */ e.jsxs(xe, { spinning: g, children: [
            /* @__PURE__ */ e.jsxs(w, { size: "small", bordered: !0, column: 2, style: { marginBottom: 16 }, children: [
              /* @__PURE__ */ e.jsx(w.Item, { label: "项目名称", span: 2, children: d.name }),
              /* @__PURE__ */ e.jsx(w.Item, { label: "描述", span: 2, children: d.description || "无" }),
              /* @__PURE__ */ e.jsx(w.Item, { label: "负责人", children: d.ownerId || "未指定" }),
              /* @__PURE__ */ e.jsx(w.Item, { label: "状态", children: d.status === 1 ? /* @__PURE__ */ e.jsx(z, { color: "green", children: "进行中" }) : /* @__PURE__ */ e.jsx(z, { children: "已归档" }) }),
              /* @__PURE__ */ e.jsx(
                w.Item,
                {
                  label: "创建时间",
                  children: X(d.createdAt)
                }
              ),
              /* @__PURE__ */ e.jsx(w.Item, { label: "项目ID", children: d.id })
            ] }),
            /* @__PURE__ */ e.jsx(
              q,
              {
                size: "small",
                header: /* @__PURE__ */ e.jsxs("b", { children: [
                  "任务项 (",
                  P.length,
                  ")"
                ] }),
                bordered: !0,
                dataSource: P,
                locale: { emptyText: "该项目下暂无任务" },
                renderItem: (s) => /* @__PURE__ */ e.jsx(
                  q.Item,
                  {
                    actions: [
                      /* @__PURE__ */ e.jsx(
                        b,
                        {
                          size: "small",
                          type: "primary",
                          icon: /* @__PURE__ */ e.jsx(se, {}),
                          disabled: s.status === 2,
                          onClick: () => N(s.id),
                          children: "完成"
                        },
                        "complete"
                      )
                    ],
                    children: /* @__PURE__ */ e.jsx(
                      q.Item.Meta,
                      {
                        title: /* @__PURE__ */ e.jsxs(T, { children: [
                          s.title,
                          U(s.status),
                          /* @__PURE__ */ e.jsxs(z, { children: [
                            "优先级 ",
                            s.priority ?? "-"
                          ] })
                        ] }),
                        description: /* @__PURE__ */ e.jsxs("span", { style: { color: "#888", fontSize: 12 }, children: [
                          "截止: ",
                          X(s.dueDate),
                          " · ID: ",
                          s.id
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
        title: o ? `编辑项目 - ${o.name}` : "新建项目",
        size: "large",
        open: r,
        onClose: () => u(!1),
        destroyOnHidden: !0,
        extra: /* @__PURE__ */ e.jsxs(T, { children: [
          /* @__PURE__ */ e.jsx(b, { onClick: () => u(!1), children: "取消" }),
          /* @__PURE__ */ e.jsx(b, { type: "primary", onClick: E, children: "保存" })
        ] }),
        children: /* @__PURE__ */ e.jsxs(y, { form: C, layout: "vertical", preserve: !1, children: [
          /* @__PURE__ */ e.jsx(y.Item, { name: "name", label: "项目名称", rules: [{ required: !0, message: "请输入项目名称" }], children: /* @__PURE__ */ e.jsx(F, { placeholder: "例如: 一人公司" }) }),
          /* @__PURE__ */ e.jsx(y.Item, { name: "description", label: "项目描述", children: /* @__PURE__ */ e.jsx(F.TextArea, { rows: 3, placeholder: "可选" }) }),
          /* @__PURE__ */ e.jsx(y.Item, { name: "status", label: "状态", initialValue: 1, children: /* @__PURE__ */ e.jsx(
            R,
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
const Y = {
  // 卡片表面
  surfaceAlt: "#fafbfc",
  // 次级表面 (表格 hover 等)
  border: "#e5e7eb",
  text: "#111827",
  // 主文本
  textMuted: "#6b7280"
}, Ie = {
  md: 12
};
function Ee({
  icon: t,
  title: l = "暂无数据",
  description: i,
  actionText: n,
  onAction: c,
  size: r = "md",
  style: u
}) {
  const o = { sm: 24, md: 40, lg: 64 }, a = { sm: 14, md: 16, lg: 20 };
  return /* @__PURE__ */ e.jsxs(
    "div",
    {
      role: "status",
      "aria-live": "polite",
      style: {
        padding: o[r] || o.md,
        textAlign: "center",
        background: "#ffffff",
        borderRadius: Ie.md,
        border: "1px dashed #e5e7eb",
        ...u
      },
      children: [
        /* @__PURE__ */ e.jsx("div", { style: {
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: Y.surfaceAlt,
          marginBottom: 16,
          fontSize: 28,
          color: "#9ca3af"
        }, children: t || /* @__PURE__ */ e.jsx(fe, {}) }),
        /* @__PURE__ */ e.jsx("div", { style: {
          fontSize: a[r],
          fontWeight: 600,
          color: Y.text,
          marginBottom: i ? 6 : 16
        }, children: l }),
        i && /* @__PURE__ */ e.jsx("div", { style: {
          fontSize: 13,
          color: Y.textMuted,
          lineHeight: 1.6,
          maxWidth: 360,
          margin: "0 auto 16px"
        }, children: i }),
        n && c && /* @__PURE__ */ e.jsx(
          b,
          {
            type: "primary",
            onClick: c,
            style: {
              background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
              border: "none",
              minHeight: 36
            },
            children: n
          }
        )
      ]
    }
  );
}
function ie({
  error: t,
  title: l = "加载失败",
  description: i,
  onRetry: n,
  retryText: c = "重新加载",
  variant: r = "inline",
  style: u
}) {
  var o;
  const a = r === "full", d = (o = t == null ? void 0 : t.response) == null ? void 0 : o.data, k = d && typeof d == "object" && (typeof d.message == "string" && d.message || typeof d.msg == "string" && d.msg) || null, P = k || (typeof t == "string" ? t : (t == null ? void 0 : t.message) || (t == null ? void 0 : t.msg) || (t ? String(t) : null)), S = i || (k ? `原因: ${k}` : P ? `原因: ${P}。请检查网络或稍后重试。` : "请检查网络或稍后重试。");
  return /* @__PURE__ */ e.jsxs(
    "div",
    {
      role: "alert",
      "aria-live": "assertive",
      style: {
        padding: a ? "48px 24px" : "20px 24px",
        background: a ? "#ffffff" : "#fef2f2",
        border: a ? `1px dashed ${Y.border}` : "1px solid #fecaca",
        borderRadius: Ie.md,
        textAlign: a ? "center" : "left",
        display: "flex",
        flexDirection: a ? "column" : "row",
        alignItems: a ? "center" : "flex-start",
        gap: a ? 12 : 16,
        ...u
      },
      children: [
        /* @__PURE__ */ e.jsx("div", { style: {
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: a ? 56 : 36,
          height: a ? 56 : 36,
          borderRadius: "50%",
          background: a ? "#fef2f2" : "#ffffff",
          color: "#dc2626",
          fontSize: a ? 28 : 18,
          flexShrink: 0
        }, children: /* @__PURE__ */ e.jsx(Se, {}) }),
        /* @__PURE__ */ e.jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [
          /* @__PURE__ */ e.jsx("div", { style: {
            fontSize: a ? 16 : 14,
            fontWeight: 600,
            color: "#991b1b",
            marginBottom: 4
          }, children: l }),
          /* @__PURE__ */ e.jsx("div", { style: {
            fontSize: 13,
            color: "#7f1d1d",
            lineHeight: 1.6,
            wordBreak: "break-word"
          }, children: S }),
          n && /* @__PURE__ */ e.jsx(
            b,
            {
              type: "primary",
              danger: !0,
              icon: /* @__PURE__ */ e.jsx(ye, {}),
              onClick: n,
              size: a ? "middle" : "small",
              style: { marginTop: 12 },
              children: c
            }
          )
        ] })
      ]
    }
  );
}
function _e({
  title: t,
  subtitle: l,
  breadcrumb: i,
  extra: n,
  back: c,
  onBack: r
}) {
  const u = Re();
  return /* @__PURE__ */ e.jsx("div", { style: {
    marginBottom: 12,
    paddingBottom: 10,
    borderBottom: "1px solid #f1f5f9"
  }, children: /* @__PURE__ */ e.jsxs("div", { style: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap"
  }, children: [
    /* @__PURE__ */ e.jsxs("div", { style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      minWidth: 0,
      flexWrap: "wrap"
    }, children: [
      c && /* @__PURE__ */ e.jsx(
        "button",
        {
          onClick: () => {
            r ? r() : u(-1);
          },
          "aria-label": "返回上一页",
          style: {
            width: 28,
            height: 28,
            borderRadius: 6,
            border: "1px solid #e5e7eb",
            background: "#ffffff",
            color: "#6b7280",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
            transition: "all 150ms ease",
            flexShrink: 0
          },
          onMouseEnter: (o) => {
            o.currentTarget.style.background = "#f8fafc", o.currentTarget.style.color = "#111827", o.currentTarget.style.borderColor = "#7c3aed";
          },
          onMouseLeave: (o) => {
            o.currentTarget.style.background = "#ffffff", o.currentTarget.style.color = "#6b7280", o.currentTarget.style.borderColor = "#e5e7eb";
          },
          children: "←"
        }
      ),
      i && i.length > 0 ? /* @__PURE__ */ e.jsx(
        Te,
        {
          items: i.map((o, a) => {
            const d = a === i.length - 1;
            return {
              title: o.href && !d ? /* @__PURE__ */ e.jsx("a", { onClick: (k) => {
                k.preventDefault(), u(o.href);
              }, children: o.label }) : /* @__PURE__ */ e.jsx("span", { style: d ? {
                fontWeight: 600,
                color: "#111827"
              } : void 0, children: o.label })
            };
          })
        }
      ) : t && /* @__PURE__ */ e.jsx("span", { role: "heading", "aria-level": 1, style: {
        fontSize: 15,
        fontWeight: 600,
        color: "#111827",
        lineHeight: 1.4
      }, children: t }),
      l && /* @__PURE__ */ e.jsx("span", { title: l, style: {
        fontSize: 12,
        color: "#94a3b8",
        lineHeight: 1.4,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        maxWidth: 360
      }, children: l })
    ] }),
    n && /* @__PURE__ */ e.jsx("div", { style: {
      display: "flex",
      gap: 8,
      flexShrink: 0
    }, children: n })
  ] }) });
}
function Ve({ left: t, right: l, extra: i }) {
  return /* @__PURE__ */ e.jsxs(
    "div",
    {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        marginBottom: 12,
        flexWrap: "wrap"
      },
      children: [
        /* @__PURE__ */ e.jsx(T, { size: 8, wrap: !0, children: t }),
        /* @__PURE__ */ e.jsxs(T, { size: 8, wrap: !0, children: [
          l,
          i
        ] })
      ]
    }
  );
}
const { Paragraph: qe } = he, ae = {
  0: { label: "待办", color: "default" },
  1: { label: "进行中", color: "blue" },
  2: { label: "已完成", color: "green" }
}, ne = {
  1: { label: "低", color: "default" },
  2: { label: "中", color: "orange" },
  3: { label: "高", color: "red" }
};
function He({ taskId: t, open: l, onClose: i, onChanged: n, onEdit: c }) {
  const [r, u] = p(null), [o, a] = p(!1);
  W(() => {
    !l || !t || (a(!0), v.getTaskDetail(t).then((g) => u((g == null ? void 0 : g.data) || g)).catch(() => u(null)).finally(() => a(!1)));
  }, [l, t]);
  const d = async () => {
    try {
      await v.completeTask(t), u((g) => ({ ...g, status: 2 })), n == null || n();
    } catch {
    }
  }, k = async () => {
    try {
      await v.deleteTask(t), n == null || n(), i == null || i();
    } catch {
    }
  }, P = ae[r == null ? void 0 : r.status] || ae[0], S = ne[r == null ? void 0 : r.priority] || ne[1];
  return /* @__PURE__ */ e.jsx(
    ue,
    {
      title: (r == null ? void 0 : r.title) || "任务详情",
      size: "large",
      open: l,
      onClose: i,
      loading: o,
      footer: /* @__PURE__ */ e.jsxs("div", { style: { display: "flex", justifyContent: "space-between" }, children: [
        /* @__PURE__ */ e.jsx(
          je,
          {
            title: "确认删除此任务?",
            onConfirm: k,
            okText: "删除",
            cancelText: "取消",
            okButtonProps: { danger: !0 },
            children: /* @__PURE__ */ e.jsx(b, { danger: !0, icon: /* @__PURE__ */ e.jsx(te, {}), children: "删除" })
          }
        ),
        /* @__PURE__ */ e.jsxs(T, { children: [
          (r == null ? void 0 : r.status) !== 2 && /* @__PURE__ */ e.jsx(b, { type: "primary", icon: /* @__PURE__ */ e.jsx(se, {}), onClick: d, children: "完成任务" }),
          /* @__PURE__ */ e.jsx(b, { icon: /* @__PURE__ */ e.jsx(Q, {}), onClick: () => c == null ? void 0 : c(r), children: "编辑" })
        ] })
      ] }),
      children: r && /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
        /* @__PURE__ */ e.jsxs(w, { column: 2, bordered: !0, size: "small", style: { marginBottom: 24 }, children: [
          /* @__PURE__ */ e.jsx(w.Item, { label: "状态", children: /* @__PURE__ */ e.jsx(z, { color: P.color, children: P.label }) }),
          /* @__PURE__ */ e.jsx(w.Item, { label: "优先级", children: /* @__PURE__ */ e.jsx(z, { color: S.color, children: S.label }) }),
          /* @__PURE__ */ e.jsx(w.Item, { label: "项目 ID", children: r.projectId }),
          /* @__PURE__ */ e.jsx(w.Item, { label: "列表 ID", children: r.listId }),
          /* @__PURE__ */ e.jsx(w.Item, { label: "截止时间", span: 2, children: r.dueDate || "未设置" }),
          /* @__PURE__ */ e.jsx(w.Item, { label: "创建时间", children: r.createdAt || "-" }),
          /* @__PURE__ */ e.jsx(w.Item, { label: "更新时间", children: r.updatedAt || "-" })
        ] }),
        r.description && /* @__PURE__ */ e.jsxs("div", { style: { marginBottom: 24 }, children: [
          /* @__PURE__ */ e.jsx("div", { style: { fontWeight: 600, marginBottom: 8 }, children: "描述" }),
          /* @__PURE__ */ e.jsx(qe, { style: { whiteSpace: "pre-wrap", color: "#595959" }, children: r.description })
        ] })
      ] })
    }
  );
}
function Ne({ open: t, task: l, projects: i, onClose: n, onSaved: c }) {
  const [r] = y.useForm(), u = !!(l != null && l.id);
  W(() => {
    t && l ? r.setFieldsValue({
      title: l.title,
      description: l.description,
      projectId: l.projectId,
      listId: l.listId,
      status: l.status,
      priority: l.priority,
      dueDate: l.dueDate
    }) : t && r.resetFields();
  }, [t, l, r]);
  const o = async () => {
    try {
      const a = await r.validateFields();
      u ? (await v.updateTask(l.id, a), I.success("任务已更新")) : (await v.createTask(a), I.success("任务已创建")), c == null || c(), n == null || n();
    } catch (a) {
      if (a != null && a.errorFields) return;
      I.error("保存失败: " + ((a == null ? void 0 : a.message) || a));
    }
  };
  return /* @__PURE__ */ e.jsx(
    pe,
    {
      title: u ? "编辑任务" : "新建任务",
      open: t,
      onCancel: n,
      onOk: o,
      destroyOnHidden: !0,
      size: "large",
      children: /* @__PURE__ */ e.jsxs(y, { form: r, layout: "vertical", preserve: !1, children: [
        /* @__PURE__ */ e.jsx(
          y.Item,
          {
            name: "title",
            label: "任务标题",
            rules: [{ required: !0, message: "请输入任务标题" }],
            children: /* @__PURE__ */ e.jsx(F, { placeholder: "例如: 实现 xx 功能" })
          }
        ),
        /* @__PURE__ */ e.jsx(y.Item, { name: "description", label: "描述", children: /* @__PURE__ */ e.jsx(F.TextArea, { rows: 3, placeholder: "任务描述 (可选)" }) }),
        /* @__PURE__ */ e.jsxs("div", { style: { display: "flex", gap: 16 }, children: [
          /* @__PURE__ */ e.jsx(
            y.Item,
            {
              name: "projectId",
              label: "所属项目",
              rules: [{ required: !0 }],
              style: { flex: 1 },
              children: /* @__PURE__ */ e.jsx(
                R,
                {
                  options: i.map((a) => ({ label: a.name, value: a.id })),
                  placeholder: "选择项目"
                }
              )
            }
          ),
          /* @__PURE__ */ e.jsx(y.Item, { name: "listId", label: "列表 ID", style: { flex: 1 }, children: /* @__PURE__ */ e.jsx(F, { type: "number", placeholder: "默认 1" }) })
        ] }),
        /* @__PURE__ */ e.jsxs("div", { style: { display: "flex", gap: 16 }, children: [
          /* @__PURE__ */ e.jsx(y.Item, { name: "status", label: "状态", initialValue: 0, style: { flex: 1 }, children: /* @__PURE__ */ e.jsx(
            R,
            {
              options: [
                { label: "待办", value: 0 },
                { label: "进行中", value: 1 },
                { label: "已完成", value: 2 }
              ]
            }
          ) }),
          /* @__PURE__ */ e.jsx(y.Item, { name: "priority", label: "优先级", initialValue: 1, style: { flex: 1 }, children: /* @__PURE__ */ e.jsx(
            R,
            {
              options: [
                { label: "低", value: 1 },
                { label: "中", value: 2 },
                { label: "高", value: 3 }
              ]
            }
          ) })
        ] }),
        /* @__PURE__ */ e.jsx(y.Item, { name: "dueDate", label: "截止时间", children: /* @__PURE__ */ e.jsx(we, { style: { width: "100%" }, placeholder: "选择截止日期" }) })
      ] })
    }
  );
}
function oe({ apiBaseURL: t, back: l }) {
  const [i, n] = p([]), [c, r] = p(null), [u, o] = p([]), [a, d] = p(!1), [k, P] = p(null), [S, g] = p(null), [L, C] = p(!1), [j, m] = p(!1), [D, M] = p(!1), [$, E] = p(null), [_] = y.useForm(), N = async () => {
    try {
      const x = await v.listMyProjects(), f = (x == null ? void 0 : x.data) || x || [];
      n(f), g(null), f.length > 0 && !c && r(f[0].id);
    } catch (x) {
      g((x == null ? void 0 : x.message) || "加载项目失败");
    }
  }, A = async (x) => {
    if (!x) {
      o([]);
      return;
    }
    d(!0), P(null);
    try {
      const f = await v.listTasksByProject(x);
      o((f == null ? void 0 : f.data) || f || []);
    } catch (f) {
      P((f == null ? void 0 : f.message) || "加载任务失败");
    } finally {
      d(!1);
    }
  };
  W(() => {
    N();
  }, []), W(() => {
    A(c);
  }, [c]);
  const U = () => {
    if (!c) {
      I.warning("请先选择项目");
      return;
    }
    _.resetFields(), _.setFieldsValue({ projectId: c, listId: 1, status: 1, priority: 1 }), C(!0);
  }, s = async () => {
    try {
      const x = await _.validateFields();
      await v.createTask(x), I.success("任务已创建"), C(!1), A(c);
    } catch (x) {
      if (x != null && x.errorFields) return;
      I.error("创建失败: " + ((x == null ? void 0 : x.message) || x));
    }
  }, h = async (x) => {
    try {
      await v.completeTask(x), I.success("任务已完成"), A(c);
    } catch (f) {
      I.error("操作失败: " + ((f == null ? void 0 : f.message) || f));
    }
  }, K = [
    { title: "ID", dataIndex: "id", width: 60 },
    { title: "标题", dataIndex: "title" },
    { title: "项目ID", dataIndex: "projectId", width: 80 },
    {
      title: "状态",
      dataIndex: "status",
      width: 100,
      render: (x) => {
        const f = { 0: "待办", 1: "进行中", 2: "已完成" }, ke = { 0: "default", 1: "blue", 2: "green" }[x] || "default";
        return /* @__PURE__ */ e.jsx(z, { color: ke, children: f[x] || x });
      }
    },
    { title: "优先级", dataIndex: "priority", width: 80 },
    { title: "截止时间", dataIndex: "dueDate", width: 180 },
    {
      title: "操作",
      width: 200,
      fixed: "right",
      render: (x, f) => /* @__PURE__ */ e.jsxs(T, { children: [
        /* @__PURE__ */ e.jsx(
          b,
          {
            size: "small",
            icon: /* @__PURE__ */ e.jsx(De, {}),
            onClick: () => {
              E(f), m(!0);
            },
            children: "查看"
          }
        ),
        /* @__PURE__ */ e.jsx(
          b,
          {
            size: "small",
            type: "primary",
            icon: /* @__PURE__ */ e.jsx(se, {}),
            onClick: () => h(f.id),
            disabled: f.status === 2,
            children: "完成"
          }
        )
      ] })
    }
  ], ve = !a && !k && u.length === 0 && c;
  return /* @__PURE__ */ e.jsxs("div", { children: [
    /* @__PURE__ */ e.jsx(
      _e,
      {
        title: "任务管理",
        subtitle: "按项目维度组织任务, 支持新建、完成等操作",
        breadcrumb: [{ label: "任务中心" }, { label: "任务列表" }],
        back: !!l
      }
    ),
    /* @__PURE__ */ e.jsx(
      Ve,
      {
        left: /* @__PURE__ */ e.jsx(
          R,
          {
            value: c,
            onChange: r,
            style: { width: 240 },
            placeholder: "选择项目",
            options: i.map((x) => ({ label: x.name, value: x.id }))
          }
        ),
        right: /* @__PURE__ */ e.jsx(b, { type: "primary", icon: /* @__PURE__ */ e.jsx(me, {}), onClick: U, children: "新建任务" })
      }
    ),
    S && /* @__PURE__ */ e.jsx("div", { style: { marginBottom: 16 }, children: /* @__PURE__ */ e.jsx(
      ie,
      {
        error: S,
        onRetry: N,
        title: "加载项目列表失败"
      }
    ) }),
    k && /* @__PURE__ */ e.jsx("div", { style: { marginBottom: 16 }, children: /* @__PURE__ */ e.jsx(ie, { error: k, onRetry: () => A(c) }) }),
    /* @__PURE__ */ e.jsx("div", { style: {
      background: "#ffffff",
      borderRadius: 16,
      padding: 20,
      boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04), 0 1px 2px rgba(15, 23, 42, 0.06)"
    }, children: ve ? /* @__PURE__ */ e.jsx(
      Ee,
      {
        title: "该项目下还没有任务",
        description: "把目标拆解成可执行的任务, 一项项推进",
        actionText: "新建第一个任务",
        onAction: U
      }
    ) : /* @__PURE__ */ e.jsx(
      ee,
      {
        rowKey: "id",
        columns: K,
        dataSource: u,
        loading: a,
        pagination: { pageSize: 10 }
      }
    ) }),
    /* @__PURE__ */ e.jsx(
      pe,
      {
        title: "新建任务",
        open: L,
        onCancel: () => C(!1),
        onOk: s,
        destroyOnHidden: !0,
        children: /* @__PURE__ */ e.jsxs(y, { form: _, layout: "vertical", preserve: !1, children: [
          /* @__PURE__ */ e.jsx(y.Item, { name: "title", label: "任务标题", rules: [{ required: !0, message: "请输入任务标题" }], children: /* @__PURE__ */ e.jsx(F, { placeholder: "例如: 实现 xx 功能" }) }),
          /* @__PURE__ */ e.jsx(y.Item, { name: "projectId", label: "所属项目", rules: [{ required: !0 }], children: /* @__PURE__ */ e.jsx(
            R,
            {
              options: i.map((x) => ({ label: x.name, value: x.id })),
              placeholder: "从数据库捞出的项目列表"
            }
          ) }),
          /* @__PURE__ */ e.jsx(y.Item, { name: "listId", label: "列表ID", rules: [{ required: !0 }], children: /* @__PURE__ */ e.jsx(F, { type: "number", placeholder: "默认 1" }) }),
          /* @__PURE__ */ e.jsx(y.Item, { name: "priority", label: "优先级", initialValue: 1, children: /* @__PURE__ */ e.jsx(R, { options: [{ label: "低", value: 1 }, { label: "中", value: 2 }, { label: "高", value: 3 }] }) })
        ] })
      }
    ),
    /* @__PURE__ */ e.jsx(
      He,
      {
        taskId: $ == null ? void 0 : $.id,
        open: j,
        onClose: () => {
          m(!1), E(null);
        },
        onChanged: A,
        onEdit: (x) => {
          E(x), m(!1), M(!0);
        }
      }
    ),
    /* @__PURE__ */ e.jsx(
      Ne,
      {
        open: D,
        task: $,
        projects: i,
        onClose: () => {
          M(!1), E(null);
        },
        onSaved: A
      }
    )
  ] });
}
const { Text: ce, Title: st } = he, de = {
  0: { text: "待办", color: "default", icon: /* @__PURE__ */ e.jsx(ge, {}) },
  1: { text: "进行中", color: "blue", icon: /* @__PURE__ */ e.jsx(be, {}) },
  2: { text: "已完成", color: "green", icon: /* @__PURE__ */ e.jsx(J, {}) }
};
function Ue({ apiBaseURL: t }) {
  const [l, i] = p([]), [n, c] = p(null), [r, u] = p([]), [o, a] = p(!1), [d, k] = p(!1), P = async () => {
    k(!0);
    try {
      const j = await v.listMyProjects(), m = (j == null ? void 0 : j.data) || j || [];
      i(m), m.length > 0 && !n && c(m[0].id);
    } catch {
      i([]);
    } finally {
      k(!1);
    }
  }, S = async (j) => {
    if (!j) {
      u([]);
      return;
    }
    a(!0);
    try {
      const m = await v.listTasksByProject(j);
      u((m == null ? void 0 : m.data) || m || []);
    } catch {
      u([]);
    } finally {
      a(!1);
    }
  };
  W(() => {
    P();
  }, []), W(() => {
    S(n);
  }, [n]);
  const g = r.reduce((j, m) => {
    j.total += 1;
    const D = m.status ?? 0;
    return D === 0 ? j.todo += 1 : D === 1 ? j.doing += 1 : D === 2 && (j.done += 1), j;
  }, { total: 0, todo: 0, doing: 0, done: 0 }), L = g.total > 0 ? Math.round(g.done / g.total * 100) : 0, C = [1, 2, 3].map((j) => ({
    priority: j,
    list: r.filter((m) => (m.priority ?? 1) === j)
  }));
  return /* @__PURE__ */ e.jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 16 }, children: [
    /* @__PURE__ */ e.jsx(B, { children: /* @__PURE__ */ e.jsxs(T, { wrap: !0, children: [
      /* @__PURE__ */ e.jsx(Ce, { style: { fontSize: 18, color: "#1677ff" } }),
      /* @__PURE__ */ e.jsx(ce, { strong: !0, children: "选择项目：" }),
      /* @__PURE__ */ e.jsx(
        R,
        {
          value: n,
          onChange: c,
          style: { width: 280 },
          loading: d,
          placeholder: "选择项目",
          options: l.map((j) => ({ label: j.name, value: j.id }))
        }
      ),
      /* @__PURE__ */ e.jsxs("a", { onClick: () => P(), children: [
        /* @__PURE__ */ e.jsx(ye, {}),
        " 刷新项目"
      ] })
    ] }) }),
    /* @__PURE__ */ e.jsxs(xe, { spinning: o, children: [
      /* @__PURE__ */ e.jsxs(le, { gutter: 16, children: [
        /* @__PURE__ */ e.jsx(H, { span: 6, children: /* @__PURE__ */ e.jsx(B, { children: /* @__PURE__ */ e.jsx(G, { title: "总任务数", value: g.total }) }) }),
        /* @__PURE__ */ e.jsx(H, { span: 6, children: /* @__PURE__ */ e.jsx(B, { children: /* @__PURE__ */ e.jsx(
          G,
          {
            title: "待办",
            value: g.todo,
            styles: { content: { color: "#8c8c8c" } },
            prefix: /* @__PURE__ */ e.jsx(ge, {})
          }
        ) }) }),
        /* @__PURE__ */ e.jsx(H, { span: 6, children: /* @__PURE__ */ e.jsx(B, { children: /* @__PURE__ */ e.jsx(
          G,
          {
            title: "进行中",
            value: g.doing,
            styles: { content: { color: "#1677ff" } },
            prefix: /* @__PURE__ */ e.jsx(be, {})
          }
        ) }) }),
        /* @__PURE__ */ e.jsx(H, { span: 6, children: /* @__PURE__ */ e.jsx(B, { children: /* @__PURE__ */ e.jsx(
          G,
          {
            title: "已完成",
            value: g.done,
            styles: { content: { color: "#52c41a" } },
            prefix: /* @__PURE__ */ e.jsx(J, {})
          }
        ) }) })
      ] }),
      /* @__PURE__ */ e.jsx(B, { style: { marginTop: 16 }, title: "完成率", children: /* @__PURE__ */ e.jsx(ze, { percent: L, status: L === 100 ? "success" : "active" }) }),
      /* @__PURE__ */ e.jsx(le, { gutter: 16, style: { marginTop: 16 }, children: C.map(({ priority: j, list: m }) => /* @__PURE__ */ e.jsx(H, { span: 8, children: /* @__PURE__ */ e.jsx(B, { size: "small", title: /* @__PURE__ */ e.jsxs(T, { children: [
        /* @__PURE__ */ e.jsx(z, { color: j === 3 ? "red" : j === 2 ? "orange" : "default", children: j === 3 ? "高" : j === 2 ? "中" : "低" }),
        /* @__PURE__ */ e.jsxs("span", { children: [
          "优先级 (",
          m.length,
          ")"
        ] })
      ] }), children: m.length === 0 ? /* @__PURE__ */ e.jsx(Z, { image: Z.PRESENTED_IMAGE_SIMPLE, description: "无任务" }) : /* @__PURE__ */ e.jsx(
        q,
        {
          size: "small",
          dataSource: m.slice(0, 8),
          renderItem: (D) => {
            const M = de[D.status ?? 0] || de[0];
            return /* @__PURE__ */ e.jsx(q.Item, { children: /* @__PURE__ */ e.jsx(
              q.Item.Meta,
              {
                avatar: M.icon,
                title: /* @__PURE__ */ e.jsxs(T, { children: [
                  /* @__PURE__ */ e.jsx(ce, { children: D.title }),
                  /* @__PURE__ */ e.jsx(z, { color: M.color, style: { margin: 0 }, children: M.text })
                ] }),
                description: D.dueDate ? `截止: ${D.dueDate}` : "无截止时间"
              }
            ) });
          }
        }
      ) }) }, j)) })
    ] })
  ] });
}
function lt() {
  return /* @__PURE__ */ e.jsxs(Me, { children: [
    /* @__PURE__ */ e.jsx(V, { index: !0, element: /* @__PURE__ */ e.jsx(Ae, { to: "dashboard", replace: !0 }) }),
    /* @__PURE__ */ e.jsx(V, { path: "dashboard", element: /* @__PURE__ */ e.jsx(Ue, {}) }),
    /* @__PURE__ */ e.jsx(V, { path: "project", element: /* @__PURE__ */ e.jsx(re, {}) }),
    /* @__PURE__ */ e.jsx(V, { path: "project/*", element: /* @__PURE__ */ e.jsx(re, {}) }),
    /* @__PURE__ */ e.jsx(V, { path: "task", element: /* @__PURE__ */ e.jsx(oe, {}) }),
    /* @__PURE__ */ e.jsx(V, { path: "task/*", element: /* @__PURE__ */ e.jsx(oe, {}) })
  ] });
}
export {
  re as ProjectList,
  tt as ProjectSelect,
  lt as TaskApp,
  Ze as TaskCard,
  Ue as TaskDashboard,
  oe as TaskList,
  et as TaskTable,
  v as api,
  v as taskApi
};
