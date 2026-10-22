# z-task 部署清单（deploy/k8s）

本目录是 **z-task** 在家庭 k3s 集群（节点 `zifang001` / `zifang002`）的部署清单。

这批 Deployment 当初是手工 `kubectl apply` 上去的，仓里查不到「它是怎么部署的」——
集群无法从代码复现，发版只能靠记忆和手记。本目录把**线上实况**（`kubectl get deploy,svc -o yaml` 的真实导出）固化回代码。

> ⚠ 本目录**只产出清单，不代跑**。`kubectl apply` 会改动生产集群，需要人工确认后执行。

## 0. 清单内容

| 文件 | 对象 | 线上对应 |
|---|---|---|
| `00-namespace.yaml` | Namespace `z-task` | 已存在 |
| `01-service.yaml` | Service `z-task-admin`（NodePort 31882 → 8082） | 已存在 |
| `02-deployment.yaml` | Deployment `z-task-admin`（镜像 `zopc/z-task:1.0.0-zboot112`，replicas 1） | 已存在 |
| `README.md` | 本文件 | — |

线上实况要点（与基线导出逐条对齐）：

- Deployment 名 `z-task-admin`，容器名 `z-task`，容器端口 `8082`（端口名 `http`）
- Service `z-task-admin`，`type: NodePort`，`port 8082 → targetPort http`，`nodePort 31882`
- 镜像 `zopc/z-task:1.0.0-zboot112`，`imagePullPolicy: Never`
- env：`JAVA_OPTS=-Xms256m -Xmx1024m` + `ZTASK_DB_HOST` / `_PORT` / `_NAME` / `_USER` / `_PASSWORD`
- resources：requests `300m` / `1280Mi`，limits `2` CPU / `2Gi`
- 本域**无 PVC**

## 1. 怎么构建镜像

### 现状（如实说明）：本仓**有** Dockerfile，但它与当前代码/线上规格**对不上**

`z-task/Dockerfile` 在仓里，但它按现状**构建不出**线上那份镜像，两处对不上：

| Dockerfile 现状 | 仓/线上的实际 |
|---|---|
| `COPY z-task-starter/target/z-task-starter-1.0.0-SNAPSHOT.jar app.jar` | **模块 `z-task-starter` 在本仓不存在**（本仓模块只有 `z-task-core` / `z-task-web` / `z-task-admin`）。启动类是 `z-task-admin` 里的 `ZTaskAdminApplication` ⇒ 产物应是 `z-task-admin/target/z-task-admin-1.0.0.jar`（本仓版本已是 `1.0.0`，不是 `1.0.0-SNAPSHOT`）。⇒ 这行 COPY 会让 build 直接失败（源文件不存在） |
| `ENV SERVER_PORT=8080` / `EXPOSE 8080`（注释说「覆盖 jar 内 application.yml 的 8082」） | `z-task-admin/src/main/resources/application.yml` 里是 `server.port: 8082`，**线上容器端口也是 8082**（Service targetPort 指向 `http`/8082）。⇒ 按现 Dockerfile 构建出的镜像监听 8080，与本清单的 8082 不匹配 |

线上镜像口径：裸 tag `zopc/z-task:1.0.0-zboot112`，只存在于两个节点的 containerd，不在任何 registry。
**线上那份镜像显然不是用仓内这份 Dockerfile 原样构建出来的**（或构建后改过端口/模块名）——
这正是「仓里查不到它怎么部署的」的具体表现。

> ⚠ 2026-10-23（卡 `TASK-20261023-012`）：线上 tag 已从 `zopc/z-task:local` 换成版本化
> `zopc/z-task:1.0.0-zboot112`（卡 `TASK-20261023-008` 抬 `z-boot-parent` BOM 1.1.0 → 1.1.2 时换的），
> 本清单的 `image:` 行已同步对齐到线上现役坐标。**`:local` 不可回滚、不可追溯，不再使用。**

### 建议命令（可执行；Dockerfile 需先按下面修正进仓）

```bash
# 1) 打 jar —— 启动类是 z-task-admin 里的 ZTaskAdminApplication
cd z-task
mvn -pl z-task-admin -am clean package -DskipTests
# 产物：z-task-admin/target/z-task-admin-1.0.0.jar

# 2) 建议修正 z-task/Dockerfile（两处：COPY 源模块 + 端口口径），改完再构建：
#
#    FROM eclipse-temurin:8-jdk
#    LABEL maintainer="zifang"
#    RUN apt-get update && apt-get install -y --no-install-recommends tzdata wget && \
#        ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
#        echo "Asia/Shanghai" > /etc/timezone && \
#        apt-get remove -y tzdata && apt-get autoremove -y && apt-get clean
#    WORKDIR /app
#    COPY z-task-admin/target/z-task-admin-1.0.0.jar app.jar
#    # 端口口径：本仓 application.yml 是 8082，线上容器端口也是 8082 ⇒ 不要覆盖成 8080
#    EXPOSE 8082
#    HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
#      CMD wget -q -O- http://127.0.0.1:8082/doc.html || exit 1
#    ENTRYPOINT ["java", "-jar", "app.jar"]

# 3) 构建（tag 必须与 02-deployment.yaml 里的 image: 逐字一致）
docker build -t zopc/z-task:1.0.0-zboot112 .
```

