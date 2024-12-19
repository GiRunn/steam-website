import os
import sys
import time
from datetime import datetime
import json
import threading
import queue
import psycopg2
from colorama import init, Fore, Back, Style
import msvcrt  # Windows 专用的键盘输入模块
import curses  # 用于固定显示位置
from curses import wrapper
from curses.textpad import Textbox, rectangle

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
        self.screen = None
        self.current_line = 0
        self.buffer_lines = []
        self.refresh_interval = 1
        self.max_lines = 1000  # 缓冲区最大行数
        self.initialize_monitoring()

    def setup_screen(self, stdscr):
        """初始化curses屏幕"""
        self.screen = stdscr
        curses.start_color()
        curses.use_default_colors()
        curses.init_pair(1, curses.COLOR_CYAN, -1)
        curses.init_pair(2, curses.COLOR_GREEN, -1)
        curses.init_pair(3, curses.COLOR_RED, -1)
        curses.init_pair(4, curses.COLOR_YELLOW, -1)
        curses.curs_set(0)  # 隐藏光标
        self.screen.keypad(1)  # 启用键盘特殊键
        self.screen.timeout(100)  # 设置getch超时
        
    def add_line(self, line, color=0):
        """添加一行到缓冲区"""
        self.buffer_lines.append((line, color))
        if len(self.buffer_lines) > self.max_lines:
            self.buffer_lines.pop(0)

    def refresh_display(self):
        """刷新显示"""
        self.screen.clear()
        height, width = self.screen.getmaxyx()
        display_lines = height - 2  # 保留底部状态栏

        # 计算可显示的行范围
        start_line = max(0, min(self.current_line, len(self.buffer_lines) - display_lines))
        end_line = min(start_line + display_lines, len(self.buffer_lines))

        # 显示内容
        for i, (line, color) in enumerate(self.buffer_lines[start_line:end_line]):
            try:
                self.screen.addstr(i, 0, line[:width-1], curses.color_pair(color))
            except curses.error:
                pass

        # 显示状态栏
        status = f" Q:退出 | S:保存快照 | R:调整刷新间隔 | ↑↓:滚动 | PgUp/PgDn:翻页 "
        try:
            self.screen.addstr(height-1, 0, "=" * width, curses.color_pair(1))
            self.screen.addstr(height-1, (width-len(status))//2, status, curses.color_pair(4))
        except curses.error:
            pass

        self.screen.refresh()

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

        # 添加标题
        self.add_line("=" * 100, 1)
        self.add_line(f" 数据库实时监控系统 - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} ", 1)
        self.add_line("=" * 100, 1)
        self.add_line("")

        last_category = None
        for metric in metrics:
            category, name, value, threshold, status, details = metric
            category = self.translate_category(category)
            name = self.translate_metric_name(name)
            
            if category != last_category:
                self.add_line(f"\n【 {category} 】", 1)
                self.add_line("-" * 98, 1)
                last_category = category

            # 状态颜色
            color = 2 if status == '正常' else 3
            
            # 显示主要指标
            self.add_line(f"{name:<40} {value:>10.2f} / {threshold:>10.2f} [{status:^6}]", color)
            
            # 显示详细信息
            if details:
                formatted_details = self.format_details(details)
                for detail_line in formatted_details.split('\n'):
                    self.add_line(f"    {detail_line}", 4)

        self.refresh_display()

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

    def run(self, stdscr):
        """主运行循环"""
        self.setup_screen(stdscr)
        
        # 启动数据收集线程
        collector_thread = threading.Thread(target=self.data_collector)
        collector_thread.daemon = True
        collector_thread.start()

        while True:
            try:
                # 获取并显示数据
                try:
                    data_type, data = self.data_queue.get_nowait()
                    if data_type == 'metrics':
                        self.print_metrics(data)
                    elif data_type == 'error':
                        self.add_line(f"错误: {data}", 3)
                        self.refresh_display()
                except queue.Empty:
                    pass

                # 处理键盘输入
                key = self.screen.getch()
                if key == ord('q'):
                    break
                elif key == ord('s'):
                    self.save_snapshot()
                elif key == ord('r'):
                    self.adjust_refresh_interval()
                elif key == curses.KEY_UP and self.current_line > 0:
                    self.current_line -= 1
                    self.refresh_display()
                elif key == curses.KEY_DOWN:
                    if self.current_line < len(self.buffer_lines) - 1:
                        self.current_line += 1
                        self.refresh_display()
                elif key == curses.KEY_PPAGE:  # Page Up
                    self.current_line = max(0, self.current_line - 10)
                    self.refresh_display()
                elif key == curses.KEY_NPAGE:  # Page Down
                    self.current_line = min(len(self.buffer_lines) - 1, self.current_line + 10)
                    self.refresh_display()

            except KeyboardInterrupt:
                break

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
            'windows-curses': 'windows-curses'  # Windows下需要特殊的curses包
        }

        for module, package in required_packages.items():
            try:
                __import__(module)
            except ImportError:
                print(f"正在安装 {package}...")
                os.system(f"{sys.executable} -m pip install {package}")

        monitor = DatabaseMonitor()
        wrapper(monitor.run)  # 使用curses.wrapper启动程序

    except Exception as e:
        print(f"程序运行错误: {str(e)}")
        input("按任意键退出...") 