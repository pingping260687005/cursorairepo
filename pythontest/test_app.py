#!/usr/bin/env python3
"""
测试文件 - 验证应用功能
"""
import requests
import json
import time

def test_app():
    """测试应用的基本功能"""
    base_url = "http://localhost:3000"
    
    print("开始测试应用...")
    
    # 等待应用启动
    print("等待应用启动...")
    time.sleep(2)
    
    try:
        # 测试Hello端点
        print("\n1. 测试 /hello 端点...")
        response = requests.get(f"{base_url}/hello")
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Hello端点正常: {data}")
        else:
            print(f"✗ Hello端点错误: {response.status_code}")
        
        # 测试带参数的Hello端点
        print("\n2. 测试 /hello/<name> 端点...")
        response = requests.get(f"{base_url}/hello/World")
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Hello World端点正常: {data}")
        else:
            print(f"✗ Hello World端点错误: {response.status_code}")
            
        # 测试Users端点
        print("\n3. 测试 /users 端点...")
        response = requests.get(f"{base_url}/users")
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Users端点正常: 找到 {data.get('count', 0)} 个用户")
            if 'data' in data:
                for user in data['data']:
                    print(f"  - {user['name']}, {user['age']}岁")
        else:
            print(f"✗ Users端点错误: {response.status_code}")
        
        # 测试根据姓名获取用户
        print("\n4. 测试 /users/<name> 端点...")
        response = requests.get(f"{base_url}/users/Alice")
        if response.status_code == 200:
            data = response.json()
            print(f"✓ 获取Alice用户正常: {data}")
        else:
            print(f"✗ 获取Alice用户错误: {response.status_code}")
        
        # 测试创建用户
        print("\n5. 测试创建用户...")
        new_user = {"name": "David", "age": 28}
        response = requests.post(f"{base_url}/users", json=new_user)
        if response.status_code == 201:
            data = response.json()
            print(f"✓ 创建用户成功: {data}")
        else:
            print(f"✗ 创建用户失败: {response.status_code}")
            
        print("\n所有测试完成!")
        
    except requests.exceptions.ConnectionError:
        print("✗ 无法连接到应用，请确保应用正在运行")
    except Exception as e:
        print(f"✗ 测试过程中出现错误: {e}")

if __name__ == '__main__':
    test_app() 