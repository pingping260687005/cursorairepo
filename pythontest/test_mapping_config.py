#!/usr/bin/env python3
"""
测试mapping.csv配置文件功能
"""
import requests
import json
import time
import os

def test_mapping_config():
    """测试mapping.csv配置文件功能"""
    base_url = "http://localhost:3000"
    
    print("开始测试mapping.csv配置文件功能...")
    print("=" * 50)
    
    # 等待应用启动
    print("等待应用启动...")
    time.sleep(2)
    
    try:
        # 测试场景1: 使用mapping.csv中的默认配置
        print("\n=== 测试场景1: 使用mapping.csv默认配置 ===")
        test_with_default_config()
        
        # 测试场景2: 前端输入覆盖mapping.csv默认值
        print("\n=== 测试场景2: 前端输入覆盖默认配置 ===")
        test_with_frontend_override()
        
        # 测试场景3: 混合使用（部分字段使用前端，部分使用默认配置）
        print("\n=== 测试场景3: 混合使用配置 ===")
        test_with_mixed_config()
        
        # 测试场景4: 验证配置文件读取
        print("\n=== 测试场景4: 验证配置文件读取 ===")
        test_config_file_reading()
        
    except Exception as e:
        print(f"✗ 测试过程中出现错误: {e}")
        import traceback
        traceback.print_exc()

def test_with_default_config():
    """测试使用mapping.csv默认配置"""
    base_url = "http://localhost:3000"
    
    try:
        # 不传入字段映射和关键字段，使用mapping.csv中的默认值
        files = {
            'source_csv': open('sample_source.csv', 'rb'),
            'target_csv': open('sample_target.csv', 'rb')
        }
        
        data = {
            'field_mapping': '{}',  # 空映射，使用默认配置
            'key_fields': '[]'      # 空关键字段，使用默认配置
        }
        
        print("使用mapping.csv默认配置:")
        print("- 字段映射: 从mapping.csv读取")
        print("- 关键字段: 从mapping.csv读取")
        
        # 发送请求
        response = requests.post(
            f"{base_url}/data/compare",
            files=files,
            data=data
        )
        
        if response.status_code == 200:
            filename = f"mapping_test_default_{int(time.time())}.xlsx"
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
    """测试前端输入覆盖mapping.csv默认值"""
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
            'source_csv': open('sample_source.csv', 'rb'),
            'target_csv': open('sample_target.csv', 'rb')
        }
        
        data = {
            'field_mapping': json.dumps(frontend_field_mapping),
            'key_fields': json.dumps(frontend_key_fields)
        }
        
        print("前端输入覆盖默认配置:")
        print(f"- 字段映射: {frontend_field_mapping}")
        print(f"- 关键字段: {frontend_key_fields}")
        
        # 发送请求
        response = requests.post(
            f"{base_url}/data/compare",
            files=files,
            data=data
        )
        
        if response.status_code == 200:
            filename = f"mapping_test_override_{int(time.time())}.xlsx"
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

def test_with_mixed_config():
    """测试混合使用配置"""
    base_url = "http://localhost:3000"
    
    try:
        # 前端只传入部分字段映射，其他使用默认配置
        partial_field_mapping = {
            'id': 'user_id',
            'name': 'full_name'
            # age, city, salary 使用默认配置
        }
        
        # 不传入关键字段，使用默认配置
        files = {
            'source_csv': open('sample_source.csv', 'rb'),
            'target_csv': open('sample_target.csv', 'rb')
        }
        
        data = {
            'field_mapping': json.dumps(partial_field_mapping),
            'key_fields': '[]'  # 使用默认配置
        }
        
        print("混合使用配置:")
        print(f"- 字段映射: {partial_field_mapping} + 默认配置")
        print("- 关键字段: 使用默认配置")
        
        # 发送请求
        response = requests.post(
            f"{base_url}/data/compare",
            files=files,
            data=data
        )
        
        if response.status_code == 200:
            filename = f"mapping_test_mixed_{int(time.time())}.xlsx"
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

def test_config_file_reading():
    """测试配置文件读取功能"""
    try:
        print("验证mapping.csv配置文件:")
        
        if os.path.exists('mapping.csv'):
            with open('mapping.csv', 'r', encoding='utf-8') as f:
                content = f.read()
                print("✓ mapping.csv文件存在")
                print("文件内容:")
                print(content)
                
                # 验证配置格式
                lines = content.strip().split('\n')
                config = {}
                
                for line in lines:
                    line = line.strip()
                    if line.startswith('#') or not line:
                        continue
                    
                    if ',' in line:
                        key, value = line.split(',', 1)
                        key = key.strip()
                        value = value.strip()
                        config[key] = value
                
                print(f"\n解析的配置:")
                for key, value in config.items():
                    print(f"  {key}: {value}")
                
                # 验证必要字段
                required_fields = ['FIELD_MAPPING', 'KEY_FIELDS']
                missing_fields = [field for field in required_fields if field not in config]
                
                if missing_fields:
                    print(f"⚠ 缺少必要字段: {missing_fields}")
                else:
                    print("✓ 配置文件格式正确")
                    
        else:
            print("✗ mapping.csv文件不存在")
            
    except Exception as e:
        print(f"✗ 配置文件读取测试失败: {e}")

if __name__ == '__main__':
    test_mapping_config()
