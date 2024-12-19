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

def get_db_config():
    """从.env文件获取数据库配置"""
    env_path = r'E:\Steam\steam-website\server\.env'
    
    if not os.path.exists(env_path):
        logging.error(f"找不到.env文件: {env_path}")
        sys.exit(1)
        
    load_dotenv(env_path)
    
    required_vars = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD']
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    
    if missing_vars:
        logging.error(f"缺少必要的环境变量: {', '.join(missing_vars)}")
        sys.exit(1)
        
    return {
        'host': os.getenv('DB_HOST'),
        'port': os.getenv('DB_PORT'),
        'dbname': os.getenv('DB_NAME'),
        'user': os.getenv('DB_USER'),
        'password': os.getenv('DB_PASSWORD')
    }

def restart_postgresql():
    """重启PostgreSQL服务"""
    db_config = get_db_config()
    pg_ctl_path = r'D:\Program Files\PostgreSQL\17\bin\pg_ctl.exe'
    data_dir = r'D:\Program Files\PostgreSQL\17\data'
    
    try:
        # 停止服务
        logging.info("正在停止PostgreSQL服务...")
        stop_cmd = [pg_ctl_path, 'stop', '-D', data_dir, '-m', 'fast']
        subprocess.run(stop_cmd, check=True)
        time.sleep(5)
        
        # 启动服务
        logging.info("正在启动PostgreSQL服务...")
        start_cmd = [pg_ctl_path, 'start', '-D', data_dir, 
                    '-o', f'-p {db_config["port"]}']  # 使用.env中的端口
        subprocess.run(start_cmd, check=True)
        time.sleep(10)
        
        logging.info("PostgreSQL服务重启成功")
        return True
    except subprocess.CalledProcessError as e:
        logging.error(f"重启PostgreSQL服务失败: {str(e)}")
        return False

def wait_for_postgresql(max_retries=30, retry_interval=2):
    """等待PostgreSQL服务就绪"""
    db_config = get_db_config()
    retry_count = 0
    
    while retry_count < max_retries:
        try:
            # 移除dbname参数，因为我们要连接默认数据库
            temp_config = db_config.copy()
            if 'dbname' in temp_config:
                del temp_config['dbname']
                
            conn = psycopg2.connect(
                dbname='postgres',  # 使用默认数据库
                **temp_config
            )
            conn.close()
            logging.info("PostgreSQL服务已就绪")
            return True
        except psycopg2.OperationalError as e:
            retry_count += 1
            if retry_count == max_retries:
                logging.error(f"等待PostgreSQL服务就绪超时: {str(e)}")
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

def execute_system_config(conn, sql_file):
    """执行系统配置更新"""
    try:
        with conn.cursor() as cur:
            cur.execute(sql_file)
            conn.commit()
            logging.info("系统配置更新成功")
            return True
    except Exception as e:
        logging.error(f"执行系统配置更新失败: {str(e)}")
        return False

def main():
    try:
        # 获取数据库配置
        db_config = get_db_config()
        
        # 重启PostgreSQL服务
        logging.info("准备重启PostgreSQL服务...")
        if not restart_postgresql():
            logging.error("PostgreSQL服务重启失败，脚本终止")
            sys.exit(1)
        
        # 等待服务就绪
        if not wait_for_postgresql():
            logging.error("PostgreSQL服务未就绪，脚本终止")
            sys.exit(1)

        # 连接数据库（使用实际的数据库名）
        logging.info("正在连接数据库...")
        conn = psycopg2.connect(**db_config)
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        logging.info(f"成功连接到数据库 {db_config['dbname']}@{db_config['host']}:{db_config['port']}")

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

        # 先执行系统配置更新
        system_config_file = os.path.join(current_dir, 'update_system_config.sql')
        if os.path.exists(system_config_file):
            logging.info("\n正在更新系统配置...")
            with open(system_config_file, 'r', encoding='utf-8') as f:
                if not execute_system_config(conn, f.read()):
                    logging.error("系统配置更新失败")
                    sys.exit(1)
            logging.info("系统配置更新成功")

        # 执行其他SQL文件
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
        logging.error(f"执行过程中发生错误: {str(e)}")
        sys.exit(1)
    finally:
        if 'conn' in locals() and conn:
            conn.close()
            logging.info("数据库连接已关闭")

if __name__ == "__main__":
    main() 