"""
Flask应用工厂
"""
from flask import Flask
from config.settings import get_config
from config.database import init_database
import logging
import os

def create_app(config_name: str = None) -> Flask:
    """
    创建Flask应用实例
    
    Args:
        config_name (str): 配置名称
        
    Returns:
        Flask: 应用实例
    """
    # 创建应用实例
    app = Flask(__name__)
    
    # 加载配置
    config = get_config(config_name)
    app.config.from_object(config)
    
    # 配置日志
    setup_logging(app)
    
    # 初始化数据库
    # 注释掉这些行：
    # from config.database import init_database
    # if not init_database():
    #     app.logger.error("Failed to initialize database")
    
    # 注册蓝图
    register_blueprints(app)
    
    # 初始化数据
    # 注释掉这些行：
    # init_sample_data(app)
    # from config.database import get_db
    
    # 注册错误处理器
    register_error_handlers(app)
    
    return app

def setup_logging(app: Flask):
    """配置日志"""
    logging.basicConfig(
        level=getattr(logging, app.config['LOG_LEVEL']),
        format=app.config['LOG_FORMAT']
    )
    
    # 设置Flask应用的日志级别
    app.logger.setLevel(getattr(logging, app.config['LOG_LEVEL']))

def register_blueprints(app: Flask):
    """注册蓝图"""
    from routes.hello import hello_bp
    from routes.users import users_bp
    from routes.data.compare import data_compare_bp
    from routes.data.mapping import mapping_bp

    app.register_blueprint(hello_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(data_compare_bp)
    app.register_blueprint(mapping_bp)

    app.logger.info("Blueprints registered successfully")

def init_sample_data(app: Flask):
    """初始化示例数据"""
    try:
        # from config.database import get_db
        db = get_db()
        
        if db and db.users.count_documents({}) == 0:
            插入示例用户数据
            users_data = [
                {'name': 'Alice', 'age': 30},
                {'name': 'Bob', 'age': 25},
                {'name': 'Charlie', 'age': 35}
            ]
            
            db.users.insert_many(users_data)
            app.logger.info(f"Sample data inserted: {len(users_data)} users")
        else:
            app.logger.info("Sample data already exists")
            
    except Exception as e:
        app.logger.error(f"Failed to initialize sample data: {e}")

def register_error_handlers(app: Flask):
    """注册错误处理器"""
    
    @app.errorhandler(404)
    def not_found(error):
        return {
            'status': 'error',
            'message': 'Resource not found',
            'error': 'Not Found'
        }, 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return {
            'status': 'error',
            'message': 'Internal server error',
            'error': 'Internal Server Error'
        }, 500
    
    @app.errorhandler(400)
    def bad_request(error):
        return {
            'status': 'error',
            'message': 'Bad request',
            'error': 'Bad Request'
        }, 400