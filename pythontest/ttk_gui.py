import tkinter as tk
from tkinter import ttk, filedialog, messagebox
import pandas as pd
import json
import os
from pathlib import Path

class CSVCompareGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("CSV数据比较工具")
        self.root.geometry("800x600")
        
        # 设置样式
        self.style = ttk.Style()
        self.style.configure("Title.TLabel", font=("Helvetica", 16, "bold"))
        
        # 创建主框架
        self.main_frame = ttk.Frame(root, padding="10")
        self.main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # 标题
        title = ttk.Label(self.main_frame, text="CSV数据比较工具", style="Title.TLabel")
        title.grid(row=0, column=0, columnspan=2, pady=(0, 20))
        
        # 创建notebook用于标签页
        self.notebook = ttk.Notebook(self.main_frame)
        self.notebook.grid(row=1, column=0, columnspan=2, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # 创建三个标签页
        self.mapping_frame = ttk.Frame(self.notebook, padding="10")
        self.upload_frame = ttk.Frame(self.notebook, padding="10")
        self.result_frame = ttk.Frame(self.notebook, padding="10")
        
        self.notebook.add(self.mapping_frame, text="字段映射")
        self.notebook.add(self.upload_frame, text="文件上传")
        self.notebook.add(self.result_frame, text="比较结果")
        
        # 初始化各个页面
        self.setup_mapping_page()
        self.setup_upload_page()
        self.setup_result_page()
        
        # 数据存储
        self.mapping_data = {"field_mapping": {}, "key_fields": []}
        self.source_file = ""
        self.target_file = ""
        
        # 加载已有的mapping配置
        self.load_mapping()
    
    def setup_mapping_page(self):
        # 字段映射表格
        self.mapping_tree = ttk.Treeview(self.mapping_frame, columns=("source", "target", "desc"), show="headings")
        self.mapping_tree.heading("source", text="数据1")
        self.mapping_tree.heading("target", text="数据2")
        self.mapping_tree.heading("desc", text="描述")
        
        # 设置列宽
        self.mapping_tree.column("source", width=150)
        self.mapping_tree.column("target", width=150)
        self.mapping_tree.column("desc", width=200)
        
        # 添加滚动条
        scrollbar = ttk.Scrollbar(self.mapping_frame, orient="vertical", command=self.mapping_tree.yview)
        self.mapping_tree.configure(yscrollcommand=scrollbar.set)
        
        # 绑定双击事件
        self.mapping_tree.bind('<Double-1>', self.on_double_click)
        
        # 按钮区域
        btn_frame = ttk.Frame(self.mapping_frame)
        ttk.Button(btn_frame, text="添加映射", command=self.add_mapping).pack(side=tk.LEFT, padx=5)
        ttk.Button(btn_frame, text="删除映射", command=self.delete_mapping).pack(side=tk.LEFT, padx=5)
        ttk.Button(btn_frame, text="保存配置", command=self.save_mapping).pack(side=tk.LEFT, padx=5)
        
        # 关键字段区域
        key_frame = ttk.LabelFrame(self.mapping_frame, text="关键字段", padding="5")
        self.key_field_var = tk.StringVar()
        key_entry = ttk.Entry(key_frame, textvariable=self.key_field_var)
        ttk.Button(key_frame, text="添加关键字段", command=self.add_key_field).pack(side=tk.RIGHT, padx=5)
        key_entry.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=5)
        
        # 关键字段列表
        self.key_listbox = tk.Listbox(key_frame, height=4)
        key_scrollbar = ttk.Scrollbar(key_frame, orient="vertical", command=self.key_listbox.yview)
        self.key_listbox.configure(yscrollcommand=key_scrollbar.set)
        
        # 布局
        self.mapping_tree.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        scrollbar.grid(row=0, column=1, sticky=(tk.N, tk.S))
        btn_frame.grid(row=1, column=0, columnspan=2, pady=10)
        key_frame.grid(row=2, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=10)
        self.key_listbox.pack(fill=tk.X, expand=True, pady=5)
        key_scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        # 配置权重
        self.mapping_frame.columnconfigure(0, weight=1)
        self.mapping_frame.rowconfigure(0, weight=1)
    
    def setup_upload_page(self):
        # 文件1选择
        file1_frame = ttk.LabelFrame(self.upload_frame, text="数据文件1", padding="5")
        self.file1_var = tk.StringVar()
        ttk.Entry(file1_frame, textvariable=self.file1_var, state="readonly").pack(side=tk.LEFT, fill=tk.X, expand=True, padx=5)
        ttk.Button(file1_frame, text="选择文件", command=lambda: self.select_file("source")).pack(side=tk.RIGHT)
        
        # 文件2选择
        file2_frame = ttk.LabelFrame(self.upload_frame, text="数据文件2", padding="5")
        self.file2_var = tk.StringVar()
        ttk.Entry(file2_frame, textvariable=self.file2_var, state="readonly").pack(side=tk.LEFT, fill=tk.X, expand=True, padx=5)
        ttk.Button(file2_frame, text="选择文件", command=lambda: self.select_file("target")).pack(side=tk.RIGHT)
        
        # 比较按钮
        compare_btn = ttk.Button(self.upload_frame, text="开始比较", command=self.compare_files)
        
        # 布局
        file1_frame.pack(fill=tk.X, pady=10)
        file2_frame.pack(fill=tk.X, pady=10)
        compare_btn.pack(pady=20)
    
    def setup_result_page(self):
        # 创建结果标签和统计信息区域
        info_frame = ttk.Frame(self.result_frame)
        info_frame.grid(row=0, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=(0, 10))
        
        self.diff_count_label = ttk.Label(info_frame, text="差异统计：")
        self.diff_count_label.pack(side=tk.LEFT, padx=5)
        
        # 图例说明
        legend_frame = ttk.Frame(info_frame)
        legend_frame.pack(side=tk.RIGHT, padx=5)
        
        ttk.Label(legend_frame, text="图例：").pack(side=tk.LEFT, padx=5)
        ttk.Label(legend_frame, text="仅在数据1中", background="#ffcdd2").pack(side=tk.LEFT, padx=5)
        ttk.Label(legend_frame, text="仅在数据2中", background="#c8e6c9").pack(side=tk.LEFT, padx=5)
        ttk.Label(legend_frame, text="数据不一致", background="#fff9c4").pack(side=tk.LEFT, padx=5)
        
        # 结果展示表格
        self.result_tree = ttk.Treeview(self.result_frame, show="headings")
        
        # 设置表格样式
        style = ttk.Style()
        style.configure("Treeview", rowheight=25)
        style.configure("Treeview.Heading", font=("Helvetica", 10, "bold"))
        
        # 添加滚动条
        y_scrollbar = ttk.Scrollbar(self.result_frame, orient="vertical", command=self.result_tree.yview)
        x_scrollbar = ttk.Scrollbar(self.result_frame, orient="horizontal", command=self.result_tree.xview)
        self.result_tree.configure(yscrollcommand=y_scrollbar.set, xscrollcommand=x_scrollbar.set)
        
        # 导出按钮和操作区域
        btn_frame = ttk.Frame(self.result_frame)
        ttk.Button(btn_frame, text="导出Excel", command=self.export_excel).pack(side=tk.LEFT, padx=5)
        ttk.Button(btn_frame, text="复制到剪贴板", command=self.copy_to_clipboard).pack(side=tk.LEFT, padx=5)
        
        # 布局
        self.result_tree.grid(row=1, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        y_scrollbar.grid(row=1, column=1, sticky=(tk.N, tk.S))
        x_scrollbar.grid(row=2, column=0, sticky=(tk.W, tk.E))
        btn_frame.grid(row=3, column=0, columnspan=2, pady=10)
        
        # 配置权重
        self.result_frame.columnconfigure(0, weight=1)
        self.result_frame.rowconfigure(1, weight=1)
        
        # 绑定双击事件以查看详细差异
        self.result_tree.bind("<Double-1>", self.show_diff_detail)
    
    def create_edit_dialog(self, title="添加字段映射", values=None):
        dialog = tk.Toplevel(self.root)
        dialog.title(title)
        dialog.geometry("400x300")  # 增加窗口尺寸
        dialog.transient(self.root)  # 设置为主窗口的临时窗口
        dialog.grab_set()  # 模态窗口
        # dialog.resizable(False, False)  # 禁止调整大小
        
        # 输入框
        source_var = tk.StringVar(value=values[0] if values else "")
        target_var = tk.StringVar(value=values[1] if values else "")
        desc_var = tk.StringVar(value=values[2] if values else "")
        
        # 创建表单框架
        form_frame = ttk.Frame(dialog, padding="10")
        form_frame.pack(fill=tk.BOTH, expand=True)
        
        # 创建样式
        style = ttk.Style()
        style.configure("Field.TLabel", font=("Helvetica", 10))
        style.configure("Field.TEntry", padding=5)
        
        # 数据1字段
        ttk.Label(form_frame, text="数据1字段:", style="Field.TLabel").pack(anchor=tk.W, pady=(0, 5))
        source_entry = ttk.Entry(form_frame, textvariable=source_var, style="Field.TEntry", width=40)
        source_entry.pack(fill=tk.X, pady=(0, 15))
        
        # 数据2字段
        ttk.Label(form_frame, text="数据2字段:", style="Field.TLabel").pack(anchor=tk.W, pady=(0, 5))
        target_entry = ttk.Entry(form_frame, textvariable=target_var, style="Field.TEntry", width=40)
        target_entry.pack(fill=tk.X, pady=(0, 15))
        
        # 描述字段
        ttk.Label(form_frame, text="描述:", style="Field.TLabel").pack(anchor=tk.W, pady=(0, 5))
        desc_entry = ttk.Entry(form_frame, textvariable=desc_var, style="Field.TEntry", width=40)
        desc_entry.pack(fill=tk.X, pady=(0, 15))
        
        result = {"submit": False, "values": None}
        
        def submit():
            source = source_var.get().strip()
            target = target_var.get().strip()
            desc = desc_var.get().strip()
            if source and target:
                result["submit"] = True
                result["values"] = (source, target, desc)
                dialog.destroy()
            else:
                messagebox.showwarning("警告", "数据1字段和数据2字段不能为空！", parent=dialog)
        
        # 按钮区域
        # 按钮样式
        style.configure("Action.TButton", padding=10)
        
        btn_frame = ttk.Frame(form_frame)
        btn_frame.pack(fill=tk.X, pady=(20, 0))
        ttk.Button(btn_frame, text="确定", command=submit, style="Action.TButton", width=15).pack(side=tk.RIGHT, padx=5)
        ttk.Button(btn_frame, text="取消", command=dialog.destroy, style="Action.TButton", width=15).pack(side=tk.RIGHT, padx=5)
        
        # 设置焦点并等待窗口关闭
        source_entry.focus_set()
        dialog.wait_window()
        return result
    
    def add_mapping(self):
        result = self.create_edit_dialog()
        if result["submit"] and result["values"]:
            self.mapping_tree.insert("", tk.END, values=result["values"])
            self.save_mapping()  # 自动保存更改
    
    def edit_mapping(self, item):
        current_values = self.mapping_tree.item(item)["values"]
        result = self.create_edit_dialog("编辑字段映射", current_values)
        if result["submit"] and result["values"]:
            self.mapping_tree.item(item, values=result["values"])
            self.save_mapping()  # 自动保存更改
    
    def on_double_click(self, event):
        item = self.mapping_tree.selection()[0]
        self.edit_mapping(item)
    
    def delete_mapping(self):
        selected = self.mapping_tree.selection()
        if selected:
            if messagebox.askyesno("确认", "确定要删除选中的映射吗？"):
                self.mapping_tree.delete(selected)
                self.save_mapping()  # 自动保存更改
    
    def add_key_field(self):
        field = self.key_field_var.get()
        if field:
            self.key_listbox.insert(tk.END, field)
            self.key_field_var.set("")
    
    def load_mapping(self):
        try:
            if os.path.exists("mapping.csv"):
                df = pd.read_csv("mapping.csv")
                for _, row in df.iterrows():
                    # 使用source1和source2列作为映射源和目标
                    source = row.get("source1", "")
                    target = row.get("source2", "")
                    desc = row.get("desc", "")
                    if source and target:  # 只添加非空的映射
                        self.mapping_tree.insert("", tk.END, values=(source, target, desc))
                
                # 加载关键字段 (is_key为yes的字段)
                key_fields = df[df["is_key"] == "yes"]["source1"].tolist()
                for field in key_fields:
                    if field:  # 只添加非空的关键字段
                        self.key_listbox.insert(tk.END, field)
        except Exception as e:
            messagebox.showerror("错误", f"加载mapping.csv失败: {str(e)}")
            print(f"错误详情: {str(e)}")  # 在控制台打印详细错误信息
    
    def save_mapping(self):
        try:
            # 收集映射数据
            mapping_data = []
            for item in self.mapping_tree.get_children():
                values = self.mapping_tree.item(item)["values"]
                key_fields = list(self.key_listbox.get(0, tk.END))
                mapping_data.append({
                    "source1": values[0],
                    "source2": values[1],
                    "desc": values[2] if len(values) > 2 else "",
                    "is_key": "yes" if values[0] in key_fields else "no"
                })
            
            # 保存到CSV
            mapping_df = pd.DataFrame(mapping_data)
            mapping_df.to_csv("mapping.csv", index=False)
            messagebox.showinfo("成功", "配置已保存到mapping.csv")
        except Exception as e:
            messagebox.showerror("错误", f"保存配置失败: {str(e)}")
    
    def select_file(self, file_type):
        filename = filedialog.askopenfilename(
            title=f"选择{'数据文件1' if file_type == 'source' else '数据文件2'}",
            filetypes=[("CSV files", "*.csv"), ("All files", "*.*")]
        )
        if filename:
            if file_type == "source":
                self.source_file = filename
                self.file1_var.set(filename)
            else:
                self.target_file = filename
                self.file2_var.set(filename)
    
    def compare_files(self):
        if not (self.source_file and self.target_file):
            messagebox.showwarning("警告", "请先选择要比较的文件")
            return
        
        try:
            # 读取CSV文件
            df1 = pd.read_csv(self.source_file)
            df2 = pd.read_csv(self.target_file)
            
            # 获取映射关系
            field_mapping = {}
            non_key_fields = []  # 记录非关键字段
            for item in self.mapping_tree.get_children():
                values = self.mapping_tree.item(item)["values"]
                source_field, target_field = values[0], values[1]
                field_mapping[target_field] = source_field
                non_key_fields.append(source_field)
            
            # 获取关键字段
            key_fields = list(self.key_listbox.get(0, tk.END))
            if not key_fields:
                messagebox.showerror("错误", "请至少设置一个关键字段")
                return
                
            # 从非关键字段中移除关键字段
            non_key_fields = [f for f in non_key_fields if f not in key_fields]
            
            # 重命名df2的列以匹配df1
            df2_renamed = df2.rename(columns=field_mapping)
            
            # 准备结果列
            result_columns = key_fields.copy()
            for field in non_key_fields:
                result_columns.extend([f"{field}_数据1", f"{field}_数据2"])
            
            # 合并数据
            merged = pd.merge(df1, df2_renamed, on=key_fields, how='outer', 
                            suffixes=('_数据1', '_数据2'), indicator=True)
            
            # 清除现有结果
            for col in self.result_tree["columns"]:
                self.result_tree.heading(col, text="")
            
            # 设置新的列
            self.result_tree["columns"] = tuple(result_columns)
            
            # 设置列标题和宽度
            for col in result_columns:
                display_name = col.replace("_数据1", "(数据1)").replace("_数据2", "(数据2)")
                self.result_tree.heading(col, text=display_name)
                self.result_tree.column(col, width=120, anchor="center")
            
            # 显示数据并设置行颜色
            only_in_source = 0
            only_in_target = 0
            diff_values = 0
            
            # 处理每一行数据
            diff_rows = []  # 存储有差异的行数据
            diff_tags = []  # 存储对应的差异标签
            
            for index, row in merged.iterrows():
                merge_status = row["_merge"]
                values = []
                
                # 添加关键字段的值
                for key in key_fields:
                    values.append(str(row[key]))
                
                # 添加非关键字段的比较值
                has_diff = False
                for field in non_key_fields:
                    val1 = row.get(f"{field}_数据1", "")
                    val2 = row.get(f"{field}_数据2", "")
                    values.extend([str(val1), str(val2)])
                    
                    # 检查是否有差异
                    if pd.notna(val1) and pd.notna(val2) and str(val1) != str(val2):
                        has_diff = True
                
                # 只添加有差异的行
                if merge_status == "left_only":  # 仅在数据1中
                    diff_rows.append(values)
                    diff_tags.append("left_only")
                    only_in_source += 1
                elif merge_status == "right_only":  # 仅在数据2中
                    diff_rows.append(values)
                    diff_tags.append("right_only")
                    only_in_target += 1
                elif has_diff:  # 值不一致
                    diff_rows.append(values)
                    diff_tags.append("diff_values")
                    diff_values += 1
            
            # 配置标签样式
            self.result_tree.tag_configure("left_only", background="#ffcdd2")  # 浅红色
            self.result_tree.tag_configure("right_only", background="#c8e6c9")  # 浅绿色
            self.result_tree.tag_configure("diff_values", background="#fff9c4")  # 浅黄色
            
            # 显示差异行
            for values, tag in zip(diff_rows, diff_tags):
                item_id = self.result_tree.insert("", tk.END, values=values)
                self.result_tree.item(item_id, tags=(tag,))
                
            # 保存差异数据供导出使用
            self.diff_data = list(zip(diff_rows, diff_tags))
            
            # 更新统计信息
            total_diff = only_in_source + only_in_target + diff_values
            stats_text = f"差异统计：总差异数 {total_diff} | 仅在数据1中 {only_in_source} | 仅在数据2中 {only_in_target} | 值不一致 {diff_values}"
            self.diff_count_label.config(text=stats_text)
            
            # 切换到结果页面
            self.notebook.select(2)
            
        except Exception as e:
            messagebox.showerror("错误", f"比较文件失败: {str(e)}")
            
    def has_value_differences(self, row, key_fields):
        """检查非关键字段是否有差异"""
        try:
            for col in row.index:
                if col not in key_fields and col != "_merge":
                    x_col = col + "_x" if col + "_x" in row.index else col
                    y_col = col + "_y" if col + "_y" in row.index else col
                    if x_col != y_col and pd.notna(row.get(x_col)) and pd.notna(row.get(y_col)):
                        if str(row.get(x_col)) != str(row.get(y_col)):
                            return True
            return False
        except Exception:
            return False
            
    def copy_to_clipboard(self):
        """将选中的行复制到剪贴板"""
        selected_items = self.result_tree.selection()
        if not selected_items:
            messagebox.showinfo("提示", "请先选择要复制的行")
            return
            
        text = []
        # 添加表头
        headers = [self.result_tree.heading(col)["text"] for col in self.result_tree["columns"]]
        text.append("\t".join(headers))
        
        # 添加选中的行
        for item in selected_items:
            values = self.result_tree.item(item)["values"]
            text.append("\t".join(map(str, values)))
            
        # 复制到剪贴板
        self.root.clipboard_clear()
        self.root.clipboard_append("\n".join(text))
        messagebox.showinfo("成功", "已复制到剪贴板")
            
    def show_diff_detail(self, event):
        """显示行差异详情"""
        item = self.result_tree.identify_row(event.y)
        if not item:
            return
            
        values = self.result_tree.item(item)["values"]
        tags = self.result_tree.item(item)["tags"]
        
        if not tags:
            return
            
        diff_type = {
            "left_only": "此行仅在数据1中存在",
            "right_only": "此行仅在数据2中存在",
            "diff_values": "此行数据不一致"
        }.get(tags[0], "")
        
        if diff_type:
            # 创建详情窗口
            detail = tk.Toplevel(self.root)
            detail.title("差异详情")
            detail.geometry("600x500")
            detail.transient(self.root)
            
            # 创建Frame用于组织内容
            main_frame = ttk.Frame(detail, padding="20")
            main_frame.pack(fill=tk.BOTH, expand=True)
            
            # 显示差异类型
            ttk.Label(main_frame, text=diff_type, font=("Helvetica", 12, "bold")).pack(anchor=tk.W, pady=(0, 15))
            
            # 创建表格显示差异
            tree = ttk.Treeview(main_frame, columns=("字段", "数据1", "数据2", "状态"), show="headings", height=10)
            tree.heading("字段", text="字段")
            tree.heading("数据1", text="数据1值")
            tree.heading("数据2", text="数据2值")
            tree.heading("状态", text="状态")
            
            # 设置列宽
            tree.column("字段", width=100)
            tree.column("数据1", width=150)
            tree.column("数据2", width=150)
            tree.column("状态", width=100)
            
            # 添加滚动条
            scrollbar = ttk.Scrollbar(main_frame, orient="vertical", command=tree.yview)
            tree.configure(yscrollcommand=scrollbar.set)
            
            # 布局
            tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
            scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
            
            # 获取所有字段
            columns = self.result_tree["columns"]
            key_fields = list(self.key_listbox.get(0, tk.END))
            
            # 显示数据
            idx = 0
            # 首先显示关键字段
            for key in key_fields:
                val = values[idx]
                tree.insert("", tk.END, values=(key, val, val, "关键字段"))
                idx += 1
            
            # 然后显示其他字段
            while idx < len(values):
                field_name = columns[idx].replace("_数据1", "")
                if field_name + "_数据2" in columns:
                    val1 = values[idx]
                    val2 = values[idx + 1]
                    status = "不一致" if val1 != val2 and pd.notna(val1) and pd.notna(val2) else "一致"
                    tree.insert("", tk.END, values=(field_name, val1, val2, status),
                              tags=("diff",) if status == "不一致" else ())
                    idx += 2
                else:
                    idx += 1
            
            # 设置不一致行的颜色
            tree.tag_configure("diff", background="#fff9c4")
            
            # 添加关闭按钮
            ttk.Button(main_frame, text="关闭", command=detail.destroy).pack(pady=(15, 0))
    
    def export_excel(self):
        if not hasattr(self, 'diff_data') or not self.diff_data:
            messagebox.showwarning("警告", "没有差异数据可导出")
            return
        
        filename = filedialog.asksaveasfilename(
            defaultextension=".xlsx",
            filetypes=[("Excel files", "*.xlsx"), ("All files", "*.*")]
        )
        
        # 跟踪包含差异的单元格
        diff_cells = []

        if filename:
            try:
                # 创建Excel writer对象
                with pd.ExcelWriter(filename, engine='openpyxl') as writer:
                    # 获取关键字段和列信息
                    key_fields = list(self.key_listbox.get(0, tk.END))
                    columns = self.result_tree["columns"]
                    data = []
                    diff_cells = []  # 存储需要标记的单元格位置
                    
                    # 从保存的差异数据中获取数据
                    for values, tag in self.diff_data:
                        data.append(values)
                        
                        # 检查非关键字段的差异
                        if tag == "diff_values":
                            row_idx = len(data)  # 当前行号（考虑到后面Excel中的标题行，实际行号会+1）
                            idx = len(key_fields)  # 从非关键字段开始检查
                            
                            while idx < len(values):
                                if idx + 1 < len(values):  # 确保有成对的值
                                    val1 = str(values[idx])
                                    val2 = str(values[idx + 1])
                                    if val1 != val2:  # 如果值不同，记录单元格位置
                                        diff_cells.append((row_idx, idx))
                                        diff_cells.append((row_idx, idx + 1))
                                idx += 2
                    
                    # 创建DataFrame
                    df = pd.DataFrame(data, columns=[col.replace("_数据1", "(数据1)").replace("_数据2", "(数据2)") 
                                                   for col in columns])
                    
                    # 写入数据
                    df.to_excel(writer, sheet_name='比较结果', index=False)
                    
                    # 获取工作表对象
                    worksheet = writer.sheets['比较结果']
                    
                    # 从openpyxl.styles导入所需的样式
                    from openpyxl.styles import PatternFill, Font, Alignment, Border, Side

                    # 在写入数据后检查差异单元格
                    for row_idx, (values, tag) in enumerate(self.diff_data, start=2):  # 从第2行开始（跳过标题）
                        if tag == "diff_values":
                            idx = len(key_fields)  # 从非关键字段开始检查
                            while idx < len(values):
                                if idx + 1 < len(values):  # 确保有成对的值
                                    val1 = str(values[idx])
                                    val2 = str(values[idx + 1])
                                    if val1 != val2:  # 如果值不同，记录单元格位置
                                        diff_cells.append((row_idx, idx + 1))
                                        diff_cells.append((row_idx, idx + 2))
                                idx += 2
                    
                    # 定义样式
                    header_fill = PatternFill(start_color="CCCCCC", end_color="CCCCCC", fill_type="solid")
                    red_fill = PatternFill(start_color="FFCDD2", end_color="FFCDD2", fill_type="solid")
                    green_fill = PatternFill(start_color="C8E6C9", end_color="C8E6C9", fill_type="solid")
                    yellow_fill = PatternFill(start_color="FFF9C4", end_color="FFF9C4", fill_type="solid")
                    
                    # 设置列宽
                    for column in worksheet.columns:
                        max_length = 0
                        column = list(column)
                        for cell in column:
                            try:
                                if len(str(cell.value)) > max_length:
                                    max_length = len(str(cell.value))
                            except:
                                pass
                        adjusted_width = (max_length + 2)
                        worksheet.column_dimensions[column[0].column_letter].width = adjusted_width
                    
                    # 设置标题行样式
                    for cell in worksheet[1]:
                        cell.fill = header_fill
                        cell.font = Font(bold=True)
                        cell.alignment = Alignment(horizontal='center', vertical='center')
                    
                    # 设置数据行样式
                    for row_idx, (values, tag) in enumerate(self.diff_data, start=2):  # 从第2行开始（跳过标题）
                        # 设置行基本样式
                        for cell in worksheet[row_idx]:
                            cell.alignment = Alignment(horizontal='center', vertical='center')
                        
                        # 设置整行的基本颜色
                        if tag in ["left_only", "right_only"]:
                            fill = {
                                "left_only": red_fill,
                                "right_only": green_fill
                            }.get(tag)
                            
                            for cell in worksheet[row_idx]:
                                cell.fill = fill
                        
                        # 标记差异值的单元格
                        for cell_idx, cell in enumerate(worksheet[row_idx]):
                            if (row_idx, cell_idx + 1) in diff_cells:  # +1 因为Excel列号从1开始
                                cell.fill = yellow_fill
                    
                    # 添加边框
                    thin_border = Border(
                        left=Side(style='thin'),
                        right=Side(style='thin'),
                        top=Side(style='thin'),
                        bottom=Side(style='thin')
                    )
                    for row in worksheet.iter_rows():
                        for cell in row:
                            cell.border = thin_border
                    
                    # 冻结首行
                    worksheet.freeze_panes = 'A2'
                    
                messagebox.showinfo("成功", f"数据已导出到: {filename}\n\n包含以下特性：\n- 差异行颜色标记\n- 自动调整列宽\n- 居中对齐\n- 冻结标题行\n- 边框美化")
            except Exception as e:
                messagebox.showerror("错误", f"导出失败: {str(e)}")

def main():
    root = tk.Tk()
    app = CSVCompareGUI(root)
    root.mainloop()

if __name__ == "__main__":
    main()
