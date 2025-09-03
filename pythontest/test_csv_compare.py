#!/usr/bin/env python3
"""
CSV比较功能测试脚本
"""
import requests
import json
import time

def test_csv_compare():
    """测试CSV比较功能"""
    base_url = "http://localhost:3000"
    
    print("开始测试CSV比较功能...")
    
    # 等待应用启动
    print("等待应用启动...")
    time.sleep(2)
    
    try:
        # 准备测试数据
        field_mapping = {
            'id': 'user_id',
            'name': 'full_name', 
            'age': 'user_age',
            'city': 'location',
            'salary': 'annual_income'
        }
        
        key_fields = ['id']
        
        # 准备文件上传
        files = {
            'source_csv': open('sample_source.csv', 'rb'),
            'target_csv': open('sample_target.csv', 'rb')
        }
        
        data = {
            'field_mapping': json.dumps(field_mapping),
            'key_fields': json.dumps(key_fields)
        }
        
        print(f"\n字段映射: {field_mapping}")
        print(f"关键字段: {key_fields}")
        
        # 发送请求
        print("\n发送CSV比较请求...")
        response = requests.post(
            f"{base_url}/data/compare",
            files=files,
            data=data
        )
        
        if response.status_code == 200:
            # 保存Excel文件
            filename = f"comparison_report_{int(time.time())}.xlsx"
            with open(filename, 'wb') as f:
                f.write(response.content)
            
            print(f"✓ CSV比较成功! Excel报告已保存为: {filename}")
            print(f"文件大小: {len(response.content)} bytes")
            
            # 分析结果
            print("\n预期结果分析:")
            print("- 数据丢失: Edward (ID=5) - 源表有但目标表没有")
            print("- 值差异: 无 (所有共同记录的值都匹配)")
            print("- 新增记录: Frank (ID=6) - 目标表有但源表没有")
            
        else:
            print(f"✗ CSV比较失败: {response.status_code}")
            print(f"错误信息: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("✗ 无法连接到应用，请确保应用正在运行")
    except Exception as e:
        print(f"✗ 测试过程中出现错误: {e}")
    finally:
        # 关闭文件
        if 'files' in locals():
            for file in files.values():
                file.close()

if __name__ == '__main__':
    test_csv_compare() 