import os
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import logging
from datetime import datetime
import sys
from dotenv import load_dotenv
import subprocess
import time
import platform

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(f'review_system_setup_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log'),
        logging.StreamHandler()
    ]
)

def check_and_start_postgres():
    """检查并启动PostgreSQL服务"""
    system = platform.system().lower()
    try:
        if system == 'windows':
            # 检查服务状态
            result = subprocess.run(['sc', 'query', 'postgresql-x64-17'], 
                                    capture_output=True, text=True)
            
            # 如果服务未运行，尝试启动
            if 'RUNNING' not in result.stdout:
                logging.info("PostgreSQL服务未运行，正在启动...")
                subprocess.run(['net', 'start', 'postgresql-x64-17'], check=True)
                time.sleep(10)  # 等待服务完全启动
        
        elif system == 'linux':
            # Linux系统检查服务状态
            result = subprocess.run(['systemctl', 'is-active', 'postgresql'], 
                                    capture_output=True, text=True)
            
            if result.returncode != 0:
                logging.info("PostgreSQL服务未运行，正在启动...")
                subprocess.run(['sudo', 'systemctl', 'start', 'postgresql'], check=True)
                time.sleep(10)
        
        else:
            logging.warning(f"不支持的操作系统: {system}")
    
    except subprocess.CalledProcessError as e:
        logging.error(f"启动PostgreSQL服务失败: {str(e)}")
        sys.exit(1)

def get_db_config():
    """从.env文件获取数据库配置"""
    env_path = r'E:\Steam\steam-website\server\.env'
    
    if not os.path.exists(env_path):
        logging.error(f"找不到.env文件: {env_path}")
        sys.exit(1)
    
    load_dotenv(env_path)
    
    return {
        'dbname': os.getenv('DB_NAME', 'games'),
        'user': os.getenv('DB_USER', 'postgres'),
        'password': os.getenv('DB_PASSWORD', '123qweasdzxc..a'),
        'host': os.getenv('DB_HOST', 'localhost'),
        'port': os.getenv('DB_PORT', '5432')
    }

def create_connection(db_config=None):
    """创建数据库连接"""
    if db_config is None:
        db_config = get_db_config()
    
    try:
        conn = psycopg2.connect(**db_config)
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        return conn
    except Exception as e:
        logging.error(f"数据库连接失败: {str(e)}")
        sys.exit(1)

def load_sql_file(file_path):
    """加载SQL文件"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        logging.error(f"读取SQL文件 {file_path} 失败: {str(e)}")
        return None

def execute_sql(conn, sql_content, description):
    """执行SQL语句"""
    try:
        with conn.cursor() as cur:
            cur.execute(sql_content)
        logging.info(f"成功执行: {description}")
        return True
    except Exception as e:
        logging.error(f"执行 {description} 时出错: {str(e)}")
        return False

def main():
    # 检查并启动PostgreSQL服务
    check_and_start_postgres()
    
    # 获取数据库配置并创建连接
    db_config = get_db_config()
    
    try:
        conn = create_connection(db_config)
        
        # 获取当前脚本所在目录
        current_dir = os.path.dirname(os.path.abspath(__file__))
        
        # SQL文件列表（按顺序执行）
        sql_files = [
            ('drop_review_tables.sql', '删除现有表'),
            ('create_review_tables.sql', '创建评论表'),
            ('create_partition_maintenance.sql', '创建分区维护'),
            ('create_partition_functions.sql', '创建分区函数'),
            ('create_triggers.sql', '创建触发器'),
            ('create_indexes.sql', '创建索引'),
            ('create_initial_partitions.sql', '创建初始分区'),
            ('test_review_system.sql', '测试系统'),
            ('create_performance_config.sql', '创建性能配置'),
            ('optimize_partition_strategy.sql', '优化分区策略'),
            ('setup_read_write_split.sql', '设置读写分离')
        ]

        # 执行SQL文件
        total_files = len(sql_files)
        for index, (sql_file, description) in enumerate(sql_files, 1):
            file_path = os.path.join(current_dir, sql_file)
            logging.info(f"\n[{index}/{total_files}] 正在执行 {sql_file}...")
            
            # 添加执行时间统计
            start_time = time.time()
            
            sql_content = load_sql_file(file_path)
            if sql_content is None:
                continue

            if not execute_sql(conn, sql_content, description):
                logging.error(f"执行 {sql_file} 失败")
                sys.exit(1)
                
            execution_time = time.time() - start_time
            logging.info(f"完成 {sql_file} (耗时: {execution_time:.2f}秒)")
            
        logging.info("\n所有SQL文件执行成功！")

    except Exception as e:
        logging.error(f"执行过程中发生错误: {str(e)}")
        sys.exit(1)
    finally:
        if 'conn' in locals() and conn:
            conn.close()
            logging.info("数据库连接已关闭")

if __name__ == "__main__":
    main() 