import psycopg2
import os
from datetime import datetime
import time

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
        print(f"\n正在执行: {os.path.basename(file_path)}")
        print("-" * 50)
        
        with open(file_path, 'r', encoding='utf-8') as f:
            sql = f.read()
            
            # 开始新事务
            conn.rollback()
            
            # 记录开始时间
            start_time = time.time()
            
            # 执行SQL
            cur.execute(sql)
            conn.commit()
            
            # 计算执行时间
            execution_time = time.time() - start_time
            
            # 记录成功
            if category:
                cur.execute("""
                    SELECT review_system.record_test_result(%s, %s, %s, %s, %s::interval)
                """, (os.path.basename(file_path), category, '通过', 
                     f'执行成功，耗时: {execution_time:.2f}秒', 
                     f'{int(execution_time)} seconds'))
                conn.commit()
            
            print(f"执行成功！耗时: {execution_time:.2f}秒")
            print(f"影响的行数: {cur.rowcount}")
            return True
            
    except Exception as e:
        conn.rollback()
        print(f"执行失败: {str(e)}")
        print(f"失败的SQL文件: {file_path}")
        print(f"错误位置: {e.__traceback__.tb_lineno}")
        
        # 记录失败
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
                print(f"执行: {sql_file}")
                execute_sql_file(cur, conn, file_path, "架构重置和创建")
        
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