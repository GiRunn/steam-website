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
import signal
import psutil
import atexit
import pkg_resources

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(f'deployment_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log'),
        logging.StreamHandler()
    ]
)

# 存储需要清理的进程
processes_to_cleanup = []

def cleanup_processes():
    """清理所有相关进程"""
    for proc in processes_to_cleanup:
        try:
            if psutil.pid_exists(proc.pid):
                parent = psutil.Process(proc.pid)
                children = parent.children(recursive=True)
                for child in children:
                    child.terminate()
                parent.terminate()
                logging.info(f"已终止进程 {proc.pid}")
        except Exception as e:
            logging.warning(f"清理进程时出错: {str(e)}")

# 注册退出时的清理函数
atexit.register(cleanup_processes)

def signal_handler(signum, frame):
    """处理中断信号"""
    logging.info("收到中断信号，正在清理...")
    cleanup_processes()
    sys.exit(1)

# 注册信号处理器
signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)

def is_port_in_use(port):
    """检查端口是否被占用"""
    try:
        # 首先检查是否能正常连接数据库
        if check_postgres_connection():
            return False  # 如果能连接，说明端口被PostgreSQL正常占用
            
        # 如果不能连接，再检查端口
        for conn in psutil.net_connections():
            if conn.laddr.port == port:
                return True
        return False
    except:
        return False

def kill_process_on_port(port):
    """结束占用指定端口的进程"""
    # 如果PostgreSQL正常运行，不要杀死进程
    if check_postgres_connection():
        return
        
    try:
        for conn in psutil.net_connections():
            if conn.laddr.port == port:
                try:
                    process = psutil.Process(conn.pid)
                    # 检查进程名称，避免误杀PostgreSQL
                    if not process.name().lower().startswith('postgres'):
                        process.terminate()
                        logging.info(f"已终止占用端口 {port} 的进程 {conn.pid}")
                except:
                    pass
    except Exception as e:
        logging.error(f"结束端口 {port} 的进程时出错: {str(e)}")

def check_postgres_connection():
    """检查PostgreSQL连接是否正常"""
    try:
        start_time = time.time()
        print("正在检查PostgreSQL连接...")
        conn = psycopg2.connect(**get_db_config())
        conn.close()
        elapsed = time.time() - start_time
        print(f"✓ PostgreSQL连接正常 ({elapsed:.2f}秒)")
        return True
    except Exception as e:
        print(f"✗ PostgreSQL连接失败: {str(e)}")
        return False

def restart_postgres_service():
    """重启PostgreSQL服务"""
    system = platform.system().lower()
    try:
        print("\n正在重启PostgreSQL服务...")
        if system == 'windows':
            print("1. 停止服务...")
            subprocess.run(['net', 'stop', 'postgresql-x64-17'], 
                         capture_output=True, 
                         text=True)
            time.sleep(2)  # 减少等待时间
            
            print("2. 启动服务...")
            start_result = subprocess.run(
                ['net', 'start', 'postgresql-x64-17'],
                capture_output=True,
                text=True
            )
            
            if start_result.returncode != 0:
                print(f"✗ 服务启动失败: {start_result.stderr}")
                return False
                
        elif system == 'linux':
            subprocess.run(['sudo', 'systemctl', 'restart', 'postgresql'], check=True)
            
        time.sleep(5)  # 减少等待时间
        
        # 验证服务是否启动
        print("3. 验证服务状态...")
        if check_postgres_connection():
            print("✓ PostgreSQL服务重启成功")
            return True
        return False
        
    except Exception as e:
        print(f"✗ 重启服务失败: {str(e)}")
        return False

def ensure_postgres_running():
    """确保PostgreSQL服务正常运行"""
    # 首先检查连接
    if check_postgres_connection():
        return True
        
    # 连接失败，尝试重启服务
    logging.info("尝试重启PostgreSQL服务...")
    if restart_postgres_service():
        return True
        
    logging.error("无法启动PostgreSQL服务")
    return False

def execute_sql_with_timeout(conn, sql_content, timeout=60):  # 减少超时时间
    """使用超时机制执行SQL"""
    cur = conn.cursor()
    try:
        cur.execute(f"SET statement_timeout = {timeout * 1000};")
        cur.execute(sql_content)
        conn.commit()
        return True
    except Exception as e:
        conn.rollback()
        print(f"✗ SQL执行错误: {str(e)}")
        return False
    finally:
        cur.close()

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

def check_and_install_dependencies():
    """检查并安装必要的依赖包"""
    required_packages = {
        'psycopg2-binary': 'psycopg2-binary',
        'python-dotenv': 'python-dotenv',
        'psutil': 'psutil'
    }
    
    missing_packages = []
    installed_packages = {pkg.key for pkg in pkg_resources.working_set}
    
    for package, pip_name in required_packages.items():
        if package not in installed_packages:
            missing_packages.append(pip_name)
    
    if missing_packages:
        logging.info("正在安装必要的依赖包...")
        for package in missing_packages:
            try:
                logging.info(f"正在安装 {package}...")
                subprocess.check_call([sys.executable, '-m', 'pip', 'install', package])
                logging.info(f"{package} 安装成功")
            except subprocess.CalledProcessError as e:
                logging.error(f"安装 {package} 失败: {str(e)}")
                return False
    
    return True

def main():
    try:
        print("\n=== PostgreSQL评论系统部署工具 ===")
        start_total = time.time()
        
        # 确保PostgreSQL服务运行
        if not ensure_postgres_running():
            sys.exit(1)
            
        # 获取数据库配置并创建连接
        print("\n正在连接数据库...")
        db_config = get_db_config()
        conn = create_connection(db_config)
        print("✓ 数据库连接成功")
        
        # SQL文件列表
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
        
        # 获取当前脚本所在目录
        current_dir = os.path.dirname(os.path.abspath(__file__))
        
        # 执行SQL文件
        print("\n开始执行SQL脚本:")
        print("=" * 50)
        total_files = len(sql_files)
        
        for index, (sql_file, description) in enumerate(sql_files, 1):
            file_path = os.path.join(current_dir, sql_file)
            print(f"\n[{index}/{total_files}] {description}")
            
            if not os.path.exists(file_path):
                print(f"- 跳过: 文件不存在 ({sql_file})")
                continue
            
            start_time = time.time()
            sql_content = load_sql_file(file_path)
            
            if sql_content is None:
                print("- 跳过: 文件读取失败")
                continue
                
            print(f"- 执行中...")
            if not execute_sql_with_timeout(conn, sql_content):
                raise Exception(f"执行失败: {sql_file}")
                
            execution_time = time.time() - start_time
            print(f"✓ 完成 ({execution_time:.2f}秒)")
            
        total_time = time.time() - start_total
        print("\n" + "=" * 50)
        print(f"部署完成! 总耗时: {total_time:.2f}秒")
        
    except Exception as e:
        print(f"\n✗ 错误: {str(e)}")
        sys.exit(1)
    finally:
        if 'conn' in locals() and conn:
            conn.close()
            print("\n数据库连接已关闭")

if __name__ == "__main__":
    # 检查依赖
    print("检查依赖包...")
    if not check_and_install_dependencies():
        print("✗ 依赖包安装失败")
        sys.exit(1)
    print("✓ 依赖包检查完成")
    
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n用户中断，正在退出...")
        sys.exit(1) 