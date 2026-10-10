import Te, { useState as y, useEffect as O } from "react";
import { Row as le, Col as P, Card as k, Statistic as Y, Input as R, Select as I, Table as G, Button as v, message as j, Tag as z, Space as N, Form as h, DatePicker as Ee, Modal as _e, Typography as Ie } from "antd";
import { FileTextOutlined as re, ClockCircleOutlined as Re, CheckCircleOutlined as we, SearchOutlined as Se, PlusOutlined as oe, EditOutlined as ie, UserOutlined as Oe, LockOutlined as Ce, HomeOutlined as Ae, DashboardOutlined as Pe, AppstoreOutlined as B } from "@ant-design/icons";
import { h as ze, i as Ne, c as Le, k as Fe, g as Ye, e as $e, b as De, n as Me } from "./api-BEl7ApRU.js";
import { d as pt } from "./api-BEl7ApRU.js";
import { useNavigate as D, useParams as qe } from "react-router-dom";
var $ = { exports: {} }, C = {};
/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var ae;
function Ue() {
  if (ae) return C;
  ae = 1;
  var c = Symbol.for("react.transitional.element"), o = Symbol.for("react.fragment");
  function d(f, a, r) {
    var p = null;
    if (r !== void 0 && (p = "" + r), a.key !== void 0 && (p = "" + a.key), "key" in a) {
      r = {};
      for (var n in a)
        n !== "key" && (r[n] = a[n]);
    } else r = a;
    return a = r.ref, {
      $$typeof: c,
      type: f,
      key: p,
      ref: a !== void 0 ? a : null,
      props: r
    };
  }
  return C.Fragment = o, C.jsx = d, C.jsxs = d, C;
}
var A = {};
/**
 * @license React
 * react-jsx-runtime.development.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var ne;
function We() {
  return ne || (ne = 1, process.env.NODE_ENV !== "production" && (function() {
    function c(t) {
      if (t == null) return null;
      if (typeof t == "function")
        return t.$$typeof === ge ? null : t.displayName || t.name || null;
      if (typeof t == "string") return t;
      switch (t) {
        case M:
          return "Fragment";
        case ue:
          return "Profiler";
        case de:
          return "StrictMode";
        case he:
          return "Suspense";
        case pe:
          return "SuspenseList";
        case ke:
          return "Activity";
        case ye:
          return "ViewTransition";
      }
      if (typeof t == "object")
        switch (typeof t.tag == "number" && console.error(
          "Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."
        ), t.$$typeof) {
          case ce:
            return "Portal";
          case me:
            return t.displayName || "Context";
          case fe:
            return (t._context.displayName || "Context") + ".Consumer";
          case xe:
            var s = t.render;
            return t = t.displayName, t || (t = s.displayName || s.name || "", t = t !== "" ? "ForwardRef(" + t + ")" : "ForwardRef"), t;
          case je:
            return s = t.displayName || null, s !== null ? s : c(t.type) || "Memo";
          case q:
            s = t._payload, t = t._init;
            try {
              return c(t(s));
            } catch {
            }
        }
      return null;
    }
    function o(t) {
      return "" + t;
    }
    function d(t) {
      try {
        o(t);
        var s = !1;
      } catch {
        s = !0;
      }
      if (s) {
        s = console;
        var u = s.error, m = typeof Symbol == "function" && Symbol.toStringTag && t[Symbol.toStringTag] || t.constructor.name || "Object";
        return u.call(
          s,
          "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.",
          m
        ), o(t);
      }
    }
    function f(t) {
      if (t === M) return "<>";
      if (typeof t == "object" && t !== null && t.$$typeof === q)
        return "<...>";
      try {
        var s = c(t);
        return s ? "<" + s + ">" : "<...>";
      } catch {
        return "<...>";
      }
    }
    function a() {
      var t = U.A;
      return t === null ? null : t.getOwner();
    }
    function r() {
      return Error("react-stack-top-frame");
    }
    function p(t) {
      if (Z.call(t, "key")) {
        var s = Object.getOwnPropertyDescriptor(t, "key").get;
        if (s && s.isReactWarning) return !1;
      }
      return t.key !== void 0;
    }
    function n(t, s) {
      function u() {
        H || (H = !0, console.error(
          "%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)",
          s
        ));
      }
      u.isReactWarning = !0, Object.defineProperty(t, "key", {
        get: u,
        configurable: !0
      });
    }
    function g() {
      var t = c(this.type);
      return K[t] || (K[t] = !0, console.error(
        "Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."
      )), t = this.props.ref, t !== void 0 ? t : null;
    }
    function T(t, s, u, m, E, b) {
      var x = u.ref;
      return t = {
        $$typeof: X,
        type: t,
        key: s,
        props: u,
        _owner: m
      }, (x !== void 0 ? x : null) !== null ? Object.defineProperty(t, "ref", {
        enumerable: !1,
        get: g
      }) : Object.defineProperty(t, "ref", { enumerable: !1, value: null }), t._store = {}, Object.defineProperty(t._store, "validated", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: 0
      }), Object.defineProperty(t, "_debugInfo", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: null
      }), Object.defineProperty(t, "_debugStack", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: E
      }), Object.defineProperty(t, "_debugTask", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: b
      }), Object.freeze && (Object.freeze(t.props), Object.freeze(t)), t;
    }
    function w(t, s, u, m, E, b) {
      var x = s.children;
      if (x !== void 0)
        if (m)
          if (ve(x)) {
            for (m = 0; m < x.length; m++)
              l(x[m]);
            Object.freeze && Object.freeze(x);
          } else
            console.error(
              "React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead."
            );
        else l(x);
      if (Z.call(s, "key")) {
        x = c(t);
        var S = Object.keys(s).filter(function(be) {
          return be !== "key";
        });
        m = 0 < S.length ? "{key: someKey, " + S.join(": ..., ") + ": ...}" : "{key: someKey}", te[x + m] || (S = 0 < S.length ? "{" + S.join(": ..., ") + ": ...}" : "{}", console.error(
          `A props object containing a "key" prop is being spread into JSX:
  let props = %s;
  <%s {...props} />
React keys must be passed directly to JSX without using spread:
  let props = %s;
  <%s key={someKey} {...props} />`,
          m,
          x,
          S,
          x
        ), te[x + m] = !0);
      }
      if (x = null, u !== void 0 && (d(u), x = "" + u), p(s) && (d(s.key), x = "" + s.key), "key" in s) {
        u = {};
        for (var V in s)
          V !== "key" && (u[V] = s[V]);
      } else u = s;
      return x && n(
        u,
        typeof t == "function" ? t.displayName || t.name || "Unknown" : t
      ), T(
        t,
        x,
        u,
        a(),
        E,
        b
      );
    }
    function l(t) {
      i(t) ? t._store && (t._store.validated = 1) : typeof t == "object" && t !== null && t.$$typeof === q && (t._payload.status === "fulfilled" ? i(t._payload.value) && t._payload.value._store && (t._payload.value._store.validated = 1) : t._store && (t._store.validated = 1));
    }
    function i(t) {
      return typeof t == "object" && t !== null && t.$$typeof === X;
    }
    var F = Te, X = Symbol.for("react.transitional.element"), ce = Symbol.for("react.portal"), M = Symbol.for("react.fragment"), de = Symbol.for("react.strict_mode"), ue = Symbol.for("react.profiler"), fe = Symbol.for("react.consumer"), me = Symbol.for("react.context"), xe = Symbol.for("react.forward_ref"), he = Symbol.for("react.suspense"), pe = Symbol.for("react.suspense_list"), je = Symbol.for("react.memo"), q = Symbol.for("react.lazy"), ke = Symbol.for("react.activity"), ye = Symbol.for("react.view_transition"), ge = Symbol.for("react.client.reference"), U = F.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, Z = Object.prototype.hasOwnProperty, ve = Array.isArray, W = console.createTask ? console.createTask : function() {
      return null;
    };
    F = {
      react_stack_bottom_frame: function(t) {
        return t();
      }
    };
    var H, K = {}, Q = F.react_stack_bottom_frame.bind(
      F,
      r
    )(), ee = W(f(r)), te = {};
    A.Fragment = M, A.jsx = function(t, s, u) {
      var m = 1e4 > U.recentlyCreatedOwnerStacks++;
      if (m) {
        var E = Error.stackTraceLimit;
        Error.stackTraceLimit = 10;
        var b = Error("react-stack-top-frame");
        Error.stackTraceLimit = E;
      } else b = Q;
      return w(
        t,
        s,
        u,
        !1,
        b,
        m ? W(f(t)) : ee
      );
    }, A.jsxs = function(t, s, u) {
      var m = 1e4 > U.recentlyCreatedOwnerStacks++;
      if (m) {
        var E = Error.stackTraceLimit;
        Error.stackTraceLimit = 10;
        var b = Error("react-stack-top-frame");
        Error.stackTraceLimit = E;
      } else b = Q;
      return w(
        t,
        s,
        u,
        !0,
        b,
        m ? W(f(t)) : ee
      );
    };
  })()), A;
}
var se;
function Ve() {
  return se || (se = 1, process.env.NODE_ENV === "production" ? $.exports = Ue() : $.exports = We()), $.exports;
}
var e = Ve();
function Be() {
  const [c, o] = y({
    total: 0,
    todo: 0,
    doing: 0,
    done: 0,
    cancelled: 0
  });
  return O(() => {
    const d = localStorage.getItem("userId") || "1";
    ze(d).then((f) => {
      const a = f.data || [];
      o({
        total: a.length,
        todo: a.filter((r) => r.status === 0).length,
        doing: a.filter((r) => r.status === 1).length,
        done: a.filter((r) => r.status === 2).length,
        cancelled: a.filter((r) => r.status === 3).length
      });
    }).catch(() => {
    });
  }, []), /* @__PURE__ */ e.jsxs("div", { children: [
    /* @__PURE__ */ e.jsx("h1", { style: { marginBottom: 24 }, children: "仪表盘" }),
    /* @__PURE__ */ e.jsxs(le, { gutter: 16, children: [
      /* @__PURE__ */ e.jsx(P, { span: 6, children: /* @__PURE__ */ e.jsx(k, { children: /* @__PURE__ */ e.jsx(
        Y,
        {
          title: "总任务数",
          value: c.total,
          prefix: /* @__PURE__ */ e.jsx(re, { style: { color: "#1890ff" } })
        }
      ) }) }),
      /* @__PURE__ */ e.jsx(P, { span: 6, children: /* @__PURE__ */ e.jsx(k, { children: /* @__PURE__ */ e.jsx(
        Y,
        {
          title: "待办",
          value: c.todo,
          prefix: /* @__PURE__ */ e.jsx(Re, { style: { color: "#faad14" } })
        }
      ) }) }),
      /* @__PURE__ */ e.jsx(P, { span: 6, children: /* @__PURE__ */ e.jsx(k, { children: /* @__PURE__ */ e.jsx(
        Y,
        {
          title: "进行中",
          value: c.doing,
          prefix: /* @__PURE__ */ e.jsx(re, { style: { color: "#1890ff" } })
        }
      ) }) }),
      /* @__PURE__ */ e.jsx(P, { span: 6, children: /* @__PURE__ */ e.jsx(k, { children: /* @__PURE__ */ e.jsx(
        Y,
        {
          title: "已完成",
          value: c.done,
          prefix: /* @__PURE__ */ e.jsx(we, { style: { color: "#52c41a" } })
        }
      ) }) })
    ] })
  ] });
}
const { Search: Je } = R, { Option: J } = I, Ge = {
  0: { color: "gold", text: "待办" },
  1: { color: "blue", text: "进行中" },
  2: { color: "green", text: "已完成" }
}, Xe = {
  0: { color: "green", text: "低" },
  1: { color: "gold", text: "中" },
  2: { color: "orange", text: "高" },
  3: { color: "red", text: "紧急" }
};
function Ze() {
  const c = D(), [o, d] = y([]), [f, a] = y(!1), [r, p] = y(null), n = async (l) => {
    if (l) {
      a(!0);
      try {
        const i = await Ne(l);
        d(i.data || []);
      } catch {
        j.error("加载任务失败");
      } finally {
        a(!1);
      }
    }
  };
  O(() => {
    r && n(r);
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
      render: (l) => {
        const i = Xe[l] || { color: "default", text: String(l) };
        return /* @__PURE__ */ e.jsx(z, { color: i.color, children: i.text });
      }
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (l) => {
        const i = Ge[l] || { color: "default", text: String(l) };
        return /* @__PURE__ */ e.jsx(z, { color: i.color, children: i.text });
      }
    },
    {
      title: "截止日期",
      dataIndex: "dueDate",
      key: "dueDate",
      render: (l) => l || "-"
    },
    {
      title: "操作",
      key: "action",
      render: (l, i) => /* @__PURE__ */ e.jsxs(N, { size: "middle", children: [
        /* @__PURE__ */ e.jsx(v, { type: "link", icon: /* @__PURE__ */ e.jsx(ie, {}), onClick: () => c(`/z-task/task/edit/${i.id}`), children: "编辑" }),
        i.status === 2 ? /* @__PURE__ */ e.jsx(v, { type: "link", onClick: () => w(i.id), children: "重新打开" }) : /* @__PURE__ */ e.jsx(v, { type: "link", onClick: () => T(i.id), children: "完成" })
      ] })
    }
  ], T = async (l) => {
    try {
      await Le(l), j.success("任务已完成"), n(r);
    } catch {
      j.error("操作失败");
    }
  }, w = async (l) => {
    try {
      await Fe(l), j.success("任务已重新打开"), n(r);
    } catch {
      j.error("操作失败");
    }
  };
  return /* @__PURE__ */ e.jsxs(
    k,
    {
      title: "任务管理",
      extra: /* @__PURE__ */ e.jsx(v, { type: "primary", icon: /* @__PURE__ */ e.jsx(oe, {}), onClick: () => c("/z-task/task/edit/new"), children: "新建任务" }),
      children: [
        /* @__PURE__ */ e.jsxs("div", { style: { marginBottom: 16, display: "flex", gap: 16 }, children: [
          /* @__PURE__ */ e.jsxs(
            I,
            {
              placeholder: "选择列表",
              style: { width: 200 },
              onChange: (l) => p(l),
              allowClear: !0,
              children: [
                /* @__PURE__ */ e.jsx(J, { value: 1, children: "待办" }),
                /* @__PURE__ */ e.jsx(J, { value: 2, children: "进行中" }),
                /* @__PURE__ */ e.jsx(J, { value: 3, children: "已完成" })
              ]
            }
          ),
          /* @__PURE__ */ e.jsx(
            Je,
            {
              placeholder: "搜索任务名称",
              allowClear: !0,
              enterButton: /* @__PURE__ */ e.jsx(Se, {}),
              style: { width: 300 }
            }
          )
        ] }),
        /* @__PURE__ */ e.jsx(
          G,
          {
            columns: g,
            dataSource: o,
            rowKey: "id",
            loading: f
          }
        )
      ]
    }
  );
}
const { Option: _ } = I, He = [
  { value: 0, label: "低" },
  { value: 1, label: "中" },
  { value: 2, label: "高" },
  { value: 3, label: "紧急" }
], Ke = [
  { value: 0, label: "待办" },
  { value: 1, label: "进行中" },
  { value: 2, label: "已完成" }
];
function Qe() {
  const c = D(), { id: o } = qe(), d = o !== "new", [f] = h.useForm(), [a, r] = y(!1);
  O(() => {
    d && o && (r(!0), r(!1));
  }, [o, d]);
  const p = async (n) => {
    try {
      j.success(d ? "任务更新成功" : "任务创建成功"), c("/z-task/task");
    } catch {
      j.error(d ? "更新失败" : "创建失败");
    }
  };
  return /* @__PURE__ */ e.jsx(k, { title: d ? "编辑任务" : "新建任务", children: /* @__PURE__ */ e.jsxs(
    h,
    {
      form: f,
      layout: "vertical",
      onFinish: p,
      initialValues: {
        status: 0,
        priority: 1
      },
      children: [
        /* @__PURE__ */ e.jsx(
          h.Item,
          {
            name: "title",
            label: "任务名称",
            rules: [{ required: !0, message: "请输入任务名称" }],
            children: /* @__PURE__ */ e.jsx(R, { placeholder: "请输入任务名称" })
          }
        ),
        /* @__PURE__ */ e.jsx(
          h.Item,
          {
            name: "projectId",
            label: "所属项目",
            rules: [{ required: !0, message: "请选择所属项目" }],
            children: /* @__PURE__ */ e.jsxs(I, { placeholder: "请选择项目", allowClear: !0, children: [
              /* @__PURE__ */ e.jsx(_, { value: 1, children: "Z-Task项目" }),
              /* @__PURE__ */ e.jsx(_, { value: 2, children: "Z-Config项目" })
            ] })
          }
        ),
        /* @__PURE__ */ e.jsx(
          h.Item,
          {
            name: "listId",
            label: "所属列表",
            rules: [{ required: !0, message: "请选择列表" }],
            children: /* @__PURE__ */ e.jsxs(I, { placeholder: "请选择列表", children: [
              /* @__PURE__ */ e.jsx(_, { value: 1, children: "待办" }),
              /* @__PURE__ */ e.jsx(_, { value: 2, children: "进行中" }),
              /* @__PURE__ */ e.jsx(_, { value: 3, children: "已完成" })
            ] })
          }
        ),
        /* @__PURE__ */ e.jsx(
          h.Item,
          {
            name: "priority",
            label: "优先级",
            children: /* @__PURE__ */ e.jsx(I, { children: He.map((n) => /* @__PURE__ */ e.jsx(_, { value: n.value, children: n.label }, n.value)) })
          }
        ),
        /* @__PURE__ */ e.jsx(
          h.Item,
          {
            name: "status",
            label: "状态",
            children: /* @__PURE__ */ e.jsx(I, { children: Ke.map((n) => /* @__PURE__ */ e.jsx(_, { value: n.value, children: n.label }, n.value)) })
          }
        ),
        /* @__PURE__ */ e.jsx(
          h.Item,
          {
            name: "dueDate",
            label: "截止日期",
            children: /* @__PURE__ */ e.jsx(Ee, { style: { width: "100%" } })
          }
        ),
        /* @__PURE__ */ e.jsx(
          h.Item,
          {
            name: "description",
            label: "任务描述",
            children: /* @__PURE__ */ e.jsx(R.TextArea, { rows: 4, placeholder: "请输入任务描述" })
          }
        ),
        /* @__PURE__ */ e.jsx(h.Item, { children: /* @__PURE__ */ e.jsxs(N, { children: [
          /* @__PURE__ */ e.jsx(v, { type: "primary", htmlType: "submit", children: d ? "更新" : "创建" }),
          /* @__PURE__ */ e.jsx(v, { onClick: () => c("/z-task/task"), children: "取消" })
        ] }) })
      ]
    }
  ) });
}
const et = {
  0: { color: "default", text: "已归档" },
  1: { color: "green", text: "进行中" }
};
function tt() {
  const [c, o] = y([]), [d, f] = y(!1), [a, r] = y(!1), [p] = h.useForm(), n = async () => {
    f(!0);
    try {
      const l = localStorage.getItem("userId") || "1", i = await Ye(l);
      o(i.data || []);
    } catch {
      j.error("加载项目失败");
    } finally {
      f(!1);
    }
  };
  O(() => {
    n();
  }, []);
  const g = async () => {
    try {
      const l = await p.validateFields();
      await $e(l), j.success("创建成功"), r(!1), p.resetFields(), n();
    } catch {
      j.error("创建失败");
    }
  }, T = async (l) => {
    try {
      await De(l), j.success("归档成功"), n();
    } catch {
      j.error("归档失败");
    }
  }, w = [
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
      render: (l) => l || "-"
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (l) => {
        const i = et[l] || { color: "default", text: String(l) };
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
      render: (l, i) => /* @__PURE__ */ e.jsxs(N, { size: "middle", children: [
        /* @__PURE__ */ e.jsx(v, { type: "link", icon: /* @__PURE__ */ e.jsx(ie, {}), children: "编辑" }),
        i.status === 1 && /* @__PURE__ */ e.jsx(v, { type: "link", danger: !0, onClick: () => T(i.id), children: "归档" })
      ] })
    }
  ];
  return /* @__PURE__ */ e.jsxs(
    k,
    {
      title: "项目管理",
      extra: /* @__PURE__ */ e.jsx(v, { type: "primary", icon: /* @__PURE__ */ e.jsx(oe, {}), onClick: () => r(!0), children: "新建项目" }),
      children: [
        /* @__PURE__ */ e.jsx(
          G,
          {
            columns: w,
            dataSource: c,
            rowKey: "id",
            loading: d
          }
        ),
        /* @__PURE__ */ e.jsx(
          _e,
          {
            title: "新建项目",
            open: a,
            onOk: g,
            onCancel: () => {
              r(!1), p.resetFields();
            },
            okText: "创建",
            cancelText: "取消",
            children: /* @__PURE__ */ e.jsxs(h, { form: p, layout: "vertical", children: [
              /* @__PURE__ */ e.jsx(h.Item, { name: "name", label: "项目名称", rules: [{ required: !0, message: "请输入项目名称" }], children: /* @__PURE__ */ e.jsx(R, { placeholder: "请输入项目名称" }) }),
              /* @__PURE__ */ e.jsx(h.Item, { name: "description", label: "项目描述", children: /* @__PURE__ */ e.jsx(R.TextArea, { placeholder: "请输入项目描述", rows: 3 }) })
            ] })
          }
        )
      ]
    }
  );
}
function rt() {
  const [c, o] = y([]), [d, f] = y(!1);
  O(() => {
    o([]);
  }, []);
  const a = [
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
      render: (r) => /* @__PURE__ */ e.jsx(z, { color: r === 1 ? "green" : "red", children: r === 1 ? "启用" : "禁用" })
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
  return /* @__PURE__ */ e.jsx(k, { title: "用户管理", children: /* @__PURE__ */ e.jsx(
    G,
    {
      columns: a,
      dataSource: c,
      rowKey: "id",
      loading: d,
      locale: { emptyText: "暂无数据（用户由 z-ctc 统一管理）" }
    }
  ) });
}
function ft() {
  const c = D(), o = async (d) => {
    var f, a, r, p;
    try {
      const n = await Me.post("/auth/login", d), g = ((f = n == null ? void 0 : n.data) == null ? void 0 : f.token) ?? (n == null ? void 0 : n.token), T = ((a = n == null ? void 0 : n.data) == null ? void 0 : a.userId) ?? (n == null ? void 0 : n.userId);
      if (g && localStorage.setItem("token", g), T != null && localStorage.setItem("userId", String(T)), !g) {
        j.error("登录响应缺少 token");
        return;
      }
      j.success("登录成功"), c("/");
    } catch (n) {
      j.error("登录失败：" + (((p = (r = n.response) == null ? void 0 : r.data) == null ? void 0 : p.message) || n.message));
    }
  };
  return /* @__PURE__ */ e.jsx("div", { className: "login-container", children: /* @__PURE__ */ e.jsx(k, { title: "欢迎登录 Z-Task", className: "login-card", children: /* @__PURE__ */ e.jsxs(
    h,
    {
      name: "login",
      initialValues: { remember: !0 },
      onFinish: o,
      autoComplete: "off",
      children: [
        /* @__PURE__ */ e.jsx(
          h.Item,
          {
            name: "username",
            rules: [{ required: !0, message: "请输入用户名!" }],
            children: /* @__PURE__ */ e.jsx(R, { prefix: /* @__PURE__ */ e.jsx(Oe, {}), placeholder: "用户名", size: "large" })
          }
        ),
        /* @__PURE__ */ e.jsx(
          h.Item,
          {
            name: "password",
            rules: [{ required: !0, message: "请输入密码!" }],
            children: /* @__PURE__ */ e.jsx(
              R.Password,
              {
                prefix: /* @__PURE__ */ e.jsx(Ce, {}),
                placeholder: "密码",
                size: "large"
              }
            )
          }
        ),
        /* @__PURE__ */ e.jsx(h.Item, { children: /* @__PURE__ */ e.jsx(v, { type: "primary", htmlType: "submit", size: "large", block: !0, children: "登录" }) })
      ]
    }
  ) }) });
}
const { Title: at, Paragraph: nt } = Ie;
function st() {
  const c = D(), [o, d] = y(null);
  O(() => {
    const a = localStorage.getItem("userInfo");
    if (a)
      try {
        d(JSON.parse(a));
      } catch {
        d({ name: a });
      }
  }, []);
  const f = lt.filter((a) => a.key !== "/z-task/home");
  return /* @__PURE__ */ e.jsxs("div", { children: [
    /* @__PURE__ */ e.jsx(k, { style: { marginBottom: 16, background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)", border: "none" }, children: /* @__PURE__ */ e.jsxs(N, { direction: "vertical", size: 4, style: { color: "#fff" }, children: [
      /* @__PURE__ */ e.jsxs(at, { level: 3, style: { color: "#fff", margin: 0 }, children: [
        "欢迎",
        o != null && o.name ? `，${o.name}` : ""
      ] }),
      /* @__PURE__ */ e.jsx(nt, { style: { color: "rgba(255,255,255,0.85)", margin: 0 }, children: "z-task 任务管理 管理台" }),
      (o == null ? void 0 : o.role) && /* @__PURE__ */ e.jsx(z, { style: { marginTop: 8, background: "rgba(255,255,255,0.2)", color: "#fff", border: "none" }, children: o.role })
    ] }) }),
    /* @__PURE__ */ e.jsx(le, { gutter: [16, 16], children: f.map((a) => /* @__PURE__ */ e.jsx(P, { xs: 24, sm: 12, md: 12, lg: 8, children: /* @__PURE__ */ e.jsx(k, { hoverable: !0, onClick: () => c(a.key), style: { borderTop: "3px solid #7c3aed" }, children: /* @__PURE__ */ e.jsxs(N, { align: "start", size: 12, children: [
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
      }, children: a.icon }),
      /* @__PURE__ */ e.jsxs("div", { style: { minWidth: 0 }, children: [
        /* @__PURE__ */ e.jsx("div", { style: { fontSize: 15, fontWeight: 600, color: "#0f172a" }, children: a.label }),
        /* @__PURE__ */ e.jsx("div", { style: { fontSize: 12, color: "#94a3b8", marginTop: 2 }, children: a.key })
      ] })
    ] }) }) }, a.key)) })
  ] });
}
const mt = () => !!localStorage.getItem("token");
L[0].Component = Be;
L[1].Component = Ze;
L[2].Component = Qe;
L[3].Component = tt;
L[4].Component = rt;
const lt = [
  { key: "/z-task/home", label: "首页", icon: /* @__PURE__ */ e.jsx(Ae, {}) },
  { key: "/z-task/overview", label: "仪表盘", icon: /* @__PURE__ */ e.jsx(Pe, {}) },
  { key: "/z-task/task", label: "任务管理", icon: /* @__PURE__ */ e.jsx(B, {}) },
  { key: "/z-task/project", label: "项目管理", icon: /* @__PURE__ */ e.jsx(B, {}) },
  { key: "/z-task/user", label: "用户管理", icon: /* @__PURE__ */ e.jsx(B, {}) }
], L = [
  { path: "/z-task/home", Component: st },
  { path: "/z-task/dashboard", Component: null },
  { path: "/z-task/task", Component: null },
  { path: "/z-task/task/edit/:id?", Component: null },
  { path: "/z-task/project", Component: null },
  { path: "/z-task/user", Component: null }
];
export {
  Be as Dashboard,
  ft as Login,
  tt as ProjectList,
  Qe as TaskEdit,
  Ze as TaskList,
  rt as UserList,
  pt as configureTask,
  mt as isAuthenticated,
  lt as menuItems,
  L as routeTable
};
