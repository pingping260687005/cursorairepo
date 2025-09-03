#!/usr/bin/env python3
"""
测试CSV元数据读取和合并功能
"""
import requests
import json
import time
import os

def test_csv_metadata():
    """测试CSV元数据功能"""
    base_url = "http://localhost:3000"
    
    print("开始测试CSV元数据功能...")
    print("=" * 50)
    
    # 等待应用启动
    print("等待应用启动...")
    time.sleep(2)
    
    try:
        # 测试场景1: 使用CSV中的默认元数据
        print("\n=== 测试场景1: 使用CSV默认元数据 ===")
        test_with_default_metadata()
        
        # 测试场景2: 前端输入覆盖CSV默认值
        print("\n=== 测试场景2: 前端输入覆盖CSV默认值 ===")
        test_with_frontend_override()
        
        # 测试场景3: 混合使用（部分字段使用前端，部分使用CSV默认值）
        print("\n=== 测试场景3: 混合使用元数据 ===")
        test_with_mixed_metadata()
        
    except Exception as e:
        print(f"✗ 测试过程中出现错误: {e}")
        import traceback
        traceback.print_exc()

def test_with_default_metadata():
    """测试使用CSV默认元数据"""
    base_url = "http://localhost:3000"
    
    try:
        # 不传入字段映射和关键字段，使用CSV中的默认值
        files = {
            'source_csv': open('sample_source_with_mapping.csv', 'rb'),
            'target_csv': open('sample_target_with_mapping.csv', 'rb')
        }
        
        data = {
            'field_mapping': '{}',  # 空映射，使用CSV默认值
            'key_fields': '[]'      # 空关键字段，使用CSV默认值
        }
        
        print("使用CSV默认元数据:")
        print("- 字段映射: 从CSV读取")
        print("- 关键字段: 从CSV读取")
        
        # 发送请求
        response = requests.post(
            f"{base_url}/data/compare",
            files=files,
            data=data
        )
        
        if response.status_code == 200:
            filename = f"metadata_test_default_{int(time.time())}.xlsx"
            with open(filename, 'wb') as f:
                f.write(response.content)
            
            print(f"✓ 测试成功! Excel报告已保存为: {filename}")
            print(f"文件大小: {len(response.content)} bytes")
        else:
            print(f"✗ 测试失败: {response.status_code}")
            print(f"错误信息: {response.text}")
            
    except Exception as e:
        print(f"✗ 测试失败: {e}")
    finally:
        if 'files' in locals():
            for file in files.values():
                file.close()

def test_with_frontend_override():
    """测试前端输入覆盖CSV默认值"""
    base_url = "http://localhost:3000"
    
    try:
        # 前端传入不同的字段映射和关键字段
        frontend_field_mapping = {
            'id': 'user_id',
            'name': 'full_name', 
            'age': 'user_age',
            'city': 'location',
            'salary': 'annual_income'
        }
        
        frontend_key_fields = ['id', 'name']  # 使用复合主键
        
        files = {
            'source_csv': open('sample_source_with_mapping.csv', 'rb'),
            'target_csv': open('sample_target_with_mapping.csv', 'rb')
        }
        
        data = {
            'field_mapping': json.dumps(frontend_field_mapping),
            'key_fields': json.dumps(frontend_key_fields)
        }
        
        print("前端输入覆盖CSV默认值:")
        print(f"- 字段映射: {frontend_field_mapping}")
        print(f"- 关键字段: {frontend_key_fields}")
        
        # 发送请求
        response = requests.post(
            f"{base_url}/data/compare",
            files=files,
            data=data
        )
        
        if response.status_code == 200:
            filename = f"metadata_test_override_{int(time.time())}.xlsx"
            with open(filename, 'wb') as f:
                f.write(response.content)
            
            print(f"✓ 测试成功! Excel报告已保存为: {filename}")
            print(f"文件大小: {len(response.content)} bytes")
        else:
            print(f"✗ 测试失败: {response.status_code}")
            print(f"错误信息: {response.text}")
            
    except Exception as e:
        print(f"✗ 测试失败: {e}")
    finally:
        if 'files' in locals():
            for file in files.values():
                file.close()

def test_with_mixed_metadata():
    """测试混合使用元数据"""
    base_url = "http://localhost:3000"
    
    try:
        # 前端只传入部分字段映射，其他使用CSV默认值
        partial_field_mapping = {
            'id': 'user_id',
            'name': 'full_name'
            # age, city, salary 使用CSV默认值
        }
        
        # 不传入关键字段，使用CSV默认值
        files = {
            'source_csv': open('sample_source_with_mapping.csv', 'rb'),
            'target_csv': open('sample_target_with_mapping.csv', 'rb')
        }
        
        data = {
            'field_mapping': json.dumps(partial_field_mapping),
            'key_fields': '[]'  # 使用CSV默认值
        }
        
        print("混合使用元数据:")
        print(f"- 字段映射: {partial_field_mapping} + CSV默认值")
        print("- 关键字段: 使用CSV默认值")
        
        # 发送请求
        response = requests.post(
            f"{base_url}/data/compare",
            files=files,
            data=data
        )
        
        if response.status_code == 200:
            filename = f"metadata_test_mixed_{int(time.time())}.xlsx"
            with open(filename, 'wb') as f:
                f.write(response.content)
            
            print(f"✓ 测试成功! Excel报告已保存为: {filename}")
            print(f"文件大小: {len(response.content)} bytes")
        else:
            print(f"✗ 测试失败: {response.status_code}")
            print(f"错误信息: {response.text}")
            
    except Exception as e:
        print(f"✗ 测试失败: {e}")
    finally:
        if 'files' in locals():
            for file in files.values():
                file.close()

if __name__ == '__main__':
    test_csv_metadata()
