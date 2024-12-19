import psycopg2
import os
from datetime import datetime

def run_tests():
    # 数据库连接配置
    conn_params = {
        "dbname": "your_database",
        "user": "your_username",
        "password": "your_password",
        "host": "localhost",
        "port": "5432"
    }
    
    try:
        # 连接数据库
        conn = psycopg2.connect(**conn_params)
        cur = conn.cursor()
        
        print(f"开始测试 - {datetime.now()}")
        
        # 测试文件列表
        test_files = [
            "00_测试框架.sql",
            "01_基础数据测试.sql",
            "02_分区测试.sql",
            "03_触发器测试.sql",
            "04_性能测试.sql",
            "05_压力测试.sql", 
            "06_边界测试.sql",
            "07_性能基准测试.sql",
            "08_极限测试.sql"
        ]
        
        # 执行每个测试文件
        for test_file in test_files:
            print(f"\n执行测试: {test_file}")
            file_path = f"数据库详情/review_system架构（评价表）/测试/{test_file}"
            
            with open(file_path, 'r', encoding='utf-8') as f:
                sql = f.read()
                cur.execute(sql)
                conn.commit()
        
        # 获取测试结果
        cur.execute("""
            SELECT * FROM review_system.generate_test_report()
        """)
        
        results = cur.fetchall()
        print("\n测试报告:")
        print("类别 | 总测试数 | 通过数 | 失败数 | 通过率 | 平均执行时间")
        print("-" * 70)
        for row in results:
            print(" | ".join(str(x) for x in row))
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    run_tests()