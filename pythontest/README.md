# Python Test Project

这是原Node.js项目的Python版本，使用Flask框架和PyMongo实现，采用模块化架构设计。

## 功能特性

- **Hello World API端点** (`/hello`, `/hello/<name>`)
- **用户管理API端点** (`/users`, `/users/<name>`, `POST /users`)
- **MongoDB数据库连接** - 使用数据库管理器
- **自动初始化用户数据** - 启动时自动创建示例数据
- **完整的错误处理** - 统一的错误响应格式
- **日志系统** - 完整的日志记录
- **配置管理** - 环境配置分离
- **蓝图架构** - 模块化路由管理

## 项目架构

```
pythontest/
├── app.py                 # 主应用文件
├── app_factory.py         # 应用工厂
├── requirements.txt       # Python依赖
├── run.py                # 启动脚本
├── test_app.py           # 测试文件
├── config/               # 配置模块
│   ├── __init__.py
│   ├── settings.py       # 应用配置
│   └── database.py       # 数据库配置
├── models/               # 数据模型
│   ├── __init__.py
│   └── user.py          # 用户模型
├── routes/               # 路由模块
│   ├── __init__.py
│   ├── hello.py         # Hello路由
│   ├── users.py         # 用户路由
│   └── data/            # 数据处理路由
│       ├── __init__.py
│       └── compare.py   # CSV比较路由
└── README.md             # 项目说明
```

## 安装依赖

```bash
pip install -r requirements.txt
```

## 环境变量

创建 `.env` 文件并设置以下变量：

```
MONGO_URI=mongodb://root:76ghnp2d@dbconn.sealosbja.site:41314/?directConnection=true
FLASK_ENV=development
FLASK_DEBUG=1
HOST=0.0.0.0
PORT=3000
LOG_LEVEL=INFO
```

## 运行应用

### 方式1: 直接运行
```bash
python app.py
```

### 方式2: 使用启动脚本
```bash
python run.py
```

应用将在 http://localhost:3000 启动

## API端点

### Hello端点
- `GET /hello` - 返回Hello World消息
- `GET /hello/<name>` - 返回个性化的问候消息

### 用户管理端点
- `GET /users` - 返回所有用户列表
- `GET /users/<name>` - 根据姓名获取用户信息
- `POST /users` - 创建新用户

### 数据比较端点
- `GET /data/compare` - 显示CSV比较表单页面
- `POST /data/compare` - 执行CSV数据比较，返回Excel报告

## 代码特性

### 1. 可维护性
- **模块化设计**: 路由、配置、数据库分离
- **应用工厂模式**: 便于测试和配置管理
- **清晰的目录结构**: 易于理解和维护

### 2. 可扩展性
- **蓝图架构**: 便于添加新的功能模块
- **配置系统**: 支持多环境配置
- **数据库抽象**: 便于切换数据库

### 3. 易读性
- **详细的文档字符串**: 每个函数都有说明
- **统一的命名规范**: 遵循Python PEP8规范
- **清晰的代码结构**: 逻辑分离，职责明确

## 开发指南

### 添加新路由
1. 在 `routes/` 目录下创建新的路由文件
2. 使用蓝图定义路由
3. 在 `app_factory.py` 中注册蓝图

### 添加新模型
1. 在 `models/` 目录下创建新的模型文件
2. 继承或使用dataclass定义数据结构
3. 实现必要的序列化方法

### 配置管理
1. 在 `config/settings.py` 中添加新配置项
2. 使用环境变量覆盖默认值
3. 支持不同环境的配置

## 测试

### 基础功能测试
运行测试文件验证应用功能：

```bash
python test_app.py
```

### CSV比较功能测试
运行CSV比较测试：

```bash
python test_csv_compare.py
```

### 使用Web界面
访问 http://localhost:3000/data/compare 使用Web表单进行CSV比较

## 日志

应用使用Python标准logging模块，支持不同级别的日志记录：
- DEBUG: 开发环境详细信息
- INFO: 一般信息
- WARNING: 警告信息
- ERROR: 错误信息

## 错误处理

所有API端点都包含完整的错误处理：
- 400: 请求参数错误
- 404: 资源未找到
- 409: 资源冲突
- 500: 服务器内部错误 