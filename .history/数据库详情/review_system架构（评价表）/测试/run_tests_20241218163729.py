import psycopg2
import os
from datetime import datetime
import time
import subprocess
import platform
import sys

# 数据库连接配置
conn_params = {
    "dbname": "games",
    "user": "postgres",
    "password": "123qweasdzxc..a",
    "host": "localhost",
    "port": "5432"
}

def get_db_connection():
    """获取数据库连接"""
    try:
        return psycopg2.connect(**conn_params)
    except Exception as e:
        print(f"数据库连接失败: {str(e)}")
        sys.exit(1)

def execute_one_key_deployment():
    """执行一键部署脚本"""
    try:
        # 获取一键部署脚本的完整路径
        deployment_script = os.path.join(
            os.path.dirname(__file__), 
            '..', 
            '生成review_system架构SQL命令', 
            '一键部署review_system架构（评价表.py'
        )
        
        print("运行一键部署脚本...")
        result = subprocess.run(
            [sys.executable, deployment_script], 
            capture_output=True, 
            text=True
        )
        
        # 打印脚本输出
        print(result.stdout)
        
        if result.returncode != 0:
            print("一键部署脚本执行失败:")
            print(result.stderr)
            sys.exit(1)
        
    except Exception as e:
        print(f"执行一键部署脚本时发生错误: {str(e)}")
        sys.exit(1)

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
        
        print(f"执行成功: {os.path.basename(file_path)}")
        
    except Exception as e:
        conn.rollback()
        print(f"执行 {file_path} 时发生错误: {str(e)}")
        raise

def run_tests():
    print(f"开始测试 - {datetime.now()}")
    
    # 执行一键部署脚本
    execute_one_key_deployment()
    
    # 重新建立数据库连接
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        # 测试框架目录
        test_dir = os.path.dirname(__file__)
        
        # 执行测试框架
        test_framework_file = os.path.join(test_dir, '00_测试框架.sql')
        execute_sql_file(cur, conn, test_framework_file)
        
        # 基础测试文件列表
        basic_test_files = [
            '01_基础数据测试.sql',
            '02_分区测试.sql',
            '03_触发器测试.sql',
            '04_性能测试.sql',
            '05_压力测试.sql',
            '06_边界测试.sql',
            '07_性能基准测试.sql'
        ]
        
        # 执行基础测试
        for test_file in basic_test_files:
            file_path = os.path.join(test_dir, test_file)
            if os.path.exists(file_path):
                execute_sql_file(cur, conn, file_path)
        
        # 执行极限测试
        extreme_test_dir = os.path.join(test_dir, '极限测试')
        extreme_test_files = [
            '01_安全测试.sql',
            '02_容量测试.sql',
            '03_特殊情况测试.sql',
            '04_并发测试.sql',
            '05_故障恢复测试.sql'
        ]
        
        for test_file in extreme_test_files:
            file_path = os.path.join(extreme_test_dir, test_file)
            if os.path.exists(file_path):
                execute_sql_file(cur, conn, file_path)
        
        print("\n所有测试完成！")
        
    except Exception as e:
        print(f"测试过程中发生错误: {str(e)}")
    finally:
        if cur:
            cur.close()
        if conn and not conn.closed:
            conn.close()
            print("\n数据库连接已关闭")

if __name__ == "__main__":
    run_tests()