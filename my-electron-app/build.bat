@echo off
echo ========================================
echo          Electron App 打包工具
echo ========================================
echo.

set /p choice="请选择打包类型 (1-安装包, 2-便携版, 3-全部): "

if "%choice%"=="1" (
    echo 正在创建安装包...
    npm run build:win
) else if "%choice%"=="2" (
    echo 正在创建便携版...
    npm run build:portable
) else if "%choice%"=="3" (
    echo 正在创建所有版本...
    npm run build
) else (
    echo 无效选择，默认创建安装包...
    npm run build:win
)

echo.
echo 打包完成！请查看 dist 目录。
pause