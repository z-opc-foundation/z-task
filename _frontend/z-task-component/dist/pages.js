import { j as e } from "./jsx-runtime-z6PQ6F3d.js";
import { Typography as N, Card as x, Space as S, Tag as C, Row as F, Col as z, Statistic as T, Input as g, Select as k, Table as B, Button as j, message as u, Form as o, DatePicker as E, Modal as $ } from "antd";
import { useNavigate as O, useParams as K, Routes as V, Route as b, Navigate as W } from "react-router-dom";
import { useState as h, useEffect as w } from "react";
import { HomeOutlined as H, DashboardOutlined as Z, AppstoreOutlined as A, FileTextOutlined as q, ClockCircleOutlined as _, CheckCircleOutlined as J, SearchOutlined as X, PlusOutlined as R, EditOutlined as D, UserOutlined as U, LockOutlined as M } from "@ant-design/icons";
import { createRequest as G } from "@yuku123/z-frontend-common";
const Ce = { title: "z-task 任务管理", short: "z-task" }, Q = [
  { key: "/z-task/home", label: "首页", icon: /* @__PURE__ */ e.jsx(H, {}) },
  { key: "/z-task/overview", label: "仪表盘", icon: /* @__PURE__ */ e.jsx(Z, {}) },
  { key: "/z-task/task", label: "任务管理", icon: /* @__PURE__ */ e.jsx(A, {}) },
  { key: "/z-task/project", label: "项目管理", icon: /* @__PURE__ */ e.jsx(A, {}) },
  { key: "/z-task/user", label: "用户管理", icon: /* @__PURE__ */ e.jsx(A, {}) }
], { Title: Y, Paragraph: ee } = N;
function te() {
  const t = O(), [l, c] = h(null);
  w(() => {
    const n = localStorage.getItem("userInfo");
    if (n)
      try {
        c(JSON.parse(n));
      } catch {
        c({ name: n });
      }
  }, []);
  const d = Q.filter((n) => n.key !== "/z-task/home");
  return /* @__PURE__ */ e.jsxs("div", { children: [
    /* @__PURE__ */ e.jsx(x, { style: { marginBottom: 16, background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)", border: "none" }, children: /* @__PURE__ */ e.jsxs(S, { direction: "vertical", size: 4, style: { color: "#fff" }, children: [
      /* @__PURE__ */ e.jsxs(Y, { level: 3, style: { color: "#fff", margin: 0 }, children: [
        "欢迎",
        l != null && l.name ? `，${l.name}` : ""
      ] }),
      /* @__PURE__ */ e.jsx(ee, { style: { color: "rgba(255,255,255,0.85)", margin: 0 }, children: "z-task 任务管理 管理台" }),
      (l == null ? void 0 : l.role) && /* @__PURE__ */ e.jsx(C, { style: { marginTop: 8, background: "rgba(255,255,255,0.2)", color: "#fff", border: "none" }, children: l.role })
    ] }) }),
    /* @__PURE__ */ e.jsx(F, { gutter: [16, 16], children: d.map((n) => /* @__PURE__ */ e.jsx(z, { xs: 24, sm: 12, md: 12, lg: 8, children: /* @__PURE__ */ e.jsx(x, { hoverable: !0, onClick: () => t(n.key), style: { borderTop: "3px solid #7c3aed" }, children: /* @__PURE__ */ e.jsxs(S, { align: "start", size: 12, children: [
      /* @__PURE__ */ e.jsx("div", { style: {
        width: 44,
        height: 44,
        borderRadius: 8,
        flexShrink: 0,
        background: "rgba(124,58,237,0.08)",
        color: "#7c3aed",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 20
      }, children: n.icon }),
      /* @__PURE__ */ e.jsxs("div", { style: { minWidth: 0 }, children: [
        /* @__PURE__ */ e.jsx("div", { style: { fontSize: 15, fontWeight: 600, color: "#0f172a" }, children: n.label }),
        /* @__PURE__ */ e.jsx("div", { style: { fontSize: 12, color: "#94a3b8", marginTop: 2 }, children: n.key })
      ] })
    ] }) }) }, n.key)) })
  ] });
}
const p = G({ baseURL: "/api" });
p.interceptors.request.use((t) => {
  const l = localStorage.getItem("userId");
  return l && (t.headers["X-User-Id"] = l), t;
});
function Te(t) {
  t && t.apiBase !== void 0 && (p.defaults.baseURL = t.apiBase);
}
const se = (t) => p.get("/api/task/list", { params: { listId: t } }), ae = (t) => p.get("/api/task/assignee/list", { params: { userId: t } }), re = (t) => p.post("/api/task/complete", null, { params: { taskId: t } }), le = (t) => p.post("/api/task/reopen", null, { params: { taskId: t } }), ne = (t) => p.get("/api/project/user/list", { params: { userId: t } }), ie = (t) => p.post("/api/project", t), oe = (t) => p.put(`/api/project/${t}/archive`);
function ce() {
  const [t, l] = h({
    total: 0,
    todo: 0,
    doing: 0,
    done: 0,
    cancelled: 0
  });
  return w(() => {
    const c = localStorage.getItem("userId") || "1";
    ae(c).then((d) => {
      const n = d.data || [];
      l({
        total: n.length,
        todo: n.filter((r) => r.status === 0).length,
        doing: n.filter((r) => r.status === 1).length,
        done: n.filter((r) => r.status === 2).length,
        cancelled: n.filter((r) => r.status === 3).length
      });
    }).catch(() => {
    });
  }, []), /* @__PURE__ */ e.jsxs("div", { children: [
    /* @__PURE__ */ e.jsx("h1", { style: { marginBottom: 24 }, children: "仪表盘" }),
    /* @__PURE__ */ e.jsxs(F, { gutter: 16, children: [
      /* @__PURE__ */ e.jsx(z, { span: 6, children: /* @__PURE__ */ e.jsx(x, { children: /* @__PURE__ */ e.jsx(
        T,
        {
          title: "总任务数",
          value: t.total,
          prefix: /* @__PURE__ */ e.jsx(q, { style: { color: "#1890ff" } })
        }
      ) }) }),
      /* @__PURE__ */ e.jsx(z, { span: 6, children: /* @__PURE__ */ e.jsx(x, { children: /* @__PURE__ */ e.jsx(
        T,
        {
          title: "待办",
          value: t.todo,
          prefix: /* @__PURE__ */ e.jsx(_, { style: { color: "#faad14" } })
        }
      ) }) }),
      /* @__PURE__ */ e.jsx(z, { span: 6, children: /* @__PURE__ */ e.jsx(x, { children: /* @__PURE__ */ e.jsx(
        T,
        {
          title: "进行中",
          value: t.doing,
          prefix: /* @__PURE__ */ e.jsx(q, { style: { color: "#1890ff" } })
        }
      ) }) }),
      /* @__PURE__ */ e.jsx(z, { span: 6, children: /* @__PURE__ */ e.jsx(x, { children: /* @__PURE__ */ e.jsx(
        T,
        {
          title: "已完成",
          value: t.done,
          prefix: /* @__PURE__ */ e.jsx(J, { style: { color: "#52c41a" } })
        }
      ) }) })
    ] })
  ] });
}
const { Search: de } = g, { Option: P } = k, ue = {
  0: { color: "gold", text: "待办" },
  1: { color: "blue", text: "进行中" },
  2: { color: "green", text: "已完成" }
}, xe = {
  0: { color: "green", text: "低" },
  1: { color: "gold", text: "中" },
  2: { color: "orange", text: "高" },
  3: { color: "red", text: "紧急" }
};
function he() {
  const t = O(), [l, c] = h([]), [d, n] = h(!1), [r, m] = h(null), s = async (a) => {
    if (a) {
      n(!0);
      try {
        const i = await se(a);
        c(i.data || []);
      } catch {
        u.error("加载任务失败");
      } finally {
        n(!1);
      }
    }
  };
  w(() => {
    r && s(r);
  }, [r]);
  const f = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80
    },
    {
      title: "任务名称",
      dataIndex: "title",
      key: "title"
    },
    {
      title: "优先级",
      dataIndex: "priority",
      key: "priority",
      render: (a) => {
        const i = xe[a] || { color: "default", text: String(a) };
        return /* @__PURE__ */ e.jsx(C, { color: i.color, children: i.text });
      }
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (a) => {
        const i = ue[a] || { color: "default", text: String(a) };
        return /* @__PURE__ */ e.jsx(C, { color: i.color, children: i.text });
      }
    },
    {
      title: "截止日期",
      dataIndex: "dueDate",
      key: "dueDate",
      render: (a) => a || "-"
    },
    {
      title: "操作",
      key: "action",
      render: (a, i) => /* @__PURE__ */ e.jsxs(S, { size: "middle", children: [
        /* @__PURE__ */ e.jsx(j, { type: "link", icon: /* @__PURE__ */ e.jsx(D, {}), onClick: () => t(`/z-task/task/edit/${i.id}`), children: "编辑" }),
        i.status === 2 ? /* @__PURE__ */ e.jsx(j, { type: "link", onClick: () => L(i.id), children: "重新打开" }) : /* @__PURE__ */ e.jsx(j, { type: "link", onClick: () => I(i.id), children: "完成" })
      ] })
    }
  ], I = async (a) => {
    try {
      await re(a), u.success("任务已完成"), s(r);
    } catch {
      u.error("操作失败");
    }
  }, L = async (a) => {
    try {
      await le(a), u.success("任务已重新打开"), s(r);
    } catch {
      u.error("操作失败");
    }
  };
  return /* @__PURE__ */ e.jsxs(
    x,
    {
      title: "任务管理",
      extra: /* @__PURE__ */ e.jsx(j, { type: "primary", icon: /* @__PURE__ */ e.jsx(R, {}), onClick: () => t("/z-task/task/edit/new"), children: "新建任务" }),
      children: [
        /* @__PURE__ */ e.jsxs("div", { style: { marginBottom: 16, display: "flex", gap: 16 }, children: [
          /* @__PURE__ */ e.jsxs(
            k,
            {
              placeholder: "选择列表",
              style: { width: 200 },
              onChange: (a) => m(a),
              allowClear: !0,
              children: [
                /* @__PURE__ */ e.jsx(P, { value: 1, children: "待办" }),
                /* @__PURE__ */ e.jsx(P, { value: 2, children: "进行中" }),
                /* @__PURE__ */ e.jsx(P, { value: 3, children: "已完成" })
              ]
            }
          ),
          /* @__PURE__ */ e.jsx(
            de,
            {
              placeholder: "搜索任务名称",
              allowClear: !0,
              enterButton: /* @__PURE__ */ e.jsx(X, {}),
              style: { width: 300 }
            }
          )
        ] }),
        /* @__PURE__ */ e.jsx(
          B,
          {
            columns: f,
            dataSource: l,
            rowKey: "id",
            loading: d
          }
        )
      ]
    }
  );
}
const { Option: y } = k, me = [
  { value: 0, label: "低" },
  { value: 1, label: "中" },
  { value: 2, label: "高" },
  { value: 3, label: "紧急" }
], je = [
  { value: 0, label: "待办" },
  { value: 1, label: "进行中" },
  { value: 2, label: "已完成" }
];
function pe() {
  const t = O(), { id: l } = K(), c = l !== "new", [d] = o.useForm(), [n, r] = h(!1);
  w(() => {
    c && l && (r(!0), r(!1));
  }, [l, c]);
  const m = async (s) => {
    try {
      u.success(c ? "任务更新成功" : "任务创建成功"), t("/z-task/task");
    } catch {
      u.error(c ? "更新失败" : "创建失败");
    }
  };
  return /* @__PURE__ */ e.jsx(x, { title: c ? "编辑任务" : "新建任务", children: /* @__PURE__ */ e.jsxs(
    o,
    {
      form: d,
      layout: "vertical",
      onFinish: m,
      initialValues: {
        status: 0,
        priority: 1
      },
      children: [
        /* @__PURE__ */ e.jsx(
          o.Item,
          {
            name: "title",
            label: "任务名称",
            rules: [{ required: !0, message: "请输入任务名称" }],
            children: /* @__PURE__ */ e.jsx(g, { placeholder: "请输入任务名称" })
          }
        ),
        /* @__PURE__ */ e.jsx(
          o.Item,
          {
            name: "projectId",
            label: "所属项目",
            rules: [{ required: !0, message: "请选择所属项目" }],
            children: /* @__PURE__ */ e.jsxs(k, { placeholder: "请选择项目", allowClear: !0, children: [
              /* @__PURE__ */ e.jsx(y, { value: 1, children: "Z-Task项目" }),
              /* @__PURE__ */ e.jsx(y, { value: 2, children: "Z-Config项目" })
            ] })
          }
        ),
        /* @__PURE__ */ e.jsx(
          o.Item,
          {
            name: "listId",
            label: "所属列表",
            rules: [{ required: !0, message: "请选择列表" }],
            children: /* @__PURE__ */ e.jsxs(k, { placeholder: "请选择列表", children: [
              /* @__PURE__ */ e.jsx(y, { value: 1, children: "待办" }),
              /* @__PURE__ */ e.jsx(y, { value: 2, children: "进行中" }),
              /* @__PURE__ */ e.jsx(y, { value: 3, children: "已完成" })
            ] })
          }
        ),
        /* @__PURE__ */ e.jsx(
          o.Item,
          {
            name: "priority",
            label: "优先级",
            children: /* @__PURE__ */ e.jsx(k, { children: me.map((s) => /* @__PURE__ */ e.jsx(y, { value: s.value, children: s.label }, s.value)) })
          }
        ),
        /* @__PURE__ */ e.jsx(
          o.Item,
          {
            name: "status",
            label: "状态",
            children: /* @__PURE__ */ e.jsx(k, { children: je.map((s) => /* @__PURE__ */ e.jsx(y, { value: s.value, children: s.label }, s.value)) })
          }
        ),
        /* @__PURE__ */ e.jsx(
          o.Item,
          {
            name: "dueDate",
            label: "截止日期",
            children: /* @__PURE__ */ e.jsx(E, { style: { width: "100%" } })
          }
        ),
        /* @__PURE__ */ e.jsx(
          o.Item,
          {
            name: "description",
            label: "任务描述",
            children: /* @__PURE__ */ e.jsx(g.TextArea, { rows: 4, placeholder: "请输入任务描述" })
          }
        ),
        /* @__PURE__ */ e.jsx(o.Item, { children: /* @__PURE__ */ e.jsxs(S, { children: [
          /* @__PURE__ */ e.jsx(j, { type: "primary", htmlType: "submit", children: c ? "更新" : "创建" }),
          /* @__PURE__ */ e.jsx(j, { onClick: () => t("/z-task/task"), children: "取消" })
        ] }) })
      ]
    }
  ) });
}
const ge = {
  0: { color: "default", text: "已归档" },
  1: { color: "green", text: "进行中" }
};
function fe() {
  const [t, l] = h([]), [c, d] = h(!1), [n, r] = h(!1), [m] = o.useForm(), s = async () => {
    d(!0);
    try {
      const a = localStorage.getItem("userId") || "1", i = await ne(a);
      l(i.data || []);
    } catch {
      u.error("加载项目失败");
    } finally {
      d(!1);
    }
  };
  w(() => {
    s();
  }, []);
  const f = async () => {
    try {
      const a = await m.validateFields();
      await ie(a), u.success("创建成功"), r(!1), m.resetFields(), s();
    } catch {
      u.error("创建失败");
    }
  }, I = async (a) => {
    try {
      await oe(a), u.success("归档成功"), s();
    } catch {
      u.error("归档失败");
    }
  }, L = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80
    },
    {
      title: "项目名称",
      dataIndex: "name",
      key: "name"
    },
    {
      title: "项目描述",
      dataIndex: "description",
      key: "description",
      render: (a) => a || "-"
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (a) => {
        const i = ge[a] || { color: "default", text: String(a) };
        return /* @__PURE__ */ e.jsx(C, { color: i.color, children: i.text });
      }
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      key: "createdAt"
    },
    {
      title: "操作",
      key: "action",
      render: (a, i) => /* @__PURE__ */ e.jsxs(S, { size: "middle", children: [
        /* @__PURE__ */ e.jsx(j, { type: "link", icon: /* @__PURE__ */ e.jsx(D, {}), children: "编辑" }),
        i.status === 1 && /* @__PURE__ */ e.jsx(j, { type: "link", danger: !0, onClick: () => I(i.id), children: "归档" })
      ] })
    }
  ];
  return /* @__PURE__ */ e.jsxs(
    x,
    {
      title: "项目管理",
      extra: /* @__PURE__ */ e.jsx(j, { type: "primary", icon: /* @__PURE__ */ e.jsx(R, {}), onClick: () => r(!0), children: "新建项目" }),
      children: [
        /* @__PURE__ */ e.jsx(
          B,
          {
            columns: L,
            dataSource: t,
            rowKey: "id",
            loading: c
          }
        ),
        /* @__PURE__ */ e.jsx(
          $,
          {
            title: "新建项目",
            open: n,
            onOk: f,
            onCancel: () => {
              r(!1), m.resetFields();
            },
            okText: "创建",
            cancelText: "取消",
            children: /* @__PURE__ */ e.jsxs(o, { form: m, layout: "vertical", children: [
              /* @__PURE__ */ e.jsx(o.Item, { name: "name", label: "项目名称", rules: [{ required: !0, message: "请输入项目名称" }], children: /* @__PURE__ */ e.jsx(g, { placeholder: "请输入项目名称" }) }),
              /* @__PURE__ */ e.jsx(o.Item, { name: "description", label: "项目描述", children: /* @__PURE__ */ e.jsx(g.TextArea, { placeholder: "请输入项目描述", rows: 3 }) })
            ] })
          }
        )
      ]
    }
  );
}
function ye() {
  const [t, l] = h([]), [c, d] = h(!1);
  w(() => {
    l([]);
  }, []);
  const n = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80
    },
    {
      title: "用户名",
      dataIndex: "username",
      key: "username"
    },
    {
      title: "昵称",
      dataIndex: "nickname",
      key: "nickname",
      render: (r) => r || "-"
    },
    {
      title: "邮箱",
      dataIndex: "email",
      key: "email"
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (r) => /* @__PURE__ */ e.jsx(C, { color: r === 1 ? "green" : "red", children: r === 1 ? "启用" : "禁用" })
    },
    {
      title: "来源",
      dataIndex: "source",
      key: "source",
      render: (r) => r || "-"
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      key: "createdAt"
    }
  ];
  return /* @__PURE__ */ e.jsx(x, { title: "用户管理", children: /* @__PURE__ */ e.jsx(
    B,
    {
      columns: n,
      dataSource: t,
      rowKey: "id",
      loading: c,
      locale: { emptyText: "暂无数据（用户由 z-ctc 统一管理）" }
    }
  ) });
}
function ke() {
  return /* @__PURE__ */ e.jsxs(V, { children: [
    /* @__PURE__ */ e.jsx(b, { index: !0, element: /* @__PURE__ */ e.jsx(W, { to: "task", replace: !0 }) }),
    /* @__PURE__ */ e.jsx(b, { path: "dashboard", element: /* @__PURE__ */ e.jsx(ce, {}) }),
    /* @__PURE__ */ e.jsx(b, { path: "task", element: /* @__PURE__ */ e.jsx(he, {}) }),
    /* @__PURE__ */ e.jsx(b, { path: "task/edit/:id?", element: /* @__PURE__ */ e.jsx(pe, {}) }),
    /* @__PURE__ */ e.jsx(b, { path: "project", element: /* @__PURE__ */ e.jsx(fe, {}) }),
    /* @__PURE__ */ e.jsx(b, { path: "user", element: /* @__PURE__ */ e.jsx(ye, {}) })
  ] });
}
function Oe() {
  const t = O(), l = async (c) => {
    var d, n, r, m;
    try {
      const s = await p.post("/auth/login", c), f = ((d = s == null ? void 0 : s.data) == null ? void 0 : d.token) ?? (s == null ? void 0 : s.token), I = ((n = s == null ? void 0 : s.data) == null ? void 0 : n.userId) ?? (s == null ? void 0 : s.userId);
      if (f && localStorage.setItem("token", f), I != null && localStorage.setItem("userId", String(I)), !f) {
        u.error("登录响应缺少 token");
        return;
      }
      u.success("登录成功"), t("/");
    } catch (s) {
      u.error("登录失败：" + (((m = (r = s.response) == null ? void 0 : r.data) == null ? void 0 : m.message) || s.message));
    }
  };
  return /* @__PURE__ */ e.jsx("div", { className: "login-container", children: /* @__PURE__ */ e.jsx(x, { title: "欢迎登录 Z-Task", className: "login-card", children: /* @__PURE__ */ e.jsxs(
    o,
    {
      name: "login",
      initialValues: { remember: !0 },
      onFinish: l,
      autoComplete: "off",
      children: [
        /* @__PURE__ */ e.jsx(
          o.Item,
          {
            name: "username",
            rules: [{ required: !0, message: "请输入用户名!" }],
            children: /* @__PURE__ */ e.jsx(g, { prefix: /* @__PURE__ */ e.jsx(U, {}), placeholder: "用户名", size: "large" })
          }
        ),
        /* @__PURE__ */ e.jsx(
          o.Item,
          {
            name: "password",
            rules: [{ required: !0, message: "请输入密码!" }],
            children: /* @__PURE__ */ e.jsx(
              g.Password,
              {
                prefix: /* @__PURE__ */ e.jsx(M, {}),
                placeholder: "密码",
                size: "large"
              }
            )
          }
        ),
        /* @__PURE__ */ e.jsx(o.Item, { children: /* @__PURE__ */ e.jsx(j, { type: "primary", htmlType: "submit", size: "large", block: !0, children: "登录" }) })
      ]
    }
  ) }) });
}
const v = { username: "admin", password: "123456", user: { name: "admin", role: "管理员" } };
function Le() {
  const [t, l] = h(!1), c = async (d) => {
    l(!0);
    try {
      d.username === v.username && d.password === v.password ? (localStorage.setItem("token", "mock-" + v.username), localStorage.setItem("userInfo", JSON.stringify(v.user)), u.success("登录成功（mock 模式，待 CTC/SSO 接入）"), window.location.href = "/z-task/home") : u.error("用户名或密码错误（默认 admin/123456）");
    } finally {
      l(!1);
    }
  };
  return /* @__PURE__ */ e.jsx("div", { style: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #eef2ff 0%, #f5f3ff 50%, #eff6ff 100%)"
  }, children: /* @__PURE__ */ e.jsxs(x, { style: { width: 400, boxShadow: "0 10px 40px rgba(124,58,237,0.12)" }, children: [
    /* @__PURE__ */ e.jsxs("div", { style: { textAlign: "center", marginBottom: 20 }, children: [
      /* @__PURE__ */ e.jsx("div", { style: {
        width: 48,
        height: 48,
        borderRadius: 12,
        margin: "0 auto 12px",
        background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontSize: 24,
        fontWeight: 700
      }, children: "z" }),
      /* @__PURE__ */ e.jsx("div", { style: { fontSize: 18, fontWeight: 600, color: "#0f172a" }, children: "z-task 管理台" })
    ] }),
    /* @__PURE__ */ e.jsxs(o, { onFinish: c, size: "large", children: [
      /* @__PURE__ */ e.jsx(o.Item, { name: "username", rules: [{ required: !0, message: "请输入用户名" }], children: /* @__PURE__ */ e.jsx(g, { prefix: /* @__PURE__ */ e.jsx(U, {}), placeholder: "用户名" }) }),
      /* @__PURE__ */ e.jsx(o.Item, { name: "password", rules: [{ required: !0, message: "请输入密码" }], children: /* @__PURE__ */ e.jsx(g.Password, { prefix: /* @__PURE__ */ e.jsx(M, {}), placeholder: "密码" }) }),
      /* @__PURE__ */ e.jsx(o.Item, { style: { marginBottom: 8 }, children: /* @__PURE__ */ e.jsx(
        j,
        {
          type: "primary",
          htmlType: "submit",
          loading: t,
          block: !0,
          style: { background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)", border: "none" },
          children: "登 录"
        }
      ) }),
      /* @__PURE__ */ e.jsxs("div", { style: { textAlign: "center", color: "#94a3b8", fontSize: 12 }, children: [
        "Mock 模式：用户名 ",
        /* @__PURE__ */ e.jsx("b", { children: v.username }),
        " / 密码 ",
        /* @__PURE__ */ e.jsx("b", { children: v.password })
      ] })
    ] })
  ] }) });
}
const Ae = [
  { path: "/z-task/home", Component: te },
  { path: "/z-task/dashboard", Component: null },
  { path: "/z-task/task", Component: null },
  { path: "/z-task/task/edit/:id?", Component: null },
  { path: "/z-task/project", Component: null },
  { path: "/z-task/user", Component: null },
  { path: "/z-task/:rest*", Component: ke }
], Pe = () => !!localStorage.getItem("token");
export {
  ce as Dashboard,
  te as HomePage,
  Oe as Login,
  Le as LoginPage,
  fe as ProjectList,
  pe as TaskEdit,
  he as TaskList,
  ye as UserList,
  Ce as appMeta,
  Te as configureTask,
  Pe as isAuthenticated,
  Q as menuItems,
  Ae as routes
};
