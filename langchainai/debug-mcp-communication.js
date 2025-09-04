// MCP 通信调试脚本
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function debugMCPCommunication() {
  console.log('🔬 开始调试 MCP 客户端-服务器通信...');
  
  let transport = null;
  let client = null;
  
  try {
    // 1. 创建传输层
    console.log('1️⃣ 创建 StdioClientTransport...');
    const serverPath = join(__dirname, 'mcp-server-sdk.js');
    console.log('服务器路径:', serverPath);
    
    transport = new StdioClientTransport({
      command: 'node',
      args: [serverPath],
      env: { ...process.env, MCP_SERVER_MODE: 'true' }
    });
    
    console.log('✅ StdioClientTransport 创建成功');
    
    // 2. 创建客户端
    console.log('2️⃣ 创建 MCP 客户端...');
    client = new Client(
      {
        name: 'debug-mcp-client',
        version: '1.0.0'
      },
      {
        capabilities: {}
      }
    );
    
    console.log('✅ MCP 客户端创建成功');
    
    // 3. 建立连接
    console.log('3️⃣ 建立连接...');
    await client.connect(transport);
    console.log('✅ 连接建立成功');
    
    // 4. 测试服务器响应 - 这是关键的测试点
    console.log('4️⃣ 测试服务器响应...');
    console.log('发送 tools/list 请求...');
    
    const startTime = Date.now();
    const response = await client.listTools()
    console.log('ddd...');
    // const response = await client.request('tools/list', {});
    const endTime = Date.now();
    
    console.log(`✅ 收到响应! 耗时: ${endTime - startTime}ms`);
    console.log('响应内容:', JSON.stringify(response, null, 2));
    
    // 5. 关闭连接
    console.log('5️⃣ 关闭连接...');
    await client.close();
    console.log('✅ 连接已关闭');
    
  } catch (error) {
    console.error('❌ 调试失败:', error);
    console.error('错误类型:', error.constructor.name);
    console.error('错误代码:', error.code);
    console.error('错误堆栈:', error.stack);
  }
}

debugMCPCommunication();