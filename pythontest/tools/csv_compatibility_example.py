#!/usr/bin/env python3
"""
CSV兼容性功能使用示例

演示如何使用工具类处理Excel和CSV文件
"""

import pandas as pd
import os
from excel_reader import ExcelReader
from excel_writer import ExcelWriter
from excel_processor import ExcelProcessor
from excel_validator import ExcelValidator
from file_handler import FileHandler, detect_file_format, read_file, write_file


def create_sample_data():
    """创建示例数据"""
    data = {
        'id': [1, 2, 3, 4, 5],
        'name': ['Alice', 'Bob', 'Charlie', 'Diana', 'Edward'],
        'age': [30, 25, 35, 28, 32],
        'city': ['New York', 'Los Angeles', 'Chicago', 'Boston', 'Seattle'],
        'salary': [50000, 45000, 60000, 52000, 58000]
    }
    return pd.DataFrame(data)


def example_excel_reader():
    """ExcelReader CSV兼容性示例"""
    print("=== ExcelReader CSV兼容性示例 ===")
    
    # 创建示例CSV文件
    df = create_sample_data()
    csv_file = 'sample_data.csv'
    df.to_csv(csv_file, index=False)
    
    try:
        # 使用ExcelReader读取CSV文件
        reader = ExcelReader(csv_file)
        
        print(f"文件格式检测: {'CSV' if reader.is_csv else 'Excel'}")
        print(f"工作表名称: {reader.get_sheet_names()}")
        
        # 读取数据
        data = reader.read_sheet()
        print(f"数据形状: {data.shape}")
        print(f"列名: {data.columns.tolist()}")
        print("前3行数据:")
        print(data.head(3))
        
        # 获取工作表信息
        info = reader.get_sheet_info('Sheet1')
        print(f"工作表信息: {info}")
        
        reader.close()
        
    except Exception as e:
        print(f"错误: {e}")
    finally:
        # 清理文件
        if os.path.exists(csv_file):
            os.remove(csv_file)


def example_excel_writer():
    """ExcelWriter CSV兼容性示例"""
    print("\n=== ExcelWriter CSV兼容性示例 ===")
    
    # 创建示例数据
    df = create_sample_data()
    csv_file = 'output_data.csv'
    
    try:
        # 使用ExcelWriter写入CSV文件
        writer = ExcelWriter(csv_file)
        
        print(f"文件格式检测: {'CSV' if writer.is_csv else 'Excel'}")
        
        # 写入数据
        writer.write_dataframe(df, include_index=False, include_header=True)
        print(f"数据已写入到: {csv_file}")
        
        # 验证写入结果
        if os.path.exists(csv_file):
            with open(csv_file, 'r', encoding='utf-8') as f:
                lines = f.readlines()
                print(f"文件行数: {len(lines)}")
                print("前3行内容:")
                for i, line in enumerate(lines[:3]):
                    print(f"  {i+1}: {line.strip()}")
        
        writer.close()
        
    except Exception as e:
        print(f"错误: {e}")
    finally:
        # 清理文件
        if os.path.exists(csv_file):
            os.remove(csv_file)


def example_excel_processor():
    """ExcelProcessor CSV兼容性示例"""
    print("\n=== ExcelProcessor CSV兼容性示例 ===")
    
    # 创建示例CSV文件
    df = create_sample_data()
    csv_file = 'sample_data.csv'
    df.to_csv(csv_file, index=False)
    
    try:
        # 使用ExcelProcessor处理CSV文件
        processor = ExcelProcessor(csv_file)
        
        print("原始数据信息:")
        info = processor.get_data_info()
        print(f"  形状: {info['shape']}")
        print(f"  列名: {info['columns']}")
        print(f"  数据类型: {info['dtypes']}")
        
        # 数据清洗
        cleaned_data = processor.clean_data(remove_duplicates=True, fill_na_method='drop')
        print(f"清洗后数据形状: {cleaned_data.shape}")
        
        # 数据筛选
        filtered_data = processor.filter_data({'age': '>30'})
        print(f"年龄>30的记录数: {len(filtered_data)}")
        
        # 数据排序
        sorted_data = processor.sort_data('salary', ascending=False)
        print("按薪资降序排列的前3名:")
        print(sorted_data[['name', 'salary']].head(3))
        
        # 统计分析
        stats = processor.calculate_statistics(['age', 'salary'])
        print("统计信息:")
        for col, stat in stats.items():
            print(f"  {col}: 平均值={stat['mean']:.2f}, 最大值={stat['max']}")
        
    except Exception as e:
        print(f"错误: {e}")
    finally:
        # 清理文件
        if os.path.exists(csv_file):
            os.remove(csv_file)


