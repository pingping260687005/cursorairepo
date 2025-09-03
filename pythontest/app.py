"""
主应用文件
"""
from app_factory import create_app
# 注释掉这些行：
# from config.database import db_manager
import atexit

# 创建应用实例
app = create_app()

# 获取数据库实例的便捷引用
# 注释掉这些行：
# db = app.config.get('db')

# 注册应用关闭时的清理函数
# 注释掉这些行：
# @atexit.register
# def cleanup():
#     """应用关闭时的清理工作"""
#     db_manager.close()

if __name__ == '__main__':
    # 启动应用
    app.run(
        host=app.config['HOST'],
        port=app.config['PORT'],
        debug=app.config['DEBUG']
    ) 