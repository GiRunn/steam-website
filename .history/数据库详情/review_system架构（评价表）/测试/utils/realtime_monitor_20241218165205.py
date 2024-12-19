import os
import sys
import time
import threading
import queue
import psycopg2
import curses
import logging
from datetime import datetime

class DatabaseMonitor:
    def __init__(self, refresh_interval=5, max_log_lines=500):
        # 配置日志
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            filename='database_monitor.log',
            filemode='a'
        )
        
        # 数据库连接参数
        self.conn_params = {
            "dbname": "games",
            "user": "postgres",
            "password": "123qweasdzxc..a",
            "host": "localhost",
            "port": "5432"
        }
        
        # 监控参数
        self.refresh_interval = refresh_interval
        self.max_log_lines = max_log_lines
        
        # 状态队列
        self.status_queue = queue.Queue()
        self.log_queue = queue.Queue()
        
        # 控制标志
        self.running = True
        self.paused = False
        
        # 滚动相关
        self.scroll_position = 0
        self.max_scroll = 0

    def get_database_metrics(self):
        """获取数据库性能指标"""
        try:
            with psycopg2.connect(**self.conn_params) as conn:
                with conn.cursor() as cur:
                    # 性能指标查询
                    cur.execute("""
                    SELECT 
                        (SELECT count(*) FROM pg_stat_activity) as active_connections,
                        (SELECT count(*) FROM pg_stat_activity WHERE state = 'idle') as idle_connections,
                        (SELECT round(100.0 * blks_hit / (blks_hit + blks_read), 2) FROM pg_stat_database WHERE datname = current_database()) as cache_hit_ratio,
                        (SELECT round(avg(total_time / calls), 2) FROM pg_stat_statements) as avg_query_time
                    """)
                    return cur.fetchone()
        except Exception as e:
            logging.error(f"数据库指标获取失败: {e}")
            return None

    def monitor_thread(self):
        """监控线程"""
        while self.running:
            if not self.paused:
                try:
                    metrics = self.get_database_metrics()
                    if metrics:
                        status = {
                            "active_connections": metrics[0],
                            "idle_connections": metrics[1],
                            "cache_hit_ratio": metrics[2],
                            "avg_query_time": metrics[3],
                            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                        }
                        
                        # 将状态放入队列
                        if self.status_queue.qsize() > 10:
                            self.status_queue.get()
                        self.status_queue.put(status)
                        
                        # 记录日志
                        log_entry = f"[{status['timestamp']}] 活跃连接: {status['active_connections']}, 缓存命中率: {status['cache_hit_ratio']}%, 平均查询时间: {status['avg_query_time']}ms"
                        if self.log_queue.qsize() > self.max_log_lines:
                            self.log_queue.get()
                        self.log_queue.put(log_entry)
                    
                except Exception as e:
                    logging.error(f"监控线程错误: {e}")
            
            time.sleep(self.refresh_interval)

    def render_screen(self, stdscr):
        """渲染屏幕"""
        curses.curs_set(0)  # 隐藏光标
        stdscr.clear()
        
        # 获取屏幕尺寸
        height, width = stdscr.getmaxyx()
        
        # 标题
        title = "数据库实时监控系统 (按 'q' 退出, 空格暂停/继续, 上下键滚动)"
        stdscr.addstr(0, 0, title[:width-1], curses.A_REVERSE)
        
        # 状态区域
        status_lines = list(self.status_queue.queue)
        status_start_y = 2
        
        # 渲染状态
        for i, status in enumerate(status_lines[max(0, self.scroll_position):]):
            if status_start_y + i >= height - 5:
                break
            status_line = f"时间: {status['timestamp']} | 活跃连接: {status['active_connections']} | 空闲连接: {status['idle_connections']} | 缓存命中率: {status['cache_hit_ratio']}% | 平均查询时间: {status['avg_query_time']}ms"
            stdscr.addstr(status_start_y + i, 0, status_line[:width-1])
        
        # 日志区域
        log_start_y = height - 5
        stdscr.addstr(log_start_y, 0, "-" * width, curses.A_REVERSE)
        stdscr.addstr(log_start_y + 1, 0, "最近日志:")
        
        log_lines = list(self.log_queue.queue)
        for i, log in enumerate(log_lines[max(0, self.scroll_position):]):
            if log_start_y + 2 + i >= height:
                break
            stdscr.addstr(log_start_y + 2 + i, 0, log[:width-1])
        
        # 状态提示
        status_text = "运行中" if not self.paused else "已暂停"
        stdscr.addstr(height-1, 0, f"状态: {status_text}", curses.A_REVERSE)
        
        stdscr.refresh()

    def input_thread(self, stdscr):
        """处理用户输入"""
        while self.running:
            key = stdscr.getch()
            
            if key == ord('q'):
                self.running = False
                break
            elif key == ord(' '):
                self.paused = not self.paused
            elif key == curses.KEY_UP:
                self.scroll_position = max(0, self.scroll_position - 1)
            elif key == curses.KEY_DOWN:
                self.scroll_position = min(len(list(self.status_queue.queue)) - 1, self.scroll_position + 1)

    def run(self):
        """主运行方法"""
        # 启动监控线程
        monitor_thread = threading.Thread(target=self.monitor_thread)
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
        self.screen = None
        self.initialize_monitoring()
        self.last_metrics = None
        self.refresh_interval = 1  # 刷新间隔(秒)

    def get_metrics(self, cur):
        """获取监控指标"""
        try:
            # 检查函数是否存在
            cur.execute("""
                SELECT EXISTS (
                    SELECT 1 
                    FROM pg_proc p 
                    JOIN pg_namespace n ON p.pronamespace = n.oid 
                    WHERE n.nspname = 'review_system' 
                    AND p.proname = 'enhanced_monitor_metrics'
                )
            """)
            function_exists = cur.fetchone()[0]
            
            if not function_exists:
                self.initialize_monitoring()

            # 获取基础监控指标
            cur.execute("SELECT * FROM review_system.enhanced_monitor_metrics()")
            basic_metrics = cur.fetchall()

            # 获取评论系统详细信息
            cur.execute("""
                SELECT 
                    'review_details' as category,
                    metric_name,
                    metric_value,
                    0 as threshold,
                    'info' as status,
                    details
                FROM (
                    -- 总评论数
                    SELECT 
                        'Total Reviews' as metric_name,
                        COUNT(*) as metric_value,
                        jsonb_build_object(
                            'active_reviews', COUNT(*) FILTER (WHERE review_status = 'active'),
                            'deleted_reviews', COUNT(*) FILTER (WHERE deleted_at IS NOT NULL)
                        ) as details
                    FROM review_system.reviews_partitioned
                    
                    UNION ALL
                    
                    -- 评分分布
                    SELECT 
                        'Rating Distribution' as metric_name,
                        AVG(rating) as metric_value,
                        jsonb_build_object(
                            '5_star', COUNT(*) FILTER (WHERE rating >= 4.5),
                            '4_star', COUNT(*) FILTER (WHERE rating >= 3.5 AND rating < 4.5),
                            '3_star', COUNT(*) FILTER (WHERE rating >= 2.5 AND rating < 3.5),
                            '2_star', COUNT(*) FILTER (WHERE rating >= 1.5 AND rating < 2.5),
                            '1_star', COUNT(*) FILTER (WHERE rating < 1.5)
                        ) as details
                    FROM review_system.reviews_partitioned
                    WHERE review_status = 'active'
                    
                    UNION ALL
                    
                    -- 平台分布
                    SELECT 
                        'Platform Distribution' as metric_name,
                        COUNT(*) as metric_value,
                        jsonb_build_object(
                            'PC', COUNT(*) FILTER (WHERE platform = 'PC'),
                            'PS5', COUNT(*) FILTER (WHERE platform = 'PS5'),
                            'XBOX', COUNT(*) FILTER (WHERE platform = 'XBOX')
                        ) as details
                    FROM review_system.reviews_partitioned
                    WHERE review_status = 'active'
                    
                    UNION ALL
                    
                    -- 语言分布
                    SELECT 
                        'Language Distribution' as metric_name,
                        COUNT(*) as metric_value,
                        jsonb_build_object(
                            'zh-CN', COUNT(*) FILTER (WHERE language = 'zh-CN'),
                            'en-US', COUNT(*) FILTER (WHERE language = 'en-US'),
                            'ja-JP', COUNT(*) FILTER (WHERE language = 'ja-JP'),
                            'others', COUNT(*) FILTER (WHERE language NOT IN ('zh-CN', 'en-US', 'ja-JP'))
                        ) as details
                    FROM review_system.reviews_partitioned
                    WHERE review_status = 'active'
                    
                    UNION ALL
                    
                    -- 回复统计
                    SELECT 
                        'Reply Statistics' as metric_name,
                        COUNT(*) as metric_value,
                        jsonb_build_object(
                            'total_replies', COUNT(*),
                            'active_replies', COUNT(*) FILTER (WHERE reply_status = 'active'),
                            'avg_replies_per_review', (COUNT(*)::float / 
                                NULLIF((SELECT COUNT(*) FROM review_system.reviews_partitioned), 0))::numeric(10,2)
                        ) as details
                    FROM review_system.review_replies_partitioned
                    
                    UNION ALL
                    
                    -- 分区统计
                    SELECT 
                        'Partition Statistics' as metric_name,
                        COUNT(*) as metric_value,
                        jsonb_build_object(
                            'total_partitions', COUNT(*),
                            'size_distribution', jsonb_object_agg(
                                partition_name, 
                                pg_size_pretty(partition_size)
                            )
                        ) as details
                    FROM (
                        SELECT 
                            c.relname as partition_name,
                            pg_total_relation_size(c.oid) as partition_size
                        FROM pg_class c
                        JOIN pg_namespace n ON n.oid = c.relnamespace
                        WHERE n.nspname = 'review_system'
                        AND c.relispartition
                    ) partitions
                    
                    UNION ALL
                    
                    -- 存储统计
                    SELECT 
                        'Storage Statistics' as metric_name,
                        pg_database_size(current_database())::bigint as metric_value,
                        jsonb_build_object(
                            'total_size', pg_size_pretty(pg_database_size(current_database())),
                            'reviews_size', pg_size_pretty(pg_total_relation_size('review_system.reviews_partitioned')),
                            'replies_size', pg_size_pretty(pg_total_relation_size('review_system.review_replies_partitioned')),
                            'summary_size', pg_size_pretty(pg_total_relation_size('review_system.review_summary_partitioned'))
                        ) as details
                ) metrics
            """)
            review_metrics = cur.fetchall()

            return basic_metrics + review_metrics

        except Exception as e:
            print(f"{Fore.RED}获取监控指标失败: {str(e)}{Style.RESET_ALL}")
            return []

    def format_details(self, details):
        """格式化详细信息"""
        if not details:
            return ""
        
        try:
            if isinstance(details, str):
                details = json.loads(details)
            
            # 转换详情键为中文
            translations = {
                'total_size': '总大小',
                'tables_count': '表数量',
                'growth_rate': '增长率',
                'active_connections': '活动连接',
                'idle_connections': '空闲连接',
                'waiting_connections': '等待连接',
                'blocks_hit': '缓存命中',
                'blocks_read': '磁盘读取',
                'temp_files': '临时文件',
                'temp_bytes': '临时空间',
                'commits': '提交数',
                'rollbacks': '回滚数',
                'deadlocks': '死锁数',
                'conflicts': '冲突数',
                'active_reviews': '活动评论',
                'deleted_reviews': '已删除评论',
                '5_star': '五星评价',
                '4_star': '四星评价',
                '3_star': '三星评价',
                '2_star': '二星评价',
                '1_star': '一星评价',
                'PC': 'PC平台',
                'PS5': 'PS5平台',
                'XBOX': 'XBOX平台',
                'zh-CN': '中文',
                'en-US': '英文',
                'ja-JP': '日文',
                'others': '其他语言'
            }
            
            formatted = []
            for key, value in details.items():
                translated_key = translations.get(key, key)
                formatted.append(f"{translated_key}: {value}")
            
            return '\n'.join(formatted)
            
        except Exception as e:
            return f"格式化错误: {str(e)}"

    def print_metrics(self, metrics):
        """打印监控指标"""
        if not metrics:
            return
        
        # 清屏
        os.system('cls' if os.name == 'nt' else 'clear')
        
        # 打印标题
        print(f"\n{Fore.CYAN}{'='*100}")
        print(f" 数据库实时监控系统 - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} ")
        print(f"{'='*100}{Style.RESET_ALL}\n")

        last_category = None
        
        for metric in metrics:
            category, name, value, threshold, status, details = metric
            
            # 转换类别名称为中文
            category = self.translate_category(category)
            name = self.translate_metric_name(name)
            
            if category != last_category:
                print(f"\n{Fore.CYAN}【 {category} 】{Style.RESET_ALL}")
                print(f"{Fore.CYAN}{'-'*98}{Style.RESET_ALL}")
                last_category = category

            # 状态颜色
            status_color = Fore.GREEN if status == '正常' else Fore.RED
            
            # 显示主要指标
            print(f"{Fore.WHITE}{name:<40} "
                  f"{value:>10.2f} / {threshold:>10.2f} "
                  f"[{status_color}{status:^6}{Style.RESET_ALL}]")
            
            # 显示详细信息
            if details:
                formatted_details = self.format_details(details)
                for detail_line in formatted_details.split('\n'):
                    print(f"{Fore.YELLOW}    {detail_line}{Style.RESET_ALL}")

        # 显示帮助信息
        print(f"\n{Fore.CYAN}{'='*100}")
        print(f" 操作说明：Q-退出 | S-保存监控快照 | R-调整刷新间隔")
        print(f"{'='*100}{Style.RESET_ALL}")

    def translate_category(self, category):
        """转换类别为中文"""
        translations = {
            'basic_performance': '基础性能',
            'connection_status': '连接状态',
            'performance_metrics': '性能指标',
            'transaction_stats': '事务统计',
            'query_performance': '查询性能',
            'review_details': '评论详情',
            'storage_stats': '存储统计'
        }
        return translations.get(category, category)

    def translate_metric_name(self, name):
        """转换指标名称为中文"""
        translations = {
            'Database Size (MB)': '数据库大小 (MB)',
            'Active Connections': '活动连接数',
            'Cache Hit Rate (%)': '缓存命中率 (%)',
            'Transaction Commit Rate (%)': '事务提交率 (%)',
            'Long Running Queries': '长时间运行查询',
            'Total Reviews': '总评论数',
            'Rating Distribution': '评分分布',
            'Platform Distribution': '平台分布',
            'Language Distribution': '语言分布',
            'Reply Statistics': '回复统计',
            'Partition Statistics': '分区统计',
            'Storage Statistics': '存储统计'
        }
        return translations.get(name, name)

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

    def check_keyboard(self):
        """检查键盘输入"""
        if msvcrt.kbhit():
            char = msvcrt.getch().decode('utf-8').lower()
            if char == 'q':
                return 'quit'
            elif char == 's':
                return 'snapshot'
            elif char == 'r':
                return 'refresh'
        return None

    def adjust_refresh_interval(self):
        """调整刷新间隔"""
        print(f"\n{Fore.CYAN}当前刷新间隔: {self.refresh_interval}秒")
        print("请输入新的刷新间隔(1-60秒): {Style.RESET_ALL}")
        try:
            new_interval = int(input())
            if 1 <= new_interval <= 60:
                self.refresh_interval = new_interval
                print(f"{Fore.GREEN}刷新间隔已更新为: {new_interval}秒{Style.RESET_ALL}")
            else:
                print(f"{Fore.RED}无效的输入,保持原有间隔{Style.RESET_ALL}")
        except ValueError:
            print(f"{Fore.RED}无效的输入,保持原有间隔{Style.RESET_ALL}")

    def run(self):
        """主运行循���"""
        try:
            # 启动数据收集线程
            collector_thread = threading.Thread(target=self.data_collector)
            collector_thread.daemon = True
            collector_thread.start()

            # 设置控制台属性（仅Windows）
            if os.name == 'nt':
                import ctypes
                kernel32 = ctypes.windll.kernel32
                kernel32.SetConsoleMode(kernel32.GetStdHandle(-11), 7)

            while True:
                try:
                    # 获取并显示数据
                    try:
                        data_type, data = self.data_queue.get_nowait()
                        if data_type == 'metrics':
                            self.print_metrics(data)
                        elif data_type == 'error':
                            print(f"\n{Fore.RED}错误: {data}{Style.RESET_ALL}")
                    except queue.Empty:
                        time.sleep(0.1)  # 减少CPU使用率

                    # 检查用户输入
                    if msvcrt.kbhit():
                        char = msvcrt.getch().decode('utf-8').lower()
                        if char == 'q':
                            break
                        elif char == 's':
                            self.save_snapshot()
                        elif char == 'r':
                            self.adjust_refresh_interval()

                except KeyboardInterrupt:
                    break

        finally:
            self.running = False
            print("\n监控已停止")

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
                time.sleep(self.refresh_interval)
            except Exception as e:
                self.data_queue.put(('error', str(e)))

    def initialize_monitoring(self):
        """初始化监控系统"""
        try:
            conn = get_db_connection()
            cur = conn.cursor()

            # 获取当前文件所在目录
            current_dir = os.path.dirname(os.path.abspath(__file__))
            setup_file = os.path.join(current_dir, 'setup_monitoring.sql')

            if not os.path.exists(setup_file):
                print(f"{Fore.RED}找不到setup_monitoring.sql文件: {setup_file}{Style.RESET_ALL}")
                return False

            # 读取SQL文件内容
            with open(setup_file, 'r', encoding='utf-8') as f:
                sql_content = f.read()

            # 执行SQL语句
            try:
                cur.execute(sql_content)
                conn.commit()
                print(f"{Fore.GREEN}监控系统初始化成功{Style.RESET_ALL}")
                return True
            except Exception as e:
                print(f"{Fore.RED}SQL执行失败: {str(e)}{Style.RESET_ALL}")
                conn.rollback()
                return False

        except Exception as e:
            print(f"{Fore.RED}监控系统初始化失败: {str(e)}{Style.RESET_ALL}")
            return False
        finally:
            if 'cur' in locals() and cur:
                cur.close()
            if 'conn' in locals() and conn and not conn.closed:
                conn.close()

def get_db_connection():
    """获取数据库连接"""
    try:
        return psycopg2.connect(**conn_params)
    except Exception as e:
        print(f"{Fore.RED}数据库连接失败: {str(e)}{Style.RESET_ALL}")
        sys.exit(1)

if __name__ == "__main__":
    try:
        # 检查并安装必要的包
        required_packages = {
            'colorama': 'colorama',
            'psycopg2': 'psycopg2-binary',
            'curses': 'windows-curses'  # Windows下需要特殊的curses包
        }

        for module, package in required_packages.items():
            try:
                __import__(module)
            except ImportError:
                print(f"正在安装 {package}...")
                os.system(f"{sys.executable} -m pip install {package}")
                __import__(module)

        # 设置控制台窗口大小和缓冲区
        if os.name == 'nt':  # Windows系统
            os.system('mode con: cols=120 lines=40')
            os.system('title 数据库监控系统')

        monitor = DatabaseMonitor()
        monitor.run()
    except Exception as e:
        print(f"程序运行错误: {str(e)}")
        input("按任意键退出...") 