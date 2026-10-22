# z-task-admin 生产镜像（卡 TASK-20261023-008）
#
# 【为什么基底是「现役镜像」而不是 jre 基础镜像】
#   本仓根目录那个 Dockerfile 是**过期**的：它 COPY 的是 z-task-starter/target/…，
#   而本仓 reactor 里根本没有 z-task-starter 这个模块（模块是 z-task-core /
#   z-task-web / z-task-admin）⇒ 照它构建必然 COPY 失败。
#   线上 zopc/z-task:local 是历史上手工构建的，运行时（Temurin jdk8u504 /
#   JAVA_HOME=/opt/java/openjdk / entrypoint
#   `sh -c "exec java $JAVA_OPTS -jar /app/app.jar"` / 端口 8082）已在线上验证过。
#   本轮只换 jar ⇒ 基底直接取现役镜像 ⇒ 运行时**零漂移**，把变量收敛到「jar 内容」一个。
#
# 【构建】
#   cd z-task
#   mvn -B -pl z-task-admin -am clean package -Dmaven.test.skip=true
#   docker buildx build --platform linux/amd64 --provenance=false --sbom=false --load \
#     -f deploy/Dockerfile -t zopc/z-task:1.0.0-zboot112 .
#
# 【tag 铁律】
#   产出的 tag 必须与 deploy/k8s/02-deployment.yaml 的 `image:` 逐字一致 ——
#   本集群 imagePullPolicy=Never，k3s 按字面引用去节点本地 content store 找。
#   ⚠ 不得再用 `:local`：`:local` 不可回滚、不可追溯。
FROM zopc/z-task:local

# Spring Boot 胖 jar（只匹配胖包，`.jar.original` 不匹配）
COPY z-task-admin/target/z-task-admin-*.jar /app/app.jar
