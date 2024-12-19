import psycopg2
import os
from datetime import datetime
import time
import logging

# 配置日志记录
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(f'test_run_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log'),
        logging.StreamHandler()
    ]
)

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
        logging.info(f"\n{'='*20} 开始执行: {os.path.basename(file_path)} {'='*20}")
        logging.info(f"文件路径: {file_path}")
        logging.info(f"测试类别: {category if category else '未分类'}")
        logging.info("-" * 80)
        
        with open(file_path, 'r', encoding='utf-8') as f:
            sql = f.read()
            
            # 开始新事务
            conn.rollback()
            
            # 记录开始时间和内存使用
            start_time = time.time()
            start_memory = psutil.Process().memory_info().rss / 1024 / 1024  # MB
            
            # 执行SQL
            cur.execute(sql)
            conn.commit()
            
            # 计算执行时间和内存使用
            end_time = time.time()
            end_memory = psutil.Process().memory_info().rss / 1024 / 1024  # MB
            execution_time = end_time - start_time
            memory_used = end_memory - start_memory
            
            # 获取执行计划
            if sql.strip().lower().startswith('select'):
                cur.execute(f"EXPLAIN ANALYZE {sql}")
                execution_plan = cur.fetchall()
                logging.info("\n执行计划:")
                for row in execution_plan:
                    logging.info(row[0])
            
            # 记录成功
            if category:
                performance_details = {
                    'execution_time': execution_time,
                    'memory_used': memory_used,
                    'affected_rows': cur.rowcount,
                    'timestamp': datetime.now()
                }
                
                cur.execute("""
                    SELECT review_system.record_test_result(%s, %s, %s, %s, %s::interval)
                """, (os.path.basename(file_path), category, '通过', 
                     f'执行成功\n'
                     f'耗时: {execution_time:.2f}秒\n'
                     f'内存使用: {memory_used:.2f}MB\n'
                     f'影响行数: {cur.rowcount}\n'
                     f'执行时间: {datetime.now()}',
                     f'{int(execution_time)} seconds'))
                conn.commit()
            
            logging.info(f"\n执行结果详情:")
            logging.info(f"状态: 成功")
            logging.info(f"执行时间: {execution_time:.2f}秒")
            logging.info(f"内存使用: {memory_used:.2f}MB")
            logging.info(f"影响的行数: {cur.rowcount}")
            logging.info(f"完成时间: {datetime.now()}")
            
            if cur.statusmessage:
                logging.info(f"数据库状态消息: {cur.statusmessage}")
                
            return True
            
    except Exception as e:
        conn.rollback()
        error_details = {
            'error_type': type(e).__name__,
            'error_message': str(e),
            'line_number': e.__traceback__.tb_lineno,
            'timestamp': datetime.now()
        }
        
        logging.error("\n执行失败详情:")
        logging.error(f"错误类型: {error_details['error_type']}")
        logging.error(f"错误消息: {error_details['error_message']}")
        logging.error(f"失败的SQL文件: {file_path}")
        logging.error(f"错误发生行号: {error_details['line_number']}")
        logging.error(f"失败时间: {error_details['timestamp']}")
        
        # 记录失败
        if category:
            try:
                cur.execute("""
                    SELECT review_system.record_test_result(%s, %s, %s, %s, NULL)
                """, (os.path.basename(file_path), category, '失败', 
                     f"错误类型: {error_details['error_type']}\n"
                     f"错误消息: {error_details['error_message']}\n"
                     f"错误行号: {error_details['line_number']}\n"
                     f"失败时间: {error_details['timestamp']}"))
                conn.commit()
            except Exception as inner_e:
                logging.error(f"记录测试结果失败: {str(inner_e)}")
        return False

def get_db_connection(max_retries=3, retry_delay=5):
    """获取数据库连接，带重试机制"""
    retry_count = 0
    while retry_count < max_retries:
        try:
            logging.info(f"尝试连接数据库 (尝试 {retry_count + 1}/{max_retries})")
            conn = psycopg2.connect(**conn_params)
            logging.info("数据库连接成功!")
            return conn
        except psycopg2.OperationalError as e:
            retry_count += 1
            if retry_count == max_retries:
                logging.error(f"数据库连接失败，已达到最大重试次数: {str(e)}")
                raise e
            logging.warning(f"连接失败，{retry_delay}秒后重试...")
            time.sleep(retry_delay)

def generate_test_report(cur):
    """生成详细的测试报告"""
    logging.info("\n" + "=" * 80)
    logging.info("详细测试报告")
    logging.info("=" * 80)
    
    # 获取测试统计
    cur.execute("""
        SELECT 
            test_category,
            COUNT(*) as total_tests,
            COUNT(*) FILTER (WHERE status = '通过') as passed,
            COUNT(*) FILTER (WHERE status = '失败') as failed,
            AVG(EXTRACT(EPOCH FROM execution_time)) as avg_time,
            MIN(EXTRACT(EPOCH FROM execution_time)) as min_time,
            MAX(EXTRACT(EPOCH FROM execution_time)) as max_time,
            COUNT(DISTINCT test_name) as unique_tests
        FROM review_system.test_results
        GROUP BY test_category
        ORDER BY test_category
    """)
    
    stats = cur.fetchall()
    
    logging.info("\n测试类别统计:")
    logging.info("-" * 120)
    logging.info(f"{'类别':<15} | {'总数':>8} | {'通过':>8} | {'失败':>8} | {'平均耗时':>10} | {'最短耗时':>10} | {'最长耗时':>10} | {'独立测试':>8}")
    logging.info("-" * 120)
    
    total_tests = 0
    total_passed = 0
    total_failed = 0
    
    for stat in stats:
        category, total, passed, failed, avg_time, min_time, max_time, unique = stat
        total_tests += total
        total_passed += passed
        total_failed += failed
        
        logging.info(f"{category:<15} | {total:>8} | {passed:>8} | {failed:>8} | "
                    f"{avg_time:>10.2f}s | {min_time:>10.2f}s | {max_time:>10.2f}s | {unique:>8}")
    
    # 计算总体通过率
    pass_rate = (total_passed / total_tests * 100) if total_tests > 0 else 0
    
    logging.info("-" * 120)
    logging.info(f"总计: {total_tests}个测试, {total_passed}个通过, {total_failed}个失败")
    logging.info(f"整体通过率: {pass_rate:.2f}%")
    
    # 获取失败的测试详情
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
        logging.info("\n失败测试详细信息:")
        logging.info("=" * 120)
        for failure in failures:
            logging.info(f"测试名称: {failure[0]}")
            logging.info(f"测试类别: {failure[1]}")
            logging.info(f"错误信息: {failure[2]}")
            logging.info(f"执行时间: {failure[3]}")
            logging.info(f"失败时间: {failure[4]}")
            logging.info("-" * 120)
    else:
        logging.info("\n恭喜！没有失败的测试！")
    
    # 生成性能分析报告
    logging.info("\n性能分析报告:")
    logging.info("=" * 80)
    cur.execute("""
        SELECT 
            test_category,
            AVG(EXTRACT(EPOCH FROM execution_time)) as avg_time,
            PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM execution_time)) as p95_time
        FROM review_system.test_results
        WHERE status = '通过'
        GROUP BY test_category
        ORDER BY avg_time DESC
    """)
    
    performance_stats = cur.fetchall()
    
    logging.info(f"{'类别':<20} | {'平均耗时':>12} | {'95分位耗时':>12}")
    logging.info("-" * 50)
    for perf in performance_stats:
        logging.info(f"{perf[0]:<20} | {perf[1]:>12.2f}s | {perf[2]:>12.2f}s")

def run_tests():
    try:
        logging.info("正在连接数据库...")
        conn = get_db_connection()
        cur = conn.cursor()
        
        start_time = datetime.now()
        logging.info(f"开始测试 - {start_time}")
        
        script_dir = os.path.dirname(os.path.abspath(__file__))
        
        # 首先执行测试框架脚本
        framework_file = os.path.join(script_dir, "00_测试框架.sql")
        if os.path.exists(framework_file):
            logging.info("\n创建测试框架...")
            execute_sql_file(cur, conn, framework_file)
        
        # 然后执行架构重置
        reset_file = os.path.join(script_dir, "..", "生成review_system架构SQL命令", "drop_review_tables.sql")
        if os.path.exists(reset_file):
            logging.info("\n重置数据库架构...")
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
        
        logging.info("\n创建基础架构...")
        for base_file in base_files:
            file_path = os.path.join(script_dir, "..", "生成review_system架构SQL命令", base_file)
            if os.path.exists(file_path):
                logging.info(f"执行: {base_file}")
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
            logging.info(f"\n{'='*20} 执行测试: {test_file} {'='*20}")
            file_path = os.path.join(script_dir, test_file)
            
            if os.path.exists(file_path):
                if execute_sql_file(cur, conn, file_path, category):
                    logging.info(f"{test_file} 执行成功")
            else:
                logging.warning(f"错误: 找不到文件 {file_path}")
        
        # 执行极限测试
        extreme_test_dir = os.path.join(script_dir, "极限测试")
        if os.path.exists(extreme_test_dir):
            logging.info("\n执行极限测试...")
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