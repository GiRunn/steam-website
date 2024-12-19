import os
import sys
from colorama import Fore, Style
from utils.db_utils import get_db_connection

def initialize_monitoring(self):
    """初始化监控系统"""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        print(f"{Fore.YELLOW}正在初始化监控系统...{Style.RESET_ALL}")
        
        # 读取监控函数定义
        script_dir = os.path.dirname(os.path.abspath(__file__))
        monitor_file = os.path.join(script_dir, 'monitor_functions.sql')
        
        if not os.path.exists(monitor_file):
            print(f"{Fore.RED}错误: 找不到监控函数文件 {monitor_file}{Style.RESET_ALL}")
            sys.exit(1)
            
        with open(monitor_file, 'r', encoding='utf-8') as f:
            monitor_sql = f.read()
            
        # 执行监控函数定义
        cur.execute(monitor_sql)
        conn.commit()
        
        print(f"{Fore.GREEN}监控系统初始化成功{Style.RESET_ALL}")
        
    except Exception as e:
        print(f"{Fore.RED}监控系统初始化失败: {str(e)}{Style.RESET_ALL}")
        sys.exit(1)
    finally:
        if 'cur' in locals() and cur:
            cur.close()
        if 'conn' in locals() and conn and not conn.closed:
            conn.close()