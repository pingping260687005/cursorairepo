// 演示聊天示例 - 无需 API Key
import express from 'express';

// 模拟 AI 响应函数
function mockAIResponse(message) {
  const responses = {
    '你好': '你好！我是基于 LangChain.js 的AI助手，很高兴为您服务！',
    'hello': 'Hello! I am an AI assistant built with LangChain.js. How can I help you?',
    'langchain': 'LangChain.js 是一个强大的框架，专为构建基于大语言模型的应用程序而设计。它提供了链式调用、记忆管理、提示词模板等丰富功能。',
    'nodejs': 'Node.js 是一个基于 Chrome V8 引擎的 JavaScript 运行时，非常适合构建服务器端应用程序和API接口。',
    'default': '感谢您的问题！这是一个演示版本的回复。在实际使用中，我会通过 OpenAI API 提供更智能的回答。'
  };

  // 简单关键词匹配
  for (const [keyword, response] of Object.entries(responses)) {
    if (message.toLowerCase().includes(keyword)) {
      return response;
    }
  }
  
  return responses.default;
}

async function demoChat() {
  console.log('🤖 LangChain.js 演示聊天启动...\n');
  console.log('💡 这是一个演示版本，使用模拟AI响应');
  console.log('💡 配置 OPENAI_API_KEY 后可使用真实的AI功能\n');

  const questions = [
    '你好',
    '请介绍一下 LangChain.js',
    'Node.js 有什么优势？',
    '如何使用这个应用程序？'
  ];

  for (const question of questions) {
    console.log(`👤 用户: ${question}`);
    
    // 模拟思考时间
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const response = mockAIResponse(question);
    console.log(`🤖 AI: ${response}\n`);
  }

  console.log('✅ 演示聊天完成！');
  console.log('🌐 访问 http://localhost:3001 体验Web界面');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  demoChat().catch(console.error);
}