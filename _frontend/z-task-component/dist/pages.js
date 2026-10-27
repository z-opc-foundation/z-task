import { j as e, C as K } from "./ComponentDoc-CZYjAF-k.js";
import { Typography as U, Card as j, Space as w, Tag as z, Row as R, Col as C, Statistic as S, Select as f, Button as m, message as u, Form as c, Input as k, DatePicker as _, Modal as F } from "antd";
import { useNavigate as T, useParams as V, Routes as N, Route as b, Navigate as W } from "react-router-dom";
import { useState as x, useEffect as v } from "react";
import { HomeOutlined as $, DashboardOutlined as H, AppstoreOutlined as L, ReadOutlined as Z, FileTextOutlined as D, ClockCircleOutlined as J, CheckCircleOutlined as X, PlusOutlined as E, EditOutlined as M, UserOutlined as q, LockOutlined as B } from "@ant-design/icons";
import { createRequest as G } from "@yuku123/z-frontend-common";
import { ListTable as A } from "@yuku123/z-frontend-common/ui";
const Se = { title: "z-task 任务管理", short: "z-task" }, Q = [
  { key: "/z-task/home", label: "首页", icon: /* @__PURE__ */ e.jsx($, {}) },
  { key: "/z-task/dashboard", label: "仪表盘", desc: "任务量、完成率与近期趋势", icon: /* @__PURE__ */ e.jsx(H, {}) },
  { key: "/z-task/task", label: "任务管理", desc: "任务列表、状态流转与负责人", icon: /* @__PURE__ */ e.jsx(L, {}) },
  { key: "/z-task/project", label: "项目管理", desc: "按项目归置任务与进度", icon: /* @__PURE__ */ e.jsx(L, {}) },
  { key: "/z-task/user", label: "用户管理", desc: "成员账号与角色", icon: /* @__PURE__ */ e.jsx(L, {}) },
  { key: "/z-task/docs", label: "组件文档", icon: /* @__PURE__ */ e.jsx(Z, {}) }
], { Title: Y, Paragraph: ee } = U;
function te() {
  const t = T(), [l, o] = x(null);
  v(() => {
    const r = localStorage.getItem("userInfo");
    if (r)
      try {
        o(JSON.parse(r));
      } catch {
        o({ name: r });
      }
  }, []);
  const d = Q.filter((r) => r.key !== "/z-task/home");
  return /* @__PURE__ */ e.jsxs("div", { children: [
    /* @__PURE__ */ e.jsx(j, { style: { marginBottom: 16, background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)", border: "none" }, children: /* @__PURE__ */ e.jsxs(w, { direction: "vertical", size: 4, style: { color: "#fff" }, children: [
      /* @__PURE__ */ e.jsxs(Y, { level: 3, style: { color: "#fff", margin: 0 }, children: [
        "欢迎",
        l != null && l.name ? `，${l.name}` : ""
      ] }),
      /* @__PURE__ */ e.jsx(ee, { style: { color: "rgba(255,255,255,0.85)", margin: 0 }, children: "z-task 任务管理 管理台" }),
      (l == null ? void 0 : l.role) && /* @__PURE__ */ e.jsx(z, { style: { marginTop: 8, background: "rgba(255,255,255,0.2)", color: "#fff", border: "none" }, children: l.role })
    ] }) }),
    /* @__PURE__ */ e.jsx(R, { gutter: [16, 16], children: d.map((r) => /* @__PURE__ */ e.jsx(C, { xs: 24, sm: 12, md: 12, lg: 8, children: /* @__PURE__ */ e.jsx(j, { hoverable: !0, onClick: () => t(r.key), style: { borderTop: "3px solid #7c3aed" }, children: /* @__PURE__ */ e.jsxs(w, { align: "start", size: 12, children: [
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
      }, children: r.icon }),
      /* @__PURE__ */ e.jsxs("div", { style: { minWidth: 0 }, children: [
        /* @__PURE__ */ e.jsx("div", { style: { fontSize: 15, fontWeight: 600, color: "#0f172a" }, children: r.label }),
        /* @__PURE__ */ e.jsx("div", { style: { fontSize: 12, color: "#94a3b8", marginTop: 2 }, children: r.desc || r.label })
      ] })
    ] }) }) }, r.key)) })
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
const se = (t) => p.get("/api/task/list", { params: { listId: t } }), ae = (t) => p.get("/api/task/assignee/list", { params: { userId: t } }), re = (t) => p.post("/api/task/complete", null, { params: { taskId: t } }), ne = (t) => p.post("/api/task/reopen", null, { params: { taskId: t } }), le = (t) => p.get("/api/project/user/list", { params: { userId: t } }), ie = (t) => p.post("/api/project", t), oe = (t) => p.put(`/api/project/${t}/archive`);
function ce() {
  const [t, l] = x({
    total: 0,
    todo: 0,
    doing: 0,
    done: 0,
    cancelled: 0
  });
  return v(() => {
    const o = localStorage.getItem("userId") || "1";
    ae(o).then((d) => {
      const r = d.data || [];
      l({
        total: r.length,
        todo: r.filter((s) => s.status === 0).length,
        doing: r.filter((s) => s.status === 1).length,
        done: r.filter((s) => s.status === 2).length,
        cancelled: r.filter((s) => s.status === 3).length
      });
    }).catch(() => {
    });
  }, []), /* @__PURE__ */ e.jsxs("div", { children: [
    /* @__PURE__ */ e.jsx("h1", { style: { marginBottom: 24 }, children: "仪表盘" }),
    /* @__PURE__ */ e.jsxs(R, { gutter: 16, children: [
      /* @__PURE__ */ e.jsx(C, { span: 6, children: /* @__PURE__ */ e.jsx(j, { children: /* @__PURE__ */ e.jsx(
        S,
        {
          title: "总任务数",
          value: t.total,
          prefix: /* @__PURE__ */ e.jsx(D, { style: { color: "#1890ff" } })
        }
      ) }) }),
      /* @__PURE__ */ e.jsx(C, { span: 6, children: /* @__PURE__ */ e.jsx(j, { children: /* @__PURE__ */ e.jsx(
        S,
        {
          title: "待办",
          value: t.todo,
          prefix: /* @__PURE__ */ e.jsx(J, { style: { color: "#faad14" } })
        }
      ) }) }),
      /* @__PURE__ */ e.jsx(C, { span: 6, children: /* @__PURE__ */ e.jsx(j, { children: /* @__PURE__ */ e.jsx(
        S,
        {
          title: "进行中",
          value: t.doing,
          prefix: /* @__PURE__ */ e.jsx(D, { style: { color: "#1890ff" } })
        }
      ) }) }),
      /* @__PURE__ */ e.jsx(C, { span: 6, children: /* @__PURE__ */ e.jsx(j, { children: /* @__PURE__ */ e.jsx(
        S,
        {
          title: "已完成",
          value: t.done,
          prefix: /* @__PURE__ */ e.jsx(X, { style: { color: "#52c41a" } })
        }
      ) }) })
    ] })
  ] });
}
const { Option: P } = f, de = {
  0: { color: "gold", text: "待办" },
  1: { color: "blue", text: "进行中" },
  2: { color: "green", text: "已完成" }
}, ue = {
  0: { color: "green", text: "低" },
  1: { color: "gold", text: "中" },
  2: { color: "orange", text: "高" },
  3: { color: "red", text: "紧急" }
};
function xe() {
  const t = T(), [l, o] = x([]), [d, r] = x(!1), [s, h] = x(null), a = async (n) => {
    if (n) {
      r(!0);
      try {
        const i = await se(n);
        o(i.data || []);
      } catch {
        u.error("加载任务失败");
      } finally {
        r(!1);
      }
    }
  };
  v(() => {
    s && a(s);
  }, [s]);
  const g = [
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
      render: (n) => {
        const i = ue[n] || { color: "default", text: String(n) };
        return /* @__PURE__ */ e.jsx(z, { color: i.color, children: i.text });
      }
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (n) => {
        const i = de[n] || { color: "default", text: String(n) };
        return /* @__PURE__ */ e.jsx(z, { color: i.color, children: i.text });
      }
    },
    {
      title: "截止日期",
      dataIndex: "dueDate",
      key: "dueDate",
      render: (n) => n || "-"
    },
    {
      title: "操作",
      key: "action",
      render: (n, i) => /* @__PURE__ */ e.jsxs(w, { size: "middle", children: [
        /* @__PURE__ */ e.jsx(m, { type: "link", icon: /* @__PURE__ */ e.jsx(M, {}), onClick: () => t(`/z-task/task/edit/${i.id}`), children: "编辑" }),
        i.status === 2 ? /* @__PURE__ */ e.jsx(m, { type: "link", onClick: () => O(i.id), children: "重新打开" }) : /* @__PURE__ */ e.jsx(m, { type: "link", onClick: () => I(i.id), children: "完成" })
      ] })
    }
  ], I = async (n) => {
    try {
      await re(n), u.success("任务已完成"), a(s);
    } catch {
      u.error("操作失败");
    }
  }, O = async (n) => {
    try {
      await ne(n), u.success("任务已重新打开"), a(s);
    } catch {
      u.error("操作失败");
    }
  };
  return /* @__PURE__ */ e.jsxs("div", { children: [
    /* @__PURE__ */ e.jsx("div", { style: { marginBottom: 16 }, children: /* @__PURE__ */ e.jsxs(
      f,
      {
        placeholder: "选择列表",
        style: { width: 200 },
        onChange: (n) => h(n),
        allowClear: !0,
        children: [
          /* @__PURE__ */ e.jsx(P, { value: 1, children: "待办" }),
          /* @__PURE__ */ e.jsx(P, { value: 2, children: "进行中" }),
          /* @__PURE__ */ e.jsx(P, { value: 3, children: "已完成" })
        ]
      }
    ) }),
    /* @__PURE__ */ e.jsx(
      A,
      {
        columns: g,
        rows: l,
        rowKey: "id",
        loading: d,
        cardTitle: "任务管理",
        cardExtra: /* @__PURE__ */ e.jsx(m, { type: "primary", icon: /* @__PURE__ */ e.jsx(E, {}), onClick: () => t("/z-task/task/edit/new"), children: "新建任务" }),
        searchKeys: "title",
        searchPlaceholder: "搜索任务名称",
        emptyDescription: "该列表下还没有任务"
      }
    )
  ] });
}
const { Option: y } = f, he = [
  { value: 0, label: "低" },
  { value: 1, label: "中" },
  { value: 2, label: "高" },
  { value: 3, label: "紧急" }
], me = [
  { value: 0, label: "待办" },
  { value: 1, label: "进行中" },
  { value: 2, label: "已完成" }
];
function pe() {
  const t = T(), { id: l } = V(), o = l !== "new", [d] = c.useForm(), [r, s] = x(!1);
  v(() => {
    o && l && (s(!0), s(!1));
  }, [l, o]);
  const h = async (a) => {
    try {
      u.success(o ? "任务更新成功" : "任务创建成功"), t("/z-task/task");
    } catch {
      u.error(o ? "更新失败" : "创建失败");
    }
  };
  return /* @__PURE__ */ e.jsx(j, { title: o ? "编辑任务" : "新建任务", children: /* @__PURE__ */ e.jsxs(
    c,
    {
      form: d,
      layout: "vertical",
      onFinish: h,
      initialValues: {
        status: 0,
        priority: 1
      },
      children: [
        /* @__PURE__ */ e.jsx(
          c.Item,
          {
            name: "title",
            label: "任务名称",
            rules: [{ required: !0, message: "请输入任务名称" }],
            children: /* @__PURE__ */ e.jsx(k, { placeholder: "请输入任务名称" })
          }
        ),
        /* @__PURE__ */ e.jsx(
          c.Item,
          {
            name: "projectId",
            label: "所属项目",
            rules: [{ required: !0, message: "请选择所属项目" }],
            children: /* @__PURE__ */ e.jsxs(f, { placeholder: "请选择项目", allowClear: !0, children: [
              /* @__PURE__ */ e.jsx(y, { value: 1, children: "Z-Task项目" }),
              /* @__PURE__ */ e.jsx(y, { value: 2, children: "Z-Config项目" })
            ] })
          }
        ),
        /* @__PURE__ */ e.jsx(
          c.Item,
          {
            name: "listId",
            label: "所属列表",
            rules: [{ required: !0, message: "请选择列表" }],
            children: /* @__PURE__ */ e.jsxs(f, { placeholder: "请选择列表", children: [
              /* @__PURE__ */ e.jsx(y, { value: 1, children: "待办" }),
              /* @__PURE__ */ e.jsx(y, { value: 2, children: "进行中" }),
              /* @__PURE__ */ e.jsx(y, { value: 3, children: "已完成" })
            ] })
          }
        ),
        /* @__PURE__ */ e.jsx(
          c.Item,
          {
            name: "priority",
            label: "优先级",
            children: /* @__PURE__ */ e.jsx(f, { children: he.map((a) => /* @__PURE__ */ e.jsx(y, { value: a.value, children: a.label }, a.value)) })
          }
        ),
        /* @__PURE__ */ e.jsx(
          c.Item,
          {
            name: "status",
            label: "状态",
            children: /* @__PURE__ */ e.jsx(f, { children: me.map((a) => /* @__PURE__ */ e.jsx(y, { value: a.value, children: a.label }, a.value)) })
          }
        ),
        /* @__PURE__ */ e.jsx(
          c.Item,
          {
            name: "dueDate",
            label: "截止日期",
            children: /* @__PURE__ */ e.jsx(_, { style: { width: "100%" } })
          }
        ),
        /* @__PURE__ */ e.jsx(
          c.Item,
          {
            name: "description",
            label: "任务描述",
            children: /* @__PURE__ */ e.jsx(k.TextArea, { rows: 4, placeholder: "请输入任务描述" })
          }
        ),
        /* @__PURE__ */ e.jsx(c.Item, { children: /* @__PURE__ */ e.jsxs(w, { children: [
          /* @__PURE__ */ e.jsx(m, { type: "primary", htmlType: "submit", children: o ? "更新" : "创建" }),
          /* @__PURE__ */ e.jsx(m, { onClick: () => t("/z-task/task"), children: "取消" })
        ] }) })
      ]
    }
  ) });
}
const je = {
  0: { color: "default", text: "已归档" },
  1: { color: "green", text: "进行中" }
};
function ge() {
  const [t, l] = x([]), [o, d] = x(!1), [r, s] = x(!1), [h] = c.useForm(), a = async () => {
    d(!0);
    try {
      const n = localStorage.getItem("userId") || "1", i = await le(n);
      l(i.data || []);
    } catch {
      u.error("加载项目失败");
    } finally {
      d(!1);
    }
  };
  v(() => {
    a();
  }, []);
  const g = async () => {
    try {
      const n = await h.validateFields();
      await ie(n), u.success("创建成功"), s(!1), h.resetFields(), a();
    } catch {
      u.error("创建失败");
    }
  }, I = async (n) => {
    try {
      await oe(n), u.success("归档成功"), a();
    } catch {
      u.error("归档失败");
    }
  }, O = [
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
      render: (n) => n || "-"
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (n) => {
        const i = je[n] || { color: "default", text: String(n) };
        return /* @__PURE__ */ e.jsx(z, { color: i.color, children: i.text });
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
      render: (n, i) => /* @__PURE__ */ e.jsxs(w, { size: "middle", children: [
        /* @__PURE__ */ e.jsx(m, { type: "link", icon: /* @__PURE__ */ e.jsx(M, {}), children: "编辑" }),
        i.status === 1 && /* @__PURE__ */ e.jsx(m, { type: "link", danger: !0, onClick: () => I(i.id), children: "归档" })
      ] })
    }
  ];
  return /* @__PURE__ */ e.jsxs("div", { children: [
    /* @__PURE__ */ e.jsx(
      A,
      {
        columns: O,
        rows: t,
        rowKey: "id",
        loading: o,
        cardTitle: "项目管理",
        cardExtra: /* @__PURE__ */ e.jsx(m, { type: "primary", icon: /* @__PURE__ */ e.jsx(E, {}), onClick: () => s(!0), children: "新建项目" }),
        searchKeys: "name,description",
        searchPlaceholder: "按项目名称 / 描述过滤",
        emptyDescription: "还没有项目，新建一个开始组织任务"
      }
    ),
    /* @__PURE__ */ e.jsx(
      F,
      {
        title: "新建项目",
        open: r,
        onOk: g,
        onCancel: () => {
          s(!1), h.resetFields();
        },
        okText: "创建",
        cancelText: "取消",
        children: /* @__PURE__ */ e.jsxs(c, { form: h, layout: "vertical", children: [
          /* @__PURE__ */ e.jsx(c.Item, { name: "name", label: "项目名称", rules: [{ required: !0, message: "请输入项目名称" }], children: /* @__PURE__ */ e.jsx(k, { placeholder: "请输入项目名称" }) }),
          /* @__PURE__ */ e.jsx(c.Item, { name: "description", label: "项目描述", children: /* @__PURE__ */ e.jsx(k.TextArea, { placeholder: "请输入项目描述", rows: 3 }) })
        ] })
      }
    )
  ] });
}
function ke() {
  const [t, l] = x([]), [o, d] = x(!1);
  v(() => {
    l([]);
  }, []);
  const r = [
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
      render: (s) => s || "-"
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
      render: (s) => /* @__PURE__ */ e.jsx(z, { color: s === 1 ? "green" : "red", children: s === 1 ? "启用" : "禁用" })
    },
    {
      title: "来源",
      dataIndex: "source",
      key: "source",
      render: (s) => s || "-"
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      key: "createdAt"
    }
  ];
  return (
    /* Card + Table 合成基座 ListTable 一件：分页 / 过滤 / EmptyState 三件套一次到位 */
    /* @__PURE__ */ e.jsx(
      A,
      {
        columns: r,
        rows: t,
        rowKey: "id",
        loading: o,
        cardTitle: "用户管理",
        searchKeys: "username,nickname,email",
        searchPlaceholder: "按用户名 / 昵称 / 邮箱过滤",
        emptyDescription: "暂无数据（用户由 z-ctc 统一管理）"
      }
    )
  );
}
function ye() {
  return /* @__PURE__ */ e.jsxs(N, { children: [
    /* @__PURE__ */ e.jsx(b, { index: !0, element: /* @__PURE__ */ e.jsx(W, { to: "task", replace: !0 }) }),
    /* @__PURE__ */ e.jsx(b, { path: "dashboard", element: /* @__PURE__ */ e.jsx(ce, {}) }),
    /* @__PURE__ */ e.jsx(b, { path: "task", element: /* @__PURE__ */ e.jsx(xe, {}) }),
    /* @__PURE__ */ e.jsx(b, { path: "task/edit/:id?", element: /* @__PURE__ */ e.jsx(pe, {}) }),
    /* @__PURE__ */ e.jsx(b, { path: "project", element: /* @__PURE__ */ e.jsx(ge, {}) }),
    /* @__PURE__ */ e.jsx(b, { path: "user", element: /* @__PURE__ */ e.jsx(ke, {}) })
  ] });
}
function Oe() {
  const t = T(), l = async (o) => {
    var d, r, s, h;
    try {
      const a = await p.post("/auth/login", o), g = ((d = a == null ? void 0 : a.data) == null ? void 0 : d.token) ?? (a == null ? void 0 : a.token), I = ((r = a == null ? void 0 : a.data) == null ? void 0 : r.userId) ?? (a == null ? void 0 : a.userId);
      if (g && localStorage.setItem("token", g), I != null && localStorage.setItem("userId", String(I)), !g) {
        u.error("登录响应缺少 token");
        return;
      }
      u.success("登录成功"), t("/");
    } catch (a) {
      u.error("登录失败：" + (((h = (s = a.response) == null ? void 0 : s.data) == null ? void 0 : h.message) || a.message));
    }
  };
  return /* @__PURE__ */ e.jsx("div", { className: "login-container", children: /* @__PURE__ */ e.jsx(j, { title: "欢迎登录 Z-Task", className: "login-card", children: /* @__PURE__ */ e.jsxs(
    c,
    {
      name: "login",
      initialValues: { remember: !0 },
      onFinish: l,
      autoComplete: "off",
      children: [
        /* @__PURE__ */ e.jsx(
          c.Item,
          {
            name: "username",
            rules: [{ required: !0, message: "请输入用户名!" }],
            children: /* @__PURE__ */ e.jsx(k, { prefix: /* @__PURE__ */ e.jsx(q, {}), placeholder: "用户名", size: "large" })
          }
        ),
        /* @__PURE__ */ e.jsx(
          c.Item,
          {
            name: "password",
            rules: [{ required: !0, message: "请输入密码!" }],
            children: /* @__PURE__ */ e.jsx(
              k.Password,
              {
                prefix: /* @__PURE__ */ e.jsx(B, {}),
                placeholder: "密码",
                size: "large"
              }
            )
          }
        ),
        /* @__PURE__ */ e.jsx(c.Item, { children: /* @__PURE__ */ e.jsx(m, { type: "primary", htmlType: "submit", size: "large", block: !0, children: "登录" }) })
      ]
    }
  ) }) });
}
function Le({ mockAuth: t } = {}) {
  const [l, o] = x(!1), d = t || {
    username: "",
    password: "",
    user: { name: "", role: "管理员" }
  }, r = async (s) => {
    o(!0);
    try {
      if (!d.username || !d.password) {
        u.error("未配置 mock 账号（VITE_MOCK_USER / VITE_MOCK_PASSWORD）");
        return;
      }
      s.username === d.username && s.password === d.password ? (localStorage.setItem("token", "mock-" + d.username), localStorage.setItem("userInfo", JSON.stringify(d.user)), u.success("登录成功（mock 模式，待 CTC/SSO 接入）"), window.location.href = "/z-task/home") : u.error("用户名或密码错误");
    } finally {
      o(!1);
    }
  };
  return /* @__PURE__ */ e.jsx("div", { style: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #eef2ff 0%, #f5f3ff 50%, #eff6ff 100%)"
  }, children: /* @__PURE__ */ e.jsxs(j, { style: { width: 400, boxShadow: "0 10px 40px rgba(124,58,237,0.12)" }, children: [
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
    /* @__PURE__ */ e.jsxs(c, { onFinish: r, size: "large", children: [
      /* @__PURE__ */ e.jsx(c.Item, { name: "username", rules: [{ required: !0, message: "请输入用户名" }], children: /* @__PURE__ */ e.jsx(k, { prefix: /* @__PURE__ */ e.jsx(q, {}), placeholder: "用户名" }) }),
      /* @__PURE__ */ e.jsx(c.Item, { name: "password", rules: [{ required: !0, message: "请输入密码" }], children: /* @__PURE__ */ e.jsx(k.Password, { prefix: /* @__PURE__ */ e.jsx(B, {}), placeholder: "密码" }) }),
      /* @__PURE__ */ e.jsx(c.Item, { style: { marginBottom: 8 }, children: /* @__PURE__ */ e.jsx(
        m,
        {
          type: "primary",
          htmlType: "submit",
          loading: l,
          block: !0,
          style: { background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)", border: "none" },
          children: "登 录"
        }
      ) }),
      /* @__PURE__ */ e.jsx("div", { style: { textAlign: "center", color: "#94a3b8", fontSize: 12 }, children: "Mock 模式：账号由宿主注入（VITE_MOCK_USER / VITE_MOCK_PASSWORD）" })
    ] })
  ] }) });
}
const Pe = [
  { path: "/z-task/home", Component: te },
  { path: "/z-task/dashboard", Component: null },
  { path: "/z-task/task", Component: null },
  { path: "/z-task/task/edit/:id?", Component: null },
  { path: "/z-task/project", Component: null },
  { path: "/z-task/user", Component: null },
  { path: "/z-task/docs", Component: K },
  { path: "/z-task/:rest*", Component: ye }
], Ae = () => !!localStorage.getItem("token");
export {
  K as ComponentDocPage,
  ce as Dashboard,
  te as HomePage,
  Oe as Login,
  Le as LoginPage,
  ge as ProjectList,
  pe as TaskEdit,
  xe as TaskList,
  ke as UserList,
  Se as appMeta,
  Te as configureTask,
  Ae as isAuthenticated,
  Q as menuItems,
  Pe as routes
};
