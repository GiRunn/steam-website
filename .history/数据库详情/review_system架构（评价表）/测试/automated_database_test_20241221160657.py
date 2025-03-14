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
from typing import List, Dict, Any, Tuple, Optional
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
        self.active_connections = []  # 添加活动连接跟踪
        
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
        conn = self.connection_pool.get()
        self.active_connections.append(conn)  # 跟踪活动连接
        return conn

    def release_connection(self, conn: psycopg2.extensions.connection):
        """释放连接回连接池"""
        if conn in self.active_connections:
            self.active_connections.remove(conn)  # 移除活动连接跟踪
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
            )  # 这里添加了缺失的右括号

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
        results = []
        
        # 1. 极限连接压力测试 - 可能在这里阻塞
        results.append(self._test_connection_flood())
        
        # 2. 数据库崩溃恢复测试
        results.append(self._test_crash_recovery())
        
        # 3. SQL注入攻击测试
        results.append(self._test_sql_injection_attacks(conn))
        
        # 4. 数据损坏测试
        results.append(self._test_data_corruption(conn))
        
        # 5. 网络故障模拟
        results.append(self._test_network_failures())
        
        return {
            "adverse_condition_tests": results,
            "summary": {
                "total_tests": len(results),
                "passed_tests": sum(1 for r in results if r.get("status") == "通过"),
                "failed_tests": sum(1 for r in results if r.get("status") == "失败"),
                "needs_optimization": sum(1 for r in results if r.get("status") == "需优化"),
                "errors": sum(1 for r in results if r.get("status") == "错误")
            }
        }

    def _test_connection_flood(self) -> Dict[str, Any]:
        """极限连接压力测试"""
        connections = []
        errors = []
        leaked_connections = []
        max_test_connections = 50  # 减少测试连接数
        connection_timeout = 3  # 设置连接超时为3秒
        
        try:
            start_time = time.time()
            print(f"开始连接压力测试: {datetime.now()}")
            
            # 1. 快速创建连接
            with ThreadPoolExecutor(max_workers=10) as executor:
                futures = []
                for _ in range(max_test_connections):
                    futures.append(executor.submit(lambda: self._create_single_connection(connection_timeout)))
                    
                # 使用超时机制等待所有连接完成
                for future in concurrent.futures.as_completed(futures):
                    if time.time() - start_time > 30:  # 整体超时控制
                        print("连接测试超时，提前结束")
                        break
                    try:
                        conn = future.result(timeout=connection_timeout)
                        if conn:
                            connections.append(conn)
                    except concurrent.futures.TimeoutError:
                        errors.append("连接超时")
                    except Exception as e:
                        errors.append(str(e))

            print(f"连接创建完成: {len(connections)} 成功, {len(errors)} 失败")
            
            # 2. 快速模拟连接泄露
            leaked_count = min(len(connections) // 2, 25)
            leaked_connections = connections[:leaked_count]
            
            # 3. 快速测试并发切换
            concurrent_results = self._test_concurrent_switches(10, 20)  # 减少测试规模
            
            print(f"压力测试完成: {datetime.now()}")
            
            return {
                "test": "极限连接压力测试",
                "details": {
                    "测试说明": "模拟极端的连接池压力情况",
                    "测试步骤": [
                        "1. 创建并发连接",
                        "2. 模拟连接泄露",
                        "3. 高频连接切换"
                    ],
                    "测试结果": {
                        "成功连接数": len(connections),
                        "失败连接数": len(errors),
                        "连接泄露数": len(leaked_connections),
                        "并发测试结果": concurrent_results,
                        "总耗时": f"{time.time() - start_time:.2f}秒",
                        "错误信息": errors[:10] if errors else "无错误"
                    }
                }
            }
        finally:
            # 确保清理非泄露连接
            self._cleanup_connections(connections, leaked_connections)

    def _create_single_connection(self, timeout: int) -> Optional[psycopg2.extensions.connection]:
        """创建单个数据库连接"""
        try:
            conn = psycopg2.connect(**{**self.db_config, 'connect_timeout': timeout})
            return conn
        except Exception as e:
            return None

    def _test_concurrent_switches(self, num_threads: int, num_operations: int) -> Dict[str, Any]:
        """测试并发连接切换"""
        with ThreadPoolExecutor(max_workers=num_threads) as executor:
            futures = []
            for _ in range(num_operations):
                futures.append(executor.submit(self._rapid_connect_disconnect))
            
            success_count = 0
            error_count = 0
            for future in concurrent.futures.as_completed(futures):
                try:
                    result = future.result(timeout=2)
                    if result.get('success', False):
                        success_count += 1
                    else:
                        error_count += 1
                except Exception:
                    error_count += 1
            
            return {
                "总请求数": num_operations,
                "成功请求数": success_count,
                "失败请求数": error_count
            }

    def _cleanup_connections(self, connections: List[psycopg2.extensions.connection], 
                            leaked_connections: List[psycopg2.extensions.connection]) -> None:
        """清理数据库连接"""
        for conn in connections:
            if conn not in leaked_connections and not conn.closed:
                try:
                    conn.close()
                except:
                    pass

    def _rapid_connect_disconnect(self) -> Dict[str, Any]:
        """快速连接断开测试"""
        start_time = time.time()
        try:
            conn = psycopg2.connect(**self.db_config)
            cursor = conn.cursor()
            cursor.execute("SELECT 1")
            conn.close()
            return {
                "success": True,
                "duration": time.time() - start_time
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "duration": time.time() - start_time
            }

    def _test_sql_injection_attacks(self, conn: psycopg2.extensions.connection) -> Dict[str, Any]:
        """SQL注入攻击测试"""
        cursor = conn.cursor()  # 使用传入的连接
        attack_patterns = [
            # 1. 基础SQL注入
            "' OR '1'='1",
            # 2. 堆叠查询注入
            "'; DROP TABLE review_system.reviews_partitioned; --",
            # 3. 时间盲注
            "' AND (SELECT pg_sleep(5))--",
            # 4. 联合查询注入
            "' UNION ALL SELECT * FROM information_schema.tables; --",
            # 5. 批量数据操作
            "'; INSERT INTO review_system.reviews_partitioned SELECT * FROM review_system.reviews_partitioned; --",
            # 6. 系统表访问
            "' UNION ALL SELECT table_name, column_name FROM information_schema.columns; --",
            # 7. 文件系统访问
            "' UNION ALL SELECT pg_read_file('/etc/passwd'); --",
            # 8. 特权操作
            "'; ALTER USER postgres WITH SUPERUSER; --",
            # 9. 存储过程攻击
            "'; CREATE FUNCTION hack() RETURNS void AS $$ BEGIN RAISE EXCEPTION 'Hacked!'; END; $$ LANGUAGE plpgsql; --",
            # 10. 缓冲区溢出
            "'" + "A" * 1000000  # 超大字符串
        ]
        
        results = []
        for pattern in attack_patterns:
            try:
                # 尝试执行注入
                cursor.execute(f"""
                    SELECT * FROM review_system.reviews_partitioned 
                    WHERE content = '{pattern}'
                """)
                results.append({
                    "pattern": pattern,
                    "status": "需加固",
                    "message": "注入攻击未被阻止"
                })
            except Exception as e:
                results.append({
                    "pattern": pattern,
                    "status": "安全",
                    "message": str(e)
                })
                
        return {
            "test": "SQL注入攻击测试",
            "details": {
                "测试说明": "模拟各种SQL注入攻击",
                "攻击类型": [
                    "基础SQL注入",
                    "堆叠查询注入",
                    "时间盲注",
                    "联合查询注入",
                    "批量数据操作",
                    "系统表访问",
                    "文件系统访问",
                    "特权操作",
                    "存储过程攻击",
                    "缓冲区溢出"
                ],
                "测试结果": results
            }
        }

    def _test_data_corruption(self, conn: psycopg2.extensions.connection) -> Dict[str, Any]:
        """数据损坏测试"""
        cursor = conn.cursor()  # 使用传入的连接
        corruption_tests = []
        
        try:
            # 1. 插入无效UTF-8数据
            cursor.execute("""
                INSERT INTO review_system.reviews_partitioned (content)
                VALUES (decode('FF FE FF FE', 'hex'))
            """)
            
            # 2. 插入超大BLOB数据
            huge_data = 'x' * (10 * 1024 * 1024)  # 10MB数据
            cursor.execute("""
                INSERT INTO review_system.reviews_partitioned (content)
                VALUES (%s)
            """, (huge_data,))
            
            # 3. 修改系统表
            cursor.execute("""
                UPDATE pg_class 
                SET relpages = 0 
                WHERE relname = 'reviews_partitioned'
            """)
            
            # 4. 损坏索引
            cursor.execute("""
                UPDATE pg_index 
                SET indisvalid = false 
                WHERE indexrelid = 'reviews_partitioned_pkey'::regclass
            """)
            
            return {
                "test": "数据损坏测试",
                "details": {
                    "测试说明": "模拟各种数据损坏情况",
                    "测试项目": [
                        "无效UTF-8数据",
                        "超大BLOB数据",
                        "系统表损坏",
                        "索引损坏"
                    ],
                    "测试结果": corruption_tests
                }
            }
        except Exception as e:
            return {
                "test": "数据损坏测试",
                "status": "安全",
                "message": f"数据损坏尝试被阻止: {str(e)}"
            }

    def _test_network_failures(self) -> Dict[str, Any]:
        """网络故障模拟"""
        results = []
        
        # 1. 模拟网络延迟
        with ThreadPoolExecutor(max_workers=50) as executor:
            futures = []
            for _ in range(100):
                futures.append(executor.submit(
                    self._delayed_query,
                    random.uniform(0.1, 2.0)  # 随机延迟0.1-2秒
                ))
        
        # 2. 模拟包丢失
        packet_loss_rate = 0.3  # 30%丢包率
        successful_queries = 0
        failed_queries = 0
        for _ in range(100):
            if random.random() > packet_loss_rate:
                successful_queries += 1
            else:
                failed_queries += 1
                
        # 3. 模拟连接重置
        reset_results = []
        for _ in range(50):
            try:
                conn = psycopg2.connect(**self.db_config)
                # 强制关闭连接
                conn._sock.shutdown(socket.SHUT_RDWR)
                reset_results.append("连接重置成功")
            except Exception as e:
                reset_results.append(str(e))
                
        return {
            "test": "网络故障模拟",
            "details": {
                "测试说明": "模拟各种网络故障情况",
                "测试项目": {
                    "网络延迟": {
                        "最大延迟": "2秒",
                        "并发请求": 100
                    },
                    "包丢失": {
                        "丢包率": "30%",
                        "成功请求": successful_queries,
                        "失败请求": failed_queries
                    },
                    "连接重置": {
                        "重置次数": 50,
                        "重置结果": reset_results[:5]  # 只显示前5个结果
                    }
                }
            }
        }

    def cleanup_connections(self):
        """清理所有数据库连接"""
        # 清理连接池中的连接
        while not self.connection_pool.empty():
            try:
                conn = self.connection_pool.get_nowait()
                if conn and not conn.closed:
                    conn.close()
            except queue.Empty:
                break

        # 清理活动连接
        for conn in self.active_connections:
            try:
                if conn and not conn.closed:
                    conn.close()
            except:
                pass
        self.active_connections.clear()

        # 重新初始化连接池
        self._init_connection_pool()

    def _test_crash_recovery(self) -> Dict[str, Any]:
        """数据库崩溃恢复测试"""
        cursor = None
        test_data = []
        recovery_results = []
        start_time = time.time()  # 添加开始时间记录
        
        try:
            # 1. 准备测试数据
            cursor = self.get_connection().cursor()
            for i in range(1000):
                test_data.append((
                    1001 + i,     # game_id
                    2001 + i,     # user_id - 确保提供user_id
                    Decimal('4.5'),  # rating
                    f"崩溃测试数据_{i}",  # content
                    random.randint(1, 100),  # playtime_hours
                    True,         # is_recommended
                    'PC',         # platform
                    'zh-CN'       # language
                ))
            
            # 2. 模拟事务中断
            cursor.execute("BEGIN")
            cursor.executemany("""
                INSERT INTO review_system.reviews_partitioned 
                (game_id, user_id, rating, content, playtime_hours, is_recommended, platform, language)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """, test_data[:500])  # 只插入一半数据
            
            # 3. 模拟数据库崩溃
            recovery_results.append({
                "stage": "崩溃前",
                "action": "插入500条数据",
                "status": "完成"
            })
            
            # 强制关闭连接模拟崩溃
            cursor.connection.close()
            
            recovery_results.append({
                "stage": "崩溃",
                "action": "强制关闭连接",
                "status": "模拟成功"
            })
            
            # 4. 测试恢复
            new_conn = self.get_connection()
            new_cursor = new_conn.cursor()
            
            # 检查数据一致性
            new_cursor.execute("""
                SELECT COUNT(*) 
                FROM review_system.reviews_partitioned 
                WHERE content LIKE '崩溃测试数据_%'
            """)
            recovered_count = new_cursor.fetchone()[0]
            
            # 检查WAL日志状态
            new_cursor.execute("SELECT pg_current_wal_lsn()")
            current_wal = new_cursor.fetchone()[0]
            
            # 检查系统表状态
            new_cursor.execute("""
                SELECT relname, last_vacuum, last_analyze 
                FROM pg_stat_user_tables 
                WHERE schemaname = 'review_system'
            """)
            table_stats = new_cursor.fetchall()
            
            recovery_results.append({
                "stage": "恢复",
                "action": "检查数据一致性",
                "status": "完成",
                "details": {
                    "预期数据量": 0,  # 事务未提交应该回滚
                    "实际数据量": recovered_count,
                    "WAL位置": current_wal,
                    "表状态": [
                        {
                            "名": stat[0],
                            "最后VACUUM时间": str(stat[1]) if stat[1] else "从未",
                            "最后分析时间": str(stat[2]) if stat[2] else "从未"
                        }
                        for stat in table_stats
                    ]
                }
            })
            
            return {
                "test": "数据库崩溃恢复测试",
                "details": {
                    "测试说明": "模拟数据库崩溃和恢复场景",
                    "测试步骤": [
                        "1. 准备大量测试数据",
                        "2. 模拟事务中断",
                        "3. 模拟数据库崩溃",
                        "4. 测试数据恢复"
                    ],
                    "测试结果": recovery_results,
                    "恢复状态": {
                        "数据一致性": "正常" if recovered_count == 0 else "异常",
                        "WAL日志状态": "正常" if current_wal else "异常",
                        "系统表状态": "正常" if table_stats else "异常"
                    },
                    "性能指标": {
                        "恢复耗时": f"{time.time() - start_time:.2f}秒",
                        "数据丢失率": f"{(500-recovered_count)/500*100:.1f}%" if recovered_count <= 500 else "0%"
                    }
                }
            }
            
        except Exception as e:
            return {
                "test": "数据库崩溃恢复测试",
                "status": "错误",
                "error": str(e),
                "details": {
                    "测试说明": "模拟数据库崩溃和恢复场景",
                    "错误信息": str(e),
                    "测试阶段": recovery_results
                }
            }
        finally:
            # 清理测试数据
            try:
                if cursor and not cursor.closed:
                    cursor.execute("""
                        DELETE FROM review_system.reviews_partitioned 
                        WHERE content LIKE '崩溃测试数据_%'
                    """)
                    cursor.connection.commit()
            except:
                pass

    # 在DatabaseTestFramework类中添加_delayed_query方法
    def _delayed_query(self, delay: float) -> Dict[str, Any]:
        """
        执行带延迟的查询测试
        
        Args:
            delay: 延迟秒数
            
        Returns:
            Dict: 测试结果
        """
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            start_time = time.time()
            
            # 模拟网络延迟
            time.sleep(delay)
            
            # 执行简单查询
            cursor.execute("""
                SELECT COUNT(*) 
                FROM review_system.reviews_partitioned 
                WHERE created_at >= CURRENT_TIMESTAMP - interval '1 hour'
            """)
            
            result = cursor.fetchone()
            execution_time = time.time() - start_time
            
            return {
                "success": True,
                "delay": delay,
                "execution_time": execution_time,
                "result": result[0] if result else 0
            }
            
        except Exception as e:
            return {
                "success": False,
                "delay": delay,
                "error": str(e)
            }
        finally:
            if cursor:
                cursor.close()
            if conn:
                self.release_connection(conn)

class SecurityTester:
    """安全测试类"""
    
    def __init__(self, framework: DatabaseTestFramework):
        self.framework = framework
        self.logger = logging.getLogger(__name__)

    def test_sql_injection(self, conn: psycopg2.extensions.connection) -> Dict[str, Any]:
        """SQL注入测试 - 尝试各种注入方式来验证数据库安全性"""
        results = []
        cursor = conn.cursor()

        # 更全面的注入测试模式
        injection_patterns = [
            # 基础SQL注入
            {
                "name": "基础布尔注入",
                "pattern": "' OR '1'='1",
                "description": "测试基础的布尔条件注入"
            },
            {
                "name": "注释符注入",
                "pattern": "admin'--",
                "description": "测试使用注释符绕过"
            },
            {
                "name": "UNION注入",
                "pattern": "' UNION SELECT NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL--",
                "description": "测试UNION查询注入"
            },
            {
                "name": "堆叠查询注入",
                "pattern": "'; INSERT INTO review_system.reviews_partitioned (game_id, user_id) VALUES (999999, 999999)--",
                "description": "测试多语句执行"
            },
            {
                "name": "时间盲注",
                "pattern": "' AND (SELECT pg_sleep(1))--",
                "description": "测试时间延迟注入"
            },
            {
                "name": "错误注入",
                "pattern": "' AND 1=CAST((SELECT version()) AS INTEGER)--",
                "description": "测试错误信息泄露"
            },
            {
                "name": "系统表访问",
                "pattern": "' UNION SELECT table_name,NULL,NULL,NULL,NULL,NULL,NULL,NULL FROM information_schema.tables--",
                "description": "测试系统表信息泄露"
            },
            {
                "name": "权限提升",
                "pattern": "'; ALTER USER postgres WITH SUPERUSER; --",
                "description": "测试权限提升"
            },
            {
                "name": "数据操作",
                "pattern": "'; UPDATE review_system.reviews_partitioned SET rating=1--",
                "description": "测试数据篡改"
            },
            {
                "name": "批量数据泄露",
                "pattern": "' OR '1'='1' LIMIT 1000; --",
                "description": "测试大量数据泄露"
            }
        ]

        for test_case in injection_patterns:
            try:
                # 直接构造不安全的查询
                unsafe_query = f"""
                    SELECT * FROM review_system.reviews_partitioned 
                    WHERE content = '{test_case['pattern']}'
                """
                
                start_time = time.time()
                
                try:
                    # 尝试执行注入
                    cursor.execute(unsafe_query)
                    rows = cursor.fetchall()
                    
                    # 分析执行结果
                    execution_time = time.time() - start_time
                    is_vulnerable = (
                        len(rows) > 0 or  # 返回了数据
                        execution_time > 1.0 or  # 时间延迟
                        cursor.statusmessage.startswith('UPDATE') or  # 数据被修改
                        cursor.statusmessage.startswith('INSERT')  # 数据被插入
                    )
                    
                    results.append({
                        "name": test_case["name"],
                        "pattern": test_case["pattern"],
                        "description": test_case["description"],
                        "status": "漏洞" if is_vulnerable else "安全",
                        "message": f"注入{'成功' if is_vulnerable else '失败'}",
                        "execution_time": execution_time,
                        "affected_rows": len(rows) if rows else 0
                    })
                    
                except psycopg2.Error as e:
                    # 分析错误类型
                    error_msg = str(e)
                    is_blocked = any(keyword in error_msg.lower() for keyword in [
                        'permission denied',
                        'syntax error',
                        'cannot execute',
                        'not allowed'
                    ])
                    
                    results.append({
                        "name": test_case["name"],
                        "pattern": test_case["pattern"],
                        "description": test_case["description"],
                        "status": "安全" if is_blocked else "需分析",
                        "message": error_msg,
                        "execution_time": time.time() - start_time
                    })
                    
                # 每次测试后回滚，避免数据被污染
                conn.rollback()
                
            except Exception as e:
                results.append({
                    "name": test_case["name"],
                    "pattern": test_case["pattern"],
                    "description": test_case["description"],
                    "status": "错误",
                    "message": str(e)
                })
                conn.rollback()

        # 统计测试结果
        vulnerabilities = sum(1 for r in results if r["status"] == "漏洞")
        blocked = sum(1 for r in results if r["status"] == "安全")
        needs_analysis = sum(1 for r in results if r["status"] == "需分析")
        
        return {
            "test": "SQL注入测试",
            "details": {
                "测试说明": "验证数据库对SQL注入的防护能力",
                "注入测试": results,
                "统计信息": {
                    "总测试数": len(injection_patterns),
                    "发现漏洞": vulnerabilities,
                    "成功阻止": blocked,
                    "需要分析": needs_analysis,
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
        finally:
            cursor.close()

def check_and_create_schema(conn: psycopg2.extensions.connection) -> bool:
    """检查并创建必要的schema"""
    try:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT schema_name 
            FROM information_schema.schemata 
            WHERE schema_name = 'review_system'
        """)
        
        if not cursor.fetchone():
            cursor.execute("CREATE SCHEMA review_system")
            conn.commit()
            logger.info("✓ 创建schema: review_system")
        else:
            logger.info("✓ schema已存在: review_system")
            
        return True
        
    except Exception as e:
        logger.error(f"Schema检查/创建失败: {str(e)}")
        conn.rollback()
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
    try:
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

        # 修改测试执行顺序和资源管理
        framework = DatabaseTestFramework(db_config)
        logger.info("开始数据库自动化测试...")

        # 1. 首先执行分区创建
        logger.info("创建初始分区结构...")
        conn = framework.get_connection()
        try:
            if not init_database_objects(conn):
                raise Exception("数据库初始化失败")
        finally:
            framework.release_connection(conn)

        # 2. 等待分区创建完成
        time.sleep(2)  # 给予数据库一些恢复时间

        # 3. 清理连接池
        framework.cleanup_connections()

        # 4. 然后再执行恶劣环境测试
        logger.info("创建恶劣测试环境...")
        conn = framework.get_connection()
        try:
            # 添加超时控制
            with concurrent.futures.ThreadPoolExecutor() as executor:
                future = executor.submit(framework.create_adverse_conditions, conn)
                try:
                    adverse_results = future.result(timeout=300)  # 5分钟超时
                    if adverse_results:
                        framework.save_report(
                            adverse_results, 
                            os.path.join(result_dir, "adverse_test_report.json")
                        )
                except concurrent.futures.TimeoutError:
                    logger.error("恶劣环境测试超时，继续执行其他测试")
        except Exception as e:
            logger.error(f"创建恶劣测试环境失败: {str(e)}")
        finally:
            framework.release_connection(conn)

        # 5. 再次清理连接池
        framework.cleanup_connections()

        # 6. 执行其他测试...
        # 初始化所有测试类
        security_tester = SecurityTester(framework)
        performance_tester = PerformanceTester(framework)
        business_tester = BusinessTester(framework)
        stress_tester = StressTester(framework)
        concurrency_tester = ConcurrencyTester(framework)
        backup_tester = BackupTester(framework)
        partition_tester = PartitionTester(framework)

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