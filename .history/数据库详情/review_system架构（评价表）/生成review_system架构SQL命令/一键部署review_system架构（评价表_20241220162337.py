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

def kill_process_safely(pid, process_name=None, force=False):
    """安全或强制结束进程"""
    try:
        process = psutil.Process(int(pid))
        if process_name and process.name() != process_name:
            return False
            
        if force:
            process.kill()  # 强制结束
        else:
            process.terminate()  # 正常结束
            
        return True
    except:
        return False

def force_kill_process(pid):
    """强制结束进程的终极方法"""
    try:
        # 使用taskkill强制结束进程及其子进程
        result = subprocess.run(
            ['taskkill', '/F', '/T', '/PID', str(pid)],
            capture_output=True,
            text=True
        )
        return result.returncode == 0
    except:
        return False

def terminate_postgres_connections():
    """通过PostgreSQL命令终止所有数据库连接"""
    try:
        print("\n尝试通过PostgreSQL终止现有连接...")
        
        # 使用postgres超级用户连接
        superuser_config = {
            'dbname': 'postgres',  # 连接到默认数据库
            'user': 'postgres',
            'password': '123qweasdzxc..a',
            'host': 'localhost',
            'port': '5432',
            'connect_timeout': 3
        }
        
        try:
            conn = psycopg2.connect(**superuser_config)
            conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
            cur = conn.cursor()
            
            # 终止除了自己以外的所有连接
            cur.execute("""
                SELECT pg_terminate_backend(pid) 
                FROM pg_stat_activity 
                WHERE pid != pg_backend_pid()
                AND datname IS NOT NULL;
            """)
            
            print("✓ 已终止所有现有连接")
            cur.close()
            conn.close()
            return True
            
        except psycopg2.Error as e:
            print(f"✗ 无法终止连接: {str(e)}")
            return False
            
    except Exception as e:
        print(f"✗ 终止连接时出错: {str(e)}")
        return False

