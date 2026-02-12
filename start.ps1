# RuleFrame Vue 管理系统启动脚本

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   RuleFrame Vue 管理系统 - 启动脚本" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

if (-not (Test-Path "node_modules")) {
    Write-Host "[提示] 检测到首次运行，正在安装依赖..." -ForegroundColor Yellow
    npm install
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[错误] 依赖安装失败！" -ForegroundColor Red
        Read-Host "按回车键退出"
        exit 1
    }
    
    Write-Host ""
    Write-Host "[成功] 依赖安装完成！" -ForegroundColor Green
    Write-Host ""
}

Write-Host "[信息] 正在启动开发服务器..." -ForegroundColor Blue
Write-Host "[信息] 访问地址: http://localhost:3000" -ForegroundColor Blue
Write-Host ""
Write-Host "按 Ctrl+C 停止服务器" -ForegroundColor Gray
Write-Host ""

npm run dev