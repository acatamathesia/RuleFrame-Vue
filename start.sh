#!/bin/bash

echo "============================================"
echo "   RuleFrame Vue 管理系统 - 启动脚本"
echo "============================================"
echo ""

cd "$(dirname "$0")"

if [ ! -d "node_modules" ]; then
    echo "[提示] 检测到首次运行，正在安装依赖..."
    npm install
    
    if [ $? -ne 0 ]; then
        echo "[错误] 依赖安装失败！"
        exit 1
    fi
    
    echo ""
    echo "[成功] 依赖安装完成！"
    echo ""
fi

echo "[信息] 正在启动开发服务器..."
echo "[信息] 访问地址: http://localhost:3000"
echo ""
echo "按 Ctrl+C 停止服务器"
echo ""

npm run dev