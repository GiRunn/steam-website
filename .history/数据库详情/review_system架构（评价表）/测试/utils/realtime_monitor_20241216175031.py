import os
import sys
import curses
import json
from datetime import datetime, timedelta
import threading
import queue

# 检查并安装必要的包
def install_requirements():
    try:
        import colorama
    except ImportError:
        print("正在安装 colorama...")
        os.system(f"{sys.executable} -m pip install colorama")

    try:
        import psycopg2
    except ImportError:
        print("正在安装 psycopg2...")
        os.system(f"{sys.executable} -m pip install psycopg2-binary")

# 安装依赖
install_requirements()

# 现在导入所需的包
import time
from datetime import datetime
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

def get_db_connection():
    """获取数据库连接"""
    try:
        return psycopg2.connect(**conn_params)
    except Exception as e:
        print(f"数据库连接失败: {str(e)}")
        sys.exit(1)

def get_metrics(cur):
    """获取数据库指标"""
    cur.execute("""
        SELECT * FROM review_system.monitor_database_metrics()
    """)
    return cur.fetchall()

def get_active_queries(cur):
    """获取活动查询"""
    cur.execute("""
        SELECT pid, 
               usename, 
               application_name,
               client_addr,
               state,
               query,
               EXTRACT(EPOCH FROM (now() - query_start)) as duration
        FROM pg_stat_activity 
        WHERE state != 'idle'
        AND pid != pg_backend_pid()
        ORDER BY duration DESC
        LIMIT 5
    """)
    return cur.fetchall()

def get_table_stats(cur):
    """获取表统计信息"""
    cur.execute("""
        SELECT relname as table_name,
               n_live_tup as row_count,
               n_dead_tup as dead_rows,
               last_vacuum,
               last_analyze
        FROM pg_stat_user_tables
        WHERE schemaname = 'review_system'
        ORDER BY n_live_tup DESC
        LIMIT 5
    """)
    return cur.fetchall()

def format_duration(seconds):
    """格式化持续时间"""
    if seconds is None:
        return "N/A"
    return f"{int(seconds)}s"

def clear_screen():
    """清屏"""
    os.system('cls' if os.name == 'nt' else 'clear')

def print_header():
    """打印标题"""
    print(Fore.CYAN + "=" * 100)
    print(f"数据库实时监控 - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 100 + Style.RESET_ALL)

def print_metrics(metrics):
    """打印性能指标"""
    print(Fore.GREEN + "\n系统性能指标:")
    print("-" * 100)
    print(f"{'指标名称':<25} | {'当前值':>15} | {'阈值':>15} | {'状态':>10} | {'说明':>20}")
    print("-" * 100)
    
    for metric in metrics:
        status_color = Fore.RED if metric[3] == '警告' else Fore.GREEN
        description = get_metric_description(metric[0], metric[1], metric[2])
        print(f"{metric[0]:<25} | {metric[1]:>15.2f} | {metric[2]:>15.2f} | "
              f"{status_color}{metric[3]:>10}{Style.RESET_ALL} | {description:>20}")

def get_metric_description(name, value, threshold):
    """获取指标说明"""
    if '缓存命中率' in name:
        return '越高越好' if value >= threshold else '需要优化'
    elif '连接数' in name:
        return '正常范围' if value < threshold else '连接过多'
    elif '死锁' in name:
        return '无死锁' if value == 0 else '需要关注'
    elif '全表扫描' in name:
        return '索引良好' if value < threshold else '需要优化索引'
    elif '写入速率' in name:
        return '正常负载' if value < threshold else '写入压力大'
    else:
        return '正常' if value < threshold else '需要关注'

def print_active_queries(queries):
    """打印活动查询"""
    print(Fore.YELLOW + "\n活动查询:")
    print("-" * 100)
    print(f"{'PID':<8} | {'用户':<15} | {'状态':<10} | {'持续时间':>10} | {'查询':<40}")
    print("-" * 100)
    
    for query in queries:
        duration = format_duration(query[6])
        query_text = query[5][:40] + "..." if len(query[5]) > 40 else query[5]
        print(f"{query[0]:<8} | {query[1]:<15} | {query[4]:<10} | {duration:>10} | {query_text:<40}")

def print_table_stats(stats):
    """打印表统计"""
    print(Fore.BLUE + "\n表统计:")
    print("-" * 100)
    print(f"{'表名':<30} | {'行数':>12} | {'死行数':>12} | {'最后VACUUM':>20} | {'最后分析':>20}")
    print("-" * 100)
    
    for stat in stats:
        vacuum_time = stat[3].strftime('%Y-%m-%d %H:%M:%S') if stat[3] else 'Never'
        analyze_time = stat[4].strftime('%Y-%m-%d %H:%M:%S') if stat[4] else 'Never'
        print(f"{stat[0]:<30} | {stat[1]:>12} | {stat[2]:>12} | {vacuum_time:>20} | {analyze_time:>20}")

def monitor_loop(refresh_interval=1):
    """主监控循环"""
    try:
        while True:
            try:
                conn = get_db_connection()
                cur = conn.cursor()
                
                clear_screen()
                print_header()
                
                # 获取并显示各类指标
                metrics = get_metrics(cur)
                print_metrics(metrics)
                
                queries = get_active_queries(cur)
                print_active_queries(queries)
                
                stats = get_table_stats(cur)
                print_table_stats(stats)
                
                print(Fore.CYAN + f"\n实时监控中... (每秒刷新)" + Style.RESET_ALL)
                print(Fore.YELLOW + "按 Ctrl+C 退出" + Style.RESET_ALL)
                
                cur.close()
                conn.close()
                
                time.sleep(refresh_interval)
                
            except psycopg2.Error as e:
                print(Fore.RED + f"数据库错误: {str(e)}" + Style.RESET_ALL)
                time.sleep(refresh_interval)
            except Exception as e:
                print(Fore.RED + f"发生错误: {str(e)}" + Style.RESET_ALL)
                time.sleep(refresh_interval)
            
    except KeyboardInterrupt:
        print("\n监控已停止")
    finally:
        if 'conn' in locals() and not conn.closed:
            conn.close()

def initialize_monitoring():
    """初始化监控系统"""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # 读取并执行设置脚本
        script_dir = os.path.dirname(os.path.abspath(__file__))
        setup_file = os.path.join(script_dir, 'setup_monitoring.sql')
        
        with open(setup_file, 'r', encoding='utf-8') as f:
            setup_sql = f.read()
            cur.execute(setup_sql)
        
        conn.commit()
        print(Fore.GREEN + "监控系统初始化成功" + Style.RESET_ALL)
        
    except Exception as e:
        print(Fore.RED + f"监控系统初始化失败: {str(e)}" + Style.RESET_ALL)
        sys.exit(1)
    finally:
        if cur:
            cur.close()
        if conn and not conn.closed:
            conn.close()

class DatabaseMonitor:
    def __init__(self):
        self.stdscr = curses.initscr()
        self.data_queue = queue.Queue()
        self.running = True
        
        # 初始化curses
        curses.start_color()
        curses.use_default_colors()
        curses.init_pair(1, curses.COLOR_GREEN, -1)
        curses.init_pair(2, curses.COLOR_RED, -1)
        curses.init_pair(3, curses.COLOR_YELLOW, -1)
        curses.init_pair(4, curses.COLOR_CYAN, -1)
        
        self.GREEN = curses.color_pair(1)
        self.RED = curses.color_pair(2)
        self.YELLOW = curses.color_pair(3)
        self.CYAN = curses.color_pair(4)
        
        curses.curs_set(0)  # 隐藏光标
        self.stdscr.nodelay(1)  # 非阻塞模式

    def get_metrics(self, cur):
        cur.execute("SELECT * FROM review_system.enhanced_monitor_metrics()")
        return cur.fetchall()

    def format_details(self, details_json):
        if not details_json:
            return ""
        details = json.loads(details_json)
        return "\n".join(f"  - {k}: {v}" for k, v in details.items())

    def draw_metrics(self, metrics, start_y):
        current_y = start_y
        last_category = None
        
        for metric in metrics:
            category, name, value, threshold, status, details = metric
            
            if category != last_category:
                self.stdscr.addstr(current_y, 2, f"=== {category} ===", self.CYAN)
                current_y += 1
                last_category = category
            
            # 状态颜色
            status_color = self.GREEN if status == '正常' else self.RED
            
            # 显示主要指标
            self.stdscr.addstr(current_y, 4, f"{name:<30}", curses.A_BOLD)
            self.stdscr.addstr(f" {value:>10.2f} / {threshold:>10.2f} ")
            self.stdscr.addstr(f"[{status:^6}]", status_color)
            current_y += 1
            
            # 显示详细信息
            if details:
                for detail_line in self.format_details(details).split('\n'):
                    self.stdscr.addstr(current_y, 6, detail_line, self.YELLOW)
                    current_y += 1
            
            current_y += 1
        
        return current_y

    def data_collector(self):
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

    def run(self):
        try:
            # 启动数据收集线程
            collector_thread = threading.Thread(target=self.data_collector)
            collector_thread.daemon = True
            collector_thread.start()

            while True:
                try:
                    self.stdscr.clear()
                    
                    # 显示标题
                    title = f" 数据库实时监控 - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} "
                    self.stdscr.addstr(0, 0, "=" * curses.COLS)
                    self.stdscr.addstr(1, (curses.COLS - len(title)) // 2, title, curses.A_BOLD)
                    self.stdscr.addstr(2, 0, "=" * curses.COLS)

                    current_y = 3

                    # 获取并显示数据
                    try:
                        data_type, data = self.data_queue.get_nowait()
                        if data_type == 'metrics':
                            current_y = self.draw_metrics(data, current_y)
                        elif data_type == 'error':
                            self.stdscr.addstr(current_y, 2, f"错误: {data}", self.RED)
                            current_y += 1
                    except queue.Empty:
                        pass

                    # 显示帮助信息
                    help_text = " 按 'q' 退出 | 按 'r' 刷新 | 按 's' 保存快照 "
                    self.stdscr.addstr(curses.LINES-1, 0, "=" * curses.COLS)
                    self.stdscr.addstr(curses.LINES-1, (curses.COLS - len(help_text)) // 2, 
                                     help_text, self.CYAN)

                    self.stdscr.refresh()

                    # 检查用户输入
                    c = self.stdscr.getch()
                    if c == ord('q'):
                        break
                    elif c == ord('r'):
                        continue
                    elif c == ord('s'):
                        self.save_snapshot()

                    time.sleep(0.1)  # 降低CPU使用率

                except KeyboardInterrupt:
                    break

        finally:
            self.running = False
            curses.endwin()

    def save_snapshot(self):
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
            
        except Exception as e:
            self.stdscr.addstr(curses.LINES-2, 2, f"保存快照失败: {str(e)}", self.RED)
        else:
            self.stdscr.addstr(curses.LINES-2, 2, f"快照已保存到: {filename}", self.GREEN)

if __name__ == "__main__":
    monitor = DatabaseMonitor()
    monitor.run() 