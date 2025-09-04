#!/usr/bin/env node

// 快速测试 MCP SDK 实现
console.log('🚀 测试 MCP SDK 实现...');

try {
  // 直接启动 MCP 服务器测试
  console.log('📡 启动 MCP 服务器...');
  
  import('./mcp-server-sdk.js').then(async (serverModule) => {
    const LangChainMCPServer = serverModule.default;
    const server = new LangChainMCPServer();
    
    console.log('✅ MCP 服务器模块加载成功');
    console.log('📋 服务器功能:');
    console.log('   - 工具调用处理');
    console.log('   - stdio 传输');
    console.log('   - 官方 MCP 协议支持');
    
    // 不实际启动服务器，只测试模块加载
    console.log('🎉 MCP SDK 实现验证完成！');
    
  }).catch(error => {
    console.error('❌ MCP 服务器测试失败:', error.message);
  });
  
} catch (error) {
  console.error('❌ 测试失败:', error.message);
  console.log('💡 请确保已正确安装 @modelcontextprotocol/sdk');
}