⚠ 改 Dockerfile 属于改 `z-task/` 仓内非 `deploy/` 的文件，**本任务没有动它**（硬约束：只写 `deploy/`）。
上面是建议内容，需人工评审后提交。

## 2. 怎么喂 containerd

铁律三条：

1. **裸 tag，禁 Nexus 前缀**——本集群 `imagePullPolicy: Never`，k3s 不会去 registry 拉，
   它按 `image:` 的字面引用去节点本地 content store 找。喂进去的 tag 带前缀
   （如 `nexus.internal/zopc/z-task:1.0.0-zboot112`）而清单里写的是裸 tag（或反过来）⇒ **ErrImageNeverPull**。
2. **必须用 `cat` 管道喂 `k3s ctr images import -`**——`ctr images import` 从 **stdin** 读，
   直接把文件路径当参数会报 `unrecognized image format`。
3. **两个节点都要喂**——两个节点都是工作节点，Pod 可能落在任一节点；只喂一个会出现
   `ErrImageNeverPull` + Pod 反复重建。

```bash
# 1) 在开发机上导出镜像（build 可在开发机做，不必上节点）
docker save zopc/z-task:1.0.0-zboot112 > /tmp/z-task-1.0.0-zboot112.tar
scp /tmp/z-task-1.0.0-zboot112.tar zifang@192.168.31.231:/tmp/     # zifang001
scp /tmp/z-task-1.0.0-zboot112.tar zifang@192.168.31.136:/tmp/     # zifang002

# 2) 喂 zifang001（192.168.31.231）——该节点 sudo 需要口令，会交互提示
ssh zifang@192.168.31.231 'cat /tmp/z-task-1.0.0-zboot112.tar | sudo k3s ctr images import -'

# 3) 喂 zifang002（192.168.31.136）——该节点 sudo -n 可免密
ssh zifang@192.168.31.136 'cat /tmp/z-task-1.0.0-zboot112.tar | sudo -n k3s ctr images import -'

# 4) 核验（两个节点都要看到，且 tag 必须与清单一致）
ssh zifang@192.168.31.231 'sudo k3s ctr images ls | grep z-task'
ssh zifang@192.168.31.136 'sudo -n k3s ctr images ls | grep z-task'
```

一步到位的写法（不落临时文件，效果等价）：

```bash
docker save zopc/z-task:1.0.0-zboot112 | ssh zifang@192.168.31.231 'cat - | sudo k3s ctr images import -'
docker save zopc/z-task:1.0.0-zboot112 | ssh zifang@192.168.31.136 'cat - | sudo -n k3s ctr images import -'
```

## 3. 怎么 apply

```bash
# ⚠ 会改动生产集群，需要人工确认后再执行；本仓只产出清单，不代跑。
kubectl apply -f deploy/k8s/
```

执行顺序与前置条件（apply 前置检查）：

1. **secret 先在**：`z-task-db`（键 `password`）必须已存在于 ns `z-task`，
   否则 Pod 会卡 `CreateContainerConfigError`（找不到 secret key）。
   集群里这个 secret 已经存在；重建集群时按下面补灌（口令真值在
   `lead/004_重要秘钥/`，不入仓）：

   ```bash
   kubectl -n z-task create secret generic z-task-db \
     --from-literal=password='<从 lead/004_重要秘钥/ 取真值>'
   ```

2. **namespace 先在**：`00-namespace.yaml` 已包含在目录里，`kubectl apply -f deploy/k8s/`
   会按文件名顺序（00 → 01 → 02）依次 apply，namespace 自动先建。
3. **镜像先在**：见 §2。两个节点都喂完再 apply，否则 Pod 起不来。

apply 后自检：

```bash
kubectl -n z-task get deploy,svc,pods
kubectl -n z-task describe deploy z-task-admin | tail -30
```

## 4. 怎么回滚

```bash
# 看历史版本
kubectl -n z-task rollout history deploy/z-task-admin

# 回滚到上一个版本
kubectl -n z-task rollout undo deploy/z-task-admin

# 回滚到指定版本
kubectl -n z-task rollout undo deploy/z-task-admin --to-revision=<N>

# 看回滚是否完成
kubectl -n z-task rollout status deploy/z-task-admin
```

⚠ **PVC 数据不会自动回滚**：本域没有 PVC（纯无状态 Deployment），
但 z-task 用的存储在**共享 RDS** 上，回滚 Pod **不会**回滚数据库 schema / 数据。
镜像里带 DDL 变更时，回滚镜像后旧 schema 仍在，需要人工确认兼容性。

