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
        monitor_thread.daemon = True
        monitor_thread.start()

        try:
            # 使用curses运行
            curses.wrapper(self.curses_main)
        except Exception as e:
            logging.error(f"监控系统错误: {e}")
        finally:
            self.running = False
            monitor_thread.join()

    def curses_main(self, stdscr):
        """Curses主方法"""
        # 设置输入线程
        input_thread = threading.Thread(target=self.input_thread, args=(stdscr,))
        input_thread.daemon = True
        input_thread.start()

        # 渲染循环
        while self.running:
            self.render_screen(stdscr)
            time.sleep(0.5)  # 控制刷新频率

if __name__ == "__main__":
    monitor = DatabaseMonitor()
    monitor.run()