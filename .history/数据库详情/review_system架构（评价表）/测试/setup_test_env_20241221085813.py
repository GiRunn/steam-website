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
        
        # 检查必要的字段是否存在
        cursor.execute("""
            SELECT column_name 
            FROM information_schema.columns
            WHERE table_schema = 'review_system'
            AND table_name = 'reviews_partitioned'
        """)
        
        columns = [row[0] for row in cursor.fetchall()]
        required_columns = [
            'review_id', 'game_id', 'user_id', 'rating', 
            'content', 'playtime_hours', 'likes_count'
        ]
        
        missing_columns = [col for col in required_columns if col not in columns]
        if missing_columns:
            logger.error(f"缺少必要的字段: {', '.join(missing_columns)}")
            return False
            
        # 检查必要的函数是否存在
        cursor.execute("""
            SELECT proname 
            FROM pg_proc p
            JOIN pg_namespace n ON p.pronamespace = n.oid
            WHERE n.nspname = 'review_system'
        """)
        
        functions = [row[0] for row in cursor.fetchall()]
        required_functions = [
            'decrypt_sensitive_data',
            'encrypt_sensitive_data',
            'verify_backup',
            'optimize_partitions'
        ]
        
        missing_functions = [func for func in required_functions if func not in functions]
        if missing_functions:
            logger.error(f"缺少必要的函数: {', '.join(missing_functions)}")
            return False
            
        return True
        
    except Exception as e:
        logger.error(f"数据库检查失败: {str(e)}")
        return False

def main():
    """主函数"""
    logger.info("开始设置测试环境...")
    
    # 检查Python版本
    if not check_python_version():
        sys.exit(1)
    
    # 安装pip
    if not install_pip():
        sys.exit(1)
    
    # 安装依赖
    if not install_requirements():
        sys.exit(1)
    
    # 检查数据库连接
    if not check_postgres():
        sys.exit(1)
    
    logger.info("环境设置完成!")
    
    # 运行测试脚本
    try:
        logger.info("开始运行测试...")
        test_script = os.path.join(os.path.dirname(__file__), "automated_database_test.py")
        subprocess.check_call([sys.executable, test_script])
    except Exception as e:
        logger.error(f"运行测试失败: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main() 