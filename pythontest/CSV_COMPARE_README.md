# CSV数据比较功能使用说明

## 功能概述

CSV数据比较功能可以比较两个CSV文件，识别数据差异并生成详细的Excel报告。主要功能包括：

1. **数据丢失检测**: 识别源表中有但目标表中没有的记录
2. **值差异检测**: 识别两个表中都存在但值不匹配的记录
3. **字段映射**: 支持不同字段名的映射关系
4. **Excel报告**: 生成包含详细比较结果的Excel文件

## API端点

### 1. 显示比较表单
- **URL**: `GET /data/compare`
- **功能**: 显示Web表单界面，方便用户上传文件和设置参数
- **返回**: HTML页面

### 2. 执行数据比较
- **URL**: `POST /data/compare`
- **功能**: 执行CSV数据比较，返回Excel报告
- **参数**:
  - `source_csv`: 源CSV文件
  - `target_csv`: 目标CSV文件
  - `field_mapping`: 字段映射关系 (JSON格式，可选)
  - `key_fields`: 关键字段列表 (JSON格式，必需)

## 使用方法

### 方法1: 使用Web界面

1. 访问 `http://localhost:3000/data/compare`
2. 上传源CSV文件和目标CSV文件
3. 设置字段映射关系（可选）
4. 指定关键字段
5. 点击"开始比较"按钮
6. 下载生成的Excel报告

### 方法2: 使用API调用

```python
import requests

# 准备文件
files = {
    'source_csv': open('source.csv', 'rb'),
    'target_csv': open('target.csv', 'rb')
}

# 设置参数
data = {
    'field_mapping': '{"id": "user_id", "name": "full_name"}',
    'key_fields': '["id"]'
}

# 发送请求
response = requests.post(
    'http://localhost:3000/data/compare',
    files=files,
    data=data
)

# 保存Excel报告
if response.status_code == 200:
    with open('comparison_report.xlsx', 'wb') as f:
        f.write(response.content)
```

### 方法3: 使用测试脚本

```bash
python test_csv_compare.py
```

## 参数说明

### 字段映射 (field_mapping)

字段映射用于处理两个CSV文件字段名不同的情况。

**格式**: JSON对象，键为源字段名，值为目标字段名

**示例**:
```json
{
    "id": "user_id",
    "name": "full_name", 
    "age": "user_age",
    "city": "location",
    "salary": "annual_income"
}
```

**说明**: 
- 如果留空，系统会自动使用相同的字段名进行比较
- 只有映射的字段会进行值比较

### 关键字段 (key_fields)

关键字段用于关联和比较记录。

**格式**: JSON数组，包含字段名列表

**示例**:
```json
["id"]
```
或
```json
["id", "name"]
```

**说明**:
- 用于确定两条记录是否为同一条记录
- 支持单字段或多字段组合作为主键
- 必须存在于两个CSV文件中

## 输出结果

### Excel报告结构

生成的Excel文件包含以下工作表：

#### 1. Data_Loss (数据丢失)
记录源表中有但目标表中没有的数据。

**列说明**:
- `Key_字段名`: 关键字段值
- `Source_字段名`: 源表中的字段值
- `Reason`: 丢失原因

#### 2. Value_Differences (值差异)
记录两个表中都存在但值不匹配的数据。

**列说明**:
- `Key_字段名`: 关键字段值
- `Source_字段名`: 源表中的字段值
- `Target_字段名`: 目标表中的字段值
- `Diff_字段名_Source`: 差异字段的源值
- `Diff_字段名_Target`: 差异字段的目标值
- `Diff_字段名_TargetField`: 差异字段在目标表中的字段名

#### 3. Summary (摘要)
比较结果的统计信息。

**包含信息**:
- 源表总记录数
- 目标表总记录数
- 数据丢失数量
- 值差异数量
- 匹配记录数量
- 字段映射关系
- 关键字段列表

## 示例场景

### 场景1: 用户数据同步验证

**源表 (users_source.csv)**:
```csv
id,name,age,city
1,Alice,30,New York
2,Bob,25,Los Angeles
3,Charlie,35,Chicago
```

**目标表 (users_target.csv)**:
```csv
user_id,full_name,user_age,location
1,Alice,30,New York
2,Bob,25,Los Angeles
4,Diana,28,Boston
```

**字段映射**:
```json
{"id": "user_id", "name": "full_name", "age": "user_age", "city": "location"}
```

**关键字段**:
```json
["id"]
```

**预期结果**:
- **Data_Loss**: Charlie (ID=3) - 源表有但目标表没有
- **Value_Differences**: 无 - 所有共同记录的值都匹配
- **新增记录**: Diana (ID=4) - 目标表有但源表没有

### 场景2: 订单数据一致性检查

**源表 (orders_source.csv)**:
```csv
order_id,customer_id,amount,status
1001,101,150.00,completed
1002,102,200.00,pending
1003,103,175.50,completed
```

**目标表 (orders_target.csv)**:
```csv
order_id,customer_id,total_amount,order_status
1001,101,150.00,completed
1002,102,200.00,shipped
1003,103,175.50,completed
```

**字段映射**:
```json
{"amount": "total_amount", "status": "order_status"}
```

**关键字段**:
```json
["order_id"]
```

**预期结果**:
- **Data_Loss**: 无
- **Value_Differences**: 订单1002的状态不同 (pending vs shipped)

## 注意事项

1. **文件格式**: 只支持CSV格式文件
2. **编码**: 建议使用UTF-8编码
3. **文件大小**: 大文件可能需要较长处理时间
4. **内存使用**: 文件会完全加载到内存中进行处理
5. **字段类型**: 比较时会将所有值转换为字符串进行比较

## 错误处理

系统会返回详细的错误信息，常见错误包括：

- **400**: 请求参数错误（文件缺失、格式错误等）
- **500**: 服务器内部错误（文件处理失败、Excel生成失败等）

## 性能优化建议

1. **文件大小**: 建议单个CSV文件不超过100MB
2. **字段数量**: 建议字段数不超过100个
3. **记录数量**: 建议记录数不超过100万条
4. **关键字段**: 选择唯一性高的字段作为关键字段

## 扩展功能

未来可能添加的功能：

1. **增量比较**: 只比较变更的记录
2. **批量处理**: 支持多个文件同时比较
3. **自定义比较规则**: 支持复杂的比较逻辑
4. **实时监控**: 支持实时数据同步验证
5. **API集成**: 支持直接从数据库或API获取数据 