def restart_postgres_clean():
    """完全重启PostgreSQL服务"""
    try:
        print("\n开始重启PostgreSQL服务...")
        
        # 1. 尝试正常终止连接
        terminate_postgres_connections()
        time.sleep(2)
        
        # 2. 停止服务
        print("\n停止PostgreSQL服务...")
        stop_result = subprocess.run(
            ['net', 'stop', 'postgresql-x64-17'],
            capture_output=True,
            text=True
        )
        
        if stop_result.returncode != 0 and "已经停止" not in stop_result.stderr:
            print("! 服务停止失败，尝试强制结束进程...")
            # 强制结束所有PostgreSQL相关进程
            subprocess.run(
                'taskkill /F /IM postgres.exe /T',
                shell=True,
                capture_output=True
            )
        
        time.sleep(3)
        
        # 3. 启动服务
        print("\n启动PostgreSQL服务...")
        start_result = subprocess.run(
            ['net', 'start', 'postgresql-x64-17'],
            capture_output=True,
            text=True
        )
        
        if start_result.returncode == 0:
            print("✓ PostgreSQL服务已重启")
            time.sleep(5)  # 等待服务完全启动
            return True
        else:
            print(f"✗ 服务启动失败: {start_result.stderr}")
            return False
            
    except Exception as e:
        print(f"✗ 重启服务时出错: {str(e)}")
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
            
        # 尝试通过PostgreSQL命令终止连接
        if terminate_postgres_connections():
            time.sleep(2)
            # 重新检查端口
            netstat = subprocess.run(
                ['netstat', '-ano', '|', 'findstr', ':5432'],
                capture_output=True,
                text=True,
                shell=True
            )
            if not netstat.stdout.strip():
                print("✓ 端口已释放")
                return True
        
        # 如果还是无法释放端口，尝试完全重启服务
        print("\n尝试重启PostgreSQL服务...")
        if restart_postgres_clean():
            return True
            
        # 如果以上方法都失败，则显示进程信息并提供选项
        print("\n无法自动释放端口，发现以下进程:")
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
            
        # 询问用户操作选择
        while True:
            print("\n请选择操作:")
            print("1. 安全结束进程 (推荐)")
            print("2. 强制结束进程")
            print("3. 终极强制结束 (危险)")
            print("4. 取消操作")
            choice = input("请输入选项 (1/2/3/4): ").strip()
            
            if choice in ['1', '2', '3', '4']:
                break
            print("无效的选择，请重试")
            
        if choice == '4':
            print("\n已取消操作")
            return False
            
        force_kill = (choice == '2')
        ultimate_kill = (choice == '3')
        
        if ultimate_kill:
            print("\n警告: 即将强制终止所有相关进程及其子进程！")
            print("这可能导致数据丢失或系统不稳定！")
            confirm = input("确定要继续吗? (y/n): ").lower()
            if confirm != 'y':
                print("\n已取消操作")
                return False
            
        # 结束进程
        success = False
        print("\n正在结束进程...")
        
        for pid, name in processes.items():
            if name.lower().startswith('postgres'):
                print(f"跳过PostgreSQL进程: {name} (PID: {pid})")
                continue
                
            if ultimate_kill:
                if force_kill_process(pid):
                    print(f"✓ 已强制终止进程及其子进程: {name} (PID: {pid})")
                    success = True
                else:
                    print(f"✗ 无法终止进程: {name} (PID: {pid})")
            elif force_kill:
                if kill_process_safely(pid, name, force=True):
                    print(f"✓ 已强制结束进程: {name} (PID: {pid})")
                    success = True
                else:
                    print(f"✗ 无法结束进程: {name} (PID: {pid})")
            else:
                if kill_process_safely(pid, name, force=False):
                    print(f"✓ 已安全结束进程: {name} (PID: {pid})")
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
                
            if ultimate_kill:
                print("! 正在使用终极方式清理所有相关进程...")
                # 使用更强力的方式结束所有相关进程
                subprocess.run(
                    'for /f "tokens=5" %a in (\'netstat -aon ^| findstr ":5432"\') do taskkill /F /T /PID %a',
                    shell=True,
                    capture_output=True
                )
                time.sleep(2)
                
                # 最终检查
                netstat = subprocess.run(
                    ['netstat', '-ano', '|', 'findstr', ':5432'],
                    capture_output=True,
                    text=True,
                    shell=True
                )
                if not netstat.stdout.strip():
                    print("✓ 端口已强制释放")
                    return True
                    
            print("! 端口仍然被占用，建议:")
            print("1. 使用终极强制结束选项")
            print("2. 在任务管理器中手动结束进程")
            print("3. 重启系统")
            
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
            
            # 处理端口占用
            if not handle_port_5432():
                print("\n提示: 您可以:")
                print("1. 手动结束占用端口的进程")
                print("2. 修改PostgreSQL配置使用其他端口")
                print("3. 检查是否有其他PostgreSQL实例在运行")
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

def verify_deployment():
    """验证部署是否成功"""
    verification_steps = [
        ("检查表结构", "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'review_system'"),
        ("检查触发器", "SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_schema = 'review_system'"),
        ("检查索引", "SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'review_system'"),
        ("检查分区", "SELECT COUNT(*) FROM pg_partitions WHERE schemaname = 'review_system'"),
        ("检查权限", "SELECT COUNT(*) FROM information_schema.role_table_grants WHERE table_schema = 'review_system'")
    ]
    
    success = True
    for step_name, query in verification_steps:
        try:
            # 执行验证查询
            result = execute_query(query)
            if result > 0:
                print(f"✓ {step_name}通过")
            else:
                print(f"✗ {step_name}失败")
                success = False
        except Exception as e:
            print(f"✗ {step_name}出错: {str(e)}")
            success = False
    
    return success

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
            ('create_monitoring_tables.sql', '创建监控历史表'),
            ('create_partition_maintenance.sql', '创建分区维护'),
            ('create_partition_functions.sql', '创建分区函数'),
            ('create_triggers.sql', '创建触发器'),
            ('create_indexes.sql', '创建索引'),
            ('create_initial_partitions.sql', '创建初始分区'),
            ('test_review_system.sql', '测试系统'),
            ('create_performance_config.sql', '创建性能配置'),
            ('optimize_partition_strategy.sql', '优化分区策略'),
            ('setup_read_write_split.sql', '设置读写分离'),
            ('create_security_features.sql', '创建安全特性'),
            ('create_performance_optimizations.sql', '创建性能优化'),
            ('create_monitoring_alerts.sql', '创建监控告警'),
            ('create_backup_features.sql', '创建备份功能')
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
        
        # 验证部署是否成功
        if verify_deployment():
            print("部署验证通过！")
        else:
            print("部署验证失败，请检查日志")
        
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