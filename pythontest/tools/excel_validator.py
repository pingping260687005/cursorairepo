"""
Excel数据验证工具类

提供验证Excel数据的各种功能，包括：
- 数据类型验证
- 数据范围验证
- 数据格式验证
- 数据完整性验证
- 业务规则验证
- 生成验证报告
"""

import pandas as pd
import numpy as np
import re
from typing import Union, List, Dict, Optional, Any, Callable
from datetime import datetime, date
import warnings


class ExcelValidator:
    """Excel数据验证工具类"""
    
    def __init__(self, data: Union[pd.DataFrame, str]):
        """
        初始化ExcelValidator
        
        Args:
            data (pd.DataFrame or str): DataFrame数据或Excel/CSV文件路径
        """
        if isinstance(data, str):
            if data.endswith('.csv'):
                self.df = pd.read_csv(data)
            else:
                self.df = pd.read_excel(data)
        else:
            self.df = data.copy()
        
        self.validation_results = []
        self.errors = []
        self.warnings = []
    
    def validate_data_types(self, column_types: Dict[str, str]) -> Dict[str, List[str]]:
        """
        验证数据类型
        
        Args:
            column_types (Dict[str, str]): 期望的列类型，如{'A': 'int', 'B': 'float', 'C': 'str'}
            
        Returns:
            Dict[str, List[str]]: 验证结果
        """
        results = {}
        
        for column, expected_type in column_types.items():
            if column not in self.df.columns:
                results[column] = [f"列 '{column}' 不存在"]
                continue
            
            errors = []
            actual_type = str(self.df[column].dtype)
            
            # 检查数据类型
            if expected_type == 'int':
                if not pd.api.types.is_integer_dtype(self.df[column]):
                    non_int_count = self.df[column].apply(lambda x: not pd.api.types.is_integer_dtype(type(x)) if pd.notna(x) else False).sum()
                    if non_int_count > 0:
                        errors.append(f"发现 {non_int_count} 个非整数值")
            
            elif expected_type == 'float':
                if not pd.api.types.is_float_dtype(self.df[column]):
                    non_float_count = self.df[column].apply(lambda x: not pd.api.types.is_float_dtype(type(x)) if pd.notna(x) else False).sum()
                    if non_float_count > 0:
                        errors.append(f"发现 {non_float_count} 个非浮点数值")
            
            elif expected_type == 'str':
                if not pd.api.types.is_string_dtype(self.df[column]):
                    non_str_count = self.df[column].apply(lambda x: not isinstance(x, str) if pd.notna(x) else False).sum()
                    if non_str_count > 0:
                        errors.append(f"发现 {non_str_count} 个非字符串值")
            
            elif expected_type == 'datetime':
                if not pd.api.types.is_datetime64_any_dtype(self.df[column]):
                    try:
                        pd.to_datetime(self.df[column], errors='raise')
                    except:
                        errors.append("无法转换为日期时间格式")
            
            elif expected_type == 'date':
                if not pd.api.types.is_datetime64_any_dtype(self.df[column]):
                    try:
                        pd.to_datetime(self.df[column], errors='raise')
                    except:
                        errors.append("无法转换为日期格式")
            
            results[column] = errors
        
        return results
    
    def validate_data_range(self, column_ranges: Dict[str, Dict[str, Any]]) -> Dict[str, List[str]]:
        """
        验证数据范围
        
        Args:
            column_ranges (Dict[str, Dict[str, Any]]): 列范围规则，如{'A': {'min': 0, 'max': 100}}
            
        Returns:
            Dict[str, List[str]]: 验证结果
        """
        results = {}
        
        for column, rules in column_ranges.items():
            if column not in self.df.columns:
                results[column] = [f"列 '{column}' 不存在"]
                continue
            
            errors = []
            
            # 检查最小值
            if 'min' in rules:
                min_value = rules['min']
                below_min = self.df[self.df[column] < min_value]
                if len(below_min) > 0:
                    errors.append(f"发现 {len(below_min)} 个值小于最小值 {min_value}")
            
            # 检查最大值
            if 'max' in rules:
                max_value = rules['max']
                above_max = self.df[self.df[column] > max_value]
                if len(above_max) > 0:
                    errors.append(f"发现 {len(above_max)} 个值大于最大值 {max_value}")
            
            # 检查允许的值
            if 'allowed_values' in rules:
                allowed_values = rules['allowed_values']
                invalid_values = self.df[~self.df[column].isin(allowed_values)]
                if len(invalid_values) > 0:
                    errors.append(f"发现 {len(invalid_values)} 个不在允许值列表中的值")
            
            # 检查不允许的值
            if 'forbidden_values' in rules:
                forbidden_values = rules['forbidden_values']
                forbidden_found = self.df[self.df[column].isin(forbidden_values)]
                if len(forbidden_found) > 0:
                    errors.append(f"发现 {len(forbidden_found)} 个禁止的值")
            
            results[column] = errors
        
        return results
    
    def validate_data_format(self, column_formats: Dict[str, str]) -> Dict[str, List[str]]:
        """
        验证数据格式
        
        Args:
            column_formats (Dict[str, str]): 列格式规则，如{'A': 'email', 'B': 'phone'}
            
        Returns:
            Dict[str, List[str]]: 验证结果
        """
        results = {}
        
        # 预定义格式模式
        format_patterns = {
            'email': r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
            'phone': r'^(\+?86)?1[3-9]\d{9}$',
            'id_card': r'^\d{17}[\dXx]$',
            'postal_code': r'^\d{6}$',
            'url': r'^https?://[^\s/$.?#].[^\s]*$',
            'ip': r'^(\d{1,3}\.){3}\d{1,3}$',
            'date_yyyy_mm_dd': r'^\d{4}-\d{2}-\d{2}$',
            'date_mm_dd_yyyy': r'^\d{2}/\d{2}/\d{4}$',
            'time_hh_mm': r'^\d{2}:\d{2}$',
            'time_hh_mm_ss': r'^\d{2}:\d{2}:\d{2}$'
        }
        
        for column, format_type in column_formats.items():
            if column not in self.df.columns:
                results[column] = [f"列 '{column}' 不存在"]
                continue
            
            errors = []
            
            if format_type in format_patterns:
                pattern = format_patterns[format_type]
                invalid_count = 0
                
                for value in self.df[column]:
                    if pd.notna(value) and not re.match(pattern, str(value)):
                        invalid_count += 1
                
                if invalid_count > 0:
                    errors.append(f"发现 {invalid_count} 个不符合 {format_type} 格式的值")
            
            elif format_type.startswith('regex:'):
                # 自定义正则表达式
                pattern = format_type[6:]  # 移除 'regex:' 前缀
                invalid_count = 0
                
                for value in self.df[column]:
                    if pd.notna(value) and not re.match(pattern, str(value)):
                        invalid_count += 1
                
                if invalid_count > 0:
                    errors.append(f"发现 {invalid_count} 个不符合自定义格式的值")
            
            else:
                errors.append(f"不支持的格式类型: {format_type}")
            
            results[column] = errors
        
        return results
    
    def validate_data_completeness(self, required_columns: List[str], 
                                 allow_empty: bool = False) -> Dict[str, List[str]]:
        """
        验证数据完整性
        
        Args:
            required_columns (List[str]): 必需的列
            allow_empty (bool): 是否允许空值，默认为False
            
        Returns:
            Dict[str, List[str]]: 验证结果
        """
        results = {}
        
        for column in required_columns:
            if column not in self.df.columns:
                results[column] = [f"必需列 '{column}' 不存在"]
                continue
            
            errors = []
            
            # 检查空值
            null_count = self.df[column].isnull().sum()
            if null_count > 0:
                if not allow_empty:
                    errors.append(f"发现 {null_count} 个空值")
                else:
                    self.warnings.append(f"列 '{column}' 有 {null_count} 个空值")
            
            # 检查空字符串
            empty_string_count = (self.df[column] == '').sum()
            if empty_string_count > 0:
                if not allow_empty:
                    errors.append(f"发现 {empty_string_count} 个空字符串")
                else:
                    self.warnings.append(f"列 '{column}' 有 {empty_string_count} 个空字符串")
            
            results[column] = errors
        
        return results
    
    def validate_business_rules(self, rules: Dict[str, Callable]) -> Dict[str, List[str]]:
        """
        验证业务规则
        
        Args:
            rules (Dict[str, Callable]): 业务规则，键为规则名称，值为验证函数
            
        Returns:
            Dict[str, List[str]]: 验证结果
        """
        results = {}
        
        for rule_name, rule_function in rules.items():
            try:
                # 执行验证函数
                violations = rule_function(self.df)
                
                if violations:
                    results[rule_name] = [f"违反规则: {violations}"]
                else:
                    results[rule_name] = []
                    
            except Exception as e:
                results[rule_name] = [f"规则执行失败: {str(e)}"]
        
        return results
    
    def validate_duplicates(self, columns: Union[str, List[str]], 
                          keep: str = 'first') -> Dict[str, List[str]]:
        """
        验证重复数据
        
        Args:
            columns (str or List[str]): 要检查重复的列
            keep (str): 保留方式，'first', 'last', False
            
        Returns:
            Dict[str, List[str]]: 验证结果
        """
        results = {}
        
        if isinstance(columns, str):
            columns = [columns]
        
        for column in columns:
            if column not in self.df.columns:
                results[column] = [f"列 '{column}' 不存在"]
                continue
            
            errors = []
            
            # 检查重复值
            duplicates = self.df.duplicated(subset=[column], keep=keep)
            duplicate_count = duplicates.sum()
            
            if duplicate_count > 0:
                errors.append(f"发现 {duplicate_count} 个重复值")
            
            results[column] = errors
        
        return results
    
    def validate_cross_column_consistency(self, consistency_rules: List[Dict[str, Any]]) -> Dict[str, List[str]]:
        """
        验证跨列一致性
        
        Args:
            consistency_rules (List[Dict[str, Any]]): 一致性规则列表
            
        Returns:
            Dict[str, List[str]]: 验证结果
        """
        results = {}
        
        for i, rule in enumerate(consistency_rules):
            rule_name = rule.get('name', f'规则_{i+1}')
            errors = []
            
            try:
                # 获取规则参数
                columns = rule.get('columns', [])
                condition = rule.get('condition')
                message = rule.get('message', '数据不一致')
                
                if not columns or not condition:
                    errors.append("规则配置不完整")
                else:
                    # 检查列是否存在
                    missing_columns = [col for col in columns if col not in self.df.columns]
                    if missing_columns:
                        errors.append(f"缺少列: {missing_columns}")
                    else:
                        # 执行条件检查
                        if callable(condition):
                            violations = condition(self.df[columns])
                        else:
                            # 简单的表达式检查
                            violations = self.df[columns].eval(condition)
                        
                        if isinstance(violations, pd.Series):
                            violation_count = violations.sum()
                        else:
                            violation_count = sum(violations) if isinstance(violations, (list, tuple)) else 0
                        
                        if violation_count > 0:
                            errors.append(f"{message}: 发现 {violation_count} 个不一致的记录")
                
            except Exception as e:
                errors.append(f"规则执行失败: {str(e)}")
            
            results[rule_name] = errors
        
        return results
    
    def generate_validation_report(self, output_file: Optional[str] = None) -> Dict[str, Any]:
        """
        生成验证报告
        
        Args:
            output_file (str, optional): 输出文件路径
            
        Returns:
            Dict[str, Any]: 验证报告
        """
        report = {
            'summary': {
                'total_rows': len(self.df),
                'total_columns': len(self.df.columns),
                'total_errors': sum(len(errors) for errors in self.validation_results),
                'total_warnings': len(self.warnings)
            },
            'validation_results': self.validation_results,
            'warnings': self.warnings,
            'errors': self.errors
        }
        
        if output_file:
            try:
                with open(output_file, 'w', encoding='utf-8') as f:
                    f.write("Excel数据验证报告\n")
                    f.write("=" * 50 + "\n\n")
                    
                    f.write(f"总行数: {report['summary']['total_rows']}\n")
                    f.write(f"总列数: {report['summary']['total_columns']}\n")
                    f.write(f"总错误数: {report['summary']['total_errors']}\n")
                    f.write(f"总警告数: {report['summary']['total_warnings']}\n\n")
                    
                    if self.validation_results:
                        f.write("验证结果:\n")
                        f.write("-" * 30 + "\n")
                        for result in self.validation_results:
                            f.write(f"{result}\n")
                    
                    if self.warnings:
                        f.write("\n警告:\n")
                        f.write("-" * 30 + "\n")
                        for warning in self.warnings:
                            f.write(f"{warning}\n")
                    
                    if self.errors:
                        f.write("\n错误:\n")
                        f.write("-" * 30 + "\n")
                        for error in self.errors:
                            f.write(f"{error}\n")
                            
            except Exception as e:
                self.errors.append(f"生成报告失败: {str(e)}")
        
        return report
    
    def is_valid(self) -> bool:
        """
        检查数据是否有效
        
        Returns:
            bool: 是否有效
        """
        return len(self.errors) == 0 and all(len(result) == 0 for result in self.validation_results)
    
    def get_invalid_rows(self, column: str) -> pd.DataFrame:
        """
        获取无效数据的行
        
        Args:
            column (str): 列名
            
        Returns:
            pd.DataFrame: 无效数据的行
        """
        if column not in self.df.columns:
            return pd.DataFrame()
        
        # 这里可以根据具体的验证规则来筛选无效行
        # 示例：筛选空值行
        return self.df[self.df[column].isnull()]
