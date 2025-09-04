// MCP 功能演示示例 (使用官方SDK)
import LangChainMCPClient from '../mcp-client-sdk.js';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const require = createRequire(import.meta.url);

function formatResult(toolName, result) {
  if (!result.success) {
    return `❌ ${toolName} 失败: ${result.error || '未知错误'}`;
  }
  
  switch (toolName) {
    case 'calculator':
      return `✅ 计算结果: ${result.formatted}`;
    case 'get_weather':
      return `✅ 天气信息: ${result.formatted}`;
    case 'web_search':
      if (result.results && result.results.length > 0) {
        const summaries = result.results.map(r => `• ${r.snippet.substring(0, 80)}...`).join('\n');
        return `✅ 搜索结果 (${result.results.length}条):\n${summaries}`;
      } else {
        return '✅ 搜索完成，但无相关结果';
      }
    case 'write_file':
      return `✅ 文件已写入: ${result.message}`;
    case 'read_file':
      return `✅ 文件内容: "${result.content}" (${result.size} 字节)`;
    case 'execute_code':
      return `✅ 代码执行完成: ${result.output}`;
    default:
      return `✅ ${toolName} 执行成功`;
  }
}

async function mcpDemo() {
  const client = new LangChainMCPClient();
  
  try {
    console.log('🔌 正在连接到MCP服务器 (官方SDK)...');
    await client.connect();
    
    console.log('✅ MCP SDK连接成功！');
    
    // 获取可用工具
    console.log('\n📋 获取可用工具列表...');
    const tools = await client.listTools();
    console.log('✅ 可用工具:', tools.map(t => t.name).join(', '));
    
    // 演示计算器
    console.log('\n🧮 演示计算器功能...');
    const calcResult = await client.callTool('calculator', { expression: '2 + 3 * 4' });
    console.log(formatResult('calculator', calcResult));
    
    // 演示天气查询
    console.log('\n🌤️ 演示天气查询...');
    const weatherResult = await client.callTool('get_weather', { city: '北京' });
    console.log(formatResult('get_weather', weatherResult));
    
    // 演示网络搜索
    console.log('\n🔍 演示网络搜索...');
    const searchResult = await client.callTool('web_search', { query: 'nodejs', limit: 2 });
    console.log(formatResult('web_search', searchResult));
    
    // 演示文件操作
    console.log('\n📝 演示文件操作...');
    const writeResult = await client.callTool('write_file', { 
      path: 'test-output.txt', 
      content: 'Hello from MCP SDK!\n这是一个MCP SDK测试文件。' 
    });
    console.log(formatResult('write_file', writeResult));
    
    const readResult = await client.callTool('read_file', { path: 'test-output.txt' });
    console.log(formatResult('read_file', readResult));
    
    // 演示代码执行
    console.log('\n💻 演示代码执行...');
    const codeResult = await client.callTool('execute_code', { 
      language: 'javascript', 
      code: 'console.log("Hello from MCP SDK!"); Math.PI * 2' 
    });
    console.log(formatResult('execute_code', codeResult));
    
    console.log('\n🎉 所有MCP SDK工具演示完成！');
    
  } catch (error) {
    console.error('❌ MCP SDK演示出错:', error.message);
    console.log('💡 确保主应用服务器正在运行: npm start');
  } finally {
    await client.disconnect();
    console.log('\n🔌 MCP SDK连接已断开');
  }
}

// 如果直接运行此文件，则执行演示
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🚀 开始MCP SDK功能演示...\n');
  
  mcpDemo().catch(console.error);
}

export { mcpDemo };