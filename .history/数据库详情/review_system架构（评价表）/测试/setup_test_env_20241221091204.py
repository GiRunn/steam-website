import os
import sys
import subprocess
import platform
import logging
from datetime import datetime
import psycopg2

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(f'setup_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

def check_python_version():
    """检查Python版本"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        logger.error("需要Python 3.8或更高版本")
        return False
    return True

def install_pip():
    """确保pip已安装"""
    try:
        import pip
        logger.info("pip已安装")
        return True
    except ImportError:
        logger.info("正在安装pip...")
        try:
            subprocess.check_call([sys.executable, "-m", "ensurepip"])
            return True
        except Exception as e:
            logger.error(f"安装pip失败: {str(e)}")
            return False

def install_requirements():
    """安装requirements.txt中的依赖"""
    requirements_file = os.path.join(os.path.dirname(__file__), "requirements.txt")
    
    if not os.path.exists(requirements_file):
        logger.error("requirements.txt文件不存在")
        return False
        
    try:
        logger.info("正在安装依赖包...")
        subprocess.check_call([
            sys.executable, 
            "-m", 
            "pip", 
            "install", 
            "-r", 
            requirements_file,
            "--upgrade"
        ])
        return True
    except Exception as e:
        logger.error(f"安装依赖包失败: {str(e)}")
        return False

def check_postgres():
    """检查PostgreSQL连接并验证必要的表结构是否存在"""
    try:
        conn = psycopg2.connect(
            dbname="postgres",
            user="postgres",
            password="123qweasdzxc..a",
            host="localhost",
            port="5432"
        )
        
        cursor = conn.cursor()
        
        # 检查必要的扩展
        cursor.execute("""
            CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
            CREATE EXTENSION IF NOT EXISTS pgcrypto;
        """)
        
        # 检查必要的schema
        cursor.execute("""
            CREATE SCHEMA IF NOT EXISTS review_system;
        """)
        
        conn.commit()
        
        # 首先检查schema是否存在
        cursor.execute("""
            SELECT schema_name 
            FROM information_schema.schemata 
            WHERE schema_name = 'review_system'
        """)
        
        if not cursor.fetchone():
            logger.error("review_system schema不存在,需要先执行初始化脚本")
            return False
            
        # 检查表是否存在
        cursor.execute("""
            SELECT tablename 
            FROM pg_tables 
            WHERE schemaname = 'review_system'
            AND tablename = 'reviews_partitioned'
        """)
        
        if not cursor.fetchone():
            logger.error("reviews_partitioned表不存在,需要先执行create_review_tables.sql")
            return False
            
        # 检查表结构
        cursor.execute("""
            SELECT column_name, data_type, column_default
            FROM information_schema.columns
            WHERE table_schema = 'review_system'
            AND table_name = 'reviews_partitioned'
        """)
        
        columns = {row[0]: row[1] for row in cursor.fetchall()}
        required_columns = {
            'review_id': 'bigint',
            'game_id': 'bigint',
            'user_id': 'bigint',
            'rating': 'numeric',
            'content': 'text',
            'playtime_hours': 'integer',
            'likes_count': 'integer'
        }
        
        for col, type_ in required_columns.items():
            if col not in columns:
                logger.error(f"缺少必要字段: {col}")
                return False
            if not columns[col].startswith(type_):
                logger.error(f"字段{col}的类型不正确,期望{type_},实际{columns[col]}")
                return False
                
        logger.info("数据库结构验证通过")
        return True
        
    except Exception as e:
        logger.error(f"数据库检查失败: {str(e)}")
        return False

def init_database():
    """初始化数据库结构"""
    try:
        conn = psycopg2.connect(
            dbname="postgres",
            user="postgres",
            password="123qweasdzxc..a",
            host="localhost",
            port="5432"
        )
        
        cursor = conn.cursor()
        
        # 获取SQL文件目录
        sql_dir = os.path.join(os.path.dirname(__file__), "..", "生成review_system架构SQL命令")
        
        # 按正确的依赖顺序执行SQL文件
        sql_files = [
            "drop_review_tables.sql",           # 1. 首先清理现有表
            "create_review_tables.sql",         # 2. 创建基础表结构
            "create_monitoring_tables.sql",     # 3. 创建监控表
            "create_partition_maintenance.sql", # 4. 创建分区维护函数(包含record_partition_creation)
            "create_partition_functions.sql",   # 5. 创建其他分区函数
            "create_security_features.sql",     # 6. 创建安全特性
            "create_performance_config.sql",    # 7. 设置性能配置
            "create_triggers.sql",              # 8. 创建触发器
            "create_indexes.sql",               # 9. 创建索引
            "create_initial_partitions.sql"     # 10. 最后创建初始分区
        ]
        
        # 先检查所有SQL文件是否存在
        missing_files = []
        for sql_file in sql_files:
            file_path = os.path.join(sql_dir, sql_file)
            if not os.path.exists(file_path):
                missing_files.append(sql_file)
                
        if missing_files:
            logger.error(f"缺少以下SQL文件: {', '.join(missing_files)}")
            logger.info("尝试运行一键部署脚本...")
            
            # 运行一键部署脚本
            deploy_script = os.path.join(sql_dir, "一键部署review_system架构（评价表.py")
            if os.path.exists(deploy_script):
                subprocess.check_call([sys.executable, deploy_script])
                logger.info("一键部署完成")
            else:
                logger.error("找不到一键部署脚本")
                return False
        
        # 执行SQL文件
        for sql_file in sql_files:
            file_path = os.path.join(sql_dir, sql_file)
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    sql = f.read()
                    cursor.execute(sql)
                    conn.commit()  # 每个文件执行后提交
                    logger.info(f"执行{sql_file}成功")
            except Exception as e:
                logger.error(f"执行{sql_file}失败: {str(e)}")
                conn.rollback()
                return False
                
        logger.info("数据库初始化完成")
        return True
        
    except Exception as e:
        logger.error(f"数据库初始化失败: {str(e)}")
        if 'conn' in locals():
            conn.rollback()
        return False
    finally:
        if 'conn' in locals():
            conn.close()

def main():
    """主函数"""
    logger.info("开始设置测试环境...")
    
    # 检查Python版本
    if not check_python_version():
        sys.exit(1)
    
    # 安装pip和依赖
    if not install_pip() or not install_requirements():
        sys.exit(1)
    
    # 初始化数据库(如果失败会自动尝试运行一键部署)
    if not init_database():
        sys.exit(1)
    
    # 验证数据库结构
    if not check_postgres():
        sys.exit(1)
    
    logger.info("环境设置完成!")
    
    # 运行测试
    try:
        logger.info("开始运行测试...")
        test_script = os.path.join(os.path.dirname(__file__), "automated_database_test.py")
        subprocess.check_call([sys.executable, test_script])
    except Exception as e:
        logger.error(f"运行测试失败: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main() 