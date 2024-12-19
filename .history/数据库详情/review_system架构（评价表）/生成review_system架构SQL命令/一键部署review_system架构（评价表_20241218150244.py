import os
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import logging
from datetime import datetime
import sys
from dotenv import load_dotenv
import subprocess
import time

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(f'review_system_setup_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log'),
        logging.StreamHandler()
    ]
)

def restart_postgresql():
    """重启PostgreSQL服务"""
    pg_ctl_path = r'D:\Program Files\PostgreSQL\17\bin\pg_ctl.exe'
    data_dir = r'D:\Program Files\PostgreSQL\17\data'  # PostgreSQL数据目录
    
    try:
        # 停止服务
        logging.info("正在停止PostgreSQL服务...")
        stop_cmd = [pg_ctl_path, 'stop', '-D', data_dir, '-m', 'fast']
        subprocess.run(stop_cmd, check=True)
        time.sleep(5)  # 等待服务完全停止
        
        # 启动服务
        logging.info("正在启动PostgreSQL服务...")
        start_cmd = [pg_ctl_path, 'start', '-D', data_dir]
        subprocess.run(start_cmd, check=True)
        time.sleep(10)  # 等待服务完全启动
        
        logging.info("PostgreSQL服务重启成功")
        return True
    except subprocess.CalledProcessError as e:
        logging.error(f"重启PostgreSQL服务失败: {str(e)}")
        return False

def wait_for_postgresql(max_retries=30, retry_interval=2):
    """等待PostgreSQL服务就绪"""
    retry_count = 0
    while retry_count < max_retries:
        try:
            # 尝试连接数据库
            conn = psycopg2.connect(
                dbname='postgres',  # 使用默认数据库
                user=os.getenv('DB_USER'),
                password=os.getenv('DB_PASSWORD'),
                host=os.getenv('DB_HOST'),
                port=os.getenv('DB_PORT')
            )
            conn.close()
            logging.info("PostgreSQL服务已就绪")
            return True
        except psycopg2.OperationalError:
            retry_count += 1
            if retry_count == max_retries:
                logging.error("等待PostgreSQL服务就绪超时")
                return False
            time.sleep(retry_interval)
    return False

def load_sql_file(file_path):
    """读取SQL文件内容"""
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            return file.read()
    except Exception as e:
        logging.error(f"读取SQL文件 {file_path} 时出错: {str(e)}")
        return None

def execute_sql(conn, sql, description):
    """执行SQL命令并记录结果"""
    try:
        with conn.cursor() as cur:
            cur.execute(sql)
            conn.commit()
            logging.info(f"成功执行: {description}")
            return True
    except Exception as e:
        conn.rollback()
        logging.error(f"执行 {description} 时出错: {str(e)}")
        return False

def main():
    # 加载环境变量
    env_path = "E:\\Steam\\steam-website\\server\\.env"
    load_dotenv(env_path)
    
    # 重启PostgreSQL服务
    logging.info("准备重启PostgreSQL服务...")
    if not restart_postgresql():
        logging.error("PostgreSQL服务重启失败，脚本终止")
        sys.exit(1)
    
    # 等待服务就绪
    if not wait_for_postgresql():
        logging.error("PostgreSQL服务未就绪，脚本终止")
        sys.exit(1)
    
    # 数据库连接参数
    db_params = {
        'dbname': os.getenv('DB_NAME'),
        'user': os.getenv('DB_USER'),
        'password': os.getenv('DB_PASSWORD'),
        'host': os.getenv('DB_HOST'),
        'port': os.getenv('DB_PORT')
    }

    # SQL文件执行顺序
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
        ('setup_read_write_split.sql', '设置读写分离'),
    ]

    # 获取当前脚本所在目录
    current_dir = os.path.dirname(os.path.abspath(__file__))

    try:
        # 连接数据库
        logging.info("正在连接数据库...")
        conn = psycopg2.connect(**db_params)
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        logging.info("成功连接到数据库")

        # 执行SQL文件
        for sql_file, description in sql_files:
            file_path = os.path.join(current_dir, sql_file)
            logging.info(f"\n正在执行 {sql_file}...")
            
            sql_content = load_sql_file(file_path)
            if sql_content is None:
                continue

            if not execute_sql(conn, sql_content, description):
                logging.error(f"执行 {sql_file} 失败")
                sys.exit(1)

        logging.info("\n所有SQL文件执行成功！")

    except Exception as e:
        logging.error(f"数据库连接错误: {str(e)}")
        sys.exit(1)
    finally:
        if 'conn' in locals():
            conn.close()
            logging.info("数据库连接已关闭")

if __name__ == "__main__":
    main() 