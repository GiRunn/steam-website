import psycopg2
import os
from datetime import datetime
import time
import subprocess
import platform
import sys
import logging
from threading import Timer
import argparse

# 配置日志
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

def check_environment():
    """检查测试环境状态"""
    status = {
        'postgres_running': False,
        'tables_exist': False,
        'port_available': True,
        'deployment_needed': False
    }
    
    try:
        # 检查PostgreSQL连接
        conn = psycopg2.connect(**conn_params)
        status['postgres_running'] = True
        
        # 检查是否存在评论相关表
        cur = conn.cursor()
        cur.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'reviews'
            );
        """)
        status['tables_exist'] = cur.fetchone()[0]
        
        cur.close()
        conn.close()
    except psycopg2.OperationalError:
        status['postgres_running'] = False
    except Exception as e:
        logging.warning(f"环境检查时发生错误: {str(e)}")
    
    # 根据检查结果判断是否需要部署
    if not status['tables_exist'] or not status['postgres_running']:
        status['deployment_needed'] = True
    
    return status

def get_user_choice(env_status):
    """根据环境状态向用户提供建议并获取选择"""
    print("\n=== 测试环境状态 ===")
    print(f"PostgreSQL服务: {'运行中' if env_status['postgres_running'] else '未运行'}")
    print(f"评论表结构: {'已存在' if env_status['tables_exist'] else '不存在'}")
    
    if env_status['deployment_needed']:
        print("\n建议：")
        if not env_status['postgres_running']:
            print("- PostgreSQL服务未运行，需要启动服务")
        if not env_status['tables_exist']:
            print("- 评论表结构不存在，需要执行部署脚本")
        
        while True:
            choice = input("\n是否执行一键部署脚本？(y/n): ").lower()
            if choice in ['y', 'n']:
                return choice == 'y'
    else:
        print("\n环境检查通过，可以直接执行测试")
        return False

def execute_with_timeout(proc, timeout=300):
    """使用超时机制执行子进程"""
    timer = Timer(timeout, proc.kill)
    try:
        timer.start()
        stdout, stderr = proc.communicate()
        return stdout, stderr, proc.returncode
    finally:
        timer.cancel()

def execute_one_key_deployment():
    """执行一键部署脚本，增加超时控制和详细日志"""
    try:
        deployment_script = os.path.join(
            os.path.dirname(__file__), 
            '..', 
            '生成review_system架构SQL命令', 
            '一键部署review_system架构（评价表.py'
        )
        
        if not os.path.exists(deployment_script):
            raise FileNotFoundError(f"部署脚本不存在: {deployment_script}")

        logging.info("开始执行一键部署脚本...")
        
        proc = subprocess.Popen(
            [sys.executable, deployment_script],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        stdout, stderr, returncode = execute_with_timeout(proc, timeout=300)
        
        if stdout:
            logging.info("部署脚本输出:")
            logging.info(stdout)
            
        if returncode != 0:
            logging.error("部署脚本执行失败:")
            logging.error(stderr)
            raise Exception("部署脚本执行失败")
            
        logging.info("部署脚本执行完成")
        
        # 等待数据库操作完成
        time.sleep(2)
        
    except Exception as e:
        logging.error(f"执行一键部署脚本时发生错误: {str(e)}")
        raise

def execute_sql_file(cur, conn, file_path, category=None):
    """执行单个SQL文件并处理事务，增加超时控制"""
    try:
        logging.info(f"\n正在执行: {os.path.basename(file_path)}")
        
        with open(file_path, 'r', encoding='utf-8') as f:
            sql = f.read()
        
        conn.rollback()  # 确保在清洁状态开始
        
        start_time = time.time()
        
        # 设置语句超时（3分钟）
        cur.execute("SET statement_timeout = '180000';")
        cur.execute(sql)
        conn.commit()
        
        execution_time = time.time() - start_time
        logging.info(f"执行成功: {os.path.basename(file_path)} (耗时: {execution_time:.2f}秒)")
        
    except Exception as e:
        conn.rollback()
        logging.error(f"执行 {file_path} 时发生错误: {str(e)}")
        raise

def run_tests():
    """运行测试的主函数，增加错误恢复和状态检查"""
    logging.info(f"开始测试 - {datetime.now()}")
    
    # 检查PostgreSQL服务状态
    if not check_postgres_status():
        logging.error("PostgreSQL服务未正常运行")
        return
    
    try:
        # 执行一键部署脚本
        execute_one_key_deployment()
        
        # 等待数据库操作完成
        time.sleep(2)
        
        # 重新建立数据库连接
        conn = get_db_connection()
        cur = conn.cursor()
        
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
        
        logging.info("\n所有测试完成！")
        
    except Exception as e:
        logging.error(f"测试过程中发生错误: {str(e)}")
    finally:
        if 'cur' in locals() and cur:
            cur.close()
        if 'conn' in locals() and conn and not conn.closed:
            conn.close()
            logging.info("数据库连接已关闭")

if __name__ == "__main__":
    run_tests()