import psycopg2
import logging
import time
import random
import string
import concurrent.futures
import json
import sys
import os
from datetime import datetime, timedelta
import requests
import socket
import threading
import queue
import hashlib
import re
from typing import List, Dict, Any, Tuple
import sqlparse
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass
from enum import Enum
import numpy as np
from decimal import Decimal
import psycopg2.extensions

# 配置日志记录
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(f'test_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)

# 创建全局logger
logger = logging.getLogger(__name__)

# 设置文件编码
import sys
sys.stdout.reconfigure(encoding='utf-8')

class TestType(Enum):
    """测试类型枚举"""
    SECURITY = "安全测试"
    PERFORMANCE = "性能测试"
    BUSINESS = "业务测试"
    STRESS = "压力测试"
    INJECTION = "注入测试"
    BACKUP = "备份恢复测试"
    PARTITION = "分区测试"
    CONCURRENT = "并发测试"

@dataclass
class TestResult:
    """测试结果数据类"""
    test_type: TestType
    test_name: str
    status: bool
    message: str
    duration: float
    details: Dict[str, Any] = None

class DatabaseTestFramework:
    """数据库测试框架主类"""
    
    def __init__(self, db_config: Dict[str, str]):
        """
        初始化测试框架
        
        Args:
            db_config: 数据库配置字典
        """
        self.db_config = db_config
        self.test_results: List[TestResult] = []
        self.logger = logging.getLogger(__name__)
        self.connection_pool = queue.Queue(maxsize=10)
        self.max_retries = 3
        self.retry_delay = 1  # 秒
        
        # 测试数据库连接并初始化环境
        try:
            test_conn = psycopg2.connect(**self.db_config)
            if not check_and_create_schema(test_conn):
                raise Exception("Schema检查/创建失败")
            if not init_database_objects(test_conn):
                raise Exception("数据库对象初始化失败")
            test_conn.close()
        except Exception as e:
            self.logger.error(f"数据库初始化失败: {str(e)}")
            raise
            
        # 初始化连接池
        try:
            self._init_connection_pool()
        except Exception as e:
            self.logger.error(f"初始化连接池失败: {str(e)}")
            raise

    def _init_connection_pool(self):
        """初始化数据库连接池"""
        for _ in range(10):
            try:
                conn = psycopg2.connect(**self.db_config)
                self.connection_pool.put(conn)
            except Exception as e:
                self.logger.error(f"创建连接失败: {str(e)}")
                raise

    def get_connection(self) -> psycopg2.extensions.connection:
        """从连接池获取连接"""
        return self.connection_pool.get()

    def release_connection(self, conn: psycopg2.extensions.connection):
        """释放连接回连接池"""
        if not conn.closed:
            self.connection_pool.put(conn)

    def run_test(self, test_func, test_type: TestType, test_name: str, **kwargs) -> TestResult:
        """运行单个测试并记录结果"""
        start_time = time.time()
        try:
            conn = self.get_connection()
            result = test_func(conn, **kwargs)
            
            # 修改判断逻辑
            success = True
            if isinstance(result, dict):
                # 检查详细结果中是否有失败项
                if 'summary' in result:
                    if 'passed_tests' in result['summary'] and 'total_tests' in result['summary']:
                        success = result['summary']['passed_tests'] == result['summary']['total_tests']
                # 检查是否有任何子测试失败
                if 'details' in result:
                    for detail in result.get('details', []):
                        if detail.get('status') == '失败':
                            success = False
                            break
            
            message = "测试通过" if success else "测试失败"
            details = result if isinstance(result, dict) else None
            
        except Exception as e:
            success = False
            message = f"测试失败: {str(e)}"
            details = {
                "error_type": type(e).__name__,
                "error_message": str(e),
                "traceback": sys.exc_info()[2]
            }
            self.logger.error(f"{test_name} 失败: {str(e)}", exc_info=True)
        finally:
            self.release_connection(conn)

        duration = time.time() - start_time
        test_result = TestResult(
            test_type=test_type,
            test_name=test_name,
            status=success,
            message=message,
            duration=duration,
            details=details
        )
        self.test_results.append(test_result)
        return test_result

    def generate_report(self) -> Dict[str, Any]:
        """
        生成测试报告
        
        Returns:
            Dict: 包含测试结果的详细报告
        """
        report = {
            "test_summary": {
                "total_tests": len(self.test_results),
                "passed_tests": sum(1 for r in self.test_results if r.status),
                "failed_tests": sum(1 for r in self.test_results if not r.status),
                "total_duration": sum(r.duration for r in self.test_results)
            },
            "test_results": []
        }

        # 按测试类型分组结果
        for test_type in TestType:
            type_results = [r for r in self.test_results if r.test_type == test_type]
            if type_results:
                type_summary = {
                    "test_type": test_type.value,
                    "total": len(type_results),
                    "passed": sum(1 for r in type_results if r.status),
                    "failed": sum(1 for r in type_results if not r.status),
                    "duration": sum(r.duration for r in type_results),
                    "details": [
                        {
                            "name": r.test_name,
                            "status": "通过" if r.status else "失败",
                            "message": r.message,
                            "duration": f"{r.duration:.2f}秒",
                            "details": r.details
                        }
                        for r in type_results
                    ]
                }
                report["test_results"].append(type_summary)

        return report

    def save_report(self, report: Dict[str, Any], filename: str):
        """保存测试报告到文件"""
        try:
            # 确保所有数据都是可JSON序列化的
            def clean_for_json(obj):
                if isinstance(obj, (datetime, timedelta)):
                    return str(obj)
                elif isinstance(obj, np.float64):
                    return float(obj)
                elif isinstance(obj, np.int64):
                    return int(obj)
                elif isinstance(obj, Exception):
                    return str(obj)
                elif hasattr(obj, '__dict__'):
                    return str(obj)
                return obj

            # 清理报告数据
            cleaned_report = json.loads(
                json.dumps(report, default=clean_for_json)
            )

            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(cleaned_report, f, ensure_ascii=False, indent=2)
                
        except Exception as e:
            self.logger.error(f"保存测试报告失败: {str(e)}")
            # 不抛出异常，继续执行

    def execute_with_retry(self, func, *args, **kwargs):
        """使用重试机制执行数据库操作"""
        for attempt in range(self.max_retries):
            try:
                return func(*args, **kwargs)
            except psycopg2.Error as e:
                if attempt == self.max_retries - 1:
                    raise
                time.sleep(self.retry_delay)
                continue

    def generate_test_report(self, results: Dict[str, Any]) -> None:
        """生成更详细的测试报告"""
        report_time = datetime.now().strftime("%Y%m%d_%H%M%S")
        report_file = f"test_report_{report_time}.json"
        
        try:
            with open(report_file, 'w', encoding='utf-8') as f:
                json.dump(results, f, ensure_ascii=False, indent=2)
            logger.info(f"测试报告已生成: {report_file}")
        except Exception as e:
            logger.error(f"生成测试报告失败: {str(e)}")

    def save_test_data(self, conn: psycopg2.extensions.connection, result_dir: str) -> None:
        """保存测试数据到文件"""
        cursor = conn.cursor()
        data_dir = os.path.join(result_dir, "test_data")
        os.makedirs(data_dir, exist_ok=True)
        
        try:
            # 设置搜索路径
            cursor.execute("SET search_path TO review_system, public;")
            
            # 保存reviews表数据
            cursor.execute("""
                SELECT * FROM reviews_partitioned 
                ORDER BY created_at DESC LIMIT 1000
            """)
            reviews = cursor.fetchall()
            
            # 获取列名
            cursor.execute("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_schema = 'review_system' 
                AND table_name = 'reviews_partitioned'
                ORDER BY ordinal_position
            """)
            columns = [col[0] for col in cursor.fetchall()]
            
            # 保存为CSV文件
            reviews_file = os.path.join(data_dir, "test_reviews.csv")
            with open(reviews_file, 'w', encoding='utf-8') as f:
                # 写入列头
                f.write(','.join(columns) + '\n')
                # 写入数据
                for row in reviews:
                    f.write(','.join(str(val) for val in row) + '\n')
            
            # 保存分区信息
            cursor.execute("""
                SELECT 
                    t.schemaname || '.' || t.tablename as partition_name,
                    pg_size_pretty(pg_relation_size(t.schemaname || '.' || t.tablename)) as size,
                    s.n_live_tup as live_tuples
                FROM pg_tables t
                LEFT JOIN pg_stat_user_tables s ON t.tablename = s.relname
                WHERE t.schemaname = 'review_system'
                AND t.tablename LIKE 'reviews_y%'
            """)
            partitions = cursor.fetchall()
            
            partitions_file = os.path.join(data_dir, "test_partitions.csv")
            with open(partitions_file, 'w', encoding='utf-8') as f:
                f.write('partition_name,size,live_tuples\n')
                for row in partitions:
                    f.write(','.join(str(val) for val in row) + '\n')
            
            # 保存测试过程中的关键指标
            cursor.execute("""
                SELECT 
                    current_timestamp as snapshot_time,
                    (SELECT count(*) FROM reviews_partitioned) as total_reviews,
                    (SELECT avg(rating) FROM reviews_partitioned) as avg_rating,
                    (SELECT count(*) FROM review_replies_partitioned) as total_replies,
                    (SELECT count(DISTINCT user_id) FROM reviews_partitioned) as unique_users
            """)
            metrics = cursor.fetchone()
            
            metrics_file = os.path.join(data_dir, "test_metrics.json")
            with open(metrics_file, 'w', encoding='utf-8') as f:
                json.dump({
                    'snapshot_time': str(metrics[0]),
                    'total_reviews': metrics[1],
                    'avg_rating': float(metrics[2]) if metrics[2] else 0,
                    'total_replies': metrics[3],
                    'unique_users': metrics[4]
                }, f, indent=2)
                
            self.logger.info(f"测试数据已保存到: {data_dir}")
            
        except Exception as e:
            self.logger.error(f"保存测试数据失败: {str(e)}")
            # 记录更详细的错误信息
            self.logger.error("错误详情:", exc_info=True)

    def create_adverse_conditions(self, conn: psycopg2.extensions.connection) -> Dict[str, Any]:
        """创建恶劣的测试环境并返回测试结果"""
        cursor = conn.cursor()
        results = []
        dummy_connections = []
        
        try:
            # 1. 测试连接池压力
            self.logger.info("创建大量无效连接...")
            successful_connections = 0
            for _ in range(50):
                try:
                    dummy_conn = psycopg2.connect(**self.db_config)
                    dummy_connections.append(dummy_conn)
                    successful_connections += 1
                except:
                    pass
            
            results.append({
                "test": "连接池压力测试",
                "status": "通过" if successful_connections > 40 else "失败",
                "details": {
                    "attempted_connections": 50,
                    "successful_connections": successful_connections,
                    "failure_rate": f"{((50-successful_connections)/50)*100:.1f}%"
                }
            })

            # 2. 测试数据库高负载
            self.logger.info("模拟数据库高负载...")
            start_time = time.time()
            cursor.execute("""
                WITH RECURSIVE heavy_query AS (
                    SELECT 1 as n
                    UNION ALL
                    SELECT n + 1 FROM heavy_query WHERE n < 1000000
                )
                SELECT count(*) FROM heavy_query;
            """)
            load_time = time.time() - start_time
            
            results.append({
                "test": "高负载测试",
                "status": "通过" if load_time < 5 else "需优化",
                "details": {
                    "execution_time": f"{load_time:.2f}秒",
                    "query_type": "递归查询",
                    "data_volume": "1,000,000行"
                }
            })

            # 3. 测试大量数据写入
            self.logger.info("插入大量测试数据...")
            test_data = []
            start_time = time.time()
            for i in range(10000):
                test_data.append((
                    random.randint(1, 100),
                    random.randint(1, 1000),
                    Decimal(str(round(random.uniform(1, 5), 2))),
                    ''.join(random.choices(string.ascii_letters + string.digits, k=1000)),
                    random.randint(1, 1000),
                    random.choice(['PC', 'PS5', 'XBOX']),
                    random.choice(['zh-CN', 'en-US', 'ja-JP'])
                ))
            
            cursor.executemany("""
                INSERT INTO review_system.reviews_partitioned 
                (game_id, user_id, rating, content, playtime_hours, platform, language)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, test_data)
            insert_time = time.time() - start_time
            
            results.append({
                "test": "大量数据写入测试",
                "status": "通过" if insert_time < 30 else "需优化",
                "details": {
                    "records_inserted": len(test_data),
                    "execution_time": f"{insert_time:.2f}秒",
                    "insertion_rate": f"{len(test_data)/insert_time:.1f}条/秒"
                }
            })

            # 4. 测试网络延迟
            self.logger.info("模拟网络问题...")
            network_tests = []
            for i in range(10):
                start_time = time.time()
                time.sleep(random.uniform(0.1, 0.5))
                cursor.execute("SELECT 1")
                latency = time.time() - start_time
                network_tests.append(latency)
            
            avg_latency = sum(network_tests) / len(network_tests)
            results.append({
                "test": "网络延迟测试",
                "status": "通过" if avg_latency < 0.3 else "需优化",
                "details": {
                    "average_latency": f"{avg_latency:.3f}秒",
                    "max_latency": f"{max(network_tests):.3f}秒",
                    "min_latency": f"{min(network_tests):.3f}秒",
                    "test_count": len(network_tests)
                }
            })

            # 5. 测试并发写入
            self.logger.info("创建并发写入压力...")
            concurrent_results = []
            with ThreadPoolExecutor(max_workers=20) as executor:
                futures = []
                for _ in range(100):
                    futures.append(executor.submit(self._concurrent_stress_write, conn))
                
                for future in concurrent.futures.as_completed(futures):
                    try:
                        result = future.result()
                        concurrent_results.append(result)
                    except Exception as e:
                        concurrent_results.append({"success": False, "error": str(e)})

            success_rate = sum(1 for r in concurrent_results if r.get("success", False)) / len(concurrent_results)
            results.append({
                "test": "并发写入测试",
                "status": "通过" if success_rate >= 0.9 else "失败",
                "details": {
                    "total_operations": len(concurrent_results),
                    "successful_operations": sum(1 for r in concurrent_results if r.get("success", False)),
                    "success_rate": f"{success_rate*100:.1f}%",
                    "errors": [r["error"] for r in concurrent_results if not r.get("success", False)]
                }
            })

            conn.commit()
            self.logger.info("✓ 恶劣环境测试完成")
            
        except Exception as e:
            self.logger.error(f"创建恶劣环境失败: {str(e)}")
            conn.rollback()
            results.append({
                "test": "恶劣环境测试",
                "status": "错误",
                "error": str(e)
            })
        finally:
            # 清理无效连接
            for dummy_conn in dummy_connections:
                try:
                    dummy_conn.close()
                except:
                    pass

        return {
            "adverse_condition_tests": results,
            "summary": {
                "total_tests": len(results),
                "passed_tests": sum(1 for r in results if r["status"] == "通过"),
                "failed_tests": sum(1 for r in results if r["status"] == "失败"),
                "needs_optimization": sum(1 for r in results if r["status"] == "需优化"),
                "errors": sum(1 for r in results if r["status"] == "错误")
                "successful_restores": sum(1 for r in results if r["status"] == "通过")
            }
        }

class PartitionTester:
    """分区测试类"""
    
    def __init__(self, framework: DatabaseTestFramework):
        self.framework = framework
        self.logger = logging.getLogger(__name__)

    def test_partition_creation(self, conn: psycopg2.extensions.connection) -> Dict[str, Any]:
        """测试分区创建功能"""
        results = []
        cursor = conn.cursor()

        try:
            # 创建未来36个月的分区
            self.logger.info("开始创建未来36个月的分区...")
            cursor.execute("""
                SELECT review_system.create_future_partitions(36)
            """)
            
            # 验证分区是否创建
            cursor.execute("""
                SELECT t.schemaname || '.' || t.tablename as partition_name
                FROM pg_tables t
                WHERE t.schemaname = 'review_system'
                AND t.tablename LIKE 'reviews_y%'
                ORDER BY t.tablename DESC
            """)
            
            partitions = cursor.fetchall()
            self.logger.info(f"成功创建 {len(partitions)} 个分区")
            
            for partition in partitions:
                results.append({
                    "test": "未来分区创建",
                    "partition": partition[0],
                    "status": "通过",
                    "message": f"成功创建分区: {partition[0]}"
                })
                
            conn.commit()
            
        except Exception as e:
            conn.rollback()
            self.logger.error(f"分区创建失败: {str(e)}")
            results.append({
                "test": "分区创建",
                "status": "错误",
                "error": str(e)
            })
            
        return {
            "partition_creation_tests": results,
            "summary": {
                "total_tests": len(results),
                "successful_tests": sum(1 for r in results if r["status"] == "通过")
            }
        }

    def test_partition_maintenance(self, conn: psycopg2.extensions.connection) -> Dict[str, Any]:
        """
        测试分区维护功能
        
        Args:
            conn: 数据库连接
            
        Returns:
            Dict: 测试结果详情
        """
        results = []
        cursor = conn.cursor()

        try:
            # 修改查询语句，使用正确的系统表和字段
            cursor.execute("""
                SELECT 
                    t.schemaname || '.' || t.tablename as partition_name,
                    pg_size_pretty(pg_relation_size(t.schemaname || '.' || t.tablename)) as size,
                    s.n_live_tup as live_tuples,
                    s.n_dead_tup as dead_tuples,
                    s.last_vacuum,
                    s.last_analyze
                FROM pg_stat_user_tables s
                JOIN pg_tables t ON s.relname = t.tablename AND s.schemaname = t.schemaname
                WHERE t.schemaname = 'review_system'
                AND t.tablename LIKE 'reviews_y%'
                ORDER BY t.tablename DESC
                LIMIT 5
            """)
            
            partition_stats = cursor.fetchall()
            for partition in partition_stats:
                results.append({
                    "partition": partition[0],
                    "size": partition[1],
                    "live_tuples": partition[2] or 0,  # 处理NULL值
                    "dead_tuples": partition[3] or 0,  # 处理NULL值
                    "last_vacuum": partition[4],
                    "last_analyze": partition[5],
                    "status": "需要维护" if (partition[3] or 0) > (partition[2] or 0) * 0.1 else "正常",
                    "message": "死元组比例过高" if (partition[3] or 0) > (partition[2] or 0) * 0.1 
                             else "分区状态良好"
                })

            return {
                "partition_maintenance_tests": results,
                "summary": {
                    "total_tests": len(results),
                    "healthy_partitions": sum(1 for r in results if r["status"] == "正常"),
                    "partitions_needing_maintenance": sum(1 for r in results if r["status"] == "需要维护")
                }
            }
            
        except Exception as e:
            results.append({
                "test": "分区维护",
                "status": "错误",
                "error": str(e)
            })
            return {
                "partition_maintenance_tests": results,
                "summary": {
                    "total_tests": 1,
                    "healthy_partitions": 0,
                    "partitions_needing_maintenance": 0
                }
            }

def check_and_create_schema(conn: psycopg2.extensions.connection):
    """检查并创建必要的schema"""
    try:
        cursor = conn.cursor()
        cursor.execute("CREATE SCHEMA IF NOT EXISTS review_system")
        conn.commit()
        cursor.close()
        logger.info("✓ Schema检查/创建成功")
        return True
    except Exception as e:
        logger.error(f"Schema检查/创建失败: {str(e)}")
        return False

def check_and_install_dependencies():
    """检查并安装所需的依赖包"""
    required_packages = [
        'requests',
        'psycopg2-binary',
        'numpy',
        'python-dotenv'
    ]
    
    try:
        import pip
        for package in required_packages:
            try:
                __import__(package)
                print(f"✓ {package} 已安装")
            except ImportError:
                print(f"正在安装 {package}...")
                pip.main(['install', package])
        return True
    except Exception as e:
        print(f"安装依赖包时出错: {str(e)}")
        return False

def init_database_objects(conn: psycopg2.extensions.connection) -> bool:
    """初始化数据库对象"""
    try:
        cursor = conn.cursor()
        
        # 获取当前脚本所在目录
        current_dir = os.path.dirname(os.path.abspath(__file__))
        parent_dir = os.path.dirname(current_dir)
        sql_dir = os.path.join(parent_dir, "生成review_system架构SQL命令")
        
        # 首先执行清理脚本
        logger.info("清理现有数据库对象...")
        try:
            cursor.execute("""
                DROP SCHEMA IF EXISTS review_system CASCADE;
                CREATE SCHEMA review_system;
            """)
            conn.commit()
            logger.info("✓ 成功清理并重建schema")
        except Exception as e:
            logger.error(f"清理schema失败: {str(e)}")
            return False
            
        # 按顺序执行SQL文件
        sql_files = [
            'create_review_tables.sql',
            'create_partition_maintenance.sql',
            'create_partition_functions.sql',
            'create_triggers.sql',
            'create_indexes.sql',
            'create_monitoring_tables.sql',
            'create_monitoring_alerts.sql',
            'create_backup_features.sql',
            'create_security_features.sql',
            'create_performance_optimizations.sql'
        ]
        
        for sql_file in sql_files:
            file_path = os.path.join(sql_dir, sql_file)
            if os.path.exists(file_path):
                logger.info(f"执行SQL文件: {sql_file}")
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        sql_content = f.read()
                        cursor.execute(sql_content)
                        conn.commit()
                    logger.info(f"✓ 成功执行: {sql_file}")
                except Exception as e:
                    logger.error(f"执行 {sql_file} 失败: {str(e)}")
                    return False
            else:
                logger.warning(f"找不到SQL文件: {file_path}")
        
        # 创建初始分区
        logger.info("创建初始分区...")
        try:
            # 直接使用create_future_partitions函数创建分区
            cursor.execute("SELECT review_system.create_future_partitions(3)")
            conn.commit()
            logger.info("✓ 成功创建初始分区")
        except Exception as e:
            logger.error(f"创建初始分区失败: {str(e)}")
            return False
        
        return True
        
    except Exception as e:
        logger.error(f"初始化数据库对象失败: {str(e)}")
        conn.rollback()
        return False

def main():
    """主函数:运行所有测试并生成报告"""
    
    # 从环境变量获取测试结果目录
    result_dir = os.environ.get('TEST_RESULT_DIR')
    if not result_dir:
        # 如果没有传入目录，则创建新的
        current_date = datetime.now().strftime("%Y年%m月%d日")
        test_dir = f"review_system架构测试{current_date}"
        test_count = 1
        
        while os.path.exists(test_dir + f"第{test_count}份"):
            test_count += 1
        
        result_dir = test_dir + f"第{test_count}份"
        os.makedirs(result_dir, exist_ok=True)
    
    # 创建日志目录
    log_dir = os.path.join(result_dir, "logs")
    os.makedirs(log_dir, exist_ok=True)
    
    # 修改日志和报告文件的保存路径
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler(os.path.join(log_dir, f'test_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log'), encoding='utf-8'),
            logging.StreamHandler()
        ]
    )
    
    # 设置setup日志文件路径
    setup_log_file = os.path.join(log_dir, f'setup_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log')
    setup_logger = logging.getLogger('setup')
    setup_logger.setLevel(logging.INFO)
    setup_handler = logging.FileHandler(setup_log_file, encoding='utf-8')
    setup_handler.setFormatter(logging.Formatter('%(asctime)s - %(levelname)s - %(message)s'))
    setup_logger.addHandler(setup_handler)
    
    # 数据库配置
    db_config = {
        'dbname': 'postgres',
        'user': 'postgres',
        'password': '123qweasdzxc..a',
        'host': 'localhost',
        'port': '5432'
    }

    try:
        # 初始化测试框架
        framework = DatabaseTestFramework(db_config)
        # 使用全局logger，不需要重新创建
        logger.info("开始数据库自动化测试...")

        # 初始化所有测试类
        security_tester = SecurityTester(framework)
        performance_tester = PerformanceTester(framework)
        business_tester = BusinessTester(framework)
        stress_tester = StressTester(framework)
        concurrency_tester = ConcurrencyTester(framework)
        backup_tester = BackupTester(framework)
        partition_tester = PartitionTester(framework)

        # 创建恶劣测试环境
        logger.info("创建恶劣测试环境...")
        conn = framework.get_connection()
        try:
            framework.create_adverse_conditions(conn)
        finally:
            framework.release_connection(conn)

        # 运行安全测试
        logger.info("执行安全测试...")
        framework.run_test(
            security_tester.test_access_control,
            TestType.SECURITY,
            "访问控制测试"
        )
        framework.run_test(
            security_tester.test_data_encryption,
            TestType.SECURITY,
            "数据加密测试"
        )

        # 运行性能测试
        logger.info("执行性能测试...")
        framework.run_test(
            performance_tester.test_query_performance,
            TestType.PERFORMANCE,
            "查询性能测试"
        )
        framework.run_test(
            performance_tester.test_index_effectiveness,
            TestType.PERFORMANCE,
            "索引效果测试"
        )
        framework.run_test(
            performance_tester.test_partition_performance,
            TestType.PERFORMANCE,
            "分区性能测试"
        )

        # 运行业务测试
        logger.info("执行业务逻辑测试...")
        framework.run_test(
            business_tester.test_review_crud,
            TestType.BUSINESS,
            "评论CRUD测试"
        )
        framework.run_test(
            business_tester.test_review_summary_update,
            TestType.BUSINESS,
            "评论汇总更新测试"
        )

        # 运行压力测试
        logger.info("执行压力测试...")
        framework.run_test(
            stress_tester.test_high_load,
            TestType.STRESS,
            "高负载测试"
        )
        framework.run_test(
            stress_tester.test_resource_limits,
            TestType.STRESS,
            "资源限制测试"
        )

        # 运行并发测试
        logger.info("执行并发测试...")
        framework.run_test(
            concurrency_tester.test_concurrent_writes,
            TestType.CONCURRENT,
            "并发写入测试"
        )
        framework.run_test(
            concurrency_tester.test_deadlock_prevention,
            TestType.CONCURRENT,
            "死锁预防测试"
        )

        # 运行备份测试
        logger.info("执行备份测试...")
        framework.run_test(
            backup_tester.test_backup_creation,
            TestType.BACKUP,
            "备份创建测试"
        )
        framework.run_test(
            backup_tester.test_backup_restore,
            TestType.BACKUP,
            "备份恢复测试"
        )

        # 运行分区测试
        logger.info("执行分区测试...")
        framework.run_test(
            partition_tester.test_partition_creation,
            TestType.PARTITION,
            "分区创建测试"
        )
        framework.run_test(
            partition_tester.test_partition_maintenance,
            TestType.PARTITION,
            "分区维护测试"
        )

        # 生成测试报告
        logger.info("生成测试报告...")
        report = framework.generate_report()
        
        # 保存HTML格式报告
        report_file = os.path.join(result_dir, f"test_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}")
        framework.save_report(report, f"{report_file}.json")
        generate_html_report(report, f"{report_file}.html")
        
        logger.info(f"测试完成! 报告已保存到: {report_file}.json 和 {report_file}.html")
        
        # 输出测试摘要
        print("\n=== 测试摘要 ===")
        print(f"总测试数: {report['test_summary']['total_tests']}")
        print(f"通过测试: {report['test_summary']['passed_tests']}")
        print(f"失败测试: {report['test_summary']['failed_tests']}")
        print(f"总耗时: {report['test_summary']['total_duration']:.2f}秒")
        
        # 检查是否有失败的测试
        if report['test_summary']['failed_tests'] > 0:
            print("\n警告: 存在失败的测试!")
            sys.exit(1)
            
        # 生成测试报告后，保存测试数据
        logger.info("保存测试数据...")
        conn = framework.get_connection()
        try:
            framework.save_test_data(conn, result_dir)
        finally:
            framework.release_connection(conn)
        
    except Exception as e:
        logger.error(f"测试过程中出错: {str(e)}", exc_info=True)
        sys.exit(1)

