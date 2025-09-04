// 测试 OpenAI API Key 脚本
import 'dotenv/config';
import { ChatOpenAI } from '@langchain/openai';

async function testAPIKey() {
  console.log('🧪 测试 OpenAI API Key...\n');
  
  try {
    const model = new ChatOpenAI({
      modelName: "gpt-3.5-turbo",
      temperature: 0.7,
      maxTokens: 100,
    });

    console.log('📤 发送测试消息...');
    const response = await model.invoke([
      { role: 'user', content: '请简单介绍一下自己，用中文回答' }
    ]);

    console.log('✅ API Key 测试成功！');
    console.log('🤖 AI 回复:', response.content);
    console.log('\n🎉 您的 LangChain 应用已准备就绪！');

  } catch (error) {
    console.error('❌ API Key 测试失败:', error.message);
    
    if (error.message.includes('API key')) {
      console.log('💡 请检查 .env 文件中的 OPENAI_API_KEY 是否正确');
    } else if (error.message.includes('quota')) {
      console.log('💡 请检查 OpenAI 账户余额或使用限额');
    } else {
      console.log('💡 请检查网络连接或稍后重试');
    }
  }
}

testAPIKey();