import ee from "react";
var b = { exports: {} }, d = {};
/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var I;
function re() {
  if (I) return d;
  I = 1;
  var c = Symbol.for("react.transitional.element"), T = Symbol.for("react.fragment");
  function f(m, o, s) {
    var E = null;
    if (s !== void 0 && (E = "" + s), o.key !== void 0 && (E = "" + o.key), "key" in o) {
      s = {};
      for (var _ in o)
        _ !== "key" && (s[_] = o[_]);
    } else s = o;
    return o = s.ref, {
      $$typeof: c,
      type: m,
      key: E,
      ref: o !== void 0 ? o : null,
      props: s
    };
  }
  return d.Fragment = T, d.jsx = f, d.jsxs = f, d;
}
var R = {};
/**
 * @license React
 * react-jsx-runtime.development.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var L;
function te() {
  return L || (L = 1, process.env.NODE_ENV !== "production" && (function() {
    function c(e) {
      if (e == null) return null;
      if (typeof e == "function")
        return e.$$typeof === Z ? null : e.displayName || e.name || null;
      if (typeof e == "string") return e;
      switch (e) {
        case p:
          return "Fragment";
        case U:
          return "Profiler";
        case M:
          return "StrictMode";
        case z:
          return "Suspense";
        case G:
          return "SuspenseList";
        case B:
          return "Activity";
        case H:
          return "ViewTransition";
      }
      if (typeof e == "object")
        switch (typeof e.tag == "number" && console.error(
          "Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."
        ), e.$$typeof) {
          case D:
            return "Portal";
          case J:
            return e.displayName || "Context";
          case q:
            return (e._context.displayName || "Context") + ".Consumer";
          case V:
            var r = e.render;
            return e = e.displayName, e || (e = r.displayName || r.name || "", e = e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef"), e;
          case X:
            return r = e.displayName || null, r !== null ? r : c(e.type) || "Memo";
          case k:
            r = e._payload, e = e._init;
            try {
              return c(e(r));
            } catch {
            }
        }
      return null;
    }
    function T(e) {
      return "" + e;
    }
    function f(e) {
      try {
        T(e);
        var r = !1;
      } catch {
        r = !0;
      }
      if (r) {
        r = console;
        var t = r.error, a = typeof Symbol == "function" && Symbol.toStringTag && e[Symbol.toStringTag] || e.constructor.name || "Object";
        return t.call(
          r,
          "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.",
          a
        ), T(e);
      }
    }
    function m(e) {
      if (e === p) return "<>";
      if (typeof e == "object" && e !== null && e.$$typeof === k)
        return "<...>";
      try {
        var r = c(e);
        return r ? "<" + r + ">" : "<...>";
      } catch {
        return "<...>";
      }
    }
    function o() {
      var e = O.A;
      return e === null ? null : e.getOwner();
    }
    function s() {
      return Error("react-stack-top-frame");
    }
    function E(e) {
      if (x.call(e, "key")) {
        var r = Object.getOwnPropertyDescriptor(e, "key").get;
        if (r && r.isReactWarning) return !1;
      }
      return e.key !== void 0;
    }
    function _(e, r) {
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
    function F() {
      var e = c(this.type);
      return g[e] || (g[e] = !0, console.error(
        "Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."
      )), e = this.props.ref, e !== void 0 ? e : null;
    }
    function W(e, r, t, a, u, l) {
      var n = t.ref;
      return e = {
        $$typeof: j,
        type: e,
        key: r,
        props: t,
        _owner: a
      }, (n !== void 0 ? n : null) !== null ? Object.defineProperty(e, "ref", {
        enumerable: !1,
        get: F
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
        value: u
      }), Object.defineProperty(e, "_debugTask", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: l
      }), Object.freeze && (Object.freeze(e.props), Object.freeze(e)), e;
    }
    function S(e, r, t, a, u, l) {
      var n = r.children;
      if (n !== void 0)
        if (a)
          if (Q(n)) {
            for (a = 0; a < n.length; a++)
              w(n[a]);
            Object.freeze && Object.freeze(n);
          } else
            console.error(
              "React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead."
            );
        else w(n);
      if (x.call(r, "key")) {
        n = c(e);
        var i = Object.keys(r).filter(function(K) {
          return K !== "key";
        });
        a = 0 < i.length ? "{key: someKey, " + i.join(": ..., ") + ": ...}" : "{key: someKey}", Y[n + a] || (i = 0 < i.length ? "{" + i.join(": ..., ") + ": ...}" : "{}", console.error(
          `A props object containing a "key" prop is being spread into JSX:
  let props = %s;
  <%s {...props} />
React keys must be passed directly to JSX without using spread:
  let props = %s;
  <%s key={someKey} {...props} />`,
          a,
          n,
          i,
          n
        ), Y[n + a] = !0);
      }
      if (n = null, t !== void 0 && (f(t), n = "" + t), E(r) && (f(r.key), n = "" + r.key), "key" in r) {
        t = {};
        for (var P in r)
          P !== "key" && (t[P] = r[P]);
      } else t = r;
      return n && _(
        t,
        typeof e == "function" ? e.displayName || e.name || "Unknown" : e
      ), W(
        e,
        n,
        t,
        o(),
        u,
        l
      );
    }
    function w(e) {
      y(e) ? e._store && (e._store.validated = 1) : typeof e == "object" && e !== null && e.$$typeof === k && (e._payload.status === "fulfilled" ? y(e._payload.value) && e._payload.value._store && (e._payload.value._store.validated = 1) : e._store && (e._store.validated = 1));
    }
    function y(e) {
      return typeof e == "object" && e !== null && e.$$typeof === j;
    }
    var v = ee, j = Symbol.for("react.transitional.element"), D = Symbol.for("react.portal"), p = Symbol.for("react.fragment"), M = Symbol.for("react.strict_mode"), U = Symbol.for("react.profiler"), q = Symbol.for("react.consumer"), J = Symbol.for("react.context"), V = Symbol.for("react.forward_ref"), z = Symbol.for("react.suspense"), G = Symbol.for("react.suspense_list"), X = Symbol.for("react.memo"), k = Symbol.for("react.lazy"), B = Symbol.for("react.activity"), H = Symbol.for("react.view_transition"), Z = Symbol.for("react.client.reference"), O = v.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, x = Object.prototype.hasOwnProperty, Q = Array.isArray, A = console.createTask ? console.createTask : function() {
      return null;
    };
    v = {
      react_stack_bottom_frame: function(e) {
        return e();
      }
    };
    var h, g = {}, N = v.react_stack_bottom_frame.bind(
      v,
      s
    )(), C = A(m(s)), Y = {};
    R.Fragment = p, R.jsx = function(e, r, t) {
      var a = 1e4 > O.recentlyCreatedOwnerStacks++;
      if (a) {
        var u = Error.stackTraceLimit;
        Error.stackTraceLimit = 10;
        var l = Error("react-stack-top-frame");
        Error.stackTraceLimit = u;
      } else l = N;
      return S(
        e,
        r,
        t,
        !1,
        l,
        a ? A(m(e)) : C
      );
    }, R.jsxs = function(e, r, t) {
      var a = 1e4 > O.recentlyCreatedOwnerStacks++;
      if (a) {
        var u = Error.stackTraceLimit;
        Error.stackTraceLimit = 10;
        var l = Error("react-stack-top-frame");
        Error.stackTraceLimit = u;
      } else l = N;
      return S(
        e,
        r,
        t,
        !0,
        l,
        a ? A(m(e)) : C
      );
    };
  })()), R;
}
var $;
function ae() {
  return $ || ($ = 1, process.env.NODE_ENV === "production" ? b.exports = re() : b.exports = te()), b.exports;
}
var oe = ae();
export {
  oe as j
};