def generate_html_report(report: Dict[str, Any], filename: str):
    """生成HTML格式的测试报告"""
    html_content = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>数据库测试报告</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .summary { background: #f0f0f0; padding: 15px; margin-bottom: 20px; }
            .test-type { margin-bottom: 30px; }
            .test-case { margin: 10px 0; padding: 10px; border: 1px solid #ddd; }
            .pass { color: green; }
            .fail { color: red; }
            .warning { color: orange; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
        </style>
    </head>
    <body>
        <h1>数据库测试报告</h1>
    """

    # 添加摘要信息
    html_content += f"""
        <div class="summary">
            <h2>测试摘要</h2>
            <p>总测试数: {report['test_summary']['total_tests']}</p>
            <p>通过测试: {report['test_summary']['passed_tests']}</p>
            <p>失败测试: {report['test_summary']['failed_tests']}</p>
            <p>总耗时: {report['test_summary']['total_duration']:.2f}秒</p>
        </div>
    """

    # 添加详细测试结果
    for test_type in report['test_results']:
        html_content += f"""
            <div class="test-type">
                <h2>{test_type['test_type']}</h2>
                <table>
                    <tr>
                        <th>测试名称</th>
                        <th>状态</th>
                        <th>耗时</th>
                        <th>详情</th>
                    </tr>
        """
        
        for detail in test_type['details']:
            status_class = 'pass' if detail['status'] == '通过' else 'fail'
            html_content += f"""
                <tr>
                    <td>{detail['name']}</td>
                    <td class="{status_class}">{detail['status']}</td>
                    <td>{detail['duration']}</td>
                    <td>{detail['message']}</td>
                </tr>
            """
            
        html_content += """
                </table>
            </div>
        """

    html_content += """
    </body>
    </html>
    """

    with open(filename, 'w', encoding='utf-8') as f:
        f.write(html_content)

if __name__ == "__main__":
    print("检查依赖包...")
    if not check_and_install_dependencies():
        print("✗ 依赖包安装失败")
        sys.exit(1)
    print("✓ 依赖包检查完成")
    
    # 继续执行主函数
    main() 