def example_excel_validator():
    """ExcelValidator CSV兼容性示例"""
    print("\n=== ExcelValidator CSV兼容性示例 ===")
    
    # 创建示例CSV文件
    df = create_sample_data()
    csv_file = 'sample_data.csv'
    df.to_csv(csv_file, index=False)
    
    try:
        # 使用ExcelValidator验证CSV文件
        validator = ExcelValidator(csv_file)
        
        # 数据类型验证
        type_results = validator.validate_data_types({
            'id': 'int',
            'age': 'int',
            'salary': 'int',
            'name': 'str'
        })
        print("数据类型验证结果:")
        for col, errors in type_results.items():
            if errors:
                print(f"  {col}: {errors}")
            else:
                print(f"  {col}: 通过")
        
        # 数据范围验证
        range_results = validator.validate_data_range({
            'age': {'min': 18, 'max': 65},
            'salary': {'min': 30000, 'max': 100000}
        })
        print("数据范围验证结果:")
        for col, errors in range_results.items():
            if errors:
                print(f"  {col}: {errors}")
            else:
                print(f"  {col}: 通过")
        
        # 数据完整性验证
        completeness_results = validator.validate_data_completeness(['id', 'name'])
        print("数据完整性验证结果:")
        for col, errors in completeness_results.items():
            if errors:
                print(f"  {col}: {errors}")
            else:
                print(f"  {col}: 通过")
        
        # 生成验证报告
        report = validator.generate_validation_report()
        print(f"验证报告摘要: 总错误数={report['summary']['total_errors']}")
        
    except Exception as e:
        print(f"错误: {e}")
    finally:
        # 清理文件
        if os.path.exists(csv_file):
            os.remove(csv_file)


def example_file_handler():
    """FileHandler统一文件处理示例"""
    print("\n=== FileHandler统一文件处理示例 ===")
    
    # 创建示例数据
    df = create_sample_data()
    csv_file = 'sample_data.csv'
    excel_file = 'sample_data.xlsx'
    
    try:
        # 保存为CSV和Excel文件
        df.to_csv(csv_file, index=False)
        df.to_excel(excel_file, index=False)
        
        # 使用FileHandler处理不同格式的文件
        for file_path in [csv_file, excel_file]:
            print(f"\n处理文件: {file_path}")
            
            with FileHandler(file_path) as handler:
                # 文件格式检测
                print(f"  文件格式: {handler.get_format().value}")
                print(f"  是否为CSV: {handler.is_csv()}")
                print(f"  是否为Excel: {handler.is_excel()}")
                
                # 读取数据
                data = handler.read_data()
                print(f"  数据形状: {data.shape}")
                
                # 获取文件信息
                info = handler.get_file_info()
                print(f"  文件大小: {info['file_size']} 字节")
                print(f"  工作表数量: {len(info['sheet_names'])}")
        
        # 使用便捷函数
        print(f"\n使用便捷函数读取CSV: {csv_file}")
        data = read_file(csv_file)
        print(f"数据形状: {data.shape}")
        
        # 使用便捷函数写入
        output_file = 'output_data.csv'
        write_file(output_file, df)
        print(f"数据已写入: {output_file}")
        
        # 清理输出文件
        if os.path.exists(output_file):
            os.remove(output_file)
        
    except Exception as e:
        print(f"错误: {e}")
    finally:
        # 清理文件
        for file_path in [csv_file, excel_file]:
            if os.path.exists(file_path):
                os.remove(file_path)


def example_format_detection():
    """文件格式检测示例"""
    print("\n=== 文件格式检测示例 ===")
    
    # 创建示例文件
    df = create_sample_data()
    csv_file = 'sample_data.csv'
    excel_file = 'sample_data.xlsx'
    
    try:
        # 保存文件
        df.to_csv(csv_file, index=False)
        df.to_excel(excel_file, index=False)
        
        # 检测文件格式
        for file_path in [csv_file, excel_file]:
            format_type = detect_file_format(file_path)
            print(f"{file_path}: {format_type.value}")
        
    except Exception as e:
        print(f"错误: {e}")
    finally:
        # 清理文件
        for file_path in [csv_file, excel_file]:
            if os.path.exists(file_path):
                os.remove(file_path)


def main():
    """主函数"""
    print("CSV兼容性功能演示")
    print("=" * 50)
    
    # 运行所有示例
    example_excel_reader()
    example_excel_writer()
    example_excel_processor()
    example_excel_validator()
    example_file_handler()
    example_format_detection()
    
    print("\n" + "=" * 50)
    print("所有示例运行完成！")


if __name__ == "__main__":
    main()
