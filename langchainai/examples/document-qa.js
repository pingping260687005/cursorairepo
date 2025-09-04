import 'dotenv/config';
import { ChatOpenAI } from '@langchain/openai';
import { RetrievalQAChain } from 'langchain/chains';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { OpenAIEmbeddings } from '@langchain/openai';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { Document } from '@langchain/core/documents';
import { promises as fs } from 'fs';
import path from 'path';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function documentQAExample() {
  console.log('📚 LangChain 文档问答示例');
  console.log('💡 这个示例会读取文档并回答相关问题');
  console.log('─'.repeat(50));

  try {
    // 示例文档内容
    const sampleDocuments = [
      {
        content: `
        LangChain 是一个用于开发基于语言模型的应用程序的框架。它提供了以下核心概念：

        1. LLMs 和 Chat Models: 语言模型的包装器
        2. Prompt Templates: 用于格式化输入的模板
        3. Chains: 将多个组件组合在一起
        4. Agents: 使用语言模型来决定采取哪些行动
        5. Memory: 在链或代理调用之间保持状态
        6. Document Loaders: 从各种源加载文档
        7. Text Splitters: 将文档分割成块
        8. Vectorstores: 存储和搜索嵌入
        9. Retrievers: 查询您的数据
        `,
        metadata: { source: "langchain_intro.txt" }
      },
      {
        content: `
        Node.js 是一个基于 Chrome V8 JavaScript 引擎的 JavaScript 运行时环境。
        
        主要特点：
        - 事件驱动、非阻塞 I/O 模型
        - 轻量级和高效
        - 拥有世界上最大的开源库生态系统 npm
        - 适合构建可扩展的网络应用程序
        
        常用模块：
        - HTTP: 创建 HTTP 服务器和客户端
        - File System (fs): 文件系统操作
        - Path: 处理文件路径
        - Express: Web 应用框架
        `,
        metadata: { source: "nodejs_intro.txt" }
      },
      {
        content: `
        人工智能 (AI) 是计算机科学的一个分支，旨在创建能够执行通常需要人类智能的任务的系统。

        AI 的主要领域：
        1. 机器学习 (ML): 使计算机能够从数据中学习
        2. 深度学习 (DL): 使用神经网络进行学习
        3. 自然语言处理 (NLP): 理解和生成人类语言
        4. 计算机视觉: 理解和解释视觉信息
        5. 机器人技术: 创建能够在物理世界中操作的智能机器

        现代 AI 应用：
        - 聊天机器人和虚拟助手
        - 推荐系统
        - 图像识别
        - 语音识别
        - 自动驾驶汽车
        `,
        metadata: { source: "ai_intro.txt" }
      }
    ];

    console.log('📄 准备示例文档...');

    // 创建文档对象
    const documents = sampleDocuments.map(doc => 
      new Document({ pageContent: doc.content, metadata: doc.metadata })
    );

    // 文本分割器
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 50,
    });

    // 分割文档
    const splitDocs = await textSplitter.splitDocuments(documents);
    console.log(`📑 文档已分割为 ${splitDocs.length} 个块`);

    // 创建嵌入
    const embeddings = new OpenAIEmbeddings();

    // 创建向量存储
    console.log('🔍 创建向量存储...');
    const vectorStore = await MemoryVectorStore.fromDocuments(splitDocs, embeddings);

    // 创建检索器
    const retriever = vectorStore.asRetriever({
      k: 3, // 返回最相关的3个文档块
    });

    // 创建聊天模型
    const chatModel = new ChatOpenAI({
      modelName: "gpt-3.5-turbo",
      temperature: 0.1,
    });

    // 创建问答链
    const qaChain = RetrievalQAChain.fromLLM(chatModel, retriever);

    console.log('✅ 文档问答系统已准备就绪！');
    console.log('💡 您可以询问关于 LangChain、Node.js 或 AI 的问题');
    console.log('💡 输入 "exit" 退出\n');

    // 问答循环
    const askQuestion = () => {
      rl.question('❓ 您的问题: ', async (question) => {
        if (question.trim().toLowerCase() === 'exit') {
          console.log('👋 再见！');
          rl.close();
          return;
        }

        if (!question.trim()) {
          console.log('⚠️  请输入有效的问题\n');
          askQuestion();
          return;
        }

        try {
          console.log('🔍 搜索相关文档...');
          
          const response = await qaChain.invoke({
            query: question
          });

          console.log(`\n💡 答案: ${response.text}\n`);
          
          // 显示相关文档源
          const relevantDocs = await retriever.getRelevantDocuments(question);
          if (relevantDocs.length > 0) {
            console.log('📚 参考文档:');
            relevantDocs.forEach((doc, index) => {
              console.log(`   ${index + 1}. ${doc.metadata.source}`);
            });
            console.log('');
          }

        } catch (error) {
          console.error('❌ 错误:', error.message);
          console.log('💡 请检查您的 OpenAI API 配置\n');
        }

        askQuestion();
      });
    };

    askQuestion();

  } catch (error) {
    console.error('❌ 初始化失败:', error.message);
    console.log('💡 请确保已正确配置 .env 文件中的 OPENAI_API_KEY');
    rl.close();
  }
}

// 启动文档问答
documentQAExample();