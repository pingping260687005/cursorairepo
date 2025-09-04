import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { ChatOpenAI } from '@langchain/openai';
import { ConversationChain } from 'langchain/chains';
import { BufferMemory } from 'langchain/memory';
import { PromptTemplate } from '@langchain/core/prompts';
import LangChainMCPServer from './mcp-server-sdk.js';
import LangChainMCPClient from './mcp-client-sdk.js';
import MCPTools from './mcp-tools.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件配置
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 初始化 LangChain 组件
let chatModel;
let memory;
let conversationChain;

// 初始化 MCP 组件
let mcpServer;
let mcpClient;
let mcpTools;

// 模拟 AI 响应函数
function getMockResponse(message) {
  const responses = {
    '你好': '你好！我是基于 LangChain.js 的 AI 助手，很高兴为您服务！请问有什么可以帮助您的吗？',
    'hello': 'Hello! I am an AI assistant built with LangChain.js. How can I help you today?',
    'langchain': 'LangChain.js 是一个强大的框架，专为构建基于大语言模型的应用程序而设计。它提供了链式调用、记忆管理、提示词模板等丰富功能。',
    'nodejs': 'Node.js 是一个基于 Chrome V8 引擎的 JavaScript 运行时，非常适合构建服务器端应用程序和 API 接口。',
    '功能': '我可以帮助您：\n💬 智能对话和问答\n🧠 记忆对话上下文\n📚 提供技术知识和建议\n⚙️ 帮助解决编程问题',
    '帮助': '当然可以帮助您！请告诉我您需要什么帮助，比如：\n- 编程相关问题\n- 技术咨询\n- 项目建议\n- 代码调试',
    'api': '这个应用提供了以下 API 接口：\n- POST /chat - 带记忆的聊天\n- POST /simple-chat - 简单聊天\n- GET /memory - 查看对话历史\n- POST /clear-memory - 清除记忆',
  };

  const message_lower = message.toLowerCase();
  
  // 关键词匹配
  for (const [keyword, response] of Object.entries(responses)) {
    if (message_lower.includes(keyword)) {
      return response;
    }
  }
  
  // 默认回复
  return `感谢您的问题！您问的是："${message}"。\n  \n🚀 这是一个演示模式的回复。在实际使用中，我会通过 OpenAI API 提供更智能的回答。\n\n💡 要使用真实的 AI 功能，请：\n1. 获取 OpenAI API Key\n2. 在 .env 文件中设置 OPENAI_API_KEY\n3. 重启服务器\n\n试试问我："你好"、"langchain"、"功能"、"帮助" 等关键词哦！`;
}

// 初始化函数
async function initializeLangChain() {
  try {
    // 检查是否有有效的 API Key
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey || apiKey === 'your_openai_api_key_here') {
      console.log('⚠️  未配置有效的 OPENAI_API_KEY，使用演示模式');
      console.log('💡 配置真实 API Key 后可使用完整 AI 功能');
      return;
    }

    // 创建聊天模型
    chatModel = new ChatOpenAI({
      modelName: "gpt-3.5-turbo",
      temperature: parseFloat(process.env.TEMPERATURE) || 0.7,
      maxTokens: parseInt(process.env.MAX_TOKENS) || 2000,
    });

    // 创建记忆
    memory = new BufferMemory({
      memoryKey: "history",
      returnMessages: true,
    });

    // 创建自定义提示模板
    const prompt = PromptTemplate.fromTemplate(`
你是一个友好、乐于助人的AI助手。请根据以下对话历史和当前问题提供有用的回答。

对话历史:
{history}

人类: {input}
AI助手:`);

    // 创建对话链
    conversationChain = new ConversationChain({
      llm: chatModel,
      memory: memory,
      prompt: prompt,
    });

    console.log('🤖 LangChain 初始化成功！');
  } catch (error) {
    console.error('❌ LangChain 初始化失败:', error.message);
    console.log('💡 提示: 使用演示模式，配置 OPENAI_API_KEY 后可使用真实AI功能');
  }
}

// 初始化MCP组件 - 使用官方 SDK
async function initializeMCP() {
  try {
    console.log('🛠️ 初始化 MCP 系统 (官方 SDK)...');
    
    // 初始化 MCP 工具
    mcpTools = new MCPTools();
    
    // 初始化 MCP 客户端
    mcpClient = new LangChainMCPClient();
    await mcpClient.connect();
    
    console.log('✅ MCP 系统初始化成功！');
    console.log('📦 使用官方 @modelcontextprotocol/sdk');
    
    // 获取可用工具
    const tools = await mcpClient.listTools();
    console.log(`🔧 可用工具: ${tools.length} 个`);
    
  } catch (error) {
    console.error('❌ MCP 初始化失败:', error.message);
  }
}

// API 路由

// 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    app: process.env.APP_NAME || 'LangChain AI App'
  });
});

// 聊天接口
app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: '消息内容不能为空' });
    }

    console.log(`💬 收到消息: ${message}`);

    let response;

    // 检查是否有有效的 LangChain 配置
    if (!conversationChain) {
      // 使用模拟响应
      response = getMockResponse(message);
      console.log(`🎭 模拟回复: ${response}`);
    } else {
      // 使用真实的 AI 回复
      const aiResponse = await conversationChain.invoke({
        input: message
      });
      response = aiResponse.response;
      console.log(`🤖 AI 回复: ${response}`);
    }

    res.json({
      success: true,
      response: response,
      timestamp: new Date().toISOString(),
      mode: conversationChain ? 'ai' : 'demo'
    });

  } catch (error) {
    console.error('❌ 聊天处理错误:', error);
    res.status(500).json({ 
      error: '处理消息时发生错误',
      details: error.message 
    });
  }
});

// 清除记忆
app.post('/clear-memory', async (req, res) => {
  try {
    if (memory) {
      await memory.clear();
      console.log('🧹 对话记忆已清除');
    }
    res.json({ success: true, message: '对话记忆已清除' });
  } catch (error) {
    console.error('❌ 清除记忆错误:', error);
    res.status(500).json({ error: '清除记忆时发生错误' });
  }
});

// 获取对话历史
app.get('/memory', async (req, res) => {
  try {
    if (memory) {
      const messages = await memory.chatHistory.getMessages();
      res.json({ 
        success: true, 
        messages: messages.map(msg => ({
          type: msg.constructor.name,
          content: msg.content
        }))
      });
    } else {
      res.json({ success: true, messages: [] });
    }
  } catch (error) {
    console.error('❌ 获取记忆错误:', error);
    res.status(500).json({ error: '获取对话历史时发生错误' });
  }
});

// 简单的问答接口（无记忆）
app.post('/simple-chat', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: '消息内容不能为空' });
    }

    if (!chatModel) {
      return res.status(500).json({ error: 'AI 服务未正确初始化' });
    }

    const response = await chatModel.invoke([
      { role: 'system', content: '你是一个友好、乐于助人的AI助手。' },
      { role: 'user', content: message }
    ]);

    res.json({
      success: true,
      response: response.content,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ 简单聊天错误:', error);
    res.status(500).json({ 
      error: '处理消息时发生错误',
      details: error.message 
    });
  }
});

// MCP相关API接口

// 获取MCP工具列表
app.get('/mcp/tools', async (req, res) => {
  try {
    if (!mcpClient || !mcpClient.isConnected()) {
      return res.status(500).json({ error: 'MCP系统未初始化或未连接' });
    }

    const tools = await mcpClient.listTools();
    res.json({
      success: true,
      tools: tools,
      count: tools.length
    });
  } catch (error) {
    console.error('❌ 获取MCP工具列表错误:', error);
    res.status(500).json({ error: '获取工具列表失败' });
  }
});

// 调用MCP工具
app.post('/mcp/call', async (req, res) => {
  try {
    const { tool, args } = req.body;

    if (!tool) {
      return res.status(400).json({ error: '工具名称不能为空' });
    }

    if (!mcpClient || !mcpClient.isConnected()) {
      return res.status(500).json({ error: 'MCP系统未初始化或未连接' });
    }

    console.log(`🔧 调用MCP工具: ${tool}`, args);
    
    const result = await mcpClient.callTool(tool, args || {});
    
    res.json({
      success: true,
      tool: tool,
      result: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ MCP工具调用错误:', error);
    res.status(500).json({ 
      error: '工具调用失败',
      details: error.message 
    });
  }
});

// 获取MCP服务器状态
app.get('/mcp/status', async (req, res) => {
  try {
    let toolCount = 0;
    
    if (mcpClient && mcpClient.isConnected()) {
      try {
        const tools = await mcpClient.listTools();
        toolCount = tools.length;
      } catch (error) {
        console.warn('获取工具数量失败:', error.message);
      }
    }

    const status = {
      mode: 'mcp-sdk', // 使用官方 MCP SDK
      client: {
        connected: mcpClient ? mcpClient.isConnected() : false,
        type: 'stdio'
      },
      tools: toolCount,
      sdk: {
        version: "0.4.0",
        type: "official",
        transport: 'stdio'
      }
    };

    res.json({
      success: true,
      status: status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ 获取MCP状态错误:', error);
    res.status(500).json({ error: '获取状态失败' });
  }
});

// 带MCP工具支持的增强聊天接口
app.post('/chat-with-tools', async (req, res) => {
  try {
    const { message, enableTools = true } = req.body;

    if (!message) {
      return res.status(400).json({ error: '消息内容不能为空' });
    }

    console.log(`💬 收到增强聊天消息: ${message}`);

    let response;
    let toolsUsed = [];

    // 检测是否需要使用工具
    if (enableTools && mcpClient && mcpClient.isConnected()) {
      // 简单的工具检测逻辑
      if (message.includes('计算') || message.includes('算') || /\d+[+\-*/]\d+/.test(message)) {
        // 数学计算
        const mathMatch = message.match(/([\d+\-*/.() ]+)/g);
        if (mathMatch) {
          try {
            const result = await mcpClient.callTool('calculator', { expression: mathMatch[0] });
            toolsUsed.push({ tool: 'calculator', result });
          } catch (error) {
            console.error('计算工具调用失败:', error);
          }
        }
      }
      
      if (message.includes('天气') || message.includes('气温')) {
        // 天气查询
        const cityMatch = message.match(/([\u5317\u4eac\u4e0a\u6d77\u5e7f\u5dde\u6df1\u5733\u676d\u5dde]+)/g);
        if (cityMatch) {
          try {
            const result = await mcpClient.callTool('get_weather', { city: cityMatch[0] });
            toolsUsed.push({ tool: 'get_weather', result });
          } catch (error) {
            console.error('天气工具调用失败:', error);
          }
        }
      }
      
      if (message.includes('搜索') || message.includes('查找')) {
        // 网络搜索
        const query = message.replace(/.*?(搜索|查找)/, '').trim();
        if (query) {
          try {
            const result = await mcpClient.callTool('web_search', { query, limit: 3 });
            toolsUsed.push({ tool: 'web_search', result });
          } catch (error) {
            console.error('搜索工具调用失败:', error);
          }
        }
      }
    }

    // 构建包含工具结果的响应
    if (toolsUsed.length > 0) {
      let toolResponses = [];
      toolsUsed.forEach(({ tool, result }) => {
        if (result.success) {
          switch (tool) {
            case 'calculator':
              toolResponses.push(`🧮 计算结果: ${result.formatted}`);
              break;
            case 'get_weather':
              toolResponses.push(`🌤️ ${result.formatted}`);
              break;
            case 'web_search':
              if (result.results && result.results.length > 0) {
                toolResponses.push(`🔍 搜索结果:\n${result.results.map(r => `• ${r.snippet}`).join('\n')}`);
              }
              break;
          }
        }
      });
      
      response = toolResponses.join('\n\n');
      
      if (!response) {
        response = getMockResponse(message);
      }
    } else {
      // 使用常规聊天逻辑
      if (!conversationChain) {
        response = getMockResponse(message);
      } else {
        const aiResponse = await conversationChain.invoke({ input: message });
        response = aiResponse.response;
      }
    }

    res.json({
      success: true,
      response: response,
      toolsUsed: toolsUsed.map(t => ({ tool: t.tool, success: t.result.success })),
      timestamp: new Date().toISOString(),
      mode: conversationChain ? 'ai' : 'demo'
    });

  } catch (error) {
    console.error('❌ 增强聊天处理错误:', error);
    res.status(500).json({ 
      error: '处理消息时发生错误',
      details: error.message 
    });
  }
});

// 启动服务器
async function startServer() {
  await initializeLangChain();
  await initializeMCP();
  
  app.listen(PORT, () => {
    console.log('🚀 LangChain AI 服务器启动成功!');
    console.log(`📡 服务地址: http://localhost:${PORT}`);
    console.log(`🔧 环境: ${process.env.NODE_ENV}`);
    console.log('📚 可用接口:');
    console.log('   GET  /health - 健康检查');
    console.log('   POST /chat - 带记忆的聊天');
    console.log('   POST /simple-chat - 简单聊天');
    console.log('   POST /clear-memory - 清除记忆');
    console.log('   GET  /memory - 获取对话历史');
    console.log('   GET  /mcp/tools - 获取MCP工具列表');
    console.log('   POST /mcp/call - 调用MCP工具');
    console.log('   GET  /mcp/status - MCP服务器状态');
    console.log('   POST /chat-with-tools - 带工具支持的聊天');
    console.log('\n💡 使用示例:');
    console.log('curl -X POST http://localhost:3001/chat -H "Content-Type: application/json" -d \'{"message":"你好！"}\'');
  });
}

// 错误处理
process.on('uncaughtException', (error) => {
  console.error('❌ 未捕获的异常:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ 未处理的 Promise 拒绝:', reason);
});

// 启动应用
startServer().catch(console.error);