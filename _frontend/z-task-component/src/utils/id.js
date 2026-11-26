/**
 * 工作台 ID 语义的**单一定义点**。
 *
 * 2026-11-02 随待办前端搬迁，从 z-team 的 `workspace/utils/id.ts` 迁入（去 TS 标注）。
 *
 * 背景：主键可能是 19 位雪花 ID（~2.1e18），超过 JavaScript `Number` 的 53 位有效位
 * （`Number.MAX_SAFE_INTEGER = 9007199254740991`）。一旦让任何一处出现 `Number(id)`，
 * 浏览器就会按 float64 舍掉末位且**原值不可恢复**：
 *
 *     Number("2096058642985349121") === 2096058642985349000   // true
 *
 * 拿这个被抹平的 ID 回去查库，必然命中「项目不存在」。
 *
 * 分层约定：
 *   · MySQL  一律 bigint   —— 数值序正确，索引/范围扫描才成立
 *   · Java   一律 Long
 *   · JSON   一律 string   —— 只在这一层为迁就 JS 而转
 *   · 前端   一律 Id(=string)
 *
 * 所以本文件只提供「转成 Id / 比较 Id / 排序 Id」三件事，
 * 业务代码里不该再出现裸的 `String(x.id)` 或 `Number(x.id)`。
 *
 * ⚠ z-task 侧的待办主键是自增（`IdType.AUTO`），值域比雪花小得多，
 *    但**语义约定保持一致** —— 换主键策略时不必再改前端。
 */

/** 雪花 ID / 主外键的统一类型。刻意就是 string，不做 number-like 包装。 */
export const Id = String

/**
 * 把后端返回的任意形态（已是 string、或是历史遗留的 number）收敛成 Id。
 *
 * 注意：如果上游给的是**已经被 float64 抹平的 number**，这里救不回来 ——
 * 信息在 JSON.parse 阶段就没了。真正的修复在服务端必须发字符串。
 */
export function toId(v) {
    if (v === null || v === undefined || v === '') {
        return ''
    }
    return typeof v === 'string' ? v : String(v)
}

/** 可空形态：null / undefined / "" 一律归一为 null，替代 `== null` 的散落判断。 */
export function toIdOrNull(v) {
    const s = toId(v)
    return s === '' ? null : s
}

/** 两个 ID 是否同一个。全仓比较 ID 只走这里，避免各处自己 `String()` 一遍。 */
export function sameId(a, b) {
    return toId(a) === toId(b)
}

/**
 * 是否是「前端自己造的乐观占位 ID」（约定：负数）。
 *
 * 旧代码写的是 `m.id < 0`。ID 收敛成 string 之后这个写法就废了，而且**废得很隐蔽**：
 * JS 里 `"2096058642985349121" < 0` 会把字符串强转成 number 再比，
 * 于是又绕回了 float64 —— 恰好是本文件开头要消灭的那件事。
 */
export function isOptimisticId(v) {
    const s = toId(v)
    return s !== '' && s.startsWith('-')
}

/**
 * 是否是一个「有效的正数 ID」（非空且数值 > 0）。
 *
 * 用来替换散落各处的 `Number.isFinite(x) && x > 0`。那个写法在 ID 还是 number 时
 * 是对的，ID 收敛成 string 之后**恒为 false**（`Number.isFinite("123") === false`），
 * 于是依赖它的分支会集体静默失效 —— 这类 bug 不报错，只是功能悄悄不工作了。
 */
export function isPositiveId(v) {
    const id = toId(v)
    // 必须先挡掉空值：compareIds 有意把空值排最后，于是 compareIds("", "0") === 1，
    // 不挡的话空 ID 会被判成「有效的正数 ID」，这正是要避免的。
    return id !== '' && compareIds(id, '0') > 0
}

/**
 * 按数值大小比较两个 ID（消息排序、任务合并、范围判断都依赖它）。
 *
 * 为什么不能偷懒直接用 `a < b`：今天的主键全是 19 位，同长度的纯数字串
 * 「字典序恰好等于数值序」，所以这么写会**碰巧一直正确**——这正是它阴险的地方。
 * 一旦出现长度不同的 ID 立刻翻车，且不会报错、只会静默排错。
 *
 * 这里用 BigInt 比较（19 位在 BigInt 范围内精确）；非纯数字退回字符串序，
 * 保证函数永不抛。
 */
export function compareIds(a, b) {
    const x = toId(a)
    const y = toId(b)
    if (x === y) {
        return 0
    }
    if (x === '') {
        return 1 // 空值排最后，避免 min/max 计算被 0 污染
    }
    if (y === '') {
        return -1
    }
    try {
        const bx = BigInt(x)
        const by = BigInt(y)
        return bx < by ? -1 : 1
    } catch {
        return x < y ? -1 : 1
    }
}

/** 取一组 ID 的数值最小/最大，用于「区间内」判断。 */
export function minId(ids) {
    let min = ''
    for (const id of ids) {
        if (toId(id) === '') {
            continue
        }
        if (min === '' || compareIds(id, min) < 0) {
            min = toId(id)
        }
    }
    return min
}

export function maxId(ids) {
    let max = ''
    for (const id of ids) {
        if (toId(id) === '') {
            continue
        }
        if (max === '' || compareIds(id, max) > 0) {
            max = toId(id)
        }
    }
    return max
}
