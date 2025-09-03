"""
数据库配置和连接管理
"""
from pymongo import MongoClient
from pymongo.database import Database
import os
import logging
from typing import Optional

logger = logging.getLogger(__name__)

class DatabaseManager:
    """数据库管理器"""
    
    def __init__(self):
        self.client: Optional[MongoClient] = None
        self.db: Optional[Database] = None
        
    def connect(self, mongo_uri: str = None) -> bool:
        """
        连接到MongoDB
        
        Args:
            mongo_uri (str): MongoDB连接字符串
            
        Returns:
            bool: 连接是否成功
        """
        try:
            if not mongo_uri:
                mongo_uri = os.getenv('MONGO_URI', 'mongodb://root:76ghnp2d@dbconn.sealosbja.site:41314/?directConnection=true')
            
            self.client = MongoClient(mongo_uri)
            # 测试连接
            self.client.admin.command('ping')
            
            # 获取默认数据库
            self.db = self.client.get_default_database()
            
            logger.info('Successfully connected to MongoDB')
            return True
            
        except Exception as e:
            logger.error(f'Failed to connect to MongoDB: {e}')
            return False
    
    def get_database(self) -> Optional[Database]:
        """
        获取数据库实例
        
        Returns:
            Database: 数据库实例或None
        """
        return self.db
    
    def close(self):
        """关闭数据库连接"""
        if self.client:
            self.client.close()
            logger.info('MongoDB connection closed')
    
    def is_connected(self) -> bool:
        """
        检查是否已连接
        
        Returns:
            bool: 连接状态
        """
        try:
            if self.client:
                self.client.admin.command('ping')
                return True
        except:
            pass
        return False

# 全局数据库管理器实例
db_manager = DatabaseManager()

def get_db() -> Optional[Database]:
    """
    获取数据库实例的便捷函数
    
    Returns:
        Database: 数据库实例
    """
    return db_manager.get_database()

def init_database():
    """初始化数据库连接"""
    return db_manager.connect() 