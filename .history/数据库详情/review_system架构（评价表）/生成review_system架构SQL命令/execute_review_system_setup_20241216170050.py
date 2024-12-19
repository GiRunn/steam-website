import os
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import logging
from datetime import datetime
import sys
from dotenv import load_dotenv

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(f'review_system_setup_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log'),
        logging.StreamHandler()
    ]
)

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
    load_dotenv()
    
    # 数据库连接参数
    db_params = {
        'dbname': os.getenv('DB_NAME', 'steam'),
        'user': os.getenv('DB_USER', 'postgres'),
        'password': os.getenv('DB_PASSWORD', 'your_password'),
        'host': os.getenv('DB_HOST', 'localhost'),
        'port': os.getenv('DB_PORT', '5432')
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
        ('test_review_system.sql', '测试系统')
    ]

    # 获取当前脚本所在目录
    current_dir = os.path.dirname(os.path.abspath(__file__))

    try:
        # 连接数据库
        logging.info("正在连接数据库...")
        conn = psycopg2.connect(
            dbname='games',
            user='postgres', 
            password='123qweasdzxc..a',
            host='localhost',
            port='5432'
        )
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