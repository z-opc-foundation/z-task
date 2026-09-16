#!/bin/bash
set -e

# 指定JDK 8版本编译
export JAVA_HOME=/Users/zifang/Library/Java/JavaVirtualMachines/corretto-1.8.0_482/Contents/Home
export PATH=$JAVA_HOME/bin:$PATH

echo "===================== 开始打包 ====================="

# 1. 构建前端
echo "1. 构建前端项目..."
cd z-task-frontend
npm install
npm run build
cd ..

# 2. 复制前端资源到starter的static目录
echo "2. 复制前端资源到starter..."
rm -rf z-task-starter/src/main/resources/static/*
cp -r z-task-frontend/dist/* z-task-starter/src/main/resources/static/

# 3. 打包后端
echo "3. 打包后端项目..."
mvn clean
mvn install -DskipTests=true

echo "===================== 打包完成 ====================="
echo "jar包位置：z-task-starter/target/z-task-starter-*.jar"
