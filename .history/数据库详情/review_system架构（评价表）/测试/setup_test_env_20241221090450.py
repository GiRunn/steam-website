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
        
        # 检查所有必要的表
        required_tables = [
            'reviews_partitioned',
            'review_replies_partitioned', 
            'review_summary_partitioned',
            'partition_management',
            'monitoring_history',
            'backup_history'
        ]
        
        for table in required_tables:
            cursor.execute("""
                SELECT 1 FROM information_schema.tables 
                WHERE table_schema = 'review_system' 
                AND table_name = %s
            """, (table,))
            if not cursor.fetchone():
                logger.error(f"表 {table} 不存在")
                return False
                
        # 检查分区是否存在
        cursor.execute("""
            SELECT COUNT(*) 
            FROM pg_tables 
            WHERE schemaname = 'review_system'
            AND tablename LIKE 'reviews_y%m%'
        """)
        if cursor.fetchone()[0] == 0:
            logger.error("没有找到评论表分区")
            return False
            
        # 检查必要的函数
        required_functions = [
            'create_future_partitions',
            'record_partition_creation',
            'check_partition_status',
            'update_review_summary'
        ]
        
        for func in required_functions:
            cursor.execute("""
                SELECT 1 FROM pg_proc p 
                JOIN pg_namespace n ON p.pronamespace = n.oid 
                WHERE n.nspname = 'review_system' 
                AND p.proname = %s
            """, (func,))
            if not cursor.fetchone():
                logger.error(f"函数 {func} 不存在")
                return False
                
        logger.info("数据库结构验证通过")
        return True
        
    except Exception as e:
        logger.error(f"数据库检查失败: {str(e)}")
        return False
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

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
            "drop_review_tables.sql",              # 清理现有表
            "create_review_tables.sql",            # 创建基础表
            "create_partition_maintenance.sql",     # 创建分区管理
            "create_monitoring_tables.sql",        # 创建监控表
            "create_backup_features.sql",          # 创建备份功能
            "create_partition_functions.sql",       # 创建分区函数
            "create_security_features.sql",         # 创建安全特性
            "create_performance_optimizations.sql", # 创建性能优化
            "create_triggers.sql",                 # 创建触发器
            "create_indexes.sql",                  # 创建索引
            "create_initial_partitions.sql",       # 初始化分区
            "optimize_partition_strategy.sql",      # 优化分区策略
            "setup_read_write_split.sql",          # 设置读写分离
            "create_monitoring_alerts.sql",        # 创建监控告警
            "update_system_config.sql"             # 更新系统配置
        ]
        
        # 执行每个SQL文件
        for sql_file in sql_files:
            file_path = os.path.join(sql_dir, sql_file)
            if os.path.exists(file_path):
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        sql = f.read()
                        # 分割SQL语句
                        statements = sql.split(';')
                        for statement in statements:
                            if statement.strip():
                                cursor.execute(statement)
                        conn.commit()
                        logger.info(f"执行{sql_file}成功")
                except Exception as e:
                    logger.error(f"执行{sql_file}失败: {str(e)}")
                    conn.rollback()
                    return False
            else:
                logger.error(f"找不到{sql_file}")
                return False
                
        # 验证关键对象是否创建成功
        validation_queries = [
            ("检查schema", "SELECT 1 FROM information_schema.schemata WHERE schema_name = 'review_system'"),
            ("检查主表", "SELECT 1 FROM information_schema.tables WHERE table_schema = 'review_system' AND table_name = 'reviews_partitioned'"),
            ("检查分区管理表", "SELECT 1 FROM information_schema.tables WHERE table_schema = 'review_system' AND table_name = 'partition_management'"),
            ("检查分区函数", "SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'review_system' AND p.proname = 'create_future_partitions'")
        ]
        
        for check_name, query in validation_queries:
            try:
                cursor.execute(query)
                if not cursor.fetchone():
                    logger.error(f"{check_name}失败")
                    return False
                logger.info(f"{check_name}成功")
            except Exception as e:
                logger.error(f"{check_name}出错: {str(e)}")
                return False
        
        logger.info("数据库初始化完成")
        return True
        
    except Exception as e:
        logger.error(f"数据库初始化失败: {str(e)}")
        return False
    finally:
        if cursor:
            cursor.close()
        if conn:
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
    
    # 初始化数据库
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