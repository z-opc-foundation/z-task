#!/bin/bash
set -e

echo "===================== 启动 Z-Task 服务 ====================="

# 先打包
sh package.sh

# 启动服务
echo "启动服务..."
cd z-task-starter
mvn spring-boot:run
