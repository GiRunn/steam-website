import os
import sys
import time
from datetime import datetime
import json
import threading
import queue
import psycopg2
from colorama import init, Fore, Back, Style

# 初始化colorama
init()

# 数据库连接配置
conn_params = {
    "dbname": "games",
    "user": "postgres",
    "password": "123qweasdzxc..a",
    "host": "localhost",
    "port": "5432"
}

class DatabaseMonitor:
    def __init__(self):
        self.running = True
        self.data_queue = queue.Queue()

    def get_metrics(self, cur):
        """获取监控指标"""
        cur.execute("SELECT * FROM review_system.enhanced_monitor_metrics()")
        return cur.fetchall()

    def format_details(self, details_json):
        """格式化详细信息"""
        if not details_json:
            return ""
        details = json.loads(details_json)
        return "\n".join(f"  - {k}: {v}" for k, v in details.items())

    def print_metrics(self, metrics):
        """打印监控指标"""
        last_category = None
        
        for metric in metrics:
            category, name, value, threshold, status, details = metric
            
            if category != last_category:
                print(f"\n{Fore.CYAN}=== {category} ==={Style.RESET_ALL}")
                last_category = category
            
            # 状态颜色
            status_color = Fore.GREEN if status == '正常' else Fore.RED
            
            # 显示主要指标
            print(f"{Fore.WHITE}{name:<30} "
                  f"{value:>10.2f} / {threshold:>10.2f} "
                  f"[{status_color}{status:^6}{Style.RESET_ALL}]")
            
            # 显示详细信息
            if details:
                for detail_line in self.format_details(details).split('\n'):
                    print(f"{Fore.YELLOW}    {detail_line}{Style.RESET_ALL}")

    def data_collector(self):
        """数据收集线程"""
        while self.running:
            try:
                conn = get_db_connection()
                cur = conn.cursor()
                metrics = self.get_metrics(cur)
                self.data_queue.put(('metrics', metrics))
                cur.close()
                conn.close()
                time.sleep(1)
            except Exception as e:
                self.data_queue.put(('error', str(e)))

    def save_snapshot(self):
        """保存监控快照"""
        try:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"db_monitor_snapshot_{timestamp}.txt"
            
            conn = get_db_connection()
            cur = conn.cursor()
            metrics = self.get_metrics(cur)
            
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(f"数据库监控快照 - {datetime.now()}\n")
                f.write("=" * 80 + "\n\n")
                
                last_category = None
                for metric in metrics:
                    category, name, value, threshold, status, details = metric
                    
                    if category != last_category:
                        f.write(f"\n=== {category} ===\n")
                        last_category = category
                    
                    f.write(f"\n{name}:\n")
                    f.write(f"  值: {value:.2f}\n")
                    f.write(f"  阈值: {threshold:.2f}\n")
                    f.write(f"  状态: {status}\n")
                    
                    if details:
                        f.write("  详细信息:\n")
                        for line in self.format_details(details).split('\n'):
                            f.write(f"    {line}\n")
            
            cur.close()
            conn.close()
            print(f"\n{Fore.GREEN}快照已保存到: {filename}{Style.RESET_ALL}")
            
        except Exception as e:
            print(f"\n{Fore.RED}保存快照失败: {str(e)}{Style.RESET_ALL}")

    def run(self):
        """主运行循环"""
        try:
            # 启动数据收集线程
            collector_thread = threading.Thread(target=self.data_collector)
            collector_thread.daemon = True
            collector_thread.start()

            while True:
                try:
                    # 清屏
                    os.system('cls' if os.name == 'nt' else 'clear')
                    
                    # 显示标题
                    print(f"{Fore.CYAN}{'='*100}")
                    print(f" 数据库实时监控 - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} ")
                    print(f"{'='*100}{Style.RESET_ALL}")

                    # 获取并显示数据
                    try:
                        data_type, data = self.data_queue.get_nowait()
                        if data_type == 'metrics':
                            self.print_metrics(data)
                        elif data_type == 'error':
                            print(f"\n{Fore.RED}错误: {data}{Style.RESET_ALL}")
                    except queue.Empty:
                        pass

                    # 显示帮助信息
                    print(f"\n{Fore.CYAN}按 'q' 退出 | 按 's' 保存快照{Style.RESET_ALL}")
                    
                    # 检查用户输入
                    if sys.stdin in select.select([sys.stdin], [], [], 0)[0]:
                        char = sys.stdin.read(1)
                        if char == 'q':
                            break
                        elif char == 's':
                            self.save_snapshot()

                    time.sleep(1)  # 每秒更新一次

                except KeyboardInterrupt:
                    break

        finally:
            self.running = False
            print("\n监控已停止")

def get_db_connection():
    """获取数据库连接"""
    try:
        return psycopg2.connect(**conn_params)
    except Exception as e:
        print(f"{Fore.RED}数据库连接失败: {str(e)}{Style.RESET_ALL}")
        sys.exit(1)

if __name__ == "__main__":
    # 检查并安装必要的包
    try:
        import select
    except ImportError:
        print("正在安装 select...")
        os.system(f"{sys.executable} -m pip install select")
        import select

    try:
        import colorama
    except ImportError:
        print("正在安装 colorama...")
        os.system(f"{sys.executable} -m pip install colorama")
        import colorama

    try:
        import psycopg2
    except ImportError:
        print("正在安装 psycopg2...")
        os.system(f"{sys.executable} -m pip install psycopg2-binary")
        import psycopg2

    monitor = DatabaseMonitor()
    monitor.run() 