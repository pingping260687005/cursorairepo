# 🤖 LangChain.js AI 应用程序 + MCP 集成

一个基于 LangChain.js 和 MCP (Model Context Protocol) 的现代化 AI 智能应用程序。

## ✨ 特性

### 🤖 AI 功能
- 智能对话系统（基于 LangChain.js）
- 上下文记忆管理
- 自定义提示词模板
- 多模式聊天支持

### 🛠️ MCP 工具系统
- 📝 **文件操作**: 读取和写入本地文件
- 🔍 **网络搜索**: 基于 DuckDuckGo 的智能搜索
- 🧮 **计算器**: 支持复杂数学运算
- 🌤️ **天气查询**: 实时天气信息
- 💻 **代码执行**: 支持 JavaScript/Python/Bash
- 📊 **状态监控**: 实时系统状态

### 🌐 Web 界面
- 现代化响应式设计
- 实时聊天界面
- MCP 工具控制面板
- 智能工具选择
- 移动端适配

## 🚀 快速开始

### 环境要求
- Node.js v18.0+
- npm v8.0+

### 安装步骤

```bash
# 1. 克隆项目
git clone <your-repository>
cd langchainai

# 2. 安装依赖
npm install --legacy-peer-deps

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env 文件设置 OPENAI_API_KEY

# 4. 启动应用
npm start
```

### 访问应用

- **Web 界面**: http://localhost:3001
- **MCP 服务器**: ws://localhost:8080
- **健康检查**: http://localhost:3001/health

## 🔧 MCP 工具使用

### 智能聊天调用

在 Web 界面中直接输入包含关键词的消息：

- 🧮 **计算**: "请计算2+3*4" → 自动调用计算器
- 🌤️ **天气**: "北京天气怎么样" → 自动查询天气  
- 🔍 **搜索**: "搜索nodejs教程" → 自动网络搜索

### API 直接调用

```bash
# 获取工具列表
curl -X GET http://localhost:3001/mcp/tools

# 调用计算器工具
curl -X POST http://localhost:3001/mcp/call \
  -H "Content-Type: application/json" \
  -d '{"tool": "calculator", "args": {"expression": "2+3*4"}}'

# 使用增强聊天
curl -X POST http://localhost:3001/chat-with-tools \
  -H "Content-Type: application/json" \
  -d '{"message": "请计算123*456", "enableTools": true}'
```

## 📚 API 接口

### 基础功能

| 接口 | 方法 | 描述 |
|------|------|------|
| `/health` | GET | 健康检查 |
| `/chat` | POST | 带记忆的聊天 |
| `/simple-chat` | POST | 简单聊天 |
| `/clear-memory` | POST | 清除记忆 |
| `/memory` | GET | 获取对话历史 |

### MCP 功能

| 接口 | 方法 | 描述 |
|------|------|------|
| `/mcp/tools` | GET | 获取工具列表 |
| `/mcp/call` | POST | 调用指定工具 |
| `/mcp/status` | GET | MCP 系统状态 |
| `/chat-with-tools` | POST | 带工具的增强聊天 |

## 🛠️ 开发和扩展

### 项目结构

```
langchainai/
├── 📄 index.js              # 主应用程序
├── 📦 package.json          # 项目配置
├── ⚙️ .env                  # 环境变量
├── 🛠️ mcp-server.js         # MCP 服务器
├── 🔧 mcp-client.js         # MCP 客户端
├── 🧰 mcp-tools.js          # MCP 工具实现
├── ⚙️ mcp-config.js         # MCP 配置
├── 🌐 public/              # 静态资源
│   └── index.html          # Web 界面
├── 💡 examples/            # 示例代码
│   ├── chat.js             # 基础聊天
│   ├── memory-chat.js      # 记忆聊天
│   └── mcp-demo.js         # MCP 演示
└── 📖 docs/               # 文档
    ├── API_DOCUMENTATION.md
    ├── MCP_GUIDE.md
    └── DEPLOYMENT_GUIDE.md
```

### 可用脚本

```bash
npm start          # 启动生产服务器
npm run dev        # 开发模式 (nodemon)
npm run chat       # 命令行聊天示例
npm run memory     # 记忆聊天示例
npm run mcp-demo   # MCP 功能演示
```

### 添加自定义工具

1. **在 `mcp-tools.js` 中添加工具**:
```javascript
async customTool(args) {
  // 实现您的工具逻辑
  return {
    success: true,
    result: "工具执行结果"
  };
}
```

2. **注册工具处理器**:
```javascript
this.toolHandlers = {
  // ... 现有工具
  custom_tool: this.customTool.bind(this)
};
```

## 🔐 环境配置

创建 `.env` 文件并配置以下变量：

```env
# OpenAI 配置
OPENAI_API_KEY=your_openai_api_key_here

# 服务器配置
PORT=3001
NODE_ENV=development

# AI 模型参数
TEMPERATURE=0.7
MAX_TOKENS=2000

# 应用信息
APP_NAME=LangChain AI App
```

## 🐳 部署指南

### Docker 部署

```bash
# 构建镜像
docker build -t langchain-ai .

# 运行容器
docker run -p 3001:3001 -p 8080:8080 \
  -e OPENAI_API_KEY=your_key \
  langchain-ai
```

### PM2 部署

```bash
# 安装 PM2
npm install -g pm2

# 启动应用
pm2 start ecosystem.config.js

# 查看状态
pm2 status
pm2 logs
```

详细部署指南请参考 [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

## 📖 文档

- 📚 [API 文档](API_DOCUMENTATION.md) - 完整的 API 接口文档
- 🛠️ [MCP 指南](MCP_GUIDE.md) - MCP 工具系统详解
- 🚀 [部署指南](DEPLOYMENT_GUIDE.md) - 生产环境部署
- 📊 [项目总结](项目总结.md) - 功能特性总结

## 🔍 故障排除

### 常见问题

#### MCP 服务器无法启动
```bash
# 检查端口占用
netstat -an | find "8080"
```

#### API Key 错误
确保在 `.env` 文件中正确设置了 `OPENAI_API_KEY`

#### 依赖安装失败
```bash
npm cache clean --force
npm install --legacy-peer-deps
```

### 调试模式

启动时会显示详细的日志信息：
```
🚀 LangChain AI 服务器启动成功!
🛠️ MCP 系统初始化成功！
🚀 MCP服务器启动成功，端口: 8080
🔧 MCP客户端连接成功
```

## 🎯 功能演示

### Web 界面功能
1. 访问 http://localhost:3001
2. 点击 "🔧 MCP工具" 查看可用工具
3. 使用 "🛠️ 工具" 按钮进行智能聊天

### 命令行演示
```bash
# MCP 工具演示
npm run mcp-demo

# 基础聊天
npm run chat
```

## 🌟 技术亮点

- 🔗 **LangChain 集成**: 完整的对话链管理
- 🛠️ **MCP 协议**: 标准化工具调用接口
- 🌐 **WebSocket**: 实时 MCP 通信
- 🔐 **安全设计**: 工具调用安全验证
- 📊 **实时监控**: 系统状态实时监控
- 🎨 **现代界面**: 响应式 Web 设计

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 发起 Pull Request

## 📄 许可证

MIT License

## 📞 技术支持

如需帮助，请：

1. 查看文档和示例
2. 检查日志输出
3. 提交 Issue 说明问题
4. 参考故障排除指南

---

**🎉 享受您的 AI + MCP 开发之旅！**