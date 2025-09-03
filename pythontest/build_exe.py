import PyInstaller.__main__
import os
import sys

def build_exe():
    # 获取当前目录
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    # 设置打包参数
    params = [
        'ttk_gui.py',  # 主程序文件
        '--name=CSV数据比较工具',  # 生成的exe名称
        '--windowed',  # 使用GUI模式
        '--noconfirm',  # 覆盖现有文件夹
        '--clean',  # 清理临时文件
        f'--add-data={os.path.join(current_dir, "mapping.csv")};.',  # 添加数据文件
        '--hidden-import=pandas',  # 添加需要的包
        '--hidden-import=openpyxl',
    ]
    
    # 执行打包
    PyInstaller.__main__.run(params)

if __name__ == '__main__':
    build_exe()