⚠ **回滚的前提是节点上有旧镜像**：回滚只改 Deployment 里的 `image:` 字段指向的旧 tag，
该 tag 必须仍在这两个节点的 containerd 里（`k3s ctr images ls` 能看到）。旧镜像被清掉就回滚不动。

## 5. 本清单与线上的差异（抄写时发现）

| 项 | 线上 | 本清单 | 原因 |
|---|---|---|---|
| readinessProbe | `httpGet /doc.html`（Swagger 文档页） | `tcpSocket 8082`（readiness + liveness） | 本域 HTTP 端点被 SSO 闸门挡（`/actuator/health` 返回 302/401），探针只认 2xx/3xx ⇒ 用 tcpSocket 只证端口在监听 |
| labels | 资源上只有 `app.kubernetes.io/name` | 额外加 `app.kubernetes.io/part-of` | 仅加标签，不影响 selector 匹配；`apply` 是幂等合并 |
| SA 令牌自动挂载 | `automountServiceAccountToken: false` | 不含该字段 | 该收敛由**独立清单**执行（卡 `TASK-20261021-021` 交付、用户亲自执行），刻意与各域部署清单分开，避免抢同一批字段。⚠ `apply` 本清单**不会回退**这项加固（字段既不在本清单、也不在 last-applied ⇒ 三向合并不构成删除动作，已用 `kubectl apply --dry-run=server` 逐域实测：该字段仍为 `false`） |

## 6. 待办（不在本任务范围内）

- **`z-task/Dockerfile` 与当前代码对不上**（§1）：COPY 的模块 `z-task-starter` 已不存在，
  端口口径（8080 vs 线上 8082）也不一致 ⇒ 仓内 Dockerfile 目前**构建不出**线上那份镜像。
  需人工修正 Dockerfile 并提交。
- 本域没有「不经 SSO 闸门」的内部健康端点，探针只能停在 tcpSocket 级别。

## 7. ⚠️ 纪律：发版 ⇒ **同一次提交里同步清单 `image:` 行**（2026-10-23 落地 · 卡 `TASK-20261023-012` 第 7 项）

### 7.1 纪律条目（一句话，可被下一轮巡检读到）

> **线上镜像坐标变更必须在同一次提交里同步 `deploy/k8s/*-deployment.yaml` 的 `image:` 行。**
> 换句话说：**改了线上跑的那个 tag，就必须同一次提交把仓内清单的 `image:` 改成逐字一致的同一个 tag。**

### 7.2 为什么（这是本仓踩过的真实坑）

2026-10-23 卡 `TASK-20261023-008` 给本域发版，把线上镜像从 `zopc/z-task:local`
换成版本化 tag `zopc/z-task:1.0.0-zboot112`（顺带把 `z-boot-parent` BOM 从 1.1.0 抬到 1.1.2，
修「DB 健康检查卡死 16 分钟」那个坑）。**那次提交只改了 `02-deployment.yaml` 的注释头，
实体 `image:` 行仍然是 `zopc/z-task:local`** ⇒ 线上跑新镜像、仓内清单还钉旧 tag
⇒ 巡检量具 `layers.manifest_image_drift` 报 `manifest_behind_live`（🔴 高危）。

### 7.3 为什么这条回滚是**静默**的（本域 `imagePullPolicy: Never` 特有的）

| 查什么 | 本域实况 | 后果 |
|---|---|---|
| 旧 tag 还在节点上吗？| 在 —— 回滚目标 `zopc/z-task:local` 就是几分钟前线上正在跑的那份 | ⇒ apply **拉得到镜像** |
| apply 会报错吗？| 不会 —— `imagePullPolicy: Never` + 镜像在本地 content store | ⇒ **不会 `ErrImageNeverPull`** |
| 那会怎样？| Pod 正常起来、探针正常、事件 0 | 🔴 **静默回滚**，**没有任何告警** |
| 回滚丢了什么？| 丢 `z-boot-parent` 1.1.2 的 `connectTimeout` / `socketTimeout` ⇒「DB 健康卡死 16 分钟」原样复活 | 故障**极难归因**（没报错、没事件、没重启）|

⇒ 所以「清单落后」不是「当前故障」，而是**一次例行 `kubectl apply` 就会触发的静默回滚风险**。

### 7.4 怎么自查（只读，随时可跑）

```bash
# 线上现役 tag
kubectl -n z-task get deploy z-task-admin \
  -o jsonpath='{.spec.template.spec.containers[*].image}'
# 仓内清单（远端 HEAD，origin/main）的 tag
git show origin/main:deploy/k8s/02-deployment.yaml | grep -n 'image:'
```

两边**逐字一致**才算对齐。⚠ **不要**用 `git show HEAD:` —— 口径是 `origin/main`（与巡检量具同源）。

> 通用版纪律见 lead 仓 `006_部署方案/010_发版收尾清单.md`；
> 同款纪律也落在 `z-agent/deploy/k8s/README.md` §8.3（`z-agent` 那份还额外讲了
> 「注解陈旧 vs 清单落后」两档别混读）。
