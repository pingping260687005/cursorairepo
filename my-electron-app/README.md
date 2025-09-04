# My Electron App

这是一个简单的 Electron 应用程序示例。

## 功能特性

- 漂亮的现代化界面设计
- 显示系统信息（Node.js, Chromium, Electron 版本）
- 实时时间显示
- 交互式按钮
- 键盘快捷键支持

## 安装和运行

### 安装依赖
```bash
npm install
```

### 启动应用
```bash
npm start
```

### 开发模式
```bash
npm run dev
```

## 键盘快捷键

- `F12` - 打开开发者工具
- `Ctrl+R` - 刷新页面

## 项目结构

- `main.js` - 主进程文件，负责创建窗口和应用管理
- `index.html` - 应用的 HTML 界面
- `renderer.js` - 渲染进程脚本，处理界面逻辑
- `package.json` - 项目配置和依赖

## 技术栈

- **Electron** - 跨平台桌面应用框架
- **Node.js** - JavaScript 运行时
- **HTML/CSS/JavaScript** - 前端技术

## 注意事项

- 如果遇到 GPU 相关的警告，这是正常现象，不会影响应用功能
- 应用使用了现代 CSS 特性，如渐变背景和毛玻璃效果

## 扩展功能建议

- 添加菜单栏
- 实现文件拖拽功能
- 添加系统托盘
- 集成通知功能
- 添加多窗口支持