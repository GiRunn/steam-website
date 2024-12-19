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
        self.initialize_monitoring()  # 在初始化时就设置监控系统

    def get_metrics(self, cur):
        """获取监控指标"""
        try:
            # 先检查函数是否存在
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
                # 如果函数不存在，尝试初始化
                self.initialize_monitoring()
            
            # 调用监控函数
            cur.execute("SELECT * FROM review_system.enhanced_monitor_metrics()")
            return cur.fetchall()
        except Exception as e:
            print(f"{Fore.RED}获取监控指标失败: {str(e)}{Style.RESET_ALL}")
            return []

    def format_details(self, details_json):
        """格式化详细信息"""
        if not details_json:
            return ""
        
        # 如果已经是字典类型，直接使用
        if isinstance(details_json, dict):
            details = details_json
        else:
            try:
                # 尝试解析JSON字符串
                details = json.loads(details_json)
            except (TypeError, json.JSONDecodeError):
                return "无法解析详细信息"
        
        # 格式化输出
        formatted_lines = []
        for k, v in details.items():
            if isinstance(v, (dict, list)):
                # 对于嵌套的数据结构，进行更好的格式化
                formatted_lines.append(f"{k}:")
                if isinstance(v, dict):
                    for sub_k, sub_v in v.items():
                        formatted_lines.append(f"    {sub_k}: {sub_v}")
                elif isinstance(v, list):
                    for item in v:
                        if isinstance(item, dict):
                            for sub_k, sub_v in item.items():
                                formatted_lines.append(f"    {sub_k}: {sub_v}")
                        else:
                            formatted_lines.append(f"    - {item}")
            else:
                formatted_lines.append(f"{k}: {v}")
        
        return "\n".join(formatted_lines)

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

    def check_keyboard(self):
        """检查键盘输入"""
        if msvcrt.kbhit():
            char = msvcrt.getch().decode('utf-8').lower()
            if char == 'q':
                return 'quit'
            elif char == 's':
                return 'snapshot'
        return None

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
                    os.system('cls')
                    
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
                    cmd = self.check_keyboard()
                    if cmd == 'quit':
                        break
                    elif cmd == 'snapshot':
                        self.save_snapshot()

                    time.sleep(1)  # 每秒更新一次

                except KeyboardInterrupt:
                    break

        finally:
            self.running = False
            print("\n监控已停止")

    def initialize_monitoring(self):
        """初始化监控系统"""
        try:
            conn = get_db_connection()
            cur = conn.cursor()
            
            print(f"{Fore.YELLOW}正在初始化监控系统...{Style.RESET_ALL}")
            
            # 定义要执行的SQL语句列表
            sql_statements = [
                # 创建架构
                """
                CREATE SCHEMA IF NOT EXISTS review_system;
                """,
                
                # 创建表
                """
                CREATE TABLE IF NOT EXISTS review_system.monitoring_history (
                    id SERIAL PRIMARY KEY,
                    metric_name TEXT NOT NULL,
                    metric_value NUMERIC,
                    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );
                """,
                
                """
                CREATE TABLE IF NOT EXISTS review_system.security_events (
                    id SERIAL PRIMARY KEY,
                    event_type TEXT NOT NULL,
                    description TEXT,
                    source_ip TEXT,
                    user_name TEXT,
                    query_text TEXT,
                    severity TEXT,
                    occurred_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );
                """,
                
                """
                CREATE TABLE IF NOT EXISTS review_system.ip_blacklist (
                    ip TEXT PRIMARY KEY,
                    reason TEXT,
                    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );
                """,
                
                """
                CREATE TABLE IF NOT EXISTS review_system.suspicious_patterns (
                    id SERIAL PRIMARY KEY,
                    pattern TEXT NOT NULL,
                    description TEXT,
                    severity TEXT
                );
                """,
                
                # 初始化可疑模式
                """
                INSERT INTO review_system.suspicious_patterns (pattern, description, severity) 
                VALUES
                    ('DELETE FROM .* WHERE', '批量删除操作', 'HIGH'),
                    ('DROP TABLE', '删除表操作', 'HIGH'),
                    ('TRUNCATE TABLE', '清空表操作', 'HIGH'),
                    ('UPDATE .* WHERE', '批量更新操作', 'MEDIUM'),
                    ('SELECT .* FROM .* WHERE.*OR.*=', '可能的SQL注入', 'HIGH'),
                    ('UNION SELECT', '可能的SQL注入', 'HIGH'),
                    ('INTO OUTFILE', '文件操作', 'HIGH'),
                    ('SLEEP\\([0-9]+\\)', '时间延迟攻击', 'HIGH')
                ON CONFLICT DO NOTHING;
                """,
                
                # 创建监控函数
                """
                CREATE OR REPLACE FUNCTION review_system.enhanced_monitor_metrics()
                RETURNS TABLE (
                    category TEXT,
                    metric_name TEXT,
                    current_value NUMERIC,
                    threshold_value NUMERIC,
                    status TEXT,
                    details JSONB
                ) AS $monitor$
                BEGIN
                    -- 基础性能指标
                    RETURN QUERY
                    SELECT 
                        '基础性能'::TEXT,
                        '数据库大小 (MB)'::TEXT,
                        pg_database_size(current_database())::NUMERIC / (1024*1024),
                        10000.0,
                        CASE 
                            WHEN pg_database_size(current_database()) > 10737418240 THEN '警告'
                            ELSE '正常'
                        END,
                        jsonb_build_object(
                            'total_size', pg_size_pretty(pg_database_size(current_database())),
                            'tables_count', (SELECT count(*) FROM pg_tables WHERE schemaname = 'review_system'),
                            'growth_rate', '计算中'
                        );

                    -- 连接状态监控
                    RETURN QUERY
                    SELECT 
                        '连接状态'::TEXT,
                        '活动连接数'::TEXT,
                        (SELECT count(*) FROM pg_stat_activity WHERE state = 'active')::NUMERIC,
                        50.0,
                        CASE 
                            WHEN count(*) > 50 THEN '警告'
                            ELSE '正常'
                        END,
                        jsonb_build_object(
                            'active_connections', (SELECT count(*) FROM pg_stat_activity WHERE state = 'active'),
                            'idle_connections', (SELECT count(*) FROM pg_stat_activity WHERE state = 'idle'),
                            'waiting_connections', (SELECT count(*) FROM pg_stat_activity WHERE wait_event IS NOT NULL)
                        )
                    FROM pg_stat_activity;

                    -- 缓存命中率
                    RETURN QUERY
                    SELECT 
                        '性能指标'::TEXT,
                        '缓存命中率 (%)'::TEXT,
                        CASE 
                            WHEN COALESCE(blks_hit + blks_read, 0) = 0 THEN 100
                            ELSE (blks_hit::NUMERIC / NULLIF(blks_hit + blks_read, 0) * 100)
                        END,
                        90.0,
                        CASE 
                            WHEN (blks_hit::NUMERIC / NULLIF(blks_hit + blks_read, 0) * 100) < 90 THEN '警告'
                            ELSE '正常'
                        END,
                        jsonb_build_object(
                            'blocks_hit', blks_hit,
                            'blocks_read', blks_read,
                            'temp_files', temp_files,
                            'temp_bytes', pg_size_pretty(temp_bytes::bigint)
                        )
                    FROM pg_stat_database
                    WHERE datname = current_database();

                    -- 事务统计
                    RETURN QUERY
                    SELECT 
                        '事务统计'::TEXT,
                        '事务提交率 (%)'::TEXT,
                        CASE 
                            WHEN COALESCE(xact_commit + xact_rollback, 0) = 0 THEN 100
                            ELSE (xact_commit::NUMERIC / NULLIF(xact_commit + xact_rollback, 0) * 100)
                        END,
                        95.0,
                        CASE 
                            WHEN (xact_commit::NUMERIC / NULLIF(xact_commit + xact_rollback, 0) * 100) < 95 THEN '警告'
                            ELSE '正常'
                        END,
                        jsonb_build_object(
                            'commits', xact_commit,
                            'rollbacks', xact_rollback,
                            'deadlocks', deadlocks,
                            'conflicts', conflicts
                        )
                    FROM pg_stat_database
                    WHERE datname = current_database();

                    -- 查询性能监控
                    RETURN QUERY
                    SELECT 
                        '查询性能'::TEXT,
                        '长时间运行查询'::TEXT,
                        COUNT(*)::NUMERIC,
                        5.0,
                        CASE 
                            WHEN COUNT(*) > 5 THEN '警告'
                            ELSE '正常'
                        END,
                        jsonb_build_object(
                            'long_running_queries', (
                                SELECT jsonb_agg(jsonb_build_object(
                                    'pid', pid,
                                    'duration', EXTRACT(EPOCH FROM (now() - query_start)),
                                    'query', query
                                ))
                                FROM pg_stat_activity
                                WHERE state = 'active'
                                AND query_start < now() - interval '5 minutes'
                            )
                        )
                    FROM pg_stat_activity
                    WHERE state = 'active'
                    AND query_start < now() - interval '5 minutes';

                    -- 修改表统计部分
                    RETURN QUERY
                    WITH table_stats AS (
                        SELECT 
                            schemaname,
                            relname,
                            seq_scan,
                            idx_scan,
                            n_tup_ins,
                            n_tup_upd,
                            n_tup_del,
                            n_live_tup,
                            n_dead_tup,
                            last_vacuum,
                            last_analyze,
                            pg_size_pretty(pg_total_relation_size(relid)) as total_size
                        FROM pg_stat_user_tables
                        WHERE schemaname = 'review_system'
                    )
                    SELECT 
                        '表统计'::TEXT,
                        '表活动统计'::TEXT,
                        COALESCE((SELECT COUNT(*) FROM table_stats), 0)::NUMERIC,
                        0.0,
                        '正常'::TEXT,
                        jsonb_build_object(
                            'tables', (
                                SELECT jsonb_agg(jsonb_build_object(
                                    'table_name', relname,
                                    'total_size', total_size,
                                    'live_rows', n_live_tup,
                                    'dead_rows', n_dead_tup,
                                    'inserts', n_tup_ins,
                                    'updates', n_tup_upd,
                                    'deletes', n_tup_del,
                                    'seq_scans', seq_scan,
                                    'index_scans', idx_scan,
                                    'last_vacuum', last_vacuum,
                                    'last_analyze', last_analyze
                                ))
                                FROM table_stats
                            )
                        );

                    -- 添加锁监控
                    RETURN QUERY
                    WITH lock_stats AS (
                        SELECT 
                            locktype,
                            relation::regclass::text as locked_table,
                            mode,
                            granted,
                            pid,
                            (SELECT query FROM pg_stat_activity WHERE pid = l.pid) as query
                        FROM pg_locks l
                        WHERE database = (SELECT oid FROM pg_database WHERE datname = current_database())
                    )
                    SELECT 
                        '锁监控'::TEXT,
                        '锁等待统计'::TEXT,
                        (SELECT COUNT(*) FROM lock_stats WHERE NOT granted)::NUMERIC,
                        5.0,
                        CASE 
                            WHEN COUNT(*) FILTER (WHERE NOT granted) > 5 THEN '警告'
                            ELSE '正常'
                        END,
                        jsonb_build_object(
                            'waiting_locks', (
                                SELECT jsonb_agg(jsonb_build_object(
                                    'table', locked_table,
                                    'lock_type', locktype,
                                    'lock_mode', mode,
                                    'waiting_query', query
                                ))
                                FROM lock_stats
                                WHERE NOT granted
                            ),
                            'active_locks', (
                                SELECT COUNT(*) FROM lock_stats WHERE granted
                            ),
                            'blocked_queries', (
                                SELECT COUNT(DISTINCT pid) 
                                FROM pg_stat_activity 
                                WHERE wait_event_type = 'Lock'
                            )
                        )
                    FROM lock_stats;

                    -- 添加查询统计
                    RETURN QUERY
                    SELECT 
                        '查询统计'::TEXT,
                        '当前查询活动'::TEXT,
                        (SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'active')::NUMERIC,
                        50.0,
                        CASE 
                            WHEN COUNT(*) > 50 THEN '警告'
                            ELSE '正常'
                        END,
                        jsonb_build_object(
                            'active_queries', (
                                SELECT jsonb_agg(jsonb_build_object(
                                    'pid', pid,
                                    'duration', EXTRACT(EPOCH FROM (now() - query_start))::integer,
                                    'state', state,
                                    'query', query
                                ))
                                FROM pg_stat_activity
                                WHERE state = 'active'
                                AND query NOT ILIKE '%pg_stat_activity%'
                                ORDER BY query_start DESC
                                LIMIT 5
                            ),
                            'states', (
                                SELECT jsonb_object_agg(state, count(*))
                                FROM pg_stat_activity
                            ),
                            'longest_transaction', (
                                SELECT EXTRACT(EPOCH FROM MAX(now() - xact_start))::integer
                                FROM pg_stat_activity
                                WHERE xact_start IS NOT NULL
                            )
                        )
                    FROM pg_stat_activity
                    WHERE state IS NOT NULL;

                EXCEPTION WHEN OTHERS THEN
                    RETURN QUERY
                    SELECT 
                        '错误'::TEXT,
                        '监控错误'::TEXT,
                        0::NUMERIC,
                        0::NUMERIC,
                        '错误'::TEXT,
                        jsonb_build_object(
                            'error_message', SQLERRM,
                            'error_detail', SQLSTATE,
                            'error_hint', '请检查监控系统配置'
                        );
                END;
                $monitor$ LANGUAGE plpgsql;
                """
            ]
            
            # 逐个执行SQL语句
            for i, statement in enumerate(sql_statements, 1):
                try:
                    cur.execute(statement)
                    conn.commit()
                    print(f"{Fore.GREEN}成功执行第 {i} 个SQL语句{Style.RESET_ALL}")
                except Exception as e:
                    print(f"{Fore.RED}执行第 {i} 个SQL语句失败: {str(e)}{Style.RESET_ALL}")
                    raise
            
            print(f"{Fore.GREEN}监控系统初始化成功{Style.RESET_ALL}")
            
        except Exception as e:
            print(f"{Fore.RED}监控系统初始化失败: {str(e)}{Style.RESET_ALL}")
            sys.exit(1)
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
    # 检查并安装必要的包
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