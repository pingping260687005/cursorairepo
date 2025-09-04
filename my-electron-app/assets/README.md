# Electron App 图标说明

## 图标要求

为了正确打包应用程序，您需要在 `assets` 目录下添加以下图标文件：

- `icon.ico` - Windows 图标文件 (256x256 像素)
- `icon.png` - 通用 PNG 图标 (512x512 像素)

## 图标生成建议

1. 使用在线图标生成器：
   - https://www.favicon-generator.org/
   - https://convertio.co/png-ico/

2. 推荐尺寸：
   - ICO 文件：256x256, 128x128, 64x64, 48x48, 32x32, 16x16
   - PNG 文件：512x512

3. 设计建议：
   - 简洁明了的设计
   - 在小尺寸下仍然清晰可见
   - 符合应用程序主题

## 临时解决方案

如果没有自定义图标，打包程序会使用 Electron 默认图标。