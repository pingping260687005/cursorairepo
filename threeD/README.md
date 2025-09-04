# 智慧园区3D可视化显示系统

一个基于Three.js的智慧园区3D可视化平台，提供直观的园区管理和实时数据监控功能。

## 项目特性

### 🎯 核心功能
- **3D园区视图**: 沉浸式三维园区展示
- **实时数据监控**: 传感器数据实时可视化
- **交互式操作**: 鼠标/键盘操控，支持多种视角
- **智能告警**: 异常状态实时提醒
- **数据分析**: 能耗、环境数据统计分析

### 🏗️ 技术架构
- **渲染引擎**: Three.js + WebGL
- **构建工具**: Vite
- **开发语言**: ES6+ JavaScript
- **UI框架**: 原生HTML5/CSS3
- **数据管理**: 模拟数据源 + WebSocket支持

### 🎨 视觉特效
- **动态光照**: 昼夜循环、多光源系统
- **材质渲染**: PBR材质、阴影效果
- **粒子动画**: 车辆移动轨迹
- **后处理**: 抗锯齿、色彩校正

## 快速开始

### 环境要求
- Node.js 16+
- 现代浏览器（支持WebGL）

### 安装运行

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

### 访问应用
打开浏览器访问 `http://localhost:3000`

## 操作指南

### 🖱️ 鼠标控制
- **左键拖拽**: 旋转视角
- **右键拖拽**: 平移视图
- **滚轮**: 缩放
- **单击对象**: 选择并查看详情
- **双击对象**: 聚焦到对象

### ⌨️ 键盘快捷键
- **W/A/S/D**: 相机移动
- **Tab**: 切换控制面板
- **Esc**: 清除选择
- **F**: 聚焦选中对象
- **Ctrl+R**: 重置视角

### 🎛️ 界面功能
- **视角控制**: 鸟瞰、正面、侧面、等轴视角
- **显示设置**: 切换建筑物、传感器、车辆显示
- **数据筛选**: 按状态筛选设备
- **实时统计**: 园区概况数据

## 项目结构

```
src/
├── core/                   # 核心模块
│   ├── SceneManager.js     # 场景管理
│   ├── CameraController.js # 相机控制
│   ├── LightingSystem.js   # 光照系统
│   ├── DataManager.js      # 数据管理
│   └── InteractionSystem.js# 交互系统
├── components/             # 组件模块
│   ├── UIManager.js        # UI管理
│   └── ModelFactory.js     # 模型工厂
├── styles/                 # 样式文件
│   └── main.css           # 主样式
├── SmartParkApp.js        # 主应用类
└── main.js                # 入口文件
```

## 组件说明

### SceneManager (场景管理器)
负责Three.js场景的创建和渲染管理，包括性能优化和资源管理。

### CameraController (相机控制器)
提供丰富的相机控制功能，支持轨道控制、预设视角和平滑动画。

### LightingSystem (光照系统)
多光源系统，支持昼夜循环、动态阴影和环境光照。

### DataManager (数据管理器)
处理实时数据获取、缓存和分发，支持WebSocket和模拟数据。

### InteractionSystem (交互系统)
高级3D对象交互系统，支持射线投射、对象选择和事件处理。

### UIManager (界面管理器)
统一的UI管理，响应式设计，支持多种设备。

### ModelFactory (模型工厂)
3D模型创建和材质管理，支持LOD和批处理优化。

## 开发调试

### 调试工具
在开发模式下，可使用以下调试命令：

```javascript
// 在浏览器控制台中使用
debugSmartPark.stats()        // 查看统计信息
debugSmartPark.setQuality('high') // 设置渲染质量
debugSmartPark.toggleDayNight()   // 切换昼夜循环
debugSmartPark.exportData()       // 导出场景数据
```

### 快捷键
- **Ctrl+Shift+D**: 输出调试信息
- **Ctrl+Shift+E**: 导出场景数据  
- **Ctrl+Shift+R**: 重置应用

## 性能优化

### 渲染优化
- 分层渲染
- LOD系统
- 视锥剔除
- 批处理合并

### 内存管理
- 资源自动释放
- 材质复用
- 几何体缓存

### 响应式降级
- 自动质量调整
- FPS监控
- 内存使用监控

## 浏览器支持

| 浏览器 | 版本要求 |
|--------|----------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |

## 许可证

ISC License

## 贡献指南

欢迎提交Issue和Pull Request来改进项目！

## 更新日志

### v1.0.0
- 初始版本发布
- 完整的3D园区可视化功能
- 实时数据监控
- 交互式操作界面