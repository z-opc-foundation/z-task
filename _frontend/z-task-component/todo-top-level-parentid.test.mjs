/**
 * 待办「顶层事项」口径守卫（P0 回归防护）。
 *
 * 背景（2026-10-21「个人」模式全量交互测试，第 9 轮实测抓到）：
 * 待办页的**事项列表永远是空的** —— 但侧栏项目上的事项**计数是对的**。
 *
 * 根因：后端用 `parent_id = 0`（或 null）表示「无父节点」，
 * 而 `normalizeTodoItem` 把它归一成字符串 `"0"`；
 * 消费端（TodoTab 3 处 + TodoList 1 处 + todoLinkUtils 1 处）
 * 一律用 `!i.parentId` 判顶层 —— **`"0"` 是 truthy**
 * ⇒ 所有顶层事项都被当成子事项过滤掉 ⇒ 列表空。
 *
 * 为什么极难定位：计数走的是后端统计（对），列表走的是前端过滤（错），
 * 现象看起来像「今天没有事项」而不是「口径错」；
 * 而且这在**真实后端**上同样成立（parent_id 恒为 0），
 * 之前几轮测试没抓到是因为它一直只断言「能进待办页」，没断言「列表有事项」。
 *
 * 本守卫是纯真源断言（读源码文本），防回归。
 *
 * ⚠ 2026-11-03 迁仓：todo 权威实现迁到 z-task 后，本守卫随被保护代码一起搬到本仓
 *   （此前留在 z-team 会因目标文件已迁走而 ENOENT 判红）。
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(HERE, "src");

function read(rel) {
  return fs.readFileSync(path.join(SRC, rel), "utf8");
}

const todoApi = read("services/todo-api/todo.js");
const todoTab = read("components/TodoTab/index.tsx");
const todoList = read("components/TodoTab/TodoList.tsx");
const todoLinkUtils = read("components/TodoTab/todoLinkUtils.ts");

test("顶层事项的 parentId 必须归一成空串，不能是字符串 \"0\"", () => {
  // 旧口径：raw.parentId == null ? "0" : toId(raw.parentId)
  assert.doesNotMatch(
    todoApi,
    /parentId:\s*\w+\.parentId\s*==\s*null\s*\?\s*["']0["']/,
    "todo.js 里还有把顶层 parentId 归一成 \"0\" 的旧口径 —— " +
      '"0" 是 truthy，消费端的 !i.parentId 会把顶层事项全过滤掉（待办列表恒空）'
  );
  assert.match(
    todoApi,
    /parentId:\s*isRootTodoParentId\(\w+\.parentId\)\s*\?\s*["']["']\s*:/,
    "todo.js 里没有「顶层 parentId 归一成空串」的归一化"
  );
});

test("「无父」的判定必须同时覆盖 null / 0 / 空串三种后端写法", () => {
  const fn = todoApi.slice(
    todoApi.indexOf("function isRootTodoParentId"),
    todoApi.indexOf("function isRootTodoParentId") + 500
  );
  assert.match(fn, /null\s*\|\|\s*v === undefined/, "没覆盖 null / undefined");
  assert.match(fn, /s === ''/, "没覆盖空串");
  assert.match(fn, /s === '0'/, "没覆盖后端的 parent_id = 0");
});

test("消费端判顶层必须用 falsy 判断（与空串口径一致），不能与 \"0\" 比较", () => {
  const consumers = [
    ["TodoTab/index.tsx", todoTab],
    ["TodoTab/TodoList.tsx", todoList],
    ["TodoTab/todoLinkUtils.ts", todoLinkUtils],
  ];
  for (const [name, src] of consumers) {
    assert.doesNotMatch(
      src,
      /parentId\s*===\s*["']0["']/,
      `${name} 里出现 parentId === "0" 的判断 —— ` +
        '归一化后顶层是空串，这个分支永远不成立'
    );
    assert.doesNotMatch(
      src,
      /parentId\s*!==\s*["']0["']/,
      `${name} 里出现 parentId !== "0" 的判断 —— 同上`
    );
  }
  // 顶层过滤确实存在（否则会退化成「全当子事项」）
  const topFilters = (todoTab + todoList + todoLinkUtils).match(
    /![A-Za-z_][A-Za-z0-9_]*\.parentId/g
  );
  assert.ok(
    topFilters && topFilters.length >= 3,
    `顶层过滤（!x.parentId）应至少 3 处，实际 ${topFilters?.length ?? 0} 处`
  );
});
