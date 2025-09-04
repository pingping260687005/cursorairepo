import 'dotenv/config';
import { ChatOpenAI } from '@langchain/openai';
import { ConversationSummaryBufferMemory } from 'langchain/memory';
import { ConversationChain } from 'langchain/chains';
import { PromptTemplate } from '@langchain/core/prompts';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function memoryExample() {
  console.log('🧠 LangChain 高级记忆示例');
  console.log('💡 这个示例展示了不同类型的记忆功能');
  console.log('💡 使用摘要缓冲记忆，可以处理长对话');
  console.log('─'.repeat(50));

  try {
    // 创建聊天模型
    const chatModel = new ChatOpenAI({
      modelName: "gpt-3.5-turbo",
      temperature: 0.7,
      maxTokens: 1000,
    });

    // 创建高级记忆 - 摘要缓冲记忆
    const memory = new ConversationSummaryBufferMemory({
      llm: chatModel,
      maxTokenLimit: 500, // 当超过这个限制时，会自动总结早期对话
      returnMessages: true,
    });

    // 创建自定义提示模板
    const prompt = PromptTemplate.fromTemplate(`
你是一个友好、记忆力很好的AI助手。你会记住我们之前聊过的内容，并在对话中体现出来。

以下是我们的对话历史（可能包含总结）:
{history}

人类: {input}

请基于我们的对话历史，给出有用且符合上下文的回答。如果我提到之前说过的内容，请展现出你记得这些信息。

AI助手:`);

    // 创建对话链
    const conversationChain = new ConversationChain({
      llm: chatModel,
      memory: memory,
      prompt: prompt,
    });

    console.log('✅ 带高级记忆的 AI 助手已准备就绪！');
    console.log('🧠 AI 会记住您说过的内容，并在长对话中自动总结');
    console.log('💡 输入 "exit" 退出，"memory" 查看记忆，"clear" 清除记忆\n');

    // 聊天循环
    const askQuestion = () => {
      rl.question('👤 您: ', async (input) => {
        const message = input.trim();

        if (message.toLowerCase() === 'exit') {
          console.log('👋 再见！希望我们的对话对您有帮助！');
          rl.close();
          return;
        }

        if (message.toLowerCase() === 'memory') {
          try {
            const messages = await memory.chatHistory.getMessages();
            console.log('\n🧠 当前记忆内容:');
            if (messages.length === 0) {
              console.log('   (无对话记录)');
            } else {
              messages.forEach((msg, index) => {
                const type = msg.constructor.name === 'HumanMessage' ? '👤' : '🤖';
                console.log(`   ${index + 1}. ${type} ${msg.content.substring(0, 100)}${msg.content.length > 100 ? '...' : ''}`);
              });
            }
            console.log('');
            askQuestion();
            return;
          } catch (error) {
            console.error('❌ 获取记忆失败:', error.message);
            askQuestion();
            return;
          }
        }

        if (message.toLowerCase() === 'clear') {
          await memory.clear();
          console.log('🧹 记忆已清除，我们重新开始对话吧！\n');
          askQuestion();
          return;
        }

        if (!message) {
          console.log('⚠️  请输入有效的消息\n');
          askQuestion();
          return;
        }

        try {
          console.log('🤖 AI 正在回忆并思考...');
          
          const response = await conversationChain.invoke({
            input: message
          });

          console.log(`🤖 AI: ${response.response}\n`);

          // 显示记忆统计
          const messages = await memory.chatHistory.getMessages();
          console.log(`💭 当前记忆: ${messages.length} 条消息\n`);

        } catch (error) {
          console.error('❌ 错误:', error.message);
          console.log('💡 请检查您的 OPENAI_API_KEY 配置\n');
        }

        askQuestion();
      });
    };

    // 示例对话开始
    console.log('🤖 AI: 你好！我是一个有记忆的AI助手。我会记住我们聊过的内容。请告诉我一些关于您的信息吧！\n');
    askQuestion();

  } catch (error) {
    console.error('❌ 初始化失败:', error.message);
    console.log('💡 请确保已正确配置 .env 文件中的 OPENAI_API_KEY');
    rl.close();
  }
}

// 启动记忆聊天
memoryExample();