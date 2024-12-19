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
        with open(file_path, 'r', encoding='utf-8') as f:
            sql = f.read()
            
            # 开始新事务
            conn.rollback()
            
            # 执行SQL
            cur.execute(sql)
            conn.commit()
            
            # 记录成功
            if category:
                cur.execute("""
                    SELECT review_system.record_test_result(%s, %s, %s, NULL, NULL)
                """, (os.path.basename(file_path), category, '通过'))
                conn.commit()
            return True
    except Exception as e:
        conn.rollback()
        # 记录失败
        if category:
            try:
                cur.execute("""
                    SELECT review_system.record_test_result(%s, %s, %s, %s, NULL)
                """, (os.path.basename(file_path), category, '失败', str(e)))
                conn.commit()
            except:
                pass
        print(f"执行错误: {str(e)}")
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

def run_tests():
    conn = None
    cur = None
    
    try:
        print("正在连接数据库...")
        conn = get_db_connection()
        cur = conn.cursor()
        
        print(f"开始测试 - {datetime.now()}")
        
        script_dir = os.path.dirname(os.path.abspath(__file__))
        
        # 首先执行架构重置
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
            ""drop_review_tables.sql
            2. create_review_tables.sql
            3. create_partition_maintenance.sql
            4. create_partition_functions.sql
            5. create_triggers.sql
            6. create_indexes.sql
            7. create_initial_partitions.sql
            8. test_review_system.sql
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
            cur.execute("SELECT * FROM review_system.generate_test_report()")
            results = cur.fetchall()
            
            if not results:
                print("\n没有找到测试结果。")
            else:
                print("\n测试报告:")
                print("类别 | 总测试数 | 通过数 | 失败数 | 通过率 | 平均执行时间")
                print("-" * 70)
                for row in results:
                    print(" | ".join(str(x) for x in row))
                
            # 显示详细的测试结果
            cur.execute("""
                SELECT test_name, test_category, status, error_message, execution_time
                FROM review_system.test_results
                ORDER BY executed_at DESC
            """)
            detailed_results = cur.fetchall()
            
            if detailed_results:
                print("\n详细测试结果:")
                for result in detailed_results:
                    print(f"测试: {result[0]}")
                    print(f"类别: {result[1]}")
                    print(f"状态: {result[2]}")
                    if result[3]:
                        print(f"错误信息: {result[3]}")
                    if result[4]:
                        print(f"执行时间: {result[4]}")
                    print("-" * 50)
                
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