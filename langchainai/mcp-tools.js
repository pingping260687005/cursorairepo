import fs from 'fs-extra';
import path from 'path';
import axios from 'axios';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

class MCPTools {
  constructor() {
    this.toolHandlers = {
      read_file: this.readFile.bind(this),
      write_file: this.writeFile.bind(this),
      web_search: this.webSearch.bind(this),
      calculator: this.calculator.bind(this),
      get_weather: this.getWeather.bind(this),
      execute_code: this.executeCode.bind(this)
    };
  }

  // 读取文件
  async readFile(args) {
    try {
      const { path: filePath } = args;
      
      // 安全检查：防止路径遍历攻击
      if (filePath.includes('..') || path.isAbsolute(filePath)) {
        throw new Error('Invalid file path');
      }

      const content = await fs.readFile(filePath, 'utf8');
      return {
        success: true,
        content: content,
        path: filePath,
        size: content.length
      };
    } catch (error) {
      return {
        success: false,
        error: `读取文件失败: ${error.message}`
      };
    }
  }

  // 写入文件
  async writeFile(args) {
    try {
      const { path: filePath, content } = args;
      
      // 安全检查
      if (filePath.includes('..') || path.isAbsolute(filePath)) {
        throw new Error('Invalid file path');
      }

      // 确保目录存在
      await fs.ensureDir(path.dirname(filePath));
      await fs.writeFile(filePath, content, 'utf8');
      
      return {
        success: true,
        message: `文件已写入: ${filePath}`,
        size: content.length
      };
    } catch (error) {
      return {
        success: false,
        error: `写入文件失败: ${error.message}`
      };
    }
  }

  // 网络搜索 (模拟DuckDuckGo搜索)
  async webSearch(args) {
    try {
      const { query, limit = 5 } = args;
      
      // 使用DuckDuckGo即时答案API
      const searchUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_redirect=1&no_html=1&skip_disambig=1`;
      
      const response = await axios.get(searchUrl, {
        timeout: 5000, // 减少超时时间到 5 秒
        headers: {
          'User-Agent': 'LangChain-AI-App/1.0'
        }
      });

      const data = response.data;
      const results = [];

      // 处理即时答案
      if (data.Answer) {
        results.push({
          title: '即时答案',
          snippet: data.Answer,
          url: data.AnswerURL || '',
          type: 'instant_answer'
        });
      }

      // 处理定义
      if (data.Definition) {
        results.push({
          title: data.DefinitionSource || '定义',
          snippet: data.Definition,
          url: data.DefinitionURL || '',
          type: 'definition'
        });
      }

      // 处理相关主题
      if (data.RelatedTopics && data.RelatedTopics.length > 0) {
        data.RelatedTopics.slice(0, limit - results.length).forEach(topic => {
          if (topic.Text && topic.FirstURL) {
            results.push({
              title: topic.Text.split(' - ')[0] || '相关内容',
              snippet: topic.Text,
              url: topic.FirstURL,
              type: 'related_topic'
            });
          }
        });
      }

      return {
        success: true,
        query: query,
        results: results.slice(0, limit),
        total: results.length
      };

    } catch (error) {
      // 网络问题时提供模拟结果
      console.warn('网络搜索失败，使用模拟数据:', error.message);
      const { query } = args; // 修复: 从 args 中获取 query
      
      return {
        success: true,
        query: query,
        results: [
          {
            title: '模拟搜索结果',
            snippet: `关于"${query}"的模拟搜索结果。由于网络连接问题，现在显示模拟数据。`,
            url: '#',
            type: 'fallback'
          }
        ],
        total: 1,
        note: '网络连接问题，显示模拟结果'
      };
    }
  }

  // 计算器
  async calculator(args) {
    try {
      const { expression } = args;
      
      // 安全的数学表达式评估
      const safeExpression = expression.replace(/[^0-9+\-*/.() ]/g, '');
      
      if (!safeExpression) {
        throw new Error('Invalid mathematical expression');
      }

      // 使用eval进行计算（在生产环境中应使用更安全的数学库）
      const result = eval(safeExpression);
      
      if (!isFinite(result)) {
        throw new Error('Result is not a finite number');
      }

      return {
        success: true,
        expression: expression,
        result: result,
        formatted: `${expression} = ${result}`
      };
    } catch (error) {
      return {
        success: false,
        error: `计算失败: ${error.message}`
      };
    }
  }

  // 获取天气（模拟API）
  async getWeather(args) {
    try {
      const { city } = args;
      
      // 模拟天气数据（在实际应用中应使用真实的天气API）
      const weatherData = {
        '北京': { temp: 15, condition: '晴', humidity: 45, wind: '东北风 2级' },
        '上海': { temp: 18, condition: '多云', humidity: 65, wind: '东南风 3级' },
        '广州': { temp: 25, condition: '小雨', humidity: 80, wind: '南风 2级' },
        '深圳': { temp: 26, condition: '阴', humidity: 75, wind: '西南风 1级' },
        '杭州': { temp: 20, condition: '晴', humidity: 55, wind: '东风 2级' }
      };

      const weather = weatherData[city];
      
      if (!weather) {
        // 返回默认天气信息
        return {
          success: true,
          city: city,
          message: `抱歉，暂时无法获取${city}的天气信息。建议您查看当地天气应用获取准确信息。`,
          note: '这是一个演示功能，实际使用需要接入真实天气API'
        };
      }

      return {
        success: true,
        city: city,
        temperature: weather.temp,
        condition: weather.condition,
        humidity: weather.humidity,
        wind: weather.wind,
        formatted: `${city}天气：${weather.condition}，气温${weather.temp}°C，湿度${weather.humidity}%，${weather.wind}`
      };

    } catch (error) {
      return {
        success: false,
        error: `获取天气失败: ${error.message}`
      };
    }
  }

  // 执行代码
  async executeCode(args) {
    try {
      const { language, code } = args;
      
      // 安全检查：防止危险操作
      const dangerousPatterns = [
        /rm\s+-rf/,
        /del\s+\/[sf]/i,
        /format\s+c:/i,
        /shutdown/i,
        /reboot/i,
        /sudo/,
        /chmod\s+777/
      ];

      for (const pattern of dangerousPatterns) {
        if (pattern.test(code)) {
          throw new Error('Potentially dangerous code detected');
        }
      }

      let command;
      let result;

      switch (language.toLowerCase()) {
        case 'javascript':
          // 执行JavaScript代码
          try {
            result = eval(code);
            return {
              success: true,
              language: 'javascript',
              code: code,
              result: String(result),
              output: `执行结果: ${result}`
            };
          } catch (evalError) {
            throw new Error(`JavaScript执行错误: ${evalError.message}`);
          }

        case 'python':
          // 执行Python代码（需要系统安装Python）
          command = `python -c "${code.replace(/"/g, '\\"')}"`;
          break;

        case 'bash':
          // 执行Bash命令
          command = code;
          break;

        default:
          throw new Error(`不支持的编程语言: ${language}`);
      }

      if (command) {
        const { stdout, stderr } = await execAsync(command, {
          timeout: 5000, // 5秒超时
          cwd: process.cwd()
        });

        return {
          success: true,
          language: language,
          code: code,
          stdout: stdout,
          stderr: stderr,
          output: stdout || stderr || '执行完成，无输出'
        };
      }

    } catch (error) {
      return {
        success: false,
        language: args.language,
        error: `代码执行失败: ${error.message}`,
        note: '出于安全考虑，某些操作被限制'
      };
    }
  }

  // 执行工具
  async executeTool(toolName, args) {
    const handler = this.toolHandlers[toolName];
    
    if (!handler) {
      return {
        success: false,
        error: `未知的工具: ${toolName}`
      };
    }

    try {
      console.log(`🔧 执行MCP工具: ${toolName}`, args);
      const result = await handler(args);
      console.log(`✅ 工具执行完成: ${toolName}`, result.success ? '成功' : '失败');
      return result;
    } catch (error) {
      console.error(`❌ 工具执行错误: ${toolName}`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 获取可用工具列表
  getAvailableTools() {
    return Object.keys(this.toolHandlers).map(name => ({
      name: name,
      description: this.getToolDescription(name)
    }));
  }

  // 获取工具描述
  getToolDescription(toolName) {
    const descriptions = {
      read_file: '读取本地文件内容',
      write_file: '写入内容到文件',
      web_search: '搜索网络内容',
      calculator: '执行数学计算',
      get_weather: '获取城市天气信息',
      execute_code: '执行代码片段'
    };
    return descriptions[toolName] || '未知工具';
  }
}

export default MCPTools;