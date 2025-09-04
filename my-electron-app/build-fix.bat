@echo off
echo ========================================
echo    Electron 权限修复打包工具
echo ========================================
echo.

echo 正在清理缓存和临时文件...
if exist dist rmdir /s /q dist
if exist node_modules\.cache rmdir /s /q node_modules\.cache

echo 正在清理 electron-builder 缓存...
if exist "%APPDATA%\electron-builder\Cache" rmdir /s /q "%APPDATA%\electron-builder\Cache"
if exist "%LOCALAPPDATA%\electron-builder\Cache" rmdir /s /q "%LOCALAPPDATA%\electron-builder\Cache"

echo 正在清理 npm 缓存...
npm cache clean --force

echo.
echo 正在打包便携版应用程序（无代码签名）...
echo.

npx electron-builder --win portable --config.compression=store --config.win.forceCodeSigning=false --config.directories.cache=false

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ 打包成功！
    echo 📁 输出目录: dist\
    echo.
    if exist dist explorer dist
) else (
    echo.
    echo ❌ 打包仍然失败！
    echo.
    echo 🔧 建议尝试以下解决方案：
    echo.
    echo 方案1: 以管理员身份运行此脚本
    echo    右键点击此文件 → "以管理员身份运行"
    echo.
    echo 方案2: 启用 Windows 开发者模式
    echo    设置 → 更新和安全 → 开发者选项 → 开发人员模式
    echo.
    echo 方案3: 使用管理员权限的 PowerShell
    echo    以管理员身份打开 PowerShell，然后运行：
    echo    Set-Location "e:\src\git\cursor\my-electron-app"
    echo    npm run build:portable
    echo.
)

echo.
pause