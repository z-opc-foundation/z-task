import { jsx as e, jsxs as d } from "react/jsx-runtime";
import { Typography as U, Card as k, Space as T, Tag as S, Row as M, Col as w, Statistic as O, Select as I, Button as p, message as h, Form as u, Input as f, DatePicker as V, Modal as B, App as N } from "antd";
import { useNavigate as P, useParams as $, Routes as W, Route as z, Navigate as H } from "react-router-dom";
import { useState as m, useEffect as C, useCallback as E } from "react";
import { HomeOutlined as Z, DashboardOutlined as J, AppstoreOutlined as j, CheckSquareOutlined as G, ReadOutlined as Q, FileTextOutlined as F, ClockCircleOutlined as X, CheckCircleOutlined as Y, PlusOutlined as K, EditOutlined as R, UserOutlined as _, LockOutlined as q } from "@ant-design/icons";
import { p as b, T as ee, C as te } from "./ComponentDoc-BAAWP_t3.js";
import { f as Re } from "./ComponentDoc-BAAWP_t3.js";
import { ListTable as L } from "@yuku123/z-frontend-common/ui";
const Le = { title: "z-task 任务管理", short: "z-task" }, ae = [
  { key: "/z-task/home", label: "首页", icon: /* @__PURE__ */ e(Z, {}) },
  { key: "/z-task/dashboard", label: "仪表盘", desc: "任务量、完成率与近期趋势", icon: /* @__PURE__ */ e(J, {}) },
  { key: "/z-task/task", label: "任务管理", desc: "任务列表、状态流转与负责人", icon: /* @__PURE__ */ e(j, {}) },
  { key: "/z-task/project", label: "项目管理", desc: "按项目归置任务与进度", icon: /* @__PURE__ */ e(j, {}) },
  { key: "/z-task/user", label: "用户管理", desc: "成员账号与角色", icon: /* @__PURE__ */ e(j, {}) },
  { key: "/z-task/todo", label: "待办", desc: "事项、状态列与 Agent 派发", icon: /* @__PURE__ */ e(G, {}) },
  { key: "/z-task/docs", label: "组件文档", icon: /* @__PURE__ */ e(Q, {}) }
], { Title: ne, Paragraph: re } = U;
function le() {
  const a = P(), [r, o] = m(null);
  C(() => {
    const l = localStorage.getItem("userInfo");
    if (l)
      try {
        o(JSON.parse(l));
      } catch {
        o({ name: l });
      }
  }, []);
  const c = ae.filter((l) => l.key !== "/z-task/home");
  return /* @__PURE__ */ d("div", { children: [
    /* @__PURE__ */ e(k, { style: { marginBottom: 16, background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)", border: "none" }, children: /* @__PURE__ */ d(T, { direction: "vertical", size: 4, style: { color: "#fff" }, children: [
      /* @__PURE__ */ d(ne, { level: 3, style: { color: "#fff", margin: 0 }, children: [
        "欢迎",
        r != null && r.name ? `，${r.name}` : ""
      ] }),
      /* @__PURE__ */ e(re, { style: { color: "rgba(255,255,255,0.85)", margin: 0 }, children: "z-task 任务管理 管理台" }),
      (r == null ? void 0 : r.role) && /* @__PURE__ */ e(S, { style: { marginTop: 8, background: "rgba(255,255,255,0.2)", color: "#fff", border: "none" }, children: r.role })
    ] }) }),
    /* @__PURE__ */ e(M, { gutter: [16, 16], children: c.map((l) => /* @__PURE__ */ e(w, { xs: 24, sm: 12, md: 12, lg: 8, children: /* @__PURE__ */ e(k, { hoverable: !0, onClick: () => a(l.key), style: { borderTop: "3px solid #7c3aed" }, children: /* @__PURE__ */ d(T, { align: "start", size: 12, children: [
      /* @__PURE__ */ e("div", { style: {
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
      /* @__PURE__ */ d("div", { style: { minWidth: 0 }, children: [
        /* @__PURE__ */ e("div", { style: { fontSize: 15, fontWeight: 600, color: "#0f172a" }, children: l.label }),
        /* @__PURE__ */ e("div", { style: { fontSize: 12, color: "#94a3b8", marginTop: 2 }, children: l.desc || l.label })
      ] })
    ] }) }) }, l.key)) })
  ] });
}
const ie = (a) => b.get("/api/task/list", { params: { listId: a } }), oe = (a) => b.get("/api/task/assignee/list", { params: { userId: a } }), se = (a) => b.post("/api/task/complete", null, { params: { taskId: a } }), ce = (a) => b.post("/api/task/reopen", null, { params: { taskId: a } }), de = (a) => b.get("/api/project/user/list", { params: { userId: a } }), ue = (a) => b.post("/api/project", a), he = (a) => b.put(`/api/project/${a}/archive`);
function me() {
  const [a, r] = m({
    total: 0,
    todo: 0,
    doing: 0,
    done: 0,
    cancelled: 0
  });
  return C(() => {
    const o = localStorage.getItem("userId") || "1";
    oe(o).then((c) => {
      const l = c.data || [];
      r({
        total: l.length,
        todo: l.filter((t) => t.status === 0).length,
        doing: l.filter((t) => t.status === 1).length,
        done: l.filter((t) => t.status === 2).length,
        cancelled: l.filter((t) => t.status === 3).length
      });
    }).catch(() => {
    });
  }, []), /* @__PURE__ */ d("div", { children: [
    /* @__PURE__ */ e("h1", { style: { marginBottom: 24 }, children: "仪表盘" }),
    /* @__PURE__ */ d(M, { gutter: 16, children: [
      /* @__PURE__ */ e(w, { span: 6, children: /* @__PURE__ */ e(k, { children: /* @__PURE__ */ e(
        O,
        {
          title: "总任务数",
          value: a.total,
          prefix: /* @__PURE__ */ e(F, { style: { color: "#1890ff" } })
        }
      ) }) }),
      /* @__PURE__ */ e(w, { span: 6, children: /* @__PURE__ */ e(k, { children: /* @__PURE__ */ e(
        O,
        {
          title: "待办",
          value: a.todo,
          prefix: /* @__PURE__ */ e(X, { style: { color: "#faad14" } })
        }
      ) }) }),
      /* @__PURE__ */ e(w, { span: 6, children: /* @__PURE__ */ e(k, { children: /* @__PURE__ */ e(
        O,
        {
          title: "进行中",
          value: a.doing,
          prefix: /* @__PURE__ */ e(F, { style: { color: "#1890ff" } })
        }
      ) }) }),
      /* @__PURE__ */ e(w, { span: 6, children: /* @__PURE__ */ e(k, { children: /* @__PURE__ */ e(
        O,
        {
          title: "已完成",
          value: a.done,
          prefix: /* @__PURE__ */ e(Y, { style: { color: "#52c41a" } })
        }
      ) }) })
    ] })
  ] });
}
const { Option: A } = I, pe = {
  0: { color: "gold", text: "待办" },
  1: { color: "blue", text: "进行中" },
  2: { color: "green", text: "已完成" }
}, ge = {
  0: { color: "green", text: "低" },
  1: { color: "gold", text: "中" },
  2: { color: "orange", text: "高" },
  3: { color: "red", text: "紧急" }
};
function ke() {
  const a = P(), [r, o] = m([]), [c, l] = m(!1), [t, g] = m(null), n = async (i) => {
    if (i) {
      l(!0);
      try {
        const s = await ie(i);
        o(s.data || []);
      } catch {
        h.error("加载任务失败");
      } finally {
        l(!1);
      }
    }
  };
  C(() => {
    t && n(t);
  }, [t]);
  const y = [
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
      render: (i) => {
        const s = ge[i] || { color: "default", text: String(i) };
        return /* @__PURE__ */ e(S, { color: s.color, children: s.text });
      }
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (i) => {
        const s = pe[i] || { color: "default", text: String(i) };
        return /* @__PURE__ */ e(S, { color: s.color, children: s.text });
      }
    },
    {
      title: "截止日期",
      dataIndex: "dueDate",
      key: "dueDate",
      render: (i) => i || "-"
    },
    {
      title: "操作",
      key: "action",
      render: (i, s) => /* @__PURE__ */ d(T, { size: "middle", children: [
        /* @__PURE__ */ e(p, { type: "link", icon: /* @__PURE__ */ e(R, {}), onClick: () => a(`/z-task/task/edit/${s.id}`), children: "编辑" }),
        s.status === 2 ? /* @__PURE__ */ e(p, { type: "link", onClick: () => D(s.id), children: "重新打开" }) : /* @__PURE__ */ e(p, { type: "link", onClick: () => v(s.id), children: "完成" })
      ] })
    }
  ], v = async (i) => {
    try {
      await se(i), h.success("任务已完成"), n(t);
    } catch {
      h.error("操作失败");
    }
  }, D = async (i) => {
    try {
      await ce(i), h.success("任务已重新打开"), n(t);
    } catch {
      h.error("操作失败");
    }
  };
  return /* @__PURE__ */ d("div", { children: [
    /* @__PURE__ */ e("div", { style: { marginBottom: 16 }, children: /* @__PURE__ */ d(
      I,
      {
        placeholder: "选择列表",
        style: { width: 200 },
        onChange: (i) => g(i),
        allowClear: !0,
        children: [
          /* @__PURE__ */ e(A, { value: 1, children: "待办" }),
          /* @__PURE__ */ e(A, { value: 2, children: "进行中" }),
          /* @__PURE__ */ e(A, { value: 3, children: "已完成" })
        ]
      }
    ) }),
    /* @__PURE__ */ e(
      L,
      {
        columns: y,
        rows: r,
        rowKey: "id",
        loading: c,
        cardTitle: "任务管理",
        cardExtra: /* @__PURE__ */ e(p, { type: "primary", icon: /* @__PURE__ */ e(K, {}), onClick: () => a("/z-task/task/edit/new"), children: "新建任务" }),
        searchKeys: "title",
        searchPlaceholder: "搜索任务名称",
        emptyDescription: "该列表下还没有任务"
      }
    )
  ] });
}
const { Option: x } = I, ye = [
  { value: 0, label: "低" },
  { value: 1, label: "中" },
  { value: 2, label: "高" },
  { value: 3, label: "紧急" }
], fe = [
  { value: 0, label: "待办" },
  { value: 1, label: "进行中" },
  { value: 2, label: "已完成" }
];
function be() {
  const a = P(), { id: r } = $(), o = r !== "new", [c] = u.useForm(), [l, t] = m(!1);
  return C(() => {
    o && r && (t(!0), t(!1));
  }, [r, o]), /* @__PURE__ */ e(k, { title: o ? "编辑任务" : "新建任务", children: /* @__PURE__ */ d(
    u,
    {
      form: c,
      layout: "vertical",
      onFinish: async (n) => {
        try {
          h.success(o ? "任务更新成功" : "任务创建成功"), a("/z-task/task");
        } catch {
          h.error(o ? "更新失败" : "创建失败");
        }
      },
      initialValues: {
        status: 0,
        priority: 1
      },
      children: [
        /* @__PURE__ */ e(
          u.Item,
          {
            name: "title",
            label: "任务名称",
            rules: [{ required: !0, message: "请输入任务名称" }],
            children: /* @__PURE__ */ e(f, { placeholder: "请输入任务名称" })
          }
        ),
        /* @__PURE__ */ e(
          u.Item,
          {
            name: "projectId",
            label: "所属项目",
            rules: [{ required: !0, message: "请选择所属项目" }],
            children: /* @__PURE__ */ d(I, { placeholder: "请选择项目", allowClear: !0, children: [
              /* @__PURE__ */ e(x, { value: 1, children: "Z-Task项目" }),
              /* @__PURE__ */ e(x, { value: 2, children: "Z-Config项目" })
            ] })
          }
        ),
        /* @__PURE__ */ e(
          u.Item,
          {
            name: "listId",
            label: "所属列表",
            rules: [{ required: !0, message: "请选择列表" }],
            children: /* @__PURE__ */ d(I, { placeholder: "请选择列表", children: [
              /* @__PURE__ */ e(x, { value: 1, children: "待办" }),
              /* @__PURE__ */ e(x, { value: 2, children: "进行中" }),
              /* @__PURE__ */ e(x, { value: 3, children: "已完成" })
            ] })
          }
        ),
        /* @__PURE__ */ e(
          u.Item,
          {
            name: "priority",
            label: "优先级",
            children: /* @__PURE__ */ e(I, { children: ye.map((n) => /* @__PURE__ */ e(x, { value: n.value, children: n.label }, n.value)) })
          }
        ),
        /* @__PURE__ */ e(
          u.Item,
          {
            name: "status",
            label: "状态",
            children: /* @__PURE__ */ e(I, { children: fe.map((n) => /* @__PURE__ */ e(x, { value: n.value, children: n.label }, n.value)) })
          }
        ),
        /* @__PURE__ */ e(
          u.Item,
          {
            name: "dueDate",
            label: "截止日期",
            children: /* @__PURE__ */ e(V, { style: { width: "100%" } })
          }
        ),
        /* @__PURE__ */ e(
          u.Item,
          {
            name: "description",
            label: "任务描述",
            children: /* @__PURE__ */ e(f.TextArea, { rows: 4, placeholder: "请输入任务描述" })
          }
        ),
        /* @__PURE__ */ e(u.Item, { children: /* @__PURE__ */ d(T, { children: [
          /* @__PURE__ */ e(p, { type: "primary", htmlType: "submit", children: o ? "更新" : "创建" }),
          /* @__PURE__ */ e(p, { onClick: () => a("/z-task/task"), children: "取消" })
        ] }) })
      ]
    }
  ) });
}
const xe = {
  0: { color: "default", text: "已归档" },
  1: { color: "green", text: "进行中" }
};
function Ie() {
  const [a, r] = m([]), [o, c] = m(!1), [l, t] = m(!1), [g] = u.useForm(), n = async () => {
    c(!0);
    try {
      const i = localStorage.getItem("userId") || "1", s = await de(i);
      r(s.data || []);
    } catch {
      h.error("加载项目失败");
    } finally {
      c(!1);
    }
  };
  C(() => {
    n();
  }, []);
  const y = async () => {
    try {
      const i = await g.validateFields();
      await ue(i), h.success("创建成功"), t(!1), g.resetFields(), n();
    } catch {
      h.error("创建失败");
    }
  }, v = async (i) => {
    try {
      await he(i), h.success("归档成功"), n();
    } catch {
      h.error("归档失败");
    }
  };
  return /* @__PURE__ */ d("div", { children: [
    /* @__PURE__ */ e(
      L,
      {
        columns: [
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
            render: (i) => i || "-"
          },
          {
            title: "状态",
            dataIndex: "status",
            key: "status",
            render: (i) => {
              const s = xe[i] || { color: "default", text: String(i) };
              return /* @__PURE__ */ e(S, { color: s.color, children: s.text });
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
            render: (i, s) => /* @__PURE__ */ d(T, { size: "middle", children: [
              /* @__PURE__ */ e(p, { type: "link", icon: /* @__PURE__ */ e(R, {}), children: "编辑" }),
              s.status === 1 && /* @__PURE__ */ e(p, { type: "link", danger: !0, onClick: () => v(s.id), children: "归档" })
            ] })
          }
        ],
        rows: a,
        rowKey: "id",
        loading: o,
        cardTitle: "项目管理",
        cardExtra: /* @__PURE__ */ e(p, { type: "primary", icon: /* @__PURE__ */ e(K, {}), onClick: () => t(!0), children: "新建项目" }),
        searchKeys: "name,description",
        searchPlaceholder: "按项目名称 / 描述过滤",
        emptyDescription: "还没有项目，新建一个开始组织任务"
      }
    ),
    /* @__PURE__ */ e(
      B,
      {
        title: "新建项目",
        open: l,
        onOk: y,
        onCancel: () => {
          t(!1), g.resetFields();
        },
        okText: "创建",
        cancelText: "取消",
        children: /* @__PURE__ */ d(u, { form: g, layout: "vertical", children: [
          /* @__PURE__ */ e(u.Item, { name: "name", label: "项目名称", rules: [{ required: !0, message: "请输入项目名称" }], children: /* @__PURE__ */ e(f, { placeholder: "请输入项目名称" }) }),
          /* @__PURE__ */ e(u.Item, { name: "description", label: "项目描述", children: /* @__PURE__ */ e(f.TextArea, { placeholder: "请输入项目描述", rows: 3 }) })
        ] })
      }
    )
  ] });
}
function ve() {
  const [a, r] = m([]), [o, c] = m(!1);
  return C(() => {
    r([]);
  }, []), /* Card + Table 合成基座 ListTable 一件：分页 / 过滤 / EmptyState 三件套一次到位 */
  /* @__PURE__ */ e(
    L,
    {
      columns: [
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
          render: (t) => t || "-"
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
          render: (t) => /* @__PURE__ */ e(S, { color: t === 1 ? "green" : "red", children: t === 1 ? "启用" : "禁用" })
        },
        {
          title: "来源",
          dataIndex: "source",
          key: "source",
          render: (t) => t || "-"
        },
        {
          title: "创建时间",
          dataIndex: "createdAt",
          key: "createdAt"
        }
      ],
      rows: a,
      rowKey: "id",
      loading: o,
      cardTitle: "用户管理",
      searchKeys: "username,nickname,email",
      searchPlaceholder: "按用户名 / 昵称 / 邮箱过滤",
      emptyDescription: "暂无数据（用户由 z-ctc 统一管理）"
    }
  );
}
function ze() {
  return /* @__PURE__ */ d(W, { children: [
    /* @__PURE__ */ e(z, { index: !0, element: /* @__PURE__ */ e(H, { to: "task", replace: !0 }) }),
    /* @__PURE__ */ e(z, { path: "dashboard", element: /* @__PURE__ */ e(me, {}) }),
    /* @__PURE__ */ e(z, { path: "task", element: /* @__PURE__ */ e(ke, {}) }),
    /* @__PURE__ */ e(z, { path: "task/edit/:id?", element: /* @__PURE__ */ e(be, {}) }),
    /* @__PURE__ */ e(z, { path: "project", element: /* @__PURE__ */ e(Ie, {}) }),
    /* @__PURE__ */ e(z, { path: "user", element: /* @__PURE__ */ e(ve, {}) })
  ] });
}
function Ce() {
  const { message: a } = N.useApp(), [r, o] = m(null), c = E((t) => {
    o({
      title: "个人笔记在 z-team 侧",
      body: `笔记 ${t} 属于 z-team 的个人工作台。在独立 z-task 壳里打不开 —— 请到「个人工作台 → 笔记」查看。`
    });
  }, []), l = E((t) => {
    o({
      title: "群聊项目在 z-team 侧",
      body: `项目 ${t} 是 z-team 的群聊场景实例。在独立 z-task 壳里打不开 —— 请到「个人工作台 → 群聊」查看。`
    });
  }, []);
  return /* @__PURE__ */ d("div", { style: { height: "100%", minHeight: 0, display: "flex", flexDirection: "column" }, children: [
    /* @__PURE__ */ e(
      ee,
      {
        onOpenProject: l,
        onOpenNote: c
      }
    ),
    /* @__PURE__ */ e(
      B,
      {
        open: !!r,
        title: r == null ? void 0 : r.title,
        onCancel: () => o(null),
        onOk: () => o(null),
        okText: "知道了",
        cancelButtonProps: { style: { display: "none" } },
        children: /* @__PURE__ */ e("p", { style: { marginBottom: 0 }, children: r == null ? void 0 : r.body })
      }
    )
  ] });
}
function De() {
  const a = P();
  return /* @__PURE__ */ e("div", { className: "login-container", children: /* @__PURE__ */ e(k, { title: "欢迎登录 Z-Task", className: "login-card", children: /* @__PURE__ */ d(
    u,
    {
      name: "login",
      initialValues: { remember: !0 },
      onFinish: async (o) => {
        var c, l, t, g;
        try {
          const n = await b.post("/auth/login", o), y = ((c = n == null ? void 0 : n.data) == null ? void 0 : c.token) ?? (n == null ? void 0 : n.token), v = ((l = n == null ? void 0 : n.data) == null ? void 0 : l.userId) ?? (n == null ? void 0 : n.userId);
          if (y && localStorage.setItem("token", y), v != null && localStorage.setItem("userId", String(v)), !y) {
            h.error("登录响应缺少 token");
            return;
          }
          h.success("登录成功"), a("/");
        } catch (n) {
          h.error("登录失败：" + (((g = (t = n.response) == null ? void 0 : t.data) == null ? void 0 : g.message) || n.message));
        }
      },
      autoComplete: "off",
      children: [
        /* @__PURE__ */ e(
          u.Item,
          {
            name: "username",
            rules: [{ required: !0, message: "请输入用户名!" }],
            children: /* @__PURE__ */ e(f, { prefix: /* @__PURE__ */ e(_, {}), placeholder: "用户名", size: "large" })
          }
        ),
        /* @__PURE__ */ e(
          u.Item,
          {
            name: "password",
            rules: [{ required: !0, message: "请输入密码!" }],
            children: /* @__PURE__ */ e(
              f.Password,
              {
                prefix: /* @__PURE__ */ e(q, {}),
                placeholder: "密码",
                size: "large"
              }
            )
          }
        ),
        /* @__PURE__ */ e(u.Item, { children: /* @__PURE__ */ e(p, { type: "primary", htmlType: "submit", size: "large", block: !0, children: "登录" }) })
      ]
    }
  ) }) });
}
function Ee({ mockAuth: a } = {}) {
  const [r, o] = m(!1), c = a || {
    username: "",
    password: "",
    user: { name: "", role: "管理员" }
  };
  return /* @__PURE__ */ e("div", { style: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #eef2ff 0%, #f5f3ff 50%, #eff6ff 100%)"
  }, children: /* @__PURE__ */ d(k, { style: { width: 400, boxShadow: "0 10px 40px rgba(124,58,237,0.12)" }, children: [
    /* @__PURE__ */ d("div", { style: { textAlign: "center", marginBottom: 20 }, children: [
      /* @__PURE__ */ e("div", { style: {
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
      /* @__PURE__ */ e("div", { style: { fontSize: 18, fontWeight: 600, color: "#0f172a" }, children: "z-task 管理台" })
    ] }),
    /* @__PURE__ */ d(u, { onFinish: async (t) => {
      o(!0);
      try {
        if (!c.username || !c.password) {
          h.error("未配置 mock 账号（VITE_MOCK_USER / VITE_MOCK_PASSWORD）");
          return;
        }
        t.username === c.username && t.password === c.password ? (localStorage.setItem("token", "mock-" + c.username), localStorage.setItem("userInfo", JSON.stringify(c.user)), h.success("登录成功（mock 模式，待 CTC/SSO 接入）"), window.location.href = "/z-task/home") : h.error("用户名或密码错误");
      } finally {
        o(!1);
      }
    }, size: "large", children: [
      /* @__PURE__ */ e(u.Item, { name: "username", rules: [{ required: !0, message: "请输入用户名" }], children: /* @__PURE__ */ e(f, { prefix: /* @__PURE__ */ e(_, {}), placeholder: "用户名" }) }),
      /* @__PURE__ */ e(u.Item, { name: "password", rules: [{ required: !0, message: "请输入密码" }], children: /* @__PURE__ */ e(f.Password, { prefix: /* @__PURE__ */ e(q, {}), placeholder: "密码" }) }),
      /* @__PURE__ */ e(u.Item, { style: { marginBottom: 8 }, children: /* @__PURE__ */ e(
        p,
        {
          type: "primary",
          htmlType: "submit",
          loading: r,
          block: !0,
          style: { background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)", border: "none" },
          children: "登 录"
        }
      ) }),
      /* @__PURE__ */ e("div", { style: { textAlign: "center", color: "#94a3b8", fontSize: 12 }, children: "Mock 模式：账号由宿主注入（VITE_MOCK_USER / VITE_MOCK_PASSWORD）" })
    ] })
  ] }) });
}
const Fe = [
  { path: "/z-task/home", Component: le },
  { path: "/z-task/dashboard", Component: null },
  { path: "/z-task/task", Component: null },
  { path: "/z-task/task/edit/:id?", Component: null },
  { path: "/z-task/project", Component: null },
  { path: "/z-task/user", Component: null },
  // 待办（2026-11-02 从 z-team 迁入）：待办能力归属 z-task，
  // 但「打开笔记 / 打开群聊项目」两个回调的宿主在 z-team ⇒ 由 TodoPage 做降级适配。
  { path: "/z-task/todo", Component: Ce },
  { path: "/z-task/docs", Component: te },
  { path: "/z-task/:rest*", Component: ze }
], Me = () => !!localStorage.getItem("token");
export {
  te as ComponentDocPage,
  me as Dashboard,
  le as HomePage,
  De as Login,
  Ee as LoginPage,
  Ie as ProjectList,
  be as TaskEdit,
  ke as TaskList,
  Ce as TodoPage,
  ve as UserList,
  Le as appMeta,
  Re as configureTask,
  Me as isAuthenticated,
  ae as menuItems,
  Fe as routes
};
