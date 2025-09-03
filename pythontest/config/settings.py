"""
应用配置文件
"""
import os
from typing import Dict, Any

class Config:
    """基础配置类"""
    
    # 基本配置
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    DEBUG = os.getenv('FLASK_DEBUG', '1') == '1'
    TESTING = False
    
    # 服务器配置
    HOST = os.getenv('HOST', '0.0.0.0')
    PORT = int(os.getenv('PORT', 3000))
    
    # 数据库配置
    # 注释掉这些行：
    # MONGO_URI = os.getenv('MONGO_URI', 'mongodb://...')
    # 'MONGO_URI': cls.MONGO_URI,
    
    # 日志配置
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    LOG_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    
    # API配置
    API_TITLE = 'Python Test API'
    API_VERSION = '1.0.0'
    API_DESCRIPTION = 'A RESTful API built with Flask and MongoDB'
    
    @classmethod
    def to_dict(cls) -> Dict[str, Any]:
        """将配置转换为字典"""
        return {
            'SECRET_KEY': cls.SECRET_KEY,
            'DEBUG': cls.DEBUG,
            'TESTING': cls.TESTING,
            'HOST': cls.HOST,
            'PORT': cls.PORT,
            'MONGO_URI': cls.MONGO_URI,
            'LOG_LEVEL': cls.LOG_LEVEL,
            'API_TITLE': cls.API_TITLE,
            'API_VERSION': cls.API_VERSION,
            'API_DESCRIPTION': cls.API_DESCRIPTION
        }

class DevelopmentConfig(Config):
    """开发环境配置"""
    DEBUG = True
    LOG_LEVEL = 'DEBUG'

class ProductionConfig(Config):
    """生产环境配置"""
    DEBUG = False
    LOG_LEVEL = 'WARNING'
    
    # 生产环境应该设置安全的SECRET_KEY
    SECRET_KEY = os.getenv('SECRET_KEY')

class TestingConfig(Config):
    """测试环境配置"""
    TESTING = True
    DEBUG = True
    LOG_LEVEL = 'DEBUG'

# 配置映射
config_map = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}

def get_config(config_name: str = None) -> Config:
    """
    获取配置类
    
    Args:
        config_name (str): 配置名称
        
    Returns:
        Config: 配置类实例
    """
    if not config_name:
        config_name = os.getenv('FLASK_ENV', 'default')
    
    return config_map.get(config_name, config_map['default']) 