from flask import Blueprint, jsonify

# 创建蓝图
hello_bp = Blueprint('hello', __name__)

@hello_bp.route('/hello')
def hello():
    """
    Hello World端点
    
    Returns:
        JSON: 包含问候消息的响应
    """
    return jsonify({
        'message': 'Hello, world!',
        'status': 'success',
        'endpoint': '/hello'
    })

@hello_bp.route('/hello/<name>')
def hello_name(name):
    """
    带参数的Hello端点
    
    Args:
        name (str): 用户名
        
    Returns:
        JSON: 个性化的问候消息
    """
    return jsonify({
        'message': f'Hello, {name}!',
        'status': 'success',
        'endpoint': f'/hello/{name}'
    }) 