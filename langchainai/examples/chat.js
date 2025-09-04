// 基本聊天示例
import 'dotenv/config';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import readline from 'readline';

async function basicChatExample() {
  console.log('🤖 基本聊天示例启动...\n');

  try {
    // 初始化模型
    const model = new ChatOpenAI({
      modelName: "gpt-3.5-turbo",
      temperature: 0.7,
    });

    // 创建消息
    const messages = [
      new SystemMessage("你是一个友好的AI助手，请用中文回答问题。"),
      new HumanMessage("请介绍一下 LangChain.js 的主要特点。")
    ];

    console.log('📤 发送消息: 请介绍一下 LangChain.js 的主要特点。');
    
    // 获取回复
    const response = await model.invoke(messages);
    
    console.log('📥 AI 回复:');
    console.log(response.content);
    console.log('\n✅ 基本聊天示例完成！');

  } catch (error) {
    console.error('❌ 错误:', error.message);
    if (error.message.includes('API key')) {
      console.log('💡 提示: 请在 .env 文件中设置正确的 OPENAI_API_KEY');
    }
  }
}

// 交互式聊天
async function interactiveChat() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  try {
    const model = new ChatOpenAI({
      modelName: "gpt-3.5-turbo",
      temperature: 0.7,
    });

    console.log('🚀 交互式聊天启动！输入 "quit" 退出。\n');

    const chatHistory = [
      new SystemMessage("你是一个友好的AI助手，请用中文回答问题。")
    ];

    const askQuestion = () => {
      rl.question('你: ', async (input) => {
        if (input.toLowerCase() === 'quit') {
          console.log('👋 再见！');
          rl.close();
          return;
        }

        try {
          chatHistory.push(new HumanMessage(input));
          
          console.log('🤖 思考中...');
          const response = await model.invoke(chatHistory);
          
          console.log(`AI: ${response.content}\n`);
          chatHistory.push(response);

          askQuestion();
        } catch (error) {
          console.error('❌ 错误:', error.message);
          askQuestion();
        }
      });
    };

    askQuestion();

  } catch (error) {
    console.error('❌ 初始化错误:', error.message);
    rl.close();
  }
}

// 主函数
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--interactive')) {
    await interactiveChat();
  } else {
    await basicChatExample();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}