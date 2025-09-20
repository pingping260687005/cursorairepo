# Excel和CSV操作工具包

这个工具包提供了完整的Excel和CSV文件操作功能，包括读取、写入、处理、格式化和验证数据。所有工具类都支持Excel和CSV格式，提供统一的API接口。

## 安装依赖

确保已安装以下Python包：

```bash
pip install pandas openpyxl numpy
```

## 工具类概览

### 1. ExcelReader - Excel/CSV读取工具
用于读取Excel和CSV文件的各种功能。

**主要功能：**
- 读取整个工作表/CSV文件
- 读取指定范围的数据（仅Excel）
- 读取多个工作表（仅Excel）
- 获取工作表信息
- 读取单个单元格、行、列（仅Excel）
- 自动检测文件格式
- 支持CSV编码和分隔符设置

**使用示例：**
```python
from tools import ExcelReader

# 读取Excel文件
with ExcelReader('data.xlsx') as reader:
    # 读取工作表
    df = reader.read_sheet('Sheet1')
    
    # 读取指定范围
    range_data = reader.read_sheet_by_range('Sheet1', 'A1', 'C10')
    
    # 获取工作表信息
    info = reader.get_sheet_info('Sheet1')

# 读取CSV文件
with ExcelReader('data.csv') as reader:
    # 自动检测为CSV格式
    print(f"文件格式: {'CSV' if reader.is_csv else 'Excel'}")
    
    # 读取CSV数据（支持编码和分隔符设置）
    df = reader.read_sheet(encoding='utf-8', delimiter=',')
    
    # 获取文件信息
    info = reader.get_sheet_info('Sheet1')
```

### 2. ExcelWriter - Excel/CSV写入工具
用于写入Excel和CSV文件的各种功能。

**主要功能：**
- 写入DataFrame到工作表/CSV文件
- 写入数据到指定范围（仅Excel）
- 创建和删除工作表（仅Excel）
- 设置单元格格式（仅Excel）
- 设置列宽和行高（仅Excel）
- 自动检测文件格式
- 支持CSV编码和分隔符设置

**使用示例：**
```python
from tools import ExcelWriter
import pandas as pd

# 创建数据
data = {'姓名': ['张三', '李四'], '年龄': [25, 30]}
df = pd.DataFrame(data)

# 写入Excel文件
with ExcelWriter('output.xlsx') as writer:
    writer.write_dataframe(df, sheet_name='员工信息')
    writer.set_column_width('员工信息', 'A', 15)
    writer.save()

# 写入CSV文件
with ExcelWriter('output.csv') as writer:
    # 自动检测为CSV格式
    print(f"文件格式: {'CSV' if writer.is_csv else 'Excel'}")
    
    # 写入CSV数据（支持编码和分隔符设置）
    writer.write_dataframe(df, encoding='utf-8', delimiter=',')
```

### 3. ExcelProcessor - Excel/CSV数据处理工具
用于处理Excel和CSV数据的各种功能。

**主要功能：**
- 数据清洗和预处理
- 数据类型转换
- 数据筛选和排序
- 数据合并和拆分
- 统计分析
- 查找异常值
- 自动检测文件格式

**使用示例：**
```python
from tools import ExcelProcessor

# 处理Excel文件
processor = ExcelProcessor('data.xlsx')

# 处理CSV文件
processor = ExcelProcessor('data.csv')

# 数据清洗
cleaned_df = processor.clean_data(remove_duplicates=True)

# 数据类型转换
converted_df = processor.convert_data_types({'年龄': 'int64'})

# 数据筛选
filtered_df = processor.filter_data({'年龄': '>25'})

# 计算统计信息
stats = processor.calculate_statistics(['年龄', '工资'])
```

### 4. ExcelFormatter - Excel格式化工具
用于格式化Excel文件的各种功能。

**主要功能：**
- 设置字体样式
- 设置单元格颜色和背景
- 设置边框样式
- 设置对齐方式
- 条件格式化
- 自动调整列宽和行高

**使用示例：**
```python
from tools import ExcelFormatter

# 格式化Excel文件
with ExcelFormatter('data.xlsx') as formatter:
    # 格式化表头
    formatter.format_header('Sheet1', 'A1:C1', 
                          font_size=14, bold=True, 
                          fill_color='4472C4')
    
    # 设置边框
    formatter.set_border('Sheet1', 'A1:C10')
    
    # 自动调整列宽
    formatter.auto_adjust_column_width('Sheet1')
    
    # 保存格式化后的文件
    formatter.save('formatted_data.xlsx')
```

### 5. ExcelValidator - Excel/CSV数据验证工具
用于验证Excel和CSV数据的各种功能。

**主要功能：**
- 数据类型验证
- 数据范围验证
- 数据格式验证
- 数据完整性验证
- 业务规则验证
- 生成验证报告
- 自动检测文件格式

**使用示例：**
```python
from tools import ExcelValidator

# 验证Excel文件
validator = ExcelValidator('data.xlsx')

# 验证CSV文件
validator = ExcelValidator('data.csv')

# 验证数据类型
type_results = validator.validate_data_types({
    '姓名': 'str',
    '年龄': 'int',
    '工资': 'float'
})

# 验证数据范围
range_results = validator.validate_data_range({
    '年龄': {'min': 18, 'max': 65}
})

# 验证数据格式
format_results = validator.validate_data_format({
    '邮箱': 'email'
})

# 生成验证报告
report = validator.generate_validation_report('validation_report.txt')
```

### 6. FileHandler - 统一文件处理器
提供统一的文件格式检测、读取和写入功能，支持Excel和CSV格式。

**主要功能：**
- 自动检测文件格式
- 统一的数据读取接口
- 统一的数据写入接口
- 获取文件信息
- 支持上下文管理器

**使用示例：**
```python
from tools import FileHandler, detect_file_format, read_file, write_file

# 使用FileHandler类
with FileHandler('data.csv') as handler:
    print(f"文件格式: {handler.get_format().value}")
    print(f"是否为CSV: {handler.is_csv()}")
    
    # 读取数据
    df = handler.read_data()
    
    # 获取文件信息
    info = handler.get_file_info()
    print(f"文件大小: {info['file_size']} 字节")

# 使用便捷函数
format_type = detect_file_format('data.xlsx')
print(f"文件格式: {format_type.value}")

# 直接读取文件
df = read_file('data.csv', encoding='utf-8')

# 直接写入文件
write_file('output.csv', df, encoding='utf-8')
```

## 完整使用示例

### Excel文件处理示例
```python
from tools import ExcelReader, ExcelWriter, ExcelProcessor, ExcelFormatter, ExcelValidator
import pandas as pd

# 1. 读取Excel文件
with ExcelReader('input.xlsx') as reader:
    df = reader.read_sheet('Sheet1')

# 2. 处理数据
processor = ExcelProcessor(df)
cleaned_df = processor.clean_data(remove_duplicates=True)
processed_df = processor.filter_data({'价格': '>100'})

# 3. 验证数据
validator = ExcelValidator(processed_df)
is_valid = validator.is_valid()
if not is_valid:
    report = validator.generate_validation_report('validation_report.txt')

# 4. 写入处理后的数据
with ExcelWriter('output.xlsx') as writer:
    writer.write_dataframe(processed_df, sheet_name='处理后的数据')
    writer.save()

# 5. 格式化输出文件
with ExcelFormatter('output.xlsx') as formatter:
    formatter.format_header('处理后的数据', 'A1:Z1')
    formatter.auto_adjust_column_width('处理后的数据')
    formatter.save('final_output.xlsx')
```

### CSV文件处理示例
```python
from tools import ExcelReader, ExcelWriter, ExcelProcessor, ExcelValidator
import pandas as pd

# 1. 读取CSV文件
with ExcelReader('input.csv') as reader:
    print(f"文件格式: {'CSV' if reader.is_csv else 'Excel'}")
    df = reader.read_sheet(encoding='utf-8', delimiter=',')

# 2. 处理数据
processor = ExcelProcessor(df)
cleaned_df = processor.clean_data(remove_duplicates=True)
processed_df = processor.filter_data({'价格': '>100'})

# 3. 验证数据
validator = ExcelValidator(processed_df)
is_valid = validator.is_valid()
if not is_valid:
    report = validator.generate_validation_report('validation_report.txt')

# 4. 写入处理后的数据为CSV
with ExcelWriter('output.csv') as writer:
    writer.write_dataframe(processed_df, encoding='utf-8', delimiter=',')
```

### 统一文件处理示例
```python
from tools import FileHandler, detect_file_format, read_file, write_file
import pandas as pd

# 自动处理不同格式的文件
input_files = ['data.xlsx', 'data.csv']

for input_file in input_files:
    # 检测文件格式
    format_type = detect_file_format(input_file)
    print(f"处理文件: {input_file}, 格式: {format_type.value}")
    
    # 读取数据
    df = read_file(input_file)
    
    # 处理数据
    processed_df = df[df['价格'] > 100]
    
    # 写入处理后的数据
    output_file = f"processed_{input_file}"
    write_file(output_file, processed_df)
    print(f"已保存到: {output_file}")
```

## 注意事项

1. **文件路径**：确保文件路径正确，工具类会自动检查文件是否存在。

2. **内存使用**：处理大型文件时注意内存使用，建议分批处理。

3. **数据类型**：在数据类型转换时，确保数据格式正确，否则可能产生错误。

4. **上下文管理器**：建议使用`with`语句来确保文件正确关闭。

5. **错误处理**：所有工具类都包含错误处理，会抛出详细的错误信息。

6. **CSV编码**：处理CSV文件时，注意文件编码格式，默认使用UTF-8。

7. **CSV分隔符**：CSV文件默认使用逗号分隔，可通过参数自定义。

## 支持的文件格式

### Excel格式
- `.xlsx` - Excel 2007及以后版本
- `.xlsm` - 包含宏的Excel文件
- `.xltx` - Excel模板文件

### CSV格式
- `.csv` - 逗号分隔值文件
- 支持自定义分隔符（逗号、分号、制表符等）
- 支持多种编码格式（UTF-8、GBK、GB2312等）

## 依赖包版本

- pandas >= 1.3.0
- openpyxl >= 3.0.0
- numpy >= 1.20.0

## 许可证

本工具包遵循MIT许可证。
