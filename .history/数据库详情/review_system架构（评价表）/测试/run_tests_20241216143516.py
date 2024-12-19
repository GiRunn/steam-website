import psycopg2
import os
from datetime import datetime

def run_tests():
    # 初始化连接变量
    conn = None
    cur = None
    
    # 数据库连接配置
    conn_params = {
        "dbname": "games",
        "user": "postgres",
        "password": "your_password",
        "host": "123qweasdzxc",
        "port": "5432"
    }
    
    try:
        # 连接数据库
        print("正在连接数据库...")
        conn = psycopg2.connect(**conn_params)
        cur = conn.cursor()
        
        print(f"开始测试 - {datetime.now()}")
        
        # 获取当前脚本的绝对路径
        script_dir = os.path.dirname(os.path.abspath(__file__))
        
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
            # 使用绝对路径
            file_path = os.path.join(script_dir, test_file)
            
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    sql = f.read()
                    cur.execute(sql)
                    conn.commit()
                print(f"{test_file} 执行成功")
            except FileNotFoundError:
                print(f"错误: 找不到文件 {file_path}")
                continue
            except Exception as e:
                print(f"执行 {test_file} 时出错: {str(e)}")
                continue
        
        # 获取测试结果
        try:
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
            print(f"获取测试报告时出错: {str(e)}")
            
    except psycopg2.OperationalError as e:
        print(f"数据库连接失败: {str(e)}")
    except Exception as e:
        print(f"发生未知错误: {str(e)}")
    finally:
        # 关闭数据库连接
        if cur:
            cur.close()
        if conn:
            conn.close()
            print("数据库连接已关闭")

if __name__ == "__main__":
    run_tests()