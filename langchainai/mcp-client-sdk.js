/**
 * MCP 客户端实现 - 使用官方 @modelcontextprotocol/sdk
 * 
 * 这是一个标准的 MCP 客户端，用于连接和调用 MCP 服务器
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class LangChainMCPClient {
  constructor() {
    this.client = null;
    this.transport = null;
    this.serverProcess = null;
    this.connected = false;
  }

  async connect() {
    try {
      console.log('🔌 启动 MCP 服务器进程...');
      
      // 启动 MCP 服务器进程
      const serverPath = join(__dirname, 'mcp-server-sdk.js');
      console.log('📡 启动服务器路径:', serverPath);
      
      // 使用 StdioClientTransport 直接启动服务器进程
      // 根据 MCP SDK 文档，StdioClientTransport 需要 command 和 args
      this.transport = new StdioClientTransport({
        command: 'node',
        args: [serverPath],
        env: { ...process.env, MCP_SERVER_MODE: 'true' }
      });

      // 创建客户端
      this.client = new Client(
        {
          name: 'langchain-ai-mcp-client',
          version: '1.0.0'
        },
        {
          capabilities: {}
        }
      );

      // 连接到服务器
      await this.client.connect(this.transport);
      this.connected = true;

      console.log('✅ MCP 客户端连接成功');
      
      return this.client;
    } catch (error) {
      console.error('❌ MCP 客户端连接失败:', error);
      throw error;
    }
  }

  async listTools() {
    if (!this.connected || !this.client) {
      throw new Error('MCP 客户端未连接');
    }

    try {
      const response = await this.client.listTools();
      return response.tools || [];
    } catch (error) {
      console.error('❌ 获取工具列表失败:', error);
      throw error;
    }
  }

  async callTool(name, args = {}) {
    if (!this.connected || !this.client) {
      throw new Error('MCP 客户端未连接');
    }

    try {
      console.log(`🔧 调用 MCP 工具: ${name}`, args);
      
      const response = await this.client.callTool({
        name: name,
        arguments: args
      });

      // 解析返回的内容
      if (response.content && response.content.length > 0) {
        const result = JSON.parse(response.content[0].text);
        return result;
      }
      
      return response;
    } catch (error) {
      console.error(`❌ 调用工具失败 ${name}:`, error);
      throw error;
    }
  }

  async listResources() {
    if (!this.connected || !this.client) {
      throw new Error('MCP 客户端未连接');
    }

    try {
      const response = await this.client.listResources();
      return response.resources || [];
    } catch (error) {
      console.error('❌ 获取资源列表失败:', error);
      return [];
    }
  }

  async getServerInfo() {
    if (!this.connected || !this.client) {
      throw new Error('MCP 客户端未连接');
    }

    // MCP 协议中的服务器信息通常在初始化时获得
    return {
      name: "langchain-ai-mcp-server",
      version: "1.0.0",
      capabilities: {
        tools: {},
        resources: {}
      }
    };
  }

  async disconnect() {
    try {
      if (this.client) {
        await this.client.close();
      }
      
      // StdioClientTransport 会自动处理子进程的关闭
      if (this.transport) {
        await this.transport.close();
      }
      
      this.connected = false;
      console.log('🔌 MCP 客户端已断开连接');
    } catch (error) {
      console.error('❌ MCP 客户端断开连接时出错:', error);
    }
  }

  isConnected() {
    return this.connected && this.client;
  }

  // 兼容性方法
  async ping() {
    if (!this.connected) {
      throw new Error('MCP 客户端未连接');
    }
    // MCP 协议本身不需要 ping，连接状态即表示可用
    return Promise.resolve();
  }
}

export default LangChainMCPClient;