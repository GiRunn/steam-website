import psycopg2
import logging
from datetime import datetime
from dotenv import load_dotenv
import os

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(f'review_system_tests_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log'),
        logging.StreamHandler()
    ]
)

def run_test_queries(conn):
    """执行测试查询"""
    test_queries = [
        ("""
        SELECT COUNT(*) 
        FROM pg_tables 
        WHERE schemaname = 'review_system'
        """, "检查review_system架构中的表数量"),
        
        ("""
        SELECT COUNT(*) 
        FROM review_system.reviews_partitioned
        """, "检查评论表是否存在并可查询"),
        
        ("""
        SELECT COUNT(*) 
        FROM review_system.review_replies_partitioned
        """, "检查回复表是否存在并可查询"),
        
        ("""
        SELECT COUNT(*) 
        FROM review_system.review_summary_partitioned
        """, "检查汇总表是否存在并可查询"),
        
        ("""
        SELECT COUNT(*) 
        FROM review_system.partition_management
        """, "检查分区管理表是否存在并可查询")
    ]

    success = True
    with conn.cursor() as cur:
        for query, description in test_queries:
            try:
                cur.execute(query)
                result = cur.fetchone()
                logging.info(f"{description}: {result[0]}")
            except Exception as e:
                logging.error(f"Error in {description}: {str(e)}")
                success = False
    
    return success

def main():
    load_dotenv()
    
    db_params = {
        'dbname': os.getenv('DB_NAME', 'steam'),
        'user': os.getenv('DB_USER', 'postgres'),
        'password': os.getenv('DB_PASSWORD', 'your_password'),
        'host': os.getenv('DB_HOST', 'localhost'),
        'port': os.getenv('DB_PORT', '5432')
    }

    try:
        conn = psycopg2.connect(**db_params)
        logging.info("Connected to database")

        if run_test_queries(conn):
            logging.info("All tests passed successfully!")
        else:
            logging.error("Some tests failed. Check the log for details.")

    except Exception as e:
        logging.error(f"Database connection error: {str(e)}")
    finally:
        if 'conn' in locals():
            conn.close()
            logging.info("Database connection closed")

if __name__ == "__main__":
    main()