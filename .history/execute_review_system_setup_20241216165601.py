import psycopg2
import logging
import os
from datetime import datetime

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
        # 数据库配置
        self.db_config = {
            'dbname': 'games',
            'user': 'postgres',
            'password': '123qweasdzxc..a',
            'host': 'localhost',
            'port': '5432'
        }
        self.conn = None
        self.cursor = None
        
        # SQL文件基础路径
        self.sql_base_path = os.path.join(
            '数据库详情',
            'review_system架构（评价表）',
            '生成review_system架构SQL命令'
        )
        
        # 确保基础路径存在
        if not os.path.exists(self.sql_base_path):
            raise FileNotFoundError(f"SQL文件目录不存在: {self.sql_base_path}")
        
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
        
        # 验证所有SQL文件是否存在
        for sql_file in self.sql_files:
            file_path = self.get_sql_file_path(sql_file)
            if not os.path.exists(file_path):
                raise FileNotFoundError(f"SQL文件不存在: {file_path}")
        
        # 执行结果记录
        self.execution_results = []

    def get_sql_file_path(self, filename):
        """获取SQL文件的完整路径"""
        file_path = os.path.join(self.sql_base_path, filename)
        logging.info(f"Resolving SQL file path: {file_path}")
        return file_path

    # ... 其余方法保持不变 ...