// MCP 服务器配置
const MCP_CONFIG = {
  server: {
    name: "langchain-ai-mcp-server",
    version: "1.0.0"
  },
  capabilities: {
    tools: [
      "file_operations",
      "web_search", 
      "calculator",
      "weather",
      "code_execution"
    ],
    resources: [
      "documents",
      "web_pages",
      "code_files"
    ]
  },
  tools: [
    {
      name: "read_file",
      description: "读取本地文件内容",
      inputSchema: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: "文件路径"
          }
        },
        required: ["path"]
      }
    },
    {
      name: "write_file", 
      description: "写入文件内容",
      inputSchema: {
        type: "object",
        properties: {
          path: {
            type: "string", 
            description: "文件路径"
          },
          content: {
            type: "string",
            description: "文件内容"
          }
        },
        required: ["path", "content"]
      }
    },
    {
      name: "web_search",
      description: "搜索网络内容",
      inputSchema: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "搜索关键词"
          },
          limit: {
            type: "number",
            description: "结果数量限制",
            default: 5
          }
        },
        required: ["query"]
      }
    },
    {
      name: "calculator",
      description: "执行数学计算",
      inputSchema: {
        type: "object", 
        properties: {
          expression: {
            type: "string",
            description: "数学表达式"
          }
        },
        required: ["expression"]
      }
    },
    {
      name: "get_weather",
      description: "获取天气信息",
      inputSchema: {
        type: "object",
        properties: {
          city: {
            type: "string",
            description: "城市名称"
          }
        },
        required: ["city"]
      }
    },
    {
      name: "execute_code",
      description: "执行代码片段",
      inputSchema: {
        type: "object",
        properties: {
          language: {
            type: "string",
            description: "编程语言",
            enum: ["javascript", "python", "bash"]
          },
          code: {
            type: "string", 
            description: "代码内容"
          }
        },
        required: ["language", "code"]
      }
    }
  ]
};

module.exports = MCP_CONFIG;