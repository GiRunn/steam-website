import os
import sys

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

if __name__ == "__main__":
    initialize_monitoring()
    monitor_loop() 