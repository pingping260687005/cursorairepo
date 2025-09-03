#!/usr/bin/env python3
"""
启动脚本
"""
import os
import sys
from app import app

def main():
    """主函数"""
    # 设置默认端口
    port = int(os.environ.get('PORT', app.config['PORT']))
    
    # 设置主机地址
    host = os.environ.get('HOST', app.config['HOST'])
    
    print(f"Starting Flask application on {host}:{port}")
    print(f"Environment: {os.environ.get('FLASK_ENV', 'development')}")
    print(f"Debug mode: {app.config['DEBUG']}")
    print(f"API Info: {app.config['API_TITLE']} v{app.config['API_VERSION']}")
    
    try:
        app.run(debug=app.config['DEBUG'], host=host, port=port)
    except KeyboardInterrupt:
        print("\nShutting down...")
        sys.exit(0)

if __name__ == '__main__':
    main() 