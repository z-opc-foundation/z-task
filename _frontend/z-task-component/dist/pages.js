import { j as e, C as U } from "./ComponentDoc-CZYjAF-k.js";
import { Typography as _, Card as j, Space as z, Tag as S, Row as E, Col as w, Statistic as T, Select as f, Button as m, message as d, Form as o, Input as k, DatePicker as F, Modal as V } from "antd";
import { useNavigate as O, useParams as N, Routes as W, Route as b, Navigate as $ } from "react-router-dom";
import { useState as x, useEffect as C } from "react";
import { HomeOutlined as H, DashboardOutlined as Z, AppstoreOutlined as P, ReadOutlined as J, FileTextOutlined as R, ClockCircleOutlined as X, CheckCircleOutlined as G, PlusOutlined as M, EditOutlined as q, UserOutlined as B, LockOutlined as K } from "@ant-design/icons";
import { createRequest as Q } from "@yuku123/z-frontend-common";
import { ListTable as D } from "@yuku123/z-frontend-common/ui";
const Te = { title: "z-task 任务管理", short: "z-task" }, Y = [
  { key: "/z-task/home", label: "首页", icon: /* @__PURE__ */ e.jsx(H, {}) },
  { key: "/z-task/dashboard", label: "仪表盘", icon: /* @__PURE__ */ e.jsx(Z, {}) },
  { key: "/z-task/task", label: "任务管理", icon: /* @__PURE__ */ e.jsx(P, {}) },
  { key: "/z-task/project", label: "项目管理", icon: /* @__PURE__ */ e.jsx(P, {}) },
  { key: "/z-task/user", label: "用户管理", icon: /* @__PURE__ */ e.jsx(P, {}) },
  { key: "/z-task/docs", label: "组件文档", icon: /* @__PURE__ */ e.jsx(J, {}) }
], { Title: ee, Paragraph: te } = _;
function se() {
  const t = O(), [n, c] = x(null);
  C(() => {
    const l = localStorage.getItem("userInfo");
    if (l)
      try {
        c(JSON.parse(l));
      } catch {
        c({ name: l });
      }
  }, []);
  const u = Y.filter((l) => l.key !== "/z-task/home");
  return /* @__PURE__ */ e.jsxs("div", { children: [
    /* @__PURE__ */ e.jsx(j, { style: { marginBottom: 16, background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)", border: "none" }, children: /* @__PURE__ */ e.jsxs(z, { direction: "vertical", size: 4, style: { color: "#fff" }, children: [
      /* @__PURE__ */ e.jsxs(ee, { level: 3, style: { color: "#fff", margin: 0 }, children: [
        "欢迎",
        n != null && n.name ? `，${n.name}` : ""
      ] }),
      /* @__PURE__ */ e.jsx(te, { style: { color: "rgba(255,255,255,0.85)", margin: 0 }, children: "z-task 任务管理 管理台" }),
      (n == null ? void 0 : n.role) && /* @__PURE__ */ e.jsx(S, { style: { marginTop: 8, background: "rgba(255,255,255,0.2)", color: "#fff", border: "none" }, children: n.role })
    ] }) }),
    /* @__PURE__ */ e.jsx(E, { gutter: [16, 16], children: u.map((l) => /* @__PURE__ */ e.jsx(w, { xs: 24, sm: 12, md: 12, lg: 8, children: /* @__PURE__ */ e.jsx(j, { hoverable: !0, onClick: () => t(l.key), style: { borderTop: "3px solid #7c3aed" }, children: /* @__PURE__ */ e.jsxs(z, { align: "start", size: 12, children: [
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
      }, children: l.icon }),
      /* @__PURE__ */ e.jsxs("div", { style: { minWidth: 0 }, children: [
        /* @__PURE__ */ e.jsx("div", { style: { fontSize: 15, fontWeight: 600, color: "#0f172a" }, children: l.label }),
        /* @__PURE__ */ e.jsx("div", { style: { fontSize: 12, color: "#94a3b8", marginTop: 2 }, children: l.key })
      ] })
    ] }) }) }, l.key)) })
  ] });
}
const p = Q({ baseURL: "/api" });
p.interceptors.request.use((t) => {
  const n = localStorage.getItem("userId");
  return n && (t.headers["X-User-Id"] = n), t;
});
function Oe(t) {
  t && t.apiBase !== void 0 && (p.defaults.baseURL = t.apiBase);
}
const ae = (t) => p.get("/api/task/list", { params: { listId: t } }), re = (t) => p.get("/api/task/assignee/list", { params: { userId: t } }), ne = (t) => p.post("/api/task/complete", null, { params: { taskId: t } }), le = (t) => p.post("/api/task/reopen", null, { params: { taskId: t } }), ie = (t) => p.get("/api/project/user/list", { params: { userId: t } }), oe = (t) => p.post("/api/project", t), ce = (t) => p.put(`/api/project/${t}/archive`);
function de() {
  const [t, n] = x({
    total: 0,
    todo: 0,
    doing: 0,
    done: 0,
    cancelled: 0
  });
  return C(() => {
    const c = localStorage.getItem("userId") || "1";
    re(c).then((u) => {
      const l = u.data || [];
      n({
        total: l.length,
        todo: l.filter((r) => r.status === 0).length,
        doing: l.filter((r) => r.status === 1).length,
        done: l.filter((r) => r.status === 2).length,
        cancelled: l.filter((r) => r.status === 3).length
      });
    }).catch(() => {
    });
  }, []), /* @__PURE__ */ e.jsxs("div", { children: [
    /* @__PURE__ */ e.jsx("h1", { style: { marginBottom: 24 }, children: "仪表盘" }),
    /* @__PURE__ */ e.jsxs(E, { gutter: 16, children: [
      /* @__PURE__ */ e.jsx(w, { span: 6, children: /* @__PURE__ */ e.jsx(j, { children: /* @__PURE__ */ e.jsx(
        T,
        {
          title: "总任务数",
          value: t.total,
          prefix: /* @__PURE__ */ e.jsx(R, { style: { color: "#1890ff" } })
        }
      ) }) }),
      /* @__PURE__ */ e.jsx(w, { span: 6, children: /* @__PURE__ */ e.jsx(j, { children: /* @__PURE__ */ e.jsx(
        T,
        {
          title: "待办",
          value: t.todo,
          prefix: /* @__PURE__ */ e.jsx(X, { style: { color: "#faad14" } })
        }
      ) }) }),
      /* @__PURE__ */ e.jsx(w, { span: 6, children: /* @__PURE__ */ e.jsx(j, { children: /* @__PURE__ */ e.jsx(
        T,
        {
          title: "进行中",
          value: t.doing,
          prefix: /* @__PURE__ */ e.jsx(R, { style: { color: "#1890ff" } })
        }
      ) }) }),
      /* @__PURE__ */ e.jsx(w, { span: 6, children: /* @__PURE__ */ e.jsx(j, { children: /* @__PURE__ */ e.jsx(
        T,
        {
          title: "已完成",
          value: t.done,
          prefix: /* @__PURE__ */ e.jsx(G, { style: { color: "#52c41a" } })
        }
      ) }) })
    ] })
  ] });
}
const { Option: A } = f, ue = {
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
  const t = O(), [n, c] = x([]), [u, l] = x(!1), [r, h] = x(null), s = async (a) => {
    if (a) {
      l(!0);
      try {
        const i = await ae(a);
        c(i.data || []);
      } catch {
        d.error("加载任务失败");
      } finally {
        l(!1);
      }
    }
  };
  C(() => {
    r && s(r);
  }, [r]);
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
      render: (a) => {
        const i = xe[a] || { color: "default", text: String(a) };
        return /* @__PURE__ */ e.jsx(S, { color: i.color, children: i.text });
      }
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (a) => {
        const i = ue[a] || { color: "default", text: String(a) };
        return /* @__PURE__ */ e.jsx(S, { color: i.color, children: i.text });
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
      render: (a, i) => /* @__PURE__ */ e.jsxs(z, { size: "middle", children: [
        /* @__PURE__ */ e.jsx(m, { type: "link", icon: /* @__PURE__ */ e.jsx(q, {}), onClick: () => t(`/z-task/task/edit/${i.id}`), children: "编辑" }),
        i.status === 2 ? /* @__PURE__ */ e.jsx(m, { type: "link", onClick: () => L(i.id), children: "重新打开" }) : /* @__PURE__ */ e.jsx(m, { type: "link", onClick: () => I(i.id), children: "完成" })
      ] })
    }
  ], I = async (a) => {
    try {
      await ne(a), d.success("任务已完成"), s(r);
    } catch {
      d.error("操作失败");
    }
  }, L = async (a) => {
    try {
      await le(a), d.success("任务已重新打开"), s(r);
    } catch {
      d.error("操作失败");
    }
  };
  return /* @__PURE__ */ e.jsxs("div", { children: [
    /* @__PURE__ */ e.jsx("div", { style: { marginBottom: 16 }, children: /* @__PURE__ */ e.jsxs(
      f,
      {
        placeholder: "选择列表",
        style: { width: 200 },
        onChange: (a) => h(a),
        allowClear: !0,
        children: [
          /* @__PURE__ */ e.jsx(A, { value: 1, children: "待办" }),
          /* @__PURE__ */ e.jsx(A, { value: 2, children: "进行中" }),
          /* @__PURE__ */ e.jsx(A, { value: 3, children: "已完成" })
        ]
      }
    ) }),
    /* @__PURE__ */ e.jsx(
      D,
      {
        columns: g,
        rows: n,
        rowKey: "id",
        loading: u,
        cardTitle: "任务管理",
        cardExtra: /* @__PURE__ */ e.jsx(m, { type: "primary", icon: /* @__PURE__ */ e.jsx(M, {}), onClick: () => t("/z-task/task/edit/new"), children: "新建任务" }),
        searchKeys: "title",
        searchPlaceholder: "搜索任务名称",
        emptyDescription: "该列表下还没有任务"
      }
    )
  ] });
}
const { Option: y } = f, me = [
  { value: 0, label: "低" },
  { value: 1, label: "中" },
  { value: 2, label: "高" },
  { value: 3, label: "紧急" }
], pe = [
  { value: 0, label: "待办" },
  { value: 1, label: "进行中" },
  { value: 2, label: "已完成" }
];
function je() {
  const t = O(), { id: n } = N(), c = n !== "new", [u] = o.useForm(), [l, r] = x(!1);
  C(() => {
    c && n && (r(!0), r(!1));
  }, [n, c]);
  const h = async (s) => {
    try {
      d.success(c ? "任务更新成功" : "任务创建成功"), t("/z-task/task");
    } catch {
      d.error(c ? "更新失败" : "创建失败");
    }
  };
  return /* @__PURE__ */ e.jsx(j, { title: c ? "编辑任务" : "新建任务", children: /* @__PURE__ */ e.jsxs(
    o,
    {
      form: u,
      layout: "vertical",
      onFinish: h,
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
            children: /* @__PURE__ */ e.jsx(k, { placeholder: "请输入任务名称" })
          }
        ),
        /* @__PURE__ */ e.jsx(
          o.Item,
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
          o.Item,
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
          o.Item,
          {
            name: "priority",
            label: "优先级",
            children: /* @__PURE__ */ e.jsx(f, { children: me.map((s) => /* @__PURE__ */ e.jsx(y, { value: s.value, children: s.label }, s.value)) })
          }
        ),
        /* @__PURE__ */ e.jsx(
          o.Item,
          {
            name: "status",
            label: "状态",
            children: /* @__PURE__ */ e.jsx(f, { children: pe.map((s) => /* @__PURE__ */ e.jsx(y, { value: s.value, children: s.label }, s.value)) })
          }
        ),
        /* @__PURE__ */ e.jsx(
          o.Item,
          {
            name: "dueDate",
            label: "截止日期",
            children: /* @__PURE__ */ e.jsx(F, { style: { width: "100%" } })
          }
        ),
        /* @__PURE__ */ e.jsx(
          o.Item,
          {
            name: "description",
            label: "任务描述",
            children: /* @__PURE__ */ e.jsx(k.TextArea, { rows: 4, placeholder: "请输入任务描述" })
          }
        ),
        /* @__PURE__ */ e.jsx(o.Item, { children: /* @__PURE__ */ e.jsxs(z, { children: [
          /* @__PURE__ */ e.jsx(m, { type: "primary", htmlType: "submit", children: c ? "更新" : "创建" }),
          /* @__PURE__ */ e.jsx(m, { onClick: () => t("/z-task/task"), children: "取消" })
        ] }) })
      ]
    }
  ) });
}
const ge = {
  0: { color: "default", text: "已归档" },
  1: { color: "green", text: "进行中" }
};
function ke() {
  const [t, n] = x([]), [c, u] = x(!1), [l, r] = x(!1), [h] = o.useForm(), s = async () => {
    u(!0);
    try {
      const a = localStorage.getItem("userId") || "1", i = await ie(a);
      n(i.data || []);
    } catch {
      d.error("加载项目失败");
    } finally {
      u(!1);
    }
  };
  C(() => {
    s();
  }, []);
  const g = async () => {
    try {
      const a = await h.validateFields();
      await oe(a), d.success("创建成功"), r(!1), h.resetFields(), s();
    } catch {
      d.error("创建失败");
    }
  }, I = async (a) => {
    try {
      await ce(a), d.success("归档成功"), s();
    } catch {
      d.error("归档失败");
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
        return /* @__PURE__ */ e.jsx(S, { color: i.color, children: i.text });
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
      render: (a, i) => /* @__PURE__ */ e.jsxs(z, { size: "middle", children: [
        /* @__PURE__ */ e.jsx(m, { type: "link", icon: /* @__PURE__ */ e.jsx(q, {}), children: "编辑" }),
        i.status === 1 && /* @__PURE__ */ e.jsx(m, { type: "link", danger: !0, onClick: () => I(i.id), children: "归档" })
      ] })
    }
  ];
  return /* @__PURE__ */ e.jsxs("div", { children: [
    /* @__PURE__ */ e.jsx(
      D,
      {
        columns: L,
        rows: t,
        rowKey: "id",
        loading: c,
        cardTitle: "项目管理",
        cardExtra: /* @__PURE__ */ e.jsx(m, { type: "primary", icon: /* @__PURE__ */ e.jsx(M, {}), onClick: () => r(!0), children: "新建项目" }),
        searchKeys: "name,description",
        searchPlaceholder: "按项目名称 / 描述过滤",
        emptyDescription: "还没有项目，新建一个开始组织任务"
      }
    ),
    /* @__PURE__ */ e.jsx(
      V,
      {
        title: "新建项目",
        open: l,
        onOk: g,
        onCancel: () => {
          r(!1), h.resetFields();
        },
        okText: "创建",
        cancelText: "取消",
        children: /* @__PURE__ */ e.jsxs(o, { form: h, layout: "vertical", children: [
          /* @__PURE__ */ e.jsx(o.Item, { name: "name", label: "项目名称", rules: [{ required: !0, message: "请输入项目名称" }], children: /* @__PURE__ */ e.jsx(k, { placeholder: "请输入项目名称" }) }),
          /* @__PURE__ */ e.jsx(o.Item, { name: "description", label: "项目描述", children: /* @__PURE__ */ e.jsx(k.TextArea, { placeholder: "请输入项目描述", rows: 3 }) })
        ] })
      }
    )
  ] });
}
function ye() {
  const [t, n] = x([]), [c, u] = x(!1);
  C(() => {
    n([]);
  }, []);
  const l = [
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
      render: (r) => /* @__PURE__ */ e.jsx(S, { color: r === 1 ? "green" : "red", children: r === 1 ? "启用" : "禁用" })
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
  return (
    /* Card + Table 合成基座 ListTable 一件：分页 / 过滤 / EmptyState 三件套一次到位 */
    /* @__PURE__ */ e.jsx(
      D,
      {
        columns: l,
        rows: t,
        rowKey: "id",
        loading: c,
        cardTitle: "用户管理",
        searchKeys: "username,nickname,email",
        searchPlaceholder: "按用户名 / 昵称 / 邮箱过滤",
        emptyDescription: "暂无数据（用户由 z-ctc 统一管理）"
      }
    )
  );
}
function fe() {
  return /* @__PURE__ */ e.jsxs(W, { children: [
    /* @__PURE__ */ e.jsx(b, { index: !0, element: /* @__PURE__ */ e.jsx($, { to: "task", replace: !0 }) }),
    /* @__PURE__ */ e.jsx(b, { path: "dashboard", element: /* @__PURE__ */ e.jsx(de, {}) }),
    /* @__PURE__ */ e.jsx(b, { path: "task", element: /* @__PURE__ */ e.jsx(he, {}) }),
    /* @__PURE__ */ e.jsx(b, { path: "task/edit/:id?", element: /* @__PURE__ */ e.jsx(je, {}) }),
    /* @__PURE__ */ e.jsx(b, { path: "project", element: /* @__PURE__ */ e.jsx(ke, {}) }),
    /* @__PURE__ */ e.jsx(b, { path: "user", element: /* @__PURE__ */ e.jsx(ye, {}) })
  ] });
}
function Le() {
  const t = O(), n = async (c) => {
    var u, l, r, h;
    try {
      const s = await p.post("/auth/login", c), g = ((u = s == null ? void 0 : s.data) == null ? void 0 : u.token) ?? (s == null ? void 0 : s.token), I = ((l = s == null ? void 0 : s.data) == null ? void 0 : l.userId) ?? (s == null ? void 0 : s.userId);
      if (g && localStorage.setItem("token", g), I != null && localStorage.setItem("userId", String(I)), !g) {
        d.error("登录响应缺少 token");
        return;
      }
      d.success("登录成功"), t("/");
    } catch (s) {
      d.error("登录失败：" + (((h = (r = s.response) == null ? void 0 : r.data) == null ? void 0 : h.message) || s.message));
    }
  };
  return /* @__PURE__ */ e.jsx("div", { className: "login-container", children: /* @__PURE__ */ e.jsx(j, { title: "欢迎登录 Z-Task", className: "login-card", children: /* @__PURE__ */ e.jsxs(
    o,
    {
      name: "login",
      initialValues: { remember: !0 },
      onFinish: n,
      autoComplete: "off",
      children: [
        /* @__PURE__ */ e.jsx(
          o.Item,
          {
            name: "username",
            rules: [{ required: !0, message: "请输入用户名!" }],
            children: /* @__PURE__ */ e.jsx(k, { prefix: /* @__PURE__ */ e.jsx(B, {}), placeholder: "用户名", size: "large" })
          }
        ),
        /* @__PURE__ */ e.jsx(
          o.Item,
          {
            name: "password",
            rules: [{ required: !0, message: "请输入密码!" }],
            children: /* @__PURE__ */ e.jsx(
              k.Password,
              {
                prefix: /* @__PURE__ */ e.jsx(K, {}),
                placeholder: "密码",
                size: "large"
              }
            )
          }
        ),
        /* @__PURE__ */ e.jsx(o.Item, { children: /* @__PURE__ */ e.jsx(m, { type: "primary", htmlType: "submit", size: "large", block: !0, children: "登录" }) })
      ]
    }
  ) }) });
}
const v = {
  username: "",
  password: "",
  user: { name: "", role: "管理员" }
};
function Pe() {
  const [t, n] = x(!1), c = async (u) => {
    n(!0);
    try {
      if (!v.username || !v.password) {
        d.error("未配置 mock 账号（VITE_MOCK_USER / VITE_MOCK_PASSWORD）");
        return;
      }
      u.username === v.username && u.password === v.password ? (localStorage.setItem("token", "mock-" + v.username), localStorage.setItem("userInfo", JSON.stringify(v.user)), d.success("登录成功（mock 模式，待 CTC/SSO 接入）"), window.location.href = "/z-task/home") : d.error("用户名或密码错误");
    } finally {
      n(!1);
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
    /* @__PURE__ */ e.jsxs(o, { onFinish: c, size: "large", children: [
      /* @__PURE__ */ e.jsx(o.Item, { name: "username", rules: [{ required: !0, message: "请输入用户名" }], children: /* @__PURE__ */ e.jsx(k, { prefix: /* @__PURE__ */ e.jsx(B, {}), placeholder: "用户名" }) }),
      /* @__PURE__ */ e.jsx(o.Item, { name: "password", rules: [{ required: !0, message: "请输入密码" }], children: /* @__PURE__ */ e.jsx(k.Password, { prefix: /* @__PURE__ */ e.jsx(K, {}), placeholder: "密码" }) }),
      /* @__PURE__ */ e.jsx(o.Item, { style: { marginBottom: 8 }, children: /* @__PURE__ */ e.jsx(
        m,
        {
          type: "primary",
          htmlType: "submit",
          loading: t,
          block: !0,
          style: { background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)", border: "none" },
          children: "登 录"
        }
      ) }),
      /* @__PURE__ */ e.jsx("div", { style: { textAlign: "center", color: "#94a3b8", fontSize: 12 }, children: "Mock 模式：账号由宿主注入（VITE_MOCK_USER / VITE_MOCK_PASSWORD）" })
    ] })
  ] }) });
}
const Ae = [
  { path: "/z-task/home", Component: se },
  { path: "/z-task/dashboard", Component: null },
  { path: "/z-task/task", Component: null },
  { path: "/z-task/task/edit/:id?", Component: null },
  { path: "/z-task/project", Component: null },
  { path: "/z-task/user", Component: null },
  { path: "/z-task/docs", Component: U },
  { path: "/z-task/:rest*", Component: fe }
], De = () => !!localStorage.getItem("token");
export {
  U as ComponentDocPage,
  de as Dashboard,
  se as HomePage,
  Le as Login,
  Pe as LoginPage,
  ke as ProjectList,
  je as TaskEdit,
  he as TaskList,
  ye as UserList,
  Te as appMeta,
  Oe as configureTask,
  De as isAuthenticated,
  Y as menuItems,
  Ae as routes
};
