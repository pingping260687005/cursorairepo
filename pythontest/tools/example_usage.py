"""
Excel工具类使用示例

展示如何使用tools包中的各种Excel操作工具类
"""

import pandas as pd
from excel_reader import ExcelReader
from excel_writer import ExcelWriter
from excel_processor import ExcelProcessor
from excel_formatter import ExcelFormatter
from excel_validator import ExcelValidator


def example_excel_reader():
    """ExcelReader使用示例"""
    print("=== ExcelReader 使用示例 ===")
    
    # 使用上下文管理器读取Excel文件
    with ExcelReader('sample_source.csv') as reader:
        # 获取工作表名称
        sheet_names = reader.get_sheet_names()
        print(f"工作表名称: {sheet_names}")
        
        # 读取整个工作表
        df = reader.read_sheet()
        print(f"数据形状: {df.shape}")
        print(f"列名: {df.columns.tolist()}")
        
        # 读取指定范围的数据
        range_df = reader.read_sheet_by_range('Sheet1', 'A1', 'C10')
        print(f"指定范围数据形状: {range_df.shape}")
        
        # 获取工作表信息
        sheet_info = reader.get_sheet_info('Sheet1')
        print(f"工作表信息: {sheet_info}")


def example_excel_writer():
    """ExcelWriter使用示例"""
    print("\n=== ExcelWriter 使用示例 ===")
    
    # 创建示例数据
    data = {
        '姓名': ['张三', '李四', '王五'],
        '年龄': [25, 30, 35],
        '工资': [5000, 6000, 7000]
    }
    df = pd.DataFrame(data)
    
    # 使用上下文管理器写入Excel文件
    with ExcelWriter('output_example.xlsx') as writer:
        # 写入DataFrame
        writer.write_dataframe(df, sheet_name='员工信息')
        
        # 写入单个单元格
        writer.write_cell_value('员工信息', 'E1', '备注')
        writer.write_cell_value('员工信息', 'E2', '优秀员工')
        
        # 设置列宽
        writer.set_column_width('员工信息', 'A', 15)
        writer.set_column_width('员工信息', 'B', 10)
        writer.set_column_width('员工信息', 'C', 12)
        
        # 保存文件
        writer.save()


def example_excel_processor():
    """ExcelProcessor使用示例"""
    print("\n=== ExcelProcessor 使用示例 ===")
    
    # 创建示例数据
    data = {
        '产品名称': ['产品A', '产品B', '产品C', '产品A', '产品D'],
        '价格': [100, 200, 150, 100, 300],
        '数量': [10, 20, 15, 5, 25],
        '日期': ['2023-01-01', '2023-01-02', '2023-01-03', '2023-01-04', '2023-01-05']
    }
    df = pd.DataFrame(data)
    
    # 创建处理器
    processor = ExcelProcessor(df)
    
    # 数据清洗
    cleaned_df = processor.clean_data(remove_duplicates=True)
    print(f"清洗后数据形状: {cleaned_df.shape}")
    
    # 数据类型转换
    type_mapping = {
        '价格': 'float64',
        '数量': 'int64',
        '日期': 'datetime64'
    }
    converted_df = processor.convert_data_types(type_mapping)
    print(f"转换后数据类型: {converted_df.dtypes.to_dict()}")
    
    # 数据筛选
    filtered_df = processor.filter_data({'价格': '>150'})
    print(f"筛选后数据形状: {filtered_df.shape}")
    
    # 数据排序
    sorted_df = processor.sort_data('价格', ascending=False)
    print(f"排序后前3行:\n{sorted_df.head(3)}")
    
    # 分组聚合
    grouped_df = processor.group_and_aggregate(
        group_by=['产品名称'],
        agg_functions={'价格': 'mean', '数量': 'sum'}
    )
    print(f"分组聚合结果:\n{grouped_df}")
    
    # 计算统计信息
    stats = processor.calculate_statistics(['价格', '数量'])
    print(f"统计信息: {stats}")


def example_excel_formatter():
    """ExcelFormatter使用示例"""
    print("\n=== ExcelFormatter 使用示例 ===")
    
    # 创建示例Excel文件
    data = {
        '姓名': ['张三', '李四', '王五'],
        '年龄': [25, 30, 35],
        '工资': [5000, 6000, 7000]
    }
    df = pd.DataFrame(data)
    
    # 先写入数据
    with ExcelWriter('format_example.xlsx') as writer:
        writer.write_dataframe(df, sheet_name='员工信息')
    
    # 格式化文件
    with ExcelFormatter('format_example.xlsx') as formatter:
        # 格式化表头
        formatter.format_header('员工信息', 'A1:C1', 
                              font_size=14, bold=True, 
                              fill_color='4472C4', text_color='FFFFFF')
        
        # 设置数据区域格式
        formatter.set_font('员工信息', 'A2:C4', font_size=12)
        formatter.set_alignment('员工信息', 'A2:C4', horizontal='center')
        formatter.set_border('员工信息', 'A1:C4')
        
        # 设置数字格式
        formatter.set_number_format('员工信息', 'C2:C4', '#,##0')
        
        # 自动调整列宽
        formatter.auto_adjust_column_width('员工信息')
        
        # 应用条件格式化（工资大于6000的标红）
        formatter.apply_conditional_formatting(
            '员工信息', 'C2:C4', 'cell_is',
            operator='greaterThan', formula=['6000'],
            fill=formatter.workbook['员工信息']['C1'].fill
        )
        
        # 保存格式化后的文件
        formatter.save('formatted_example.xlsx')


def example_excel_validator():
    """ExcelValidator使用示例"""
    print("\n=== ExcelValidator 使用示例 ===")
    
    # 创建示例数据
    data = {
        '姓名': ['张三', '李四', '王五', '', '赵六'],
        '年龄': [25, 30, 35, None, 40],
        '邮箱': ['zhang@example.com', 'li@example.com', 'invalid-email', 'wang@test.com', 'zhao@demo.com'],
        '工资': [5000, 6000, 7000, 8000, 9000]
    }
    df = pd.DataFrame(data)
    
    # 创建验证器
    validator = ExcelValidator(df)
    
    # 验证数据类型
    type_results = validator.validate_data_types({
        '姓名': 'str',
        '年龄': 'int',
        '工资': 'float'
    })
    print(f"数据类型验证结果: {type_results}")
    
    # 验证数据范围
    range_results = validator.validate_data_range({
        '年龄': {'min': 18, 'max': 65},
        '工资': {'min': 3000, 'max': 20000}
    })
    print(f"数据范围验证结果: {range_results}")
    
    # 验证数据格式
    format_results = validator.validate_data_format({
        '邮箱': 'email'
    })
    print(f"数据格式验证结果: {format_results}")
    
    # 验证数据完整性
    completeness_results = validator.validate_data_completeness(['姓名', '年龄'])
    print(f"数据完整性验证结果: {completeness_results}")
    
    # 验证重复数据
    duplicate_results = validator.validate_duplicates(['姓名'])
    print(f"重复数据验证结果: {duplicate_results}")
    
    # 生成验证报告
    report = validator.generate_validation_report('validation_report.txt')
    print(f"验证报告摘要: {report['summary']}")


def main():
    """主函数"""
    print("Excel工具类使用示例")
    print("=" * 50)
    
    try:
        # 运行各种示例
        example_excel_reader()
        example_excel_writer()
        example_excel_processor()
        example_excel_formatter()
        example_excel_validator()
        
        print("\n所有示例运行完成！")
        
    except Exception as e:
        print(f"运行示例时出错: {e}")


if __name__ == "__main__":
    main()
