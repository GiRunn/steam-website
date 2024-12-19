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

def kill_process_safely(pid, process_name=None):
    """安全地结束进程"""
    try:
        process = psutil.Process(int(pid))
        if process_name and process.name() != process_name:
            return False
        process.terminate()
        return True
    except:
        return False

def handle_port_5432():
    """处理5432端口占用"""
    try:
        print("\n检查端口5432状态...")
        netstat = subprocess.run(
            ['netstat', '-ano', '|', 'findstr', ':5432'],
            capture_output=True,
            text=True,
            shell=True
        )
        
        if not netstat.stdout.strip():
            print("✓ 端口5432未被占用")
            return True
            
        # 收集占用端口的进程信息
        processes = {}
        for line in netstat.stdout.splitlines():
            if ':5432' in line:
                parts = line.split()
                if len(parts) >= 5:
                    pid = parts[4]
                    try:
                        process = psutil.Process(int(pid))
                        processes[pid] = process.name()
                    except:
                        processes[pid] = "未知进程"
        
        if not processes:
            print("✓ 未发现占用端口的进程")
            return True
            
        # 显示进程信息
        print("\n发现以下进程占用5432端口:")
        for pid, name in processes.items():
            print(f"  - {name} (PID: {pid})")
            
        # 询问用户是否要结束这些进程
        while True:
            choice = input("\n是否要结束这些进程来释放端口? (y/n): ").lower()
            if choice in ['y', 'n']:
                break
            print("请输入 y 或 n")
            
        if choice != 'y':
            print("\n已取消操作")
            return False
            
        # 结束进程
        success = False
        print("\n正在结束进程...")
        for pid, name in processes.items():
            if name.lower().startswith('postgres'):
                print(f"跳过PostgreSQL进程: {name} (PID: {pid})")
                continue
                
            if kill_process_safely(pid, name):
                print(f"✓ 已结束进程: {name} (PID: {pid})")
                success = True
            else:
                print(f"✗ 无法结束进程: {name} (PID: {pid})")
                
        # 等待端口释放
        if success:
            print("\n等待端口释放...")
            time.sleep(2)
            
            # 再次检查端口
            netstat = subprocess.run(
                ['netstat', '-ano', '|', 'findstr', ':5432'],
                capture_output=True,
                text=True,
                shell=True
            )
            
            if not netstat.stdout.strip():
                print("✓ 端口已成功释放")
                return True
                
            print("! 端口仍然被占用，可能需要手动处理")
            
        return False
        
    except Exception as e:
        print(f"✗ 处理端口时出错: {str(e)}")
        return False

def check_postgres_connection(timeout=5):
    """检查PostgreSQL连接是否正常，添加超时控制"""
    try:
        start_time = time.time()
        print("正在检查PostgreSQL连接...")
        
        # 创建带超时的连接
        db_config = get_db_config()
        db_config['connect_timeout'] = timeout  # 添加连接超时
        
        conn = psycopg2.connect(**db_config)
        conn.close()
        
        elapsed = time.time() - start_time
        print(f"✓ PostgreSQL连接正常 ({elapsed:.2f}秒)")
        return True
        
    except psycopg2.OperationalError as e:
        elapsed = time.time() - start_time
        if elapsed >= timeout:
            print(f"✗ PostgreSQL连接超时 ({elapsed:.2f}秒)")
            print("正在尝试启动服务...")
            return False
        print(f"✗ PostgreSQL连接失败: {str(e)}")
        return False
    except Exception as e:
        print(f"✗ PostgreSQL连接错误: {str(e)}")
        return False

def check_postgres_service_status():
    """详细检查PostgreSQL服务状态"""
    try:
        print("\n检查PostgreSQL服务状态...")
        service_check = subprocess.run(
            ['sc', 'query', 'postgresql-x64-17'],
            capture_output=True,
            text=True
        )
        
        if "不存在" in service_check.stderr or "不存在" in service_check.stdout:
            print("✗ PostgreSQL服务未安装")
            return "NOT_INSTALLED"
            
        if "STOPPED" in service_check.stdout:
            print("! PostgreSQL服务已停止")
            return "STOPPED"
            
        if "RUNNING" in service_check.stdout:
            print("✓ PostgreSQL服务正在运行")
            return "RUNNING"
            
        if "DISABLED" in service_check.stdout:
            print("✗ PostgreSQL服务已禁用")
            return "DISABLED"
            
        print(f"? 未知状态: {service_check.stdout}")
        return "UNKNOWN"
        
    except Exception as e:
        print(f"✗ 检查服务状态失败: {str(e)}")
        return "ERROR"

def check_port_5432():
    """检查5432端口状态"""
    try:
        print("\n检查端口5432状态...")
        netstat = subprocess.run(
            ['netstat', '-ano', '|', 'findstr', ':5432'],
            capture_output=True,
            text=True,
            shell=True
        )
        
        if netstat.stdout.strip():
            print("! 端口5432被占用:")
            for line in netstat.stdout.splitlines():
                if ':5432' in line:
                    parts = line.split()
                    if len(parts) >= 5:
                        pid = parts[4]
                        try:
                            process = psutil.Process(int(pid))
                            print(f"  - 进程: {process.name()} (PID: {pid})")
                        except:
                            print(f"  - PID: {pid}")
            return False
        else:
            print("✓ 端口5432未被占用")
            return True
            
    except Exception as e:
        print(f"✗ 检查端口失败: {str(e)}")
        return False

def enable_postgres_service():
    """启用PostgreSQL服务"""
    try:
        print("\n尝试启用PostgreSQL服务...")
        result = subprocess.run(
            ['sc', 'config', 'postgresql-x64-17', 'start=', 'auto'],
            capture_output=True,
            text=True
        )
        
        if result.returncode == 0:
            print("✓ 服务已启用")
            return True
        else:
            print(f"✗ 启用服务失败: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"✗ 启用服务失败: {str(e)}")
        return False

def restart_postgres_service():
    """重启PostgreSQL服务"""
    system = platform.system().lower()
    try:
        print("\n正在重启PostgreSQL服务...")
        
        if system == 'windows':
            # 检查服务状态
            status = check_postgres_service_status()
            
            if status == "NOT_INSTALLED":
                print("\n请先安装PostgreSQL服务:")
                print("1. 访问 https://www.postgresql.org/download/windows/")
                print("2. 下载并安装PostgreSQL")
                print("3. 确保安装时选择了PostgreSQL服务")
                return False
                
            if status == "DISABLED":
                if not enable_postgres_service():
                    return False
            
            # 检查端口
            if not check_port_5432():
                print("\n请先释放5432端口，或者修改PostgreSQL配置使用其他端口")
                return False
            
            # 停止服务
            if status == "RUNNING":
                print("1. 停止服务...")
                stop_result = subprocess.run(
                    ['net', 'stop', 'postgresql-x64-17'],
                    capture_output=True,
                    text=True
                )
                if stop_result.returncode != 0 and "已经停止" not in stop_result.stderr:
                    print(f"✗ 停止服务失败: {stop_result.stderr}")
                    return False
                time.sleep(2)
            
            # 启动服务
            print("2. 启动服务...")
            start_result = subprocess.run(
                ['net', 'start', 'postgresql-x64-17'],
                capture_output=True,
                text=True
            )
            
            if start_result.returncode != 0:
                if "已经启动" in start_result.stderr:
                    print("✓ 服务已经在运行")
                else:
                    print(f"✗ 启动服务失败，错误代码: {start_result.returncode}")
                    print(f"错误信息: {start_result.stderr}")
                    print("\n可能的解决方案:")
                    print("1. 检查PostgreSQL安装是否完整")
                    print("2. 检查数据目录权限")
                    print("3. 查看Windows事件查看器中的详细错误信息")
                    return False
                    
        elif system == 'linux':
            subprocess.run(['sudo', 'systemctl', 'restart', 'postgresql'], check=True)
            
        # 等待服务启动，使用递减的重试间隔
        retry_intervals = [3, 2, 1, 1, 1]
        print("3. 等待服务就绪...")
        
        for interval in retry_intervals:
            if check_postgres_connection(timeout=2):
                return True
            time.sleep(interval)
            
        print("✗ 服务启动超时")
        return False
        
    except Exception as e:
        print(f"✗ 重启服务失败: {str(e)}")
        return False

def ensure_postgres_running():
    """确保PostgreSQL服务正常运行"""
    # 首先快速检查连接
    if check_postgres_connection(timeout=5):
        return True
        
    # 连接失败，尝试重启服务
    print("\n服务未响应，尝试重启...")
    if restart_postgres_service():
        return True
        
    print("\n无法启动PostgreSQL服务，请检查:")
    print("1. PostgreSQL是否正确安装")
    print("2. 服务是否被禁用")
    print("3. 端口5432是否被占用")
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
            print("\n✗ 无法继续执行，请解决服务问题后重试")
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