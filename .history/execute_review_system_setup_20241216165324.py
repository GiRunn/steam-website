import psycopg2
import logging
import os
from datetime import datetime
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('review_system_setup.log'),
        logging.StreamHandler()
    ]
)

class ReviewSystemSetup:
    def __init__(self):
        """初始化数据库连接配置"""
        # 从环境变量获取数据库配置
        self.db_config = {
            'dbname': os.getenv('DB_NAME', 'games'),
            'user': os.getenv('DB_USER', 'postgres'),
            'password': os.getenv('DB_PASSWORD', '123qweasdzxc..a'),
            'host': os.getenv('DB_HOST', 'localhost'),
            'port': os.getenv('DB_PORT', '5432')
        }
        self.conn = None
        self.cursor = None
        
        # SQL文件基础路径
        self.sql_base_path = os.path.join(
            'database_details', 
            'review_system架构（评价表）',
            '生成review_system架构SQL命令'
        )
        
        # SQL文件执行顺序
        self.sql_files = [
            'drop_review_tables.sql',
            'create_review_tables.sql',
            'create_partition_maintenance.sql',
            'create_partition_functions.sql',
            'create_triggers.sql',
            'create_indexes.sql',
            'create_initial_partitions.sql',
            'test_review_system.sql'
        ]
        
        # 执行结果记录
        self.execution_results = []

    def get_sql_file_path(self, filename):
        """获取SQL文件的完整路径"""
        return os.path.join(self.sql_base_path, filename)

    def connect(self):
        """建立数据库连接"""
        try:
            self.conn = psycopg2.connect(**self.db_config)
            self.cursor = self.conn.cursor()
            logging.info("Successfully connected to database")
        except Exception as e:
            logging.error(f"Failed to connect to database: {str(e)}")
            raise

    def disconnect(self):
        """关闭数据库连接"""
        if self.cursor:
            self.cursor.close()
        if self.conn:
            self.conn.close()
            logging.info("Database connection closed")

    def read_sql_file(self, filename):
        """读取SQL文件内容"""
        file_path = self.get_sql_file_path(filename)
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                return file.read()
        except Exception as e:
            logging.error(f"Failed to read SQL file {file_path}: {str(e)}")
            raise

    def execute_sql(self, sql, filename):
        """执行SQL语句"""
        start_time = datetime.now()
        try:
            self.cursor.execute(sql)
            self.conn.commit()
            end_time = datetime.now()
            duration = (end_time - start_time).total_seconds()
            
            result = {
                'filename': filename,
                'status': 'SUCCESS',
                'duration': duration,
                'timestamp': end_time,
                'error': None
            }
            logging.info(f"Successfully executed {filename} in {duration:.2f} seconds")
            
        except Exception as e:
            end_time = datetime.now()
            duration = (end_time - start_time).total_seconds()
            
            result = {
                'filename': filename,
                'status': 'FAILED',
                'duration': duration,
                'timestamp': end_time,
                'error': str(e)
            }
            logging.error(f"Failed to execute {filename}: {str(e)}")
            raise
        
        finally:
            self.execution_results.append(result)

    def setup(self):
        """执行完整的设置过程"""
        try:
            self.connect()
            
            for sql_file in self.sql_files:
                logging.info(f"Executing {sql_file}...")
                sql_content = self.read_sql_file(sql_file)
                self.execute_sql(sql_content, sql_file)
                
            logging.info("Review system setup completed successfully")
            
        except Exception as e:
            logging.error(f"Setup failed: {str(e)}")
            raise
            
        finally:
            self.disconnect()
            self.generate_report()

    def generate_report(self):
        """生成执行报告"""
        report = "\nExecution Report\n"
        report += "=" * 80 + "\n"
        
        for result in self.execution_results:
            status_symbol = "✓" if result['status'] == 'SUCCESS' else "✗"
            report += f"{status_symbol} {result['filename']}\n"
            report += f"  Status: {result['status']}\n"
            report += f"  Duration: {result['duration']:.2f} seconds\n"
            report += f"  Timestamp: {result['timestamp']}\n"
            
            if result['error']:
                report += f"  Error: {result['error']}\n"
            
            report += "-" * 80 + "\n"
        
        # 创建reports目录（如果不存在）
        os.makedirs('reports', exist_ok=True)
        
        # 写入报告文件
        report_path = os.path.join('reports', 'setup_report.txt')
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write(report)
        
        logging.info(f"Execution report generated: {report_path}")

def main():
    try:
        setup = ReviewSystemSetup()
        setup.setup()
    except Exception as e:
        logging.error(f"Setup failed: {str(e)}")
        exit(1)

if __name__ == "__main__":
    main() 