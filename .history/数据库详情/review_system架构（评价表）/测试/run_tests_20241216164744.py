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

def execute_sql_file(cur, conn, file_path, category=None, is_init=False, skip_stats=False):
    """执行单个SQL文件并处理事务"""
    try:
        print(f"\n{'='*80}")
        print(f"执行文件: {os.path.basename(file_path)}")
        print(f"{'='*80}")
        
        with open(file_path, 'r', encoding='utf-8') as f:
            sql = f.read()
            
        if not skip_stats:
            try:
                # 记录开始状态
                cur.execute("SELECT pg_stat_get_db_xact_commit(pg_backend_pid()), pg_stat_get_db_xact_rollback(pg_backend_pid())")
                start_commits, start_rollbacks = cur.fetchone()
                
                # 记录开始时间和初始统计
                start_time = time.time()
                cur.execute("""
                    SELECT 
                        (SELECT pg_size_pretty(pg_database_size(current_database()))),
                        (SELECT count(*) FROM pg_stat_activity)
                """)
                initial_stats = cur.fetchone()
                
                # 如果review_system模式存在，获取额外统计信息
                cur.execute("SELECT EXISTS(SELECT 1 FROM pg_namespace WHERE nspname = 'review_system')")
                if cur.fetchone()[0]:
                    cur.execute("""
                        SELECT 
                            COALESCE(pg_size_pretty(pg_total_relation_size('review_system.reviews_partitioned')), '0 bytes'),
                            COALESCE((SELECT count(*) FROM review_system.reviews_partitioned), 0)
                    """)
                    extra_stats = cur.fetchone()
                    initial_stats = initial_stats + extra_stats
                else:
                    initial_stats = initial_stats + ('0 bytes', 0)
            except Exception as e:
                print(f"获取初始统计信息失败: {str(e)}")
                initial_stats = None
        else:
            start_time = time.time()
            initial_stats = None
            
        # 分割SQL语句并逐个执行
        statements = sql.split(';')
        for statement in statements:
            statement = statement.strip()
            if statement:
                try:
                    cur.execute(statement)
                except Exception as stmt_error:
                    if not is_init:  # 只在非初始化时显示语句错误
                        print(f"语句执行失败: {stmt_error}")
                    raise
                    
        conn.commit()
        
        # 计算执行时间
        execution_time = time.time() - start_time
        affected_rows = cur.rowcount
        
        if not skip_stats:
            try:
                # 获取执行后的统计
                cur.execute("""
                    SELECT 
                        (SELECT pg_size_pretty(pg_database_size(current_database()))),
                        (SELECT count(*) FROM pg_stat_activity)
                """)
                final_stats = cur.fetchone()
                
                # 如果review_system模式存在，获取额外统计信息
                cur.execute("SELECT EXISTS(SELECT 1 FROM pg_namespace WHERE nspname = 'review_system')")
                if cur.fetchone()[0]:
                    cur.execute("""
                        SELECT 
                            COALESCE(pg_size_pretty(pg_total_relation_size('review_system.reviews_partitioned')), '0 bytes'),
                            COALESCE((SELECT count(*) FROM review_system.reviews_partitioned), 0)
                    """)
                    extra_stats = cur.fetchone()
                    final_stats = final_stats + extra_stats
                else:
                    final_stats = final_stats + ('0 bytes', 0)
                    
                # 获取事务统计
                cur.execute("SELECT pg_stat_get_db_xact_commit(pg_backend_pid()), pg_stat_get_db_xact_rollback(pg_backend_pid())")
                end_commits, end_rollbacks = cur.fetchone()
                
                # 打印详细执行报告
                print("\n执行统计:")
                print("-" * 80)
                print(f"执行时间: {execution_time:.3f} 秒")
                print(f"影响行数: {affected_rows}")
                if initial_stats:
                    print(f"提交事务: {end_commits - start_commits}")
                    print(f"回滚事务: {end_rollbacks - start_rollbacks}")
                    print("\n数据库状态变化:")
                    print("-" * 80)
                    print(f"数据库大小: {initial_stats[0]} -> {final_stats[0]}")
                    print(f"活动连接数: {initial_stats[1]} -> {final_stats[1]}")
                    print(f"评论表大小: {initial_stats[2]} -> {final_stats[2]}")
                    print(f"评论记录数: {initial_stats[3]} -> {final_stats[3]}")
            except Exception as stats_error:
                print(f"获取统计信息失败: {str(stats_error)}")
                print("\n执行统计:")
                print("-" * 80)
                print(f"执行时间: {execution_time:.3f} 秒")
                print(f"影响行数: {affected_rows}")
        
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
        
        if category and not is_init:
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
    
    # 1. 总体统计
    cur.execute("""
        SELECT 
            COUNT(*) as total_tests,
            COUNT(*) FILTER (WHERE status = '通过') as passed,
            COUNT(*) FILTER (WHERE status = '失败') as failed,
            AVG(EXTRACT(EPOCH FROM execution_time)) as avg_time,
            MAX(EXTRACT(EPOCH FROM execution_time)) as max_time,
            MIN(EXTRACT(EPOCH FROM execution_time)) as min_time
        FROM review_system.test_results
    """)
    overall_stats = cur.fetchone()
    
    print("\n1. 总体测试统计")
    print("-" * 80)
    print(f"总测试数: {overall_stats[0]}")
    print(f"通过测试: {overall_stats[1]}")
    print(f"失败测试: {overall_stats[2]}")
    print(f"平均执行时间: {overall_stats[3]:.2f}秒")
    print(f"最长执行时间: {overall_stats[4]:.2f}秒")
    print(f"最短执行时间: {overall_stats[5]:.2f}秒")
    
    # 2. 按类别统计
    cur.execute("""
        SELECT 
            test_category,
            COUNT(*) as total_tests,
            COUNT(*) FILTER (WHERE status = '通过') as passed,
            COUNT(*) FILTER (WHERE status = '失败') as failed,
            AVG(EXTRACT(EPOCH FROM execution_time)) as avg_time,
            SUM(CASE 
                WHEN error_message::json->>'affected_rows' IS NOT NULL 
                THEN (error_message::json->>'affected_rows')::int 
                ELSE 0 
            END) as total_affected_rows
        FROM review_system.test_results
        GROUP BY test_category
        ORDER BY test_category
    """)
    
    category_stats = cur.fetchall()
    
    print("\n2. 测试类别统计")
    print("-" * 80)
    print(f"{'类别':<20} | {'总数':>8} | {'通过':>8} | {'失败':>8} | {'平均耗时':>12} | {'影响行数':>12}")
    print("-" * 80)
    
    for stat in category_stats:
        print(f"{stat[0]:<20} | {stat[1]:>8} | {stat[2]:>8} | {stat[3]:>8} | {stat[4]:>12.2f}s | {stat[5]:>12}")
    
    # 3. 性能测试详细信息
    print("\n3. 性能测试详细信息")
    print("-" * 80)
    cur.execute("""
        SELECT 
            test_name,
            error_message::json as performance_data
        FROM review_system.test_results
        WHERE test_category IN ('性能测试', '压力测试', '极限测试')
        AND status = '通过'
        ORDER BY executed_at DESC
    """)
    
    performance_tests = cur.fetchall()
    for test in performance_tests:
        print(f"\n测试: {test[0]}")
        print("-" * 40)
        for key, value in test[1].items():
            print(f"{key}: {value}")
    
    # 4. 失败测试详情
    cur.execute("""
        SELECT 
            test_name,
            test_category,
            error_message,
            execution_time,
            executed_at
        FROM review_system.test_results
        WHERE status = '失败'
        ORDER BY executed_at DESC
    """)
    
    failures = cur.fetchall()
    
    if failures:
        print("\n4. 失败测试详情")
        print("-" * 80)
        for failure in failures:
            print(f"测试名称: {failure[0]}")
            print(f"测试类别: {failure[1]}")
            print(f"错误信息: {failure[2]}")
            print(f"执行时间: {failure[3]}")
            print(f"执行时间: {failure[4]}")
            print("-" * 40)
    else:
        print("\n4. 失败测试详情")
        print("-" * 80)
        print("没有失败的测试！")

def run_tests():
    try:
        print("正在连接数据库...")
        conn = get_db_connection()
        cur = conn.cursor()
        
        print(f"开始测试 - {datetime.now()}")
        
        script_dir = os.path.dirname(os.path.abspath(__file__))
        
        # 第一阶段：创建模式和基础表
        print("\n第一阶段: 初始化数据库...")
        init_file = os.path.join(script_dir, "..", "生成review_system架构SQL命令", "init_database.sql")
        if os.path.exists(init_file):
            execute_sql_file(cur, conn, init_file, skip_stats=True)
            conn.commit()
        
        # 第二阶段：重置和创建架构
        print("\n第二阶段: 创建测试架构...")
        reset_file = os.path.join(script_dir, "..", "生成review_system架构SQL命令", "drop_review_tables.sql")
        if os.path.exists(reset_file):
            execute_sql_file(cur, conn, reset_file, "架构重置", skip_stats=True)
            conn.commit()
        
        # 创建基础架构
        base_files = [
            "create_review_tables.sql",
            "create_partition_maintenance.sql",
            "create_partition_functions.sql",
            "create_triggers.sql",
            "create_indexes.sql",
            "create_initial_partitions.sql"
        ]
        
        for base_file in base_files:
            file_path = os.path.join(script_dir, "..", "生成review_system架构SQL命令", base_file)
            if os.path.exists(file_path):
                print(f"\n执行: {base_file}")
                execute_sql_file(cur, conn, file_path, "基础架构")
                conn.commit()
        
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