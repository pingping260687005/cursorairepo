@echo off
echo ========================================
echo      Electron 简化打包工具
echo ========================================
echo.

echo 正在清理旧的构建文件...
if exist dist rmdir /s /q dist

echo 正在清理 electron-builder 缓存...
if exist "%APPDATA%\electron-builder\Cache" rmdir /s /q "%APPDATA%\electron-builder\Cache"

echo 正在打包应用程序（避免符号链接问题）...
echo.

npx electron-builder --win portable --config.compression=store

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ 打包成功！
    echo 📁 输出目录: dist\
    echo.
    if exist dist explorer dist
) else (
    echo.
    echo ❌ 打包失败！
    echo 💡 请尝试以管理员身份运行此脚本
    echo 💡 或者启用 Windows 开发者模式
    echo.
    echo 🔧 如果仍有问题，请尝试：
    echo    1. 清理 npm 缓存: npm cache clean --force
    echo    2. 重新安装依赖: rmdir /s node_modules ^&^& npm install
    echo    3. 以管理员身份运行 PowerShell
)

echo.
pause