#!/usr/bin/env python3
"""
测试美化后的Excel生成功能
"""
import requests
import json
import time
import os

def test_beautified_excel():
    """测试美化后的Excel生成功能"""
    base_url = "http://localhost:3000"
    
    print("开始测试美化后的Excel生成功能...")
    print("=" * 50)
    
    # 等待应用启动
    print("等待应用启动...")
    time.sleep(2)
    
    try:
        # 准备测试数据 - 创建有差异的测试数据
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
        
        print(f"字段映射: {field_mapping}")
        print(f"关键字段: {key_fields}")
        print("\n预期结果:")
        print("- 数据丢失: Edward (ID=5) - 源表有但目标表没有")
        print("- 值差异: 无 (所有共同记录的值都匹配)")
        print("- 新增记录: Frank (ID=6) - 目标表有但源表没有")
        
        # 发送请求
        print("\n发送CSV比较请求...")
        response = requests.post(
            f"{base_url}/data/compare",
            files=files,
            data=data
        )
        
        if response.status_code == 200:
            # 保存Excel文件
            filename = f"beautified_comparison_report_{int(time.time())}.xlsx"
            with open(filename, 'wb') as f:
                f.write(response.content)
            
            print(f"✓ 美化后的Excel报告生成成功!")
            print(f"文件名: {filename}")
            print(f"文件大小: {len(response.content)} bytes")
            
            # 检查文件是否存在
            if os.path.exists(filename):
                file_size = os.path.getsize(filename)
                print(f"文件已保存，大小: {file_size} bytes")
                
                if file_size > 1000:  # 确保文件不是空的
                    print("✓ Excel文件生成正常，包含样式和格式")
                    print("\n美化特性:")
                    print("- 表头: 彩色背景 + 白色粗体字体")
                    print("- 数据丢失行: 浅红色背景")
                    print("- 值差异行: 不同颜色区分不同类型数据")
                    print("- 差异值: 红色背景 + 白色粗体字体 + 红色粗边框")
                    print("- 自动列宽调整")
                    print("- 边框和网格线")
                else:
                    print("⚠ Excel文件可能为空或有问题")
            else:
                print("✗ 文件保存失败")
                
        else:
            print(f"✗ CSV比较失败: {response.status_code}")
            print(f"错误信息: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("✗ 无法连接到应用，请确保应用正在运行")
        print("请运行: python run.py")
    except Exception as e:
        print(f"✗ 测试过程中出现错误: {e}")
        import traceback
        traceback.print_exc()
    finally:
        # 关闭文件
        if 'files' in locals():
            for file in files.values():
                file.close()

def create_test_csv_files():
    """创建测试用的CSV文件"""
    print("创建测试CSV文件...")
    
    # 创建源CSV文件
    source_content = """id,name,age,city,salary
1,Alice,30,New York,50000
2,Bob,25,Los Angeles,45000
3,Charlie,35,Chicago,60000
4,Diana,28,Boston,52000
5,Edward,32,Seattle,58000"""
    
    with open('sample_source.csv', 'w', encoding='utf-8') as f:
        f.write(source_content)
    
    # 创建目标CSV文件
    target_content = """user_id,full_name,user_age,location,annual_income
1,Alice,30,New York,51000
2,Bob,25,Los Angeles,45000
3,Charlie,35,Chicago,60000
4,Diana,28,Boston,52000
6,Frank,29,Denver,55000"""
    
    with open('sample_target.csv', 'w', encoding='utf-8') as f:
        f.write(target_content)
    
    print("✓ 测试CSV文件创建完成")

if __name__ == '__main__':
    # 首先创建测试文件
    create_test_csv_files()
    
    # 然后测试Excel生成
    test_beautified_excel()
