import psycopg2
import os
from datetime import datetime

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
                    SELECT review_system.record_test_result($1, $2, $3, NULL, NULL)
                """, (os.path.basename(file_path), category, '通过'))
                conn.commit()
            return True
    except Exception as e:
        conn.rollback()
        # 记录失败
        if category:
            try:
                cur.execute("""
                    SELECT review_system.record_test_result($1, $2, $3, $4, NULL)
                """, (os.path.basename(file_path), category, '失败', str(e)))
                conn.commit()
            except:
                pass
        print(f"执行错误: {str(e)}")
        return False

def run_tests():
    conn = None
    cur = None
    
    # 数据库连接配置
    conn_params = {
        "dbname": "games",
        "user": "postgres",
        "password": "123qweasdzxc..a",
        "host": "localhost",
        "port": "5432"
    }
    
    try:
        print("正在连接数据库...")
        conn = psycopg2.connect(**conn_params)
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
                if execute_sql_file(cur, conn, file_path):
                    print(f"{test_file} 执行成功")
            else:
                print(f"错误: 找不到文件 {file_path}")
        
        # 获取测试报告
        try:
            cur.execute("SELECT * FROM review_system.generate_test_report()")
            results = cur.fetchall()
            
            print("\n测试报告:")
            print("类别 | 总测试数 | 通过数 | 失败数 | 通过率 | 平均执行时间")
            print("-" * 70)
            for row in results:
                print(" | ".join(str(x) for x in row))
                
        except Exception as e:
            print(f"获取测试报告时出错: {str(e)}")
            
    except psycopg2.OperationalError as e:
        print(f"数据库连接失败: {str(e)}")
    except Exception as e:
        print(f"发生未知错误: {str(e)}")
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()
            print("\n数据库连接已关闭")

if __name__ == "__main__":
    run_tests()