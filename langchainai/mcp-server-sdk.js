#!/usr/bin/env node

/**
 * 真正的 MCP 服务器实现 - 使用官方 @modelcontextprotocol/sdk
 *
 * 这是一个标准的 MCP 服务器，符合 Model Context Protocol 规范
 * 支持工具调用、资源访问等核心功能
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import fs from "fs/promises";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import axios from "axios";

const execAsync = promisify(exec);

class LangChainMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: "langchain-ai-mcp-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupResourceHandlers();
  }

  setupToolHandlers() {
    // 注册工具列表处理器
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "read_file",
            description: "读取文件内容",
            inputSchema: {
              type: "object",
              properties: {
                path: {
                  type: "string",
                  description: "文件路径",
                },
              },
              required: ["path"],
            },
          },
          {
            name: "write_file",
            description: "写入文件内容",
            inputSchema: {
              type: "object",
              properties: {
                path: {
                  type: "string",
                  description: "文件路径",
                },
                content: {
                  type: "string",
                  description: "文件内容",
                },
              },
              required: ["path", "content"],
            },
          },
          {
            name: "calculator",
            description: "数学计算器",
            inputSchema: {
              type: "object",
              properties: {
                expression: {
                  type: "string",
                  description: "数学表达式",
                },
              },
              required: ["expression"],
            },
          },
          {
            name: "get_weather",
            description: "获取天气信息",
            inputSchema: {
              type: "object",
              properties: {
                city: {
                  type: "string",
                  description: "城市名称",
                },
              },
              required: ["city"],
            },
          },
          {
            name: "web_search",
            description: "网络搜索",
            inputSchema: {
              type: "object",
              properties: {
                query: {
                  type: "string",
                  description: "搜索查询",
                },
                limit: {
                  type: "number",
                  description: "结果数量限制",
                  default: 5,
                },
              },
              required: ["query"],
            },
          },
          {
            name: "execute_code",
            description: "执行代码",
            inputSchema: {
              type: "object",
              properties: {
                language: {
                  type: "string",
                  description: "编程语言",
                  enum: ["javascript", "python", "bash"],
                },
                code: {
                  type: "string",
                  description: "代码内容",
                },
              },
              required: ["language", "code"],
            },
          },
        ],
      };
    });

    // 注册工具调用处理器
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        let result;

        switch (name) {
          case "read_file":
            result = await this.readFile(args);
            break;
          case "write_file":
            result = await this.writeFile(args);
            break;
          case "calculator":
            result = await this.calculator(args);
            break;
          case "get_weather":
            result = await this.getWeather(args);
            break;
          case "web_search":
            result = await this.webSearch(args);
            break;
          case "execute_code":
            result = await this.executeCode(args);
            break;
          default:
            throw new Error(`Unknown tool: ${name}`);
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: false,
                  error: error.message,
                },
                null,
                2
              ),
            },
          ],
          isError: true,
        };
      }
    });
  }

  setupResourceHandlers() {
    // 可以在这里添加资源处理器
    // 例如提供系统信息、配置文件等资源
  }

  // 工具实现方法
  async readFile({ path: filePath }) {
    try {
      // 安全检查
      if (filePath.includes("..") || path.isAbsolute(filePath)) {
        throw new Error("Invalid file path for security reasons");
      }

      const content = await fs.readFile(filePath, "utf8");
      const stats = await fs.stat(filePath);

      return {
        success: true,
        content: content,
        size: stats.size,
        path: filePath,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to read file: ${error.message}`,
      };
    }
  }

  async writeFile({ path: filePath, content }) {
    try {
      // 安全检查
      if (filePath.includes("..") || path.isAbsolute(filePath)) {
        throw new Error("Invalid file path for security reasons");
      }

      await fs.writeFile(filePath, content, "utf8");

      return {
        success: true,
        message: `File written successfully: ${filePath}`,
        size: content.length,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to write file: ${error.message}`,
      };
    }
  }

  async calculator({ expression }) {
    try {
      // 安全的数学表达式评估
      const safeExpression = expression.replace(/[^0-9+\-*/.() ]/g, "");

      if (!safeExpression) {
        throw new Error("Invalid mathematical expression");
      }

      const result = eval(safeExpression);

      if (!isFinite(result)) {
        throw new Error("Result is not a finite number");
      }

      return {
        success: true,
        expression: expression,
        result: result,
        formatted: `${expression} = ${result}`,
      };
    } catch (error) {
      return {
        success: false,
        error: `Calculation failed: ${error.message}`,
      };
    }
  }

  async getWeather({ city }) {
    try {
      // 模拟天气数据（在实际应用中应使用真实的天气API）
      const weatherData = {
        北京: { temp: 15, condition: "晴", humidity: 45, wind: "东北风 2级" },
        上海: { temp: 18, condition: "多云", humidity: 65, wind: "东南风 3级" },
        广州: { temp: 25, condition: "小雨", humidity: 80, wind: "南风 2级" },
        深圳: { temp: 26, condition: "阴", humidity: 75, wind: "西南风 1级" },
        杭州: { temp: 20, condition: "晴", humidity: 55, wind: "东风 2级" },
      };

      const weather = weatherData[city];

      if (!weather) {
        return {
          success: true,
          city: city,
          message: `Sorry, weather information for ${city} is not available.`,
          note: "This is a demo feature. Real implementation would connect to a weather API.",
        };
      }

      return {
        success: true,
        city: city,
        temperature: weather.temp,
        condition: weather.condition,
        humidity: weather.humidity,
        wind: weather.wind,
        formatted: `${city}天气：${weather.condition}，气温${weather.temp}°C，湿度${weather.humidity}%，${weather.wind}`,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get weather: ${error.message}`,
      };
    }
  }

  async webSearch({ query, limit = 5 }) {
    try {
      // 模拟搜索结果（在实际应用中应连接真实的搜索引擎）
      const searchResults = [
        {
          title: `${query} - Official Documentation`,
          snippet: `Official documentation and learning materials for ${query}. Comprehensive API reference and usage guides.`,
          url: `https://${query.toLowerCase()}.org`,
          type: "official",
        },
        {
          title: `${query} Tutorials and Examples`,
          snippet: `Learn ${query} with best practices and code examples. From beginner to advanced content.`,
          url: `https://tutorial.example.com/${query}`,
          type: "tutorial",
        },
        {
          title: `${query} Community and Forums`,
          snippet: `Connect with ${query} developer community, get help and share experiences.`,
          url: `https://community.example.com/${query}`,
          type: "community",
        },
      ];

      return {
        success: true,
        query: query,
        results: searchResults.slice(0, limit),
        total: searchResults.length,
        note: "This is demo data. Real implementation would connect to a search engine.",
      };
    } catch (error) {
      return {
        success: false,
        error: `Search failed: ${error.message}`,
      };
    }
  }

  async executeCode({ language, code }) {
    try {
      // 安全检查：防止危险操作
      const dangerousPatterns = [
        /rm\s+-rf/,
        /del\s+\/[sf]/i,
        /format\s+c:/i,
        /shutdown/i,
        /reboot/i,
        /sudo/,
        /chmod\s+777/,
      ];

      for (const pattern of dangerousPatterns) {
        if (pattern.test(code)) {
          throw new Error("Potentially dangerous code detected");
        }
      }

      let result;

      switch (language.toLowerCase()) {
        case "javascript":
          result = eval(code);
          return {
            success: true,
            language: "javascript",
            code: code,
            result: String(result),
            output: `执行结果: ${result}`,
          };

        case "python":
          const pythonResult = await execAsync(
            `python -c "${code.replace(/"/g, '\\"')}"`
          );
          return {
            success: true,
            language: "python",
            code: code,
            output: pythonResult.stdout || pythonResult.stderr || "执行完成",
          };

        case "bash":
          const bashResult = await execAsync(code, { timeout: 5000 });
          return {
            success: true,
            language: "bash",
            code: code,
            output: bashResult.stdout || bashResult.stderr || "执行完成",
          };

        default:
          throw new Error(`Unsupported language: ${language}`);
      }
    } catch (error) {
      return {
        success: false,
        language: language,
        error: `Code execution failed: ${error.message}`,
        note: "Certain operations are restricted for security reasons",
      };
    }
  }

  async start() {
    try {
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
      console.log("🚀 LangChain MCP Server started with official SDK");
      console.log("📡 Using stdio transport");
      console.log("🔧 Ready to handle tool calls via MCP protocol");
      process.on("SIGINT", () => {
        console.error("🔌 收到中断信号，关闭 MCP 服务器...");
        process.exit(0);
      });

      process.on("SIGTERM", () => {
        console.error("🔌 收到终止信号，关闭 MCP 服务器...");
        process.exit(0);
      });
    } catch (error) {
      console.error("Error starting mcp server:", error);
    }
  }
}

// 启动服务器
// if (import.meta.url === `file://${process.argv[1]}`) {
const server = new LangChainMCPServer();
server.start().catch(console.error);
// }

export default LangChainMCPServer;
