import ee from "react";
import { ComponentDoc as re } from "@yuku123/z-frontend-common/ui";
var j = { exports: {} }, k = {};
/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var N;
function te() {
  if (N) return k;
  N = 1;
  var l = Symbol.for("react.transitional.element"), E = Symbol.for("react.fragment");
  function p(f, s, o) {
    var m = null;
    if (o !== void 0 && (m = "" + o), s.key !== void 0 && (m = "" + s.key), "key" in s) {
      o = {};
      for (var d in s)
        d !== "key" && (o[d] = s[d]);
    } else o = s;
    return s = o.ref, {
      $$typeof: l,
      type: f,
      key: m,
      ref: s !== void 0 ? s : null,
      props: o
    };
  }
  return k.Fragment = E, k.jsx = p, k.jsxs = p, k;
}
var T = {};
/**
 * @license React
 * react-jsx-runtime.development.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var D;
function ne() {
  return D || (D = 1, process.env.NODE_ENV !== "production" && (function() {
    function l(e) {
      if (e == null) return null;
      if (typeof e == "function")
        return e.$$typeof === Z ? null : e.displayName || e.name || null;
      if (typeof e == "string") return e;
      switch (e) {
        case b:
          return "Fragment";
        case q:
          return "Profiler";
        case $:
          return "StrictMode";
        case J:
          return "Suspense";
        case V:
          return "SuspenseList";
        case H:
          return "Activity";
        case B:
          return "ViewTransition";
      }
      if (typeof e == "object")
        switch (typeof e.tag == "number" && console.error(
          "Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."
        ), e.$$typeof) {
          case M:
            return "Portal";
          case G:
            return e.displayName || "Context";
          case F:
            return (e._context.displayName || "Context") + ".Consumer";
          case W:
            var r = e.render;
            return e = e.displayName, e || (e = r.displayName || r.name || "", e = e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef"), e;
          case X:
            return r = e.displayName || null, r !== null ? r : l(e.type) || "Memo";
          case P:
            r = e._payload, e = e._init;
            try {
              return l(e(r));
            } catch {
            }
        }
      return null;
    }
    function E(e) {
      return "" + e;
    }
    function p(e) {
      try {
        E(e);
        var r = !1;
      } catch {
        r = !0;
      }
      if (r) {
        r = console;
        var t = r.error, n = typeof Symbol == "function" && Symbol.toStringTag && e[Symbol.toStringTag] || e.constructor.name || "Object";
        return t.call(
          r,
          "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.",
          n
        ), E(e);
      }
    }
    function f(e) {
      if (e === b) return "<>";
      if (typeof e == "object" && e !== null && e.$$typeof === P)
        return "<...>";
      try {
        var r = l(e);
        return r ? "<" + r + ">" : "<...>";
      } catch {
        return "<...>";
      }
    }
    function s() {
      var e = v.A;
      return e === null ? null : e.getOwner();
    }
    function o() {
      return Error("react-stack-top-frame");
    }
    function m(e) {
      if (L.call(e, "key")) {
        var r = Object.getOwnPropertyDescriptor(e, "key").get;
        if (r && r.isReactWarning) return !1;
      }
      return e.key !== void 0;
    }
    function d(e, r) {
      function t() {
        h || (h = !0, console.error(
          "%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)",
          r
        ));
      }
      t.isReactWarning = !0, Object.defineProperty(e, "key", {
        get: t,
        configurable: !0
      });
    }
    function z() {
      var e = l(this.type);
      return I[e] || (I[e] = !0, console.error(
        "Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."
      )), e = this.props.ref, e !== void 0 ? e : null;
    }
    function Y(e, r, t, n, c, i) {
      var a = t.ref;
      return e = {
        $$typeof: A,
        type: e,
        key: r,
        props: t,
        _owner: n
      }, (a !== void 0 ? a : null) !== null ? Object.defineProperty(e, "ref", {
        enumerable: !1,
        get: z
      }) : Object.defineProperty(e, "ref", { enumerable: !1, value: null }), e._store = {}, Object.defineProperty(e._store, "validated", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: 0
      }), Object.defineProperty(e, "_debugInfo", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: null
      }), Object.defineProperty(e, "_debugStack", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: c
      }), Object.defineProperty(e, "_debugTask", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: i
      }), Object.freeze && (Object.freeze(e.props), Object.freeze(e)), e;
    }
    function x(e, r, t, n, c, i) {
      var a = r.children;
      if (a !== void 0)
        if (n)
          if (Q(a)) {
            for (n = 0; n < a.length; n++)
              O(a[n]);
            Object.freeze && Object.freeze(a);
          } else
            console.error(
              "React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead."
            );
        else O(a);
      if (L.call(r, "key")) {
        a = l(e);
        var u = Object.keys(r).filter(function(K) {
          return K !== "key";
        });
        n = 0 < u.length ? "{key: someKey, " + u.join(": ..., ") + ": ...}" : "{key: someKey}", C[a + n] || (u = 0 < u.length ? "{" + u.join(": ..., ") + ": ...}" : "{}", console.error(
          `A props object containing a "key" prop is being spread into JSX:
  let props = %s;
  <%s {...props} />
React keys must be passed directly to JSX without using spread:
  let props = %s;
  <%s key={someKey} {...props} />`,
          n,
          a,
          u,
          a
        ), C[a + n] = !0);
      }
      if (a = null, t !== void 0 && (p(t), a = "" + t), m(r) && (p(r.key), a = "" + r.key), "key" in r) {
        t = {};
        for (var _ in r)
          _ !== "key" && (t[_] = r[_]);
      } else t = r;
      return a && d(
        t,
        typeof e == "function" ? e.displayName || e.name || "Unknown" : e
      ), Y(
        e,
        a,
        t,
        s(),
        c,
        i
      );
    }
    function O(e) {
      S(e) ? e._store && (e._store.validated = 1) : typeof e == "object" && e !== null && e.$$typeof === P && (e._payload.status === "fulfilled" ? S(e._payload.value) && e._payload.value._store && (e._payload.value._store.validated = 1) : e._store && (e._store.validated = 1));
    }
    function S(e) {
      return typeof e == "object" && e !== null && e.$$typeof === A;
    }
    var g = ee, A = Symbol.for("react.transitional.element"), M = Symbol.for("react.portal"), b = Symbol.for("react.fragment"), $ = Symbol.for("react.strict_mode"), q = Symbol.for("react.profiler"), F = Symbol.for("react.consumer"), G = Symbol.for("react.context"), W = Symbol.for("react.forward_ref"), J = Symbol.for("react.suspense"), V = Symbol.for("react.suspense_list"), X = Symbol.for("react.memo"), P = Symbol.for("react.lazy"), H = Symbol.for("react.activity"), B = Symbol.for("react.view_transition"), Z = Symbol.for("react.client.reference"), v = g.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, L = Object.prototype.hasOwnProperty, Q = Array.isArray, R = console.createTask ? console.createTask : function() {
      return null;
    };
    g = {
      react_stack_bottom_frame: function(e) {
        return e();
      }
    };
    var h, I = {}, y = g.react_stack_bottom_frame.bind(
      g,
      o
    )(), w = R(f(o)), C = {};
    T.Fragment = b, T.jsx = function(e, r, t) {
      var n = 1e4 > v.recentlyCreatedOwnerStacks++;
      if (n) {
        var c = Error.stackTraceLimit;
        Error.stackTraceLimit = 10;
        var i = Error("react-stack-top-frame");
        Error.stackTraceLimit = c;
      } else i = y;
      return x(
        e,
        r,
        t,
        !1,
        i,
        n ? R(f(e)) : w
      );
    }, T.jsxs = function(e, r, t) {
      var n = 1e4 > v.recentlyCreatedOwnerStacks++;
      if (n) {
        var c = Error.stackTraceLimit;
        Error.stackTraceLimit = 10;
        var i = Error("react-stack-top-frame");
        Error.stackTraceLimit = c;
      } else i = y;
      return x(
        e,
        r,
        t,
        !0,
        i,
        n ? R(f(e)) : w
      );
    };
  })()), T;
}
var U;
function ae() {
  return U || (U = 1, process.env.NODE_ENV === "production" ? j.exports = te() : j.exports = ne()), j.exports;
}
var se = ae();
const oe = "# z-task-component\n\nz-task（任务管理）跨仓唯一前端面：把「任务管理 / 项目管理 / 用户管理 / 仪表盘」这一整套任务页面\n收敛成一个可复用的 React 组件包。\n\n- **npm 包名**：`@yuku123/z-task-component`\n- **宿主接入**：`@yuku123/z-task-component/pages`（manifest + 页面），主壳可只取 `ComponentDocPage`\n- **后端**：z-task 的 `/api/task/**`、`/api/project/**`、`/api/auth/login`\n- **技术栈**：React 19 + antd 6 + react-router-dom 7 + vite（library mode，双入口 `.` / `./pages`）\n\n---\n\n## 一、能力概览\n\n路由前缀 `/z-task`，菜单在 `src/appMeta.jsx`，路由在 `src/pages-manifest.jsx`（**两者分开**）。\n\n| 页面 | 路由（相对 `/z-task/*`） | 源文件 | 能力 |\n|------|--------------------------|--------|------|\n| 登录 | `login` | `pages/Login.jsx` / `pages/LoginPage.jsx` | 登录（`POST /api/auth/login`） |\n| 首页 | `home` | `pages/HomePage.jsx` | 入口卡片页 |\n| 仪表盘 | `dashboard` | `pages/Dashboard.jsx` | 总任务数 / 待办 / 进行中 / 已完成四张统计卡 |\n| 任务管理 | `task` | `pages/task/TaskList.jsx` | 任务列表 + 完成任务 / 重新打开（基座 `ListTable`） |\n| 任务编辑 | `task/edit/:id?` | `pages/task/TaskEdit.jsx` | 任务新建 / 编辑表单 |\n| 项目管理 | `project` | `pages/project/ProjectList.jsx` | 项目列表 + 新建 / 归档（基座 `ListTable`） |\n| 用户管理 | `user` | `pages/user/UserList.jsx` | 用户列表（基座 `ListTable`） |\n| 组件文档 | `docs` | `pages/ComponentDoc.jsx` | 本文件渲染页（左侧 240px TOC + 右侧正文） |\n\n`src/pages/TaskApp.jsx` 是 `/z-task/*` 的子路由容器（`dashboard` / `task` / `task/edit/:id?` /\n`project` / `user`，index 重定向到 `task`），被 `routes` 里的 `/z-task/:rest*` 承接。\n\n### 1.1 可复用子组件（`src/components/`）\n\n| 组件 | 说明 |\n|------|------|\n| `TaskCard` | 任务卡片 |\n| `TaskTable` | 任务表格 |\n| `ProjectSelect` | 项目选择器 |\n| `ProjectList` | 项目列表组件版 |\n| `TaskList` | 任务列表组件版 |\n| `TaskDashboard` | 任务仪表盘组件版 |\n| `TaskApp` | 域内路由容器组件版 |\n| `TaskDetailDrawer` | 任务详情抽屉 |\n| `TaskEditModal` | 任务编辑弹窗 |\n\n这组组件从包根 `src/index.js` 导出（宿主可直接用，不必走 manifest）。\n\n## 二、导出面\n\n```js\n// 主入口（. 桶）：可复用组件 + taskApi\nimport {TaskCard, TaskTable, ProjectSelect, TaskApp, taskApi, ComponentDocPage} from '@yuku123/z-task-component'\n\n// 宿主组装面（./pages 桶）：manifest + 页面\nimport {menuItems, routes, HomePage, LoginPage, TaskList, TaskEdit, ProjectList, UserList} from '@yuku123/z-task-component/pages'\n```\n\n`./pages` 桶 = 一组具名再导出 + `export * from './pages-manifest.jsx'` 的整份转发。\n**不要再手挑名字** —— 之前手挑过一次，manifest 新增的 `HomePage` / `LoginPage` 没被转发，\nrollup 直接报 `LoginPage is not exported by dist/pages.js`。\n\n## 三、API 端点\n\n包内有**两套 API 客户端**，路径写法不同，详见「已知限制」。\n\n### 3.1 `src/api.js`（`taskApi`，包根导出，components/ 下的组件用这套）\n\n请求实例 `createRequest('task')`，`baseURL` 落到默认的 `/api`。\n\n| 方法 | 路径 | 说明 |\n|---|---|---|\n| GET | `/project/user/list` | 我的项目列表 |\n| POST | `/project` | 创建项目 |\n| PUT | `/project/{id}` | 更新项目 |\n| PUT | `/project/{id}/archive` | 归档项目 |\n| GET | `/task/project/list?projectId=` | 项目下的任务 |\n| GET | `/task/list?listId=` | 列表下的任务 |\n| POST | `/task` | 创建任务 |\n| POST | `/task/complete?taskId=` | 完成任务 |\n| PUT | `/task/move?taskId=&targetListId=&position=` | 移动任务 |\n| GET | `/task/{id}` | 任务详情 |\n| PUT | `/task/{id}` | 更新任务 |\n| DELETE | `/task/{id}` | 删除任务 |\n\n### 3.2 `src/services/api.js`（页面用这套）\n\n请求实例 `src/services/request.js`，`baseURL='/api'`，并注入 `X-User-Id` 头。\n\n| 方法 | 路径 | 说明 |\n|---|---|---|\n| POST | `/api/auth/login` | 登录（后端是 `/api/auth/login`，**不是** `/api/user/login`） |\n| GET | `/api/task/list?listId=` | 按列表取任务 |\n| GET | `/api/task/project/list?projectId=` | 按项目取任务 |\n| GET | `/api/task/assignee/list?userId=` | 按负责人取任务 |\n| POST | `/api/task` | 创建任务 |\n| PUT | `/api/task/move?taskId=&targetListId=&position=` | 移动任务 |\n| POST | `/api/task/assignees/add?taskId=&userId=` | 加负责人（后端是 POST，不是 DELETE） |\n| POST | `/api/task/assignees/remove?taskId=&userId=` | 移除负责人（后端是 POST） |\n| POST | `/api/task/complete?taskId=` | 完成任务（后端是 `POST /api/task/complete`，不是 `/api/task/{id}/complete`） |\n| POST | `/api/task/reopen?taskId=` | 重新打开任务 |\n| GET | `/api/project/user/list?userId=` | 我的项目列表 |\n| POST | `/api/project` | 创建项目 |\n| PUT | `/api/project/{projectId}/archive` | 归档项目 |\n\n## 四、页面说明\n\n### 4.1 仪表盘\n\n按当前负责人取任务（`getTaskListByAssignee`），渲染总任务数 / 待办 / 进行中 / 已完成四张统计卡。\n\n### 4.2 任务管理\n\n任务列表（`getTaskListByList`），行内可**完成任务**（`completeTask`）与**重新打开**（`reopenTask`）。\n过滤交给基座 `ListTable` 内置的搜索框 —— 原来页面上那个 antd `Search` 没接 `onChange`，是死的，已去掉。\n\n### 4.3 任务编辑\n\n任务新建 / 编辑表单（路由 `task/edit/:id?`，`:id` 可选 ⇒ 同一条路由兼做新建）。\n\n### 4.4 项目管理\n\n项目列表 + 新建项目 + 归档项目，统一用基座 `ListTable`。\n\n### 4.5 用户管理\n\n用户列表，用基座 `ListTable`。\n\n### 4.6 组件文档\n\n本文件。内容以 `?raw` 在编译期内联，零额外请求；左侧 240px TOC 随滚动联动。\n\n## 五、配置\n\n| 配置项 | 默认值 | 说明 |\n|---|---|---|\n| `configureTask({apiBase})` | `'/api'` | 改写 `src/services/request.js` 实例的 `baseURL` |\n| `X-User-Id` 头 | localStorage `userId` | `services/request.js` 的拦截器自动附加（`ProjectController.create` 等接口要） |\n| 登录态判据 | localStorage `token` | `isAuthenticated()` 与 suit 的 `ProtectedShell` 都用它 |\n| token 注入 | `Authorization: Bearer` | 基座拦截器统一处理 |\n\n## 六、已知限制\n\n- **菜单在 `src/appMeta.jsx`，不在 `pages-manifest.jsx`**。这是为了断开循环依赖：\n  `HomePage` 要 import `menuItems`，而 manifest 又 import `HomePage` ⇒ 循环会让 `menuItems`\n  落进 TDZ，浏览器报 `Cannot access 'X' before initialization`，整页白屏且控制台无日志。\n  页面组件直接在 manifest 里 import，不要绕道 `pages.js` 再转发。\n- ⚠ **菜单项 `/z-task/overview` 没有对应路由**（路由是 `/z-task/dashboard`）——\n  点「仪表盘」会落到 `/z-task/:rest*` → `TaskApp` → 没有 `overview` 子路由 ⇒ 空白页。\n- **包内有两套 API 客户端，路径口径不同**：\n  `src/api.js`（`taskApi`）写的是**不带** `/api` 前缀的路径，配 `baseURL='/api'` ⇒ 实际 `/api/xxx`；\n  `src/services/api.js` 写的是**带** `/api` 前缀的路径，也配 `baseURL='/api'` ⇒ 实际拼成 `/api/api/xxx`。\n  改后端契约时要认准自己动的是哪一套。\n- `src/api.js` 里写的是 `createRequest('task')`（传了字符串而不是配置对象）——\n  `createRequest` 取 `options.baseURL` 时拿到 `undefined`，于是回落到默认 `/api`。\n  结果碰巧是对的，但这是笔误，复制这个写法会踩坑。\n- `routes` 里 dashboard / task / project / user 四条的 `Component` 是 `null`，\n  实际由 `TaskApp` 接管 —— **suit 侧渲染 null 路由时必须跳过**，否则会炸。\n- 登录页有两份（`pages/Login.jsx` 与 `pages/LoginPage.jsx`），manifest 导出的是 `Login`（前者）\n  与 `LoginPage`（后者），宿主按需取。\n- 组件包必须 external 基座；`vite.config.js` 的 `external` 是精确字符串匹配，\n  `@yuku123/z-frontend-common/ui` 与 `/ui/echarts` 两个子路径必须逐个列出，漏了基座会被复制进 dist。\n\n## 七、变更记录\n\n| 版本 | 变更 |\n|---|---|\n| 0.1.1 | 新增组件文档页 `ComponentDocPage`（lead 008 §7）：`src/DOC.md` + 基座 `ComponentDoc` 薄包装 |\n| 0.1.1 | `appMeta` / `menuItems` 从 `pages-manifest.jsx` 拆到 `appMeta.jsx`，断掉模块循环 |\n| 0.1.0 | 首版：任务 / 项目 / 用户页面集 + manifest + 两套 API 客户端 |\n";
function le() {
  return /* @__PURE__ */ se.jsx(re, { markdown: oe, title: "组件文档 — z-task" });
}
export {
  le as C,
  se as j
};
