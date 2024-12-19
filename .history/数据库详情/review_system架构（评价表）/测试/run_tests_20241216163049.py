import psycopg2
import os
from datetime import datetime
import time
import json

# 数据库连接配置
conn_params = {
    "dbname": "games",
    "user": "postgres",
    "password": "123qweasdzxc..a",
    "host": "localhost",
    "port": "5432"
}

def execute_sql_file(cur, conn, file_path, category=None):
    """执行单个SQL文件并处理事务"""
    try:
        print(f"\n{'='*80}")
        print(f"执行文件: {os.path.basename(file_path)}")
        print(f"{'='*80}")
        
        with open(file_path, 'r', encoding='utf-8') as f:
            sql = f.read()
            
        # 记录开始状态
        cur.execute("SELECT pg_stat_get_db_xact_commit(pg_backend_pid()), pg_stat_get_db_xact_rollback(pg_backend_pid())")
        start_commits, start_rollbacks = cur.fetchone()
        
        # 记录开始时间和初始统计
        start_time = time.time()
        cur.execute("""
            SELECT 
                pg_size_pretty(pg_database_size(current_database())),
                (SELECT count(*) FROM pg_stat_activity),
                pg_size_pretty(pg_total_relation_size('review_system.reviews_partitioned')),
                (SELECT count(*) FROM review_system.reviews_partitioned)
        """)
        initial_stats = cur.fetchone()
        
        # 执行SQL
        conn.rollback()  # 确保清洁的开始
        cur.execute(sql)
        conn.commit()
        
        # 计算执行时间和影响行数
        execution_time = time.time() - start_time
        affected_rows = cur.rowcount
        
        # 获取执行后的统计
        cur.execute("""
            SELECT 
                pg_size_pretty(pg_database_size(current_database())),
                (SELECT count(*) FROM pg_stat_activity),
                pg_size_pretty(pg_total_relation_size('review_system.reviews_partitioned')),
                (SELECT count(*) FROM review_system.reviews_partitioned)
        """)
        final_stats = cur.fetchone()
        
        # 获取事务统计
        cur.execute("SELECT pg_stat_get_db_xact_commit(pg_backend_pid()), pg_stat_get_db_xact_rollback(pg_backend_pid())")
        end_commits, end_rollbacks = cur.fetchone()
        
        # 打印详细执行报告
        print("\n执行统计:")
        print("-" * 80)
        print(f"执行时间: {execution_time:.3f} 秒")
        print(f"影响行数: {affected_rows}")
        print(f"提交事务: {end_commits - start_commits}")
        print(f"回滚事务: {end_rollbacks - start_rollbacks}")
        print("\n数据库状态变化:")
        print("-" * 80)
        print(f"数据库大小: {initial_stats[0]} -> {final_stats[0]}")
        print(f"活动连接数: {initial_stats[1]} -> {final_stats[1]}")
        print(f"评论表大小: {initial_stats[2]} -> {final_stats[2]}")
        print(f"评论记录数: {initial_stats[3]} -> {final_stats[3]}")
        
        # 如果是测试文件，获取测试特定的统计
        if category and category in ['性能测试', '压力测试', '极限测试']:
            cur.execute("""
                SELECT 
                    test_phase,
                    operations_count,
                    success_count,
                    error_count,
                    cpu_usage,
                    memory_usage,
                    active_connections,
                    error_messages,
                    performance_metrics
                FROM review_system.extreme_test_monitor
                WHERE test_name = %s
                ORDER BY monitor_id DESC
                LIMIT 1
            """, (os.path.basename(file_path),))
            
            test_stats = cur.fetchone()
            if test_stats:
                print("\n测试性能指标:")
                print("-" * 80)
                print(f"测试阶段: {test_stats[0]}")
                print(f"操作总数: {test_stats[1]}")
                print(f"成功操作: {test_stats[2]}")
                print(f"失败操作: {test_stats[3]}")
                print(f"CPU使用率: {test_stats[4]:.2f}%")
                print(f"内存使用: {test_stats[5]:.2f}MB")
                print(f"并发连接: {test_stats[6]}")
                if test_stats[7]:  # 错误消息
                    print("\n错误信息:")
                    for error in test_stats[7]:
                        print(f"- {error}")
                if test_stats[8]:  # 性能指标
                    print("\n性能指标:")
                    for key, value in test_stats[8].items():
                        print(f"- {key}: {value}")
        
        # 记录测试结果
        if category:
            performance_data = {
                'execution_time': execution_time,
                'affected_rows': affected_rows,
                'commits': end_commits - start_commits,
                'rollbacks': end_rollbacks - start_rollbacks,
                'db_size_change': f"{initial_stats[0]} -> {final_stats[0]}",
                'records_change': f"{initial_stats[3]} -> {final_stats[3]}"
            }
            
            cur.execute("""
                SELECT review_system.record_test_result(%s, %s, %s, %s, %s::interval)
            """, (
                os.path.basename(file_path), 
                category, 
                '通过',
                json.dumps(performance_data),
                f'{int(execution_time)} seconds'
            ))
            conn.commit()
        
        print("\n执行状态: 成功")
        print("=" * 80)
        return True
            
    except Exception as e:
        conn.rollback()
        print(f"\n执行失败!")
        print("-" * 80)
        print(f"错误信息: {str(e)}")
        print(f"错误文件: {file_path}")
        print(f"错误位置: {e.__traceback__.tb_lineno}")
        print("=" * 80)
        
        if category:
            try:
                cur.execute("""
                    SELECT review_system.record_test_result(%s, %s, %s, %s, NULL)
                """, (os.path.basename(file_path), category, '失败', str(e)))
                conn.commit()
            except Exception as inner_e:
                print(f"记录测试结果失败: {str(inner_e)}")
        return False

def get_db_connection(max_retries=3, retry_delay=5):
    """获取数据库连接，带重试机制"""
    retry_count = 0
    while retry_count < max_retries:
        try:
            conn = psycopg2.connect(**conn_params)
            return conn
        except psycopg2.OperationalError as e:
            retry_count += 1
            if retry_count == max_retries:
                raise e
            print(f"连接失败，{retry_delay}秒后重试...")
            time.sleep(retry_delay)

def generate_test_report(cur):
    """生成详细的测试报告"""
    print("\n" + "=" * 80)
    print("详细测试报告")
    print("=" * 80)
    
    # 获取测试统计
    cur.execute("""
        SELECT 
            test_category,
            COUNT(*) as total_tests,
            COUNT(*) FILTER (WHERE status = '通过') as passed,
            COUNT(*) FILTER (WHERE status = '失败') as failed,
            AVG(EXTRACT(EPOCH FROM execution_time)) as avg_time
        FROM review_system.test_results
        GROUP BY test_category
        ORDER BY test_category
    """)
    
    stats = cur.fetchall()
    
    print("\n类别统计:")
    print("-" * 80)
    print(f"{'类别':<20} | {'总数':>8} | {'通过':>8} | {'失败':>8} | {'平均耗时(秒)':>12}")
    print("-" * 80)
    
    for stat in stats:
        print(f"{stat[0]:<20} | {stat[1]:>8} | {stat[2]:>8} | {stat[3]:>8} | {stat[4]:>12.2f}")
    
    # 获取失败的测试详情
    cur.execute("""
        SELECT test_name, test_category, error_message, execution_time
        FROM review_system.test_results
        WHERE status = '失败'
        ORDER BY executed_at DESC
    """)
    
    failures = cur.fetchall()
    
    if failures:
        print("\n失败的测试详情:")
        print("-" * 80)
        for failure in failures:
            print(f"测试名称: {failure[0]}")
            print(f"测试类别: {failure[1]}")
            print(f"错误信息: {failure[2]}")
            print(f"执行时间: {failure[3]}")
            print("-" * 80)
    else:
        print("\n没有失败的测试！")

def run_tests():
    try:
        print("正在连接数据库...")
        conn = get_db_connection()
        cur = conn.cursor()
        
        print(f"开始测试 - {datetime.now()}")
        
        script_dir = os.path.dirname(os.path.abspath(__file__))
        
        # 首先执行测试框架脚本
        framework_file = os.path.join(script_dir, "00_测试框架.sql")
        if os.path.exists(framework_file):
            print("\n创建测试框架...")
            execute_sql_file(cur, conn, framework_file)
        
        # 然后执行架构重置
        reset_file = os.path.join(script_dir, "..", "生成review_system架构SQL命令", "drop_review_tables.sql")
        if os.path.exists(reset_file):
            print("\n重置数据库架构...")
            execute_sql_file(cur, conn, reset_file, "架构重置")
        
        # 创建基础架构
        base_files = [
            "create_review_tables.sql",
            "create_partition_maintenance.sql",
            "create_partition_functions.sql",
            "create_triggers.sql",
            "create_indexes.sql",
            "create_initial_partitions.sql"
        ]
        
        print("\n创建基础架构...")
        for base_file in base_files:
            file_path = os.path.join(script_dir, "..", "生成review_system架构SQL命令", base_file)
            if os.path.exists(file_path):
                print(f"执行: {base_file}")
                execute_sql_file(cur, conn, file_path, "基础架构")
        
        # 测试文件列表
        test_files = [
            ("00_测试框架.sql", "框架测试"),
            ("01_基础数据测试.sql", "基础数据测试"),
            ("02_分区测试.sql", "分区测试"),
            ("03_触发器测试.sql", "触发器测试"),
            ("04_性能测试.sql", "性能测试"),
            ("05_压力测试.sql", "压力测试"),
            ("06_边界测试.sql", "边界测试"),
            ("07_性能基准测试.sql", "性能基准测试"),
            ("08_极限测试.sql", "极限测试")
        ]
        
        # 执行测试文件
        for test_file, category in test_files:
            print(f"\n执行测试: {test_file}")
            file_path = os.path.join(script_dir, test_file)
            
            if os.path.exists(file_path):
                if execute_sql_file(cur, conn, file_path, category):
                    print(f"{test_file} 执行成功")
            else:
                print(f"错误: 找不到文件 {file_path}")
        
        # 执行极限测试
        extreme_test_dir = os.path.join(script_dir, "极限测试")
        if os.path.exists(extreme_test_dir):
            print("\n执行极限测试...")
            extreme_test_files = [
                ("01_安全测试.sql", "安全测试"),
                ("02_容量测试.sql", "容量测试"),
                ("03_特殊情况测试.sql", "特殊情况测试"),
                ("04_并发测试.sql", "并发测试"),
                ("05_故障恢复测试.sql", "故障恢复测试")
            ]
            
            for test_file, category in extreme_test_files:
                file_path = os.path.join(extreme_test_dir, test_file)
                if os.path.exists(file_path):
                    print(f"\n执行: {test_file}")
                    execute_sql_file(cur, conn, file_path, f"极限测试-{category}")
        
        # 获取测试报告
        try:
            # 确保所有测试完成后再生成报告
            conn.commit()
            
            # 生成报告
            generate_test_report(cur)
            
        except Exception as e:
            print(f"获取测试报告时出错: {str(e)}")
            
    except Exception as e:
        print(f"发生错误: {str(e)}")
    finally:
        if cur:
            cur.close()
        if conn and not conn.closed:
            conn.close()
            print("\n数据库连接已关闭")

if __name__ == "__main__":
    run_tests()