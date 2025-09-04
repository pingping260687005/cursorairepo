# 🚀 部署指南

## 📋 目录

1. [本地部署](#本地部署)
2. [Docker 容器化部署](#docker-容器化部署)
3. [云平台部署](#云平台部署)
4. [生产环境配置](#生产环境配置)
5. [监控和日志](#监控和日志)
6. [安全配置](#安全配置)
7. [故障排除](#故障排除)

---

## 🏠 本地部署

### 环境要求
- **Node.js**: v18.0+ 
- **npm**: v8.0+
- **内存**: 至少 512MB
- **存储**: 至少 100MB 可用空间

### 快速部署

```bash
# 1. 克隆或下载项目
cd langchainai

# 2. 安装依赖
npm install --legacy-peer-deps

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，设置 OPENAI_API_KEY

# 4. 启动服务
npm start
```

### 服务验证

```bash
# 检查服务状态
curl http://localhost:3001/health

# 检查 MCP 状态
curl http://localhost:3001/mcp/status
```

---

## 🐳 Docker 容器化部署

### Dockerfile

创建 `Dockerfile`：

```dockerfile
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 安装依赖
RUN npm install --legacy-peer-deps --production

# 复制应用代码
COPY . .

# 暴露端口
EXPOSE 3001 8080

# 创建非root用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs

# 启动命令
CMD ["npm", "start"]
```

### Docker Compose

创建 `docker-compose.yml`：

```yaml
version: '3.8'

services:
  langchain-ai:
    build: .
    ports:
      - "3001:3001"
      - "8080:8080"
    environment:
      - NODE_ENV=production
      - PORT=3001
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - TEMPERATURE=0.7
      - MAX_TOKENS=2000
    volumes:
      - ./logs:/app/logs
      - ./data:/app/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # 可选：添加 Nginx 反向代理
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - langchain-ai
    restart: unless-stopped
```

### 构建和运行

```bash
# 构建镜像
docker build -t langchain-ai .

# 使用 Docker Compose 运行
docker-compose up -d

# 查看日志
docker-compose logs -f langchain-ai

# 停止服务
docker-compose down
```

---

## ☁️ 云平台部署

### AWS 部署

#### 1. EC2 部署

```bash
# 启动 EC2 实例 (Amazon Linux 2)
# t3.small 或更高配置

# 安装 Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# 安装 PM2
npm install -g pm2

# 部署应用
git clone <your-repo>
cd langchainai
npm install --legacy-peer-deps
npm run build

# 使用 PM2 启动
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### 2. ECS 部署

创建 `task-definition.json`：

```json
{
  "family": "langchain-ai",
  "taskRoleArn": "arn:aws:iam::account:role/ecsTaskRole",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "containerDefinitions": [
    {
      "name": "langchain-ai",
      "image": "your-account.dkr.ecr.region.amazonaws.com/langchain-ai:latest",
      "portMappings": [
        {
          "containerPort": 3001,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "OPENAI_API_KEY",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:openai-key"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/langchain-ai",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

### Google Cloud Platform

```bash
# 使用 Cloud Run 部署
gcloud run deploy langchain-ai \
  --image gcr.io/your-project/langchain-ai \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 3001 \
  --memory 1Gi \
  --cpu 1 \
  --set-env-vars NODE_ENV=production
```

### Azure 容器实例

```bash
# 部署到 Azure Container Instances
az container create \
  --resource-group myResourceGroup \
  --name langchain-ai \
  --image your-registry/langchain-ai:latest \
  --ports 3001 8080 \
  --environment-variables NODE_ENV=production \
  --secure-environment-variables OPENAI_API_KEY=your-key \
  --cpu 1 \
  --memory 2
```

---

## 🔧 生产环境配置

### PM2 配置

创建 `ecosystem.config.js`：

```javascript
module.exports = {
  apps: [{
    name: 'langchain-ai',
    script: 'index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 3001
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
```

### Nginx 反向代理

创建 `nginx.conf`：

```nginx
events {
    worker_connections 1024;
}

http {
    upstream langchain_ai {
        server localhost:3001;
    }

    # HTTP 重定向到 HTTPS
    server {
        listen 80;
        server_name yourdomain.com;
        return 301 https://$server_name$request_uri;
    }

    # HTTPS 配置
    server {
        listen 443 ssl http2;
        server_name yourdomain.com;

        # SSL 配置
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        # 代理配置
        location / {
            proxy_pass http://langchain_ai;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        # WebSocket 支持 (MCP)
        location /ws {
            proxy_pass http://localhost:8080;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        # 安全头
        add_header X-Content-Type-Options nosniff;
        add_header X-Frame-Options DENY;
        add_header X-XSS-Protection "1; mode=block";
    }
}
```

---

## 📊 监控和日志

### 应用监控

```javascript
// 添加到 index.js
const promBundle = require("express-prom-bundle");

// Prometheus 监控
const metricsMiddleware = promBundle({
  includePath: true,
  includeStatusCode: true,
  normalizePath: true,
  promClient: {
    collectDefaultMetrics: {}
  }
});

app.use(metricsMiddleware);
```

### 健康检查端点

```javascript
app.get('/health', (req, res) => {
  const health = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
    pid: process.pid,
    memory: process.memoryUsage(),
    env: process.env.NODE_ENV
  };
  
  res.status(200).json(health);
});
```

### 日志配置

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});
```

---

## 🛡️ 安全配置

### 环境变量安全

```bash
# 使用加密的环境变量存储
# AWS Secrets Manager
aws secretsmanager create-secret \
  --name "langchain-ai/openai-key" \
  --secret-string "your-openai-key"

# Azure Key Vault
az keyvault secret set \
  --vault-name "langchain-vault" \
  --name "openai-key" \
  --value "your-openai-key"
```

### 安全中间件

```javascript
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// 安全头
app.use(helmet());

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);

// CORS 配置
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:3000',
  credentials: true
}));
```

### SSL/TLS 配置

```bash
# Let's Encrypt 证书
certbot --nginx -d yourdomain.com

# 或使用 Cloudflare
# 在 Cloudflare 中配置 SSL/TLS 加密模式为 "Full (strict)"
```

---

## 🔍 故障排除

### 常见问题

#### 1. 端口冲突
```bash
# 检查端口使用情况
netstat -tulpn | grep :3001
netstat -tulpn | grep :8080

# 杀死占用端口的进程
sudo kill -9 $(lsof -ti:3001)
```

#### 2. 内存不足
```bash
# 监控内存使用
top -p $(pgrep -f "node.*index.js")

# 增加 Node.js 内存限制
node --max-old-space-size=2048 index.js
```

#### 3. MCP 连接问题
```bash
# 检查 WebSocket 连接
curl --include \
     --no-buffer \
     --header "Connection: Upgrade" \
     --header "Upgrade: websocket" \
     --header "Sec-WebSocket-Key: SGVsbG8sIHdvcmxkIQ==" \
     --header "Sec-WebSocket-Version: 13" \
     http://localhost:8080/
```

### 日志分析

```bash
# 查看错误日志
tail -f logs/error.log

# 查看实时日志
pm2 logs langchain-ai --lines 100

# 分析访问模式
awk '{print $1}' access.log | sort | uniq -c | sort -nr
```

### 性能优化

```javascript
// 启用压缩
const compression = require('compression');
app.use(compression());

// 静态文件缓存
app.use(express.static('public', {
  maxAge: '1d',
  etag: false
}));

// 连接池优化
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
} else {
  // 工作进程运行应用
  app.listen(PORT);
}
```

---

## 📚 部署清单

### 部署前检查

- [ ] 环境变量配置完成
- [ ] 依赖包安装成功
- [ ] 数据库连接测试通过
- [ ] SSL 证书配置正确
- [ ] 防火墙规则设置
- [ ] 监控和日志配置
- [ ] 备份策略制定

### 部署后验证

- [ ] 健康检查通过
- [ ] API 接口测试
- [ ] MCP 功能验证
- [ ] WebSocket 连接正常
- [ ] 性能指标监控
- [ ] 错误日志检查
- [ ] 安全扫描通过

---

**🎯 部署成功！您的 LangChain AI + MCP 应用已准备好服务用户！**

如需更多支持，请查看：
- [API 文档](API_DOCUMENTATION.md)
- [MCP 指南](MCP_GUIDE.md)
- [故障排除文档](TROUBLESHOOTING.md)