"""
Excel数据处理工具类

提供处理Excel数据的各种功能，包括：
- 数据清洗和预处理
- 数据转换和计算
- 数据合并和拆分
- 数据筛选和排序
- 统计分析
"""

import pandas as pd
import numpy as np
from typing import Union, List, Dict, Optional, Any, Tuple
import re


class ExcelProcessor:
    """Excel数据处理工具类"""
    
    def __init__(self, data: Union[pd.DataFrame, str]):
        """
        初始化ExcelProcessor
        
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
        
        self.original_df = self.df.copy()
    
    def clean_data(self, 
                   remove_duplicates: bool = True,
                   fill_na_method: str = 'drop',
                   fill_na_value: Any = None,
                   remove_empty_rows: bool = True,
                   remove_empty_cols: bool = True) -> pd.DataFrame:
        """
        清洗数据
        
        Args:
            remove_duplicates (bool): 是否删除重复行，默认为True
            fill_na_method (str): 处理缺失值的方法，'drop', 'fill', 'forward', 'backward'
            fill_na_value (Any): 填充缺失值的值
            remove_empty_rows (bool): 是否删除空行，默认为True
            remove_empty_cols (bool): 是否删除空列，默认为True
            
        Returns:
            pd.DataFrame: 清洗后的数据
        """
        df = self.df.copy()
        
        # 删除重复行
        if remove_duplicates:
            df = df.drop_duplicates()
        
        # 删除空行
        if remove_empty_rows:
            df = df.dropna(how='all')
        
        # 删除空列
        if remove_empty_cols:
            df = df.dropna(axis=1, how='all')
        
        # 处理缺失值
        if fill_na_method == 'drop':
            df = df.dropna()
        elif fill_na_method == 'fill':
            if fill_na_value is not None:
                df = df.fillna(fill_na_value)
        elif fill_na_method == 'forward':
            df = df.fillna(method='ffill')
        elif fill_na_method == 'backward':
            df = df.fillna(method='bfill')
        
        self.df = df
        return df
    
    def convert_data_types(self, column_types: Dict[str, str]) -> pd.DataFrame:
        """
        转换数据类型
        
        Args:
            column_types (Dict[str, str]): 列名和类型的映射，如{'A': 'int64', 'B': 'datetime64'}
            
        Returns:
            pd.DataFrame: 转换后的数据
        """
        df = self.df.copy()
        
        for column, dtype in column_types.items():
            if column in df.columns:
                try:
                    if dtype == 'datetime64':
                        df[column] = pd.to_datetime(df[column])
                    elif dtype == 'numeric':
                        df[column] = pd.to_numeric(df[column], errors='coerce')
                    else:
                        df[column] = df[column].astype(dtype)
                except Exception as e:
                    print(f"转换列 '{column}' 到类型 '{dtype}' 失败: {e}")
        
        self.df = df
        return df
    
    def filter_data(self, conditions: Dict[str, Any]) -> pd.DataFrame:
        """
        根据条件筛选数据
        
        Args:
            conditions (Dict[str, Any]): 筛选条件，如{'A': '>10', 'B': '==value'}
            
        Returns:
            pd.DataFrame: 筛选后的数据
        """
        df = self.df.copy()
        
        for column, condition in conditions.items():
            if column not in df.columns:
                continue
            
            if isinstance(condition, str):
                # 处理字符串条件，如'>10', '==value'
                if condition.startswith('>='):
                    value = condition[2:]
                    df = df[df[column] >= float(value)]
                elif condition.startswith('<='):
                    value = condition[2:]
                    df = df[df[column] <= float(value)]
                elif condition.startswith('>'):
                    value = condition[1:]
                    df = df[df[column] > float(value)]
                elif condition.startswith('<'):
                    value = condition[1:]
                    df = df[df[column] < float(value)]
                elif condition.startswith('=='):
                    value = condition[2:]
                    df = df[df[column] == value]
                elif condition.startswith('!='):
                    value = condition[2:]
                    df = df[df[column] != value]
                elif 'in' in condition:
                    # 处理 'in [value1, value2]' 格式
                    values = eval(condition.split('in')[1].strip())
                    df = df[df[column].isin(values)]
                elif 'contains' in condition:
                    # 处理 'contains value' 格式
                    value = condition.split('contains')[1].strip()
                    df = df[df[column].str.contains(value, na=False)]
            else:
                # 直接值比较
                df = df[df[column] == condition]
        
        self.df = df
        return df
    
    def sort_data(self, by: Union[str, List[str]], 
                 ascending: Union[bool, List[bool]] = True) -> pd.DataFrame:
        """
        排序数据
        
        Args:
            by (str or List[str]): 排序的列名
            ascending (bool or List[bool]): 是否升序，默认为True
            
        Returns:
            pd.DataFrame: 排序后的数据
        """
        df = self.df.copy()
        df = df.sort_values(by=by, ascending=ascending)
        self.df = df
        return df
    
    def group_and_aggregate(self, group_by: Union[str, List[str]], 
                           agg_functions: Dict[str, Union[str, List[str]]]) -> pd.DataFrame:
        """
        分组聚合
        
        Args:
            group_by (str or List[str]): 分组的列名
            agg_functions (Dict[str, Union[str, List[str]]]): 聚合函数，如{'A': 'sum', 'B': ['mean', 'count']}
            
        Returns:
            pd.DataFrame: 聚合后的数据
        """
        df = self.df.copy()
        result = df.groupby(group_by).agg(agg_functions)
        
        # 扁平化列名
        if isinstance(result.columns, pd.MultiIndex):
            result.columns = ['_'.join(col).strip() for col in result.columns.values]
        
        return result
    
    def pivot_table(self, index: Union[str, List[str]], 
                   columns: Union[str, List[str]], 
                   values: Union[str, List[str]], 
                   aggfunc: str = 'sum') -> pd.DataFrame:
        """
        创建透视表
        
        Args:
            index (str or List[str]): 行索引
            columns (str or List[str]): 列索引
            values (str or List[str]): 值列
            aggfunc (str): 聚合函数，默认为'sum'
            
        Returns:
            pd.DataFrame: 透视表
        """
        df = self.df.copy()
        return df.pivot_table(index=index, columns=columns, values=values, aggfunc=aggfunc)
    
    def merge_data(self, other_df: pd.DataFrame, 
                  on: Union[str, List[str]], 
                  how: str = 'inner',
                  suffixes: Tuple[str, str] = ('_x', '_y')) -> pd.DataFrame:
        """
        合并数据
        
        Args:
            other_df (pd.DataFrame): 要合并的另一个DataFrame
            on (str or List[str]): 合并的键
            how (str): 合并方式，'left', 'right', 'outer', 'inner'
            suffixes (Tuple[str, str]): 重复列的后缀
            
        Returns:
            pd.DataFrame: 合并后的数据
        """
        df = self.df.copy()
        result = df.merge(other_df, on=on, how=how, suffixes=suffixes)
        self.df = result
        return result
    
    def split_column(self, column: str, 
                    delimiter: str, 
                    new_columns: List[str]) -> pd.DataFrame:
        """
        拆分列
        
        Args:
            column (str): 要拆分的列名
            delimiter (str): 分隔符
            new_columns (List[str]): 新列名列表
            
        Returns:
            pd.DataFrame: 拆分后的数据
        """
        df = self.df.copy()
        
        if column in df.columns:
            split_data = df[column].str.split(delimiter, expand=True)
            split_data.columns = new_columns[:len(split_data.columns)]
            
            # 插入新列
            for i, new_col in enumerate(split_data.columns):
                df.insert(df.columns.get_loc(column) + i + 1, new_col, split_data[new_col])
        
        self.df = df
        return df
    
    def combine_columns(self, columns: List[str], 
                       new_column: str, 
                       separator: str = ' ') -> pd.DataFrame:
        """
        合并列
        
        Args:
            columns (List[str]): 要合并的列名列表
            new_column (str): 新列名
            separator (str): 分隔符，默认为空格
            
        Returns:
            pd.DataFrame: 合并后的数据
        """
        df = self.df.copy()
        
        # 确保所有列都存在
        existing_columns = [col for col in columns if col in df.columns]
        
        if existing_columns:
            df[new_column] = df[existing_columns].astype(str).agg(separator.join, axis=1)
        
        self.df = df
        return df
    
    def calculate_statistics(self, columns: Optional[List[str]] = None) -> Dict[str, Dict[str, float]]:
        """
        计算统计信息
        
        Args:
            columns (List[str], optional): 要统计的列名，默认为所有数值列
            
        Returns:
            Dict[str, Dict[str, float]]: 统计信息
        """
        df = self.df.copy()
        
        if columns is None:
            # 选择数值列
            numeric_columns = df.select_dtypes(include=[np.number]).columns.tolist()
        else:
            numeric_columns = [col for col in columns if col in df.columns and df[col].dtype in ['int64', 'float64']]
        
        statistics = {}
        
        for column in numeric_columns:
            stats = {
                'count': df[column].count(),
                'mean': df[column].mean(),
                'median': df[column].median(),
                'std': df[column].std(),
                'min': df[column].min(),
                'max': df[column].max(),
                'sum': df[column].sum(),
                'variance': df[column].var()
            }
            statistics[column] = stats
        
        return statistics
    
    def find_outliers(self, column: str, method: str = 'iqr', threshold: float = 1.5) -> pd.DataFrame:
        """
        查找异常值
        
        Args:
            column (str): 列名
            method (str): 方法，'iqr' 或 'zscore'
            threshold (float): 阈值
            
        Returns:
            pd.DataFrame: 包含异常值的数据
        """
        df = self.df.copy()
        
        if column not in df.columns:
            return pd.DataFrame()
        
        if method == 'iqr':
            Q1 = df[column].quantile(0.25)
            Q3 = df[column].quantile(0.75)
            IQR = Q3 - Q1
            lower_bound = Q1 - threshold * IQR
            upper_bound = Q3 + threshold * IQR
            outliers = df[(df[column] < lower_bound) | (df[column] > upper_bound)]
        elif method == 'zscore':
            z_scores = np.abs((df[column] - df[column].mean()) / df[column].std())
            outliers = df[z_scores > threshold]
        else:
            raise ValueError("method 必须是 'iqr' 或 'zscore'")
        
        return outliers
    
    def sample_data(self, n: int, random_state: Optional[int] = None) -> pd.DataFrame:
        """
        随机采样数据
        
        Args:
            n (int): 采样数量
            random_state (int, optional): 随机种子
            
        Returns:
            pd.DataFrame: 采样后的数据
        """
        df = self.df.copy()
        return df.sample(n=n, random_state=random_state)
    
    def reset_data(self) -> pd.DataFrame:
        """
        重置数据到原始状态
        
        Returns:
            pd.DataFrame: 原始数据
        """
        self.df = self.original_df.copy()
        return self.df
    
    def get_data_info(self) -> Dict[str, Any]:
        """
        获取数据信息
        
        Returns:
            Dict[str, Any]: 数据信息
        """
        df = self.df.copy()
        
        info = {
            'shape': df.shape,
            'columns': df.columns.tolist(),
            'dtypes': df.dtypes.to_dict(),
            'memory_usage': df.memory_usage(deep=True).sum(),
            'null_counts': df.isnull().sum().to_dict(),
            'duplicate_rows': df.duplicated().sum()
        }
        
        return info
