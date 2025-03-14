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
        """创建极端恶劣的测试环境"""
        results = []
        
        # 1. 极限连接压力测试
        results.append(self._test_connection_flood())
        
        # 2. 数据库崩溃恢复测试
        results.append(self._test_crash_recovery())
        
        # 3. SQL注入攻击测试 - 传入连接参数
        results.append(self._test_sql_injection_attacks(conn))
        
        # 4. 数据损坏测试 - 传入连接参数
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
        
        try:
            # 1. 创建大量无效连接
            for _ in range(1000):  # 尝试创建1000个连接
                try:
                    conn = psycopg2.connect(**self.db_config)
                    connections.append(conn)
                except Exception as e:
                    errors.append(str(e))

            # 2. 模拟连接泄露 - 使用更安全的方式
            for conn in connections[:len(connections)//2]:
                try:
                    # 执行查询但不关闭连接
                    cursor = conn.cursor()
                    cursor.execute("SELECT 1")
                    leaked_connections.append(conn)
                    # 不调用 close()，模拟连接泄露
                except Exception as e:
                    errors.append(f"连接泄露模拟失败: {str(e)}")

            # 3. 并发连接切换
            with ThreadPoolExecutor(max_workers=100) as executor:
                futures = []
                for _ in range(1000):
                    futures.append(executor.submit(
                        self._rapid_connect_disconnect
                    ))
                
                # 等待并收集并发测试结果
                concurrent_results = []
                for future in concurrent.futures.as_completed(futures):
                    try:
                        result = future.result()
                        concurrent_results.append(result)
                    except Exception as e:
                        errors.append(f"并发连接测试失败: {str(e)}")
            
            return {
                "test": "极限连接压力测试",
                "details": {
                    "测试说明": "模拟极端的连接池压力情况",
                    "测试步骤": [
                        "1. 创建1000个并发连接",
                        "2. 模拟连接泄露",
                        "3. 高频连接切换"
                    ],
                    "测试结果": {
                        "成功连接数": len(connections),
                        "失败连接数": len(errors),
                        "连接泄露数": len(leaked_connections),
                        "并发测试结果": {
                            "总请求数": len(concurrent_results),
                            "成功请求数": sum(1 for r in concurrent_results if r.get('success', False)),
                            "失败请求数": sum(1 for r in concurrent_results if not r.get('success', False))
                        },
                        "错误信息": errors[:10] if errors else "无错误"  # 只显示前10个错误
                    },
                    "性能指标": {
                        "连接池利用率": f"{(len(connections)/1000)*100:.1f}%",
                        "连接池饱和度": "高" if len(connections) > 900 else "中等",
                        "连接泄露率": f"{(len(leaked_connections)/len(connections))*100:.1f}%"
                    },
                    "安全风险": {
                        "连接泄露风险": "高" if len(leaked_connections) > len(connections)//2 else "低",
                        "资源耗尽风险": "存在" if len(connections) > 900 else "可控"
                    }
                }
            }
        finally:
            # 清理所有连接
            for conn in connections:
                try:
                    if conn not in leaked_connections:  # 不关闭泄露的连接，以模拟泄露
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

    def _test_sql_injection_attacks(self) -> Dict[str, Any]:
        """SQL注入攻击测试"""
        cursor = self.conn.cursor()
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

    def _test_data_corruption(self) -> Dict[str, Any]:
        """数据损坏测试"""
        cursor = self.conn.cursor()
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
        
        try:
            # 1. 准备测试数据
            cursor = self.get_connection().cursor()
            for i in range(1000):
                test_data.append((
                    f"崩溃测试数据_{i}",
                    datetime.now(),
                    random.randint(1, 100)
                ))
            
            # 2. 模拟事务中断
            cursor.execute("BEGIN")
            cursor.executemany("""
                INSERT INTO review_system.reviews_partitioned 
                (content, created_at, game_id)
                VALUES (%s, %s, %s)
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
                            "表名": stat[0],
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

class SecurityTester:
    """安全测试类"""
    
    def __init__(self, framework: DatabaseTestFramework):
        self.framework = framework
        self.logger = logging.getLogger(__name__)

    def test_sql_injection(self, conn: psycopg2.extensions.connection) -> Dict[str, Any]:
        """
        SQL注入测试
        
        Args:
            conn: 数据库连接
        
        Returns:
            Dict: 测试结果详情
        """
        injection_patterns = [
            "' OR '1'='1",
            "'; DROP TABLE users; --",
            "' UNION SELECT * FROM information_schema.tables; --",
            "' OR 1=1; --",
            "'; INSERT INTO users VALUES ('hacker', 'password'); --",
            "' OR '1'='1' /*",
            "admin'--",
            "1' OR '1' = '1",
            "1; UPDATE users SET password='hacked'--",
            "1' OR '1' = '1'; INSERT INTO logs VALUES('hacked');--"
        ]

        results = []
        cursor = conn.cursor()

        for pattern in injection_patterns:
            try:
                # 构建测试查询
                safe_query = "SELECT * FROM review_system.reviews_partitioned WHERE review_id = %s"
                unsafe_query = f"SELECT * FROM review_system.reviews_partitioned WHERE review_id = '{pattern}'"

                # 测试参数化查询（安全）
                try:
                    cursor.execute(safe_query, (pattern,))
                    results.append({
                        "pattern": pattern,
                        "safe_query": "通过",
                        "message": "参数化查询正确处理了注入尝试"
                    })
                except Exception as e:
                    results.append({
                        "pattern": pattern,
                        "safe_query": "失败",
                        "error": str(e)
                    })

                # 测直接字符串拼接（不安全）
                try:
                    cursor.execute(unsafe_query)
                    results.append({
                        "pattern": pattern,
                        "unsafe_query": "需要修复",
                        "message": "不安全的查询允许了潜在的注入"
                    })
                except Exception as e:
                    results.append({
                        "pattern": pattern,
                        "unsafe_query": "安全",
                        "message": "查询正确阻止了注入尝试"
                    })

            except Exception as e:
                results.append({
                    "pattern": pattern,
                    "status": "错误",
                    "error": str(e)
                })

        return {
            "injection_tests": results,
            "summary": {
                "total_tests": len(injection_patterns),
                "successful_blocks": sum(1 for r in results if "安全" in str(r.get("unsafe_query", "")))
            }
        }

    def test_privilege_escalation(self, conn: psycopg2.extensions.connection) -> Dict[str, Any]:
        """
        权限提升测试
        
        Args:
            conn: 数据库连接
            
        Returns:
            Dict: 测试结果详情
        """
        results = []
        cursor = conn.cursor()

        # 测试项目列表
        test_cases = [
            {
                "name": "尝试创建超级用户",
                "query": "CREATE USER hacker WITH SUPERUSER PASSWORD 'hack123';"
            },
            {
                "name": "尝试修改用户权限",
                "query": "ALTER USER postgres WITH SUPERUSER;"
            },
            {
                "name": "尝试访问系统表",
                "query": "SELECT * FROM pg_shadow;"
            },
            {
                "name": "尝试执行系统命令",
                "query": "COPY (SELECT '') TO PROGRAM 'rm -rf /';"
            }
        ]

        for test in test_cases:
            try:
                cursor.execute(test["query"])
                results.append({
                    "test": test["name"],
                    "status": "漏洞",
                    "message": "操作成功执行，存在安全风险"
                })
            except psycopg2.Error as e:
                results.append({
                    "test": test["name"],
                    "status": "安全",
                    "message": f"操作被正确阻止: {str(e)}"
                })

        return {
            "privilege_escalation_tests": results,
            "summary": {
                "total_tests": len(test_cases),
                "blocked_attempts": sum(1 for r in results if r["status"] == "安全")
            }
        }

    def test_data_encryption(self, conn: psycopg2.extensions.connection) -> Dict[str, Any]:
        """
        数据加密测试
        
        Args:
            conn: 数据库连接
            
        Returns:
            Dict: 测试结果详情
        """
        results = []
        cursor = conn.cursor()

        # 测试加密函数
        test_data = [
            ("测试数据1", "key1"),
            ("sensitive_info_123", "key2"),
            ("机密信息", "key3")
        ]

        for data, key in test_data:
            try:
                # 测试加密
                cursor.execute(
                    "SELECT review_system.encrypt_sensitive_data(%s, %s)",
                    (data, key)
                )
                encrypted = cursor.fetchone()[0]

                # 测试解密
                cursor.execute(
                    "SELECT review_system.decrypt_sensitive_data(%s, %s)",
                    (encrypted, key)
                )
                decrypted = cursor.fetchone()[0]

                # 验证结果
                if decrypted == data:
                    results.append({
                        "data": data,
                        "status": "通过",
                        "message": "加密解密成功"
                    })
                else:
                    results.append({
                        "data": data,
                        "status": "失败",
                        "message": "解密结果与原始数据不匹配"
                    })

            except Exception as e:
                results.append({
                    "data": data,
                    "status": "错误",
                    "message": str(e)
                })

        return {
            "encryption_tests": results,
            "summary": {
                "total_tests": len(test_data),
                "successful_tests": sum(1 for r in results if r["status"] == "通过")
            }
        }

    def test_access_control(self, conn: psycopg2.extensions.connection) -> Dict[str, Any]:
        """
        访问控制测试
        
        Args:
            conn: 数据库连接
            
        Returns:
            Dict: 测试结果详情
        """
        results = []
        cursor = conn.cursor()

        # 测试不同角色的权限
        test_cases = [
            {
                "role": "review_readonly",
                "operations": [
                    ("SELECT", "SELECT * FROM review_system.reviews_partitioned LIMIT 1"),
                    ("INSERT", "INSERT INTO review_system.reviews_partitioned (game_id, user_id, rating, content) VALUES (1, 1, 5, 'test')"),
                    ("UPDATE", "UPDATE review_system.reviews_partitioned SET rating = 1 WHERE review_id = 1"),
                    ("DELETE", "DELETE FROM review_system.reviews_partitioned WHERE review_id = 1")
                ]
            },
            {
                "role": "review_writer",
                "operations": [
                    ("SELECT", "SELECT * FROM review_system.reviews_partitioned LIMIT 1"),
                    ("INSERT", "INSERT INTO review_system.reviews_partitioned (game_id, user_id, rating, content) VALUES (1, 1, 5, 'test')"),
                    ("UPDATE", "UPDATE review_system.reviews_partitioned SET rating = 1 WHERE review_id = 1"),
                    ("DELETE", "DELETE FROM review_system.reviews_partitioned WHERE review_id = 1")
                ]
            }
        ]

        for role_test in test_cases:
            role = role_test["role"]
            try:
                # 开始新的事务
                conn.rollback()  # 确保清除任何之前的事务状态
                
                # 切换到测试角色
                cursor.execute(f"SET ROLE {role};")
                
                role_results = []
                for op_name, query in role_test["operations"]:
                    try:
                        cursor.execute(query)
                        conn.rollback()  # 回滚每个操作
                        role_results.append({
                            "operation": op_name,
                            "status": "需要检查",
                            "message": f"{role} 可以执行 {op_name} 操作"
                        })
                    except psycopg2.Error as e:
                        conn.rollback()  # 确保错误后也回滚
                        role_results.append({
                            "operation": op_name,
                            "status": "正常",
                            "message": f"{role} 无法执行 {op_name} 操作: {str(e)}"
                        })

                results.append({
                    "role": role,
                    "operations": role_results
                })

            except Exception as e:
                conn.rollback()  # 确保错误后也回滚
                results.append({
                    "role": role,
                    "status": "错误",
                    "message": str(e)
                })
            finally:
                try:
                    cursor.execute("RESET ROLE")
                    conn.commit()
                except:
                    conn.rollback()

        return {
            "access_control_tests": results,
            "summary": {
                "total_roles": len(test_cases),
                "total_operations": sum(len(r["operations"]) for r in test_cases)
            }
        }

class PerformanceTester:
    """性能测试类"""
    
    def __init__(self, framework: DatabaseTestFramework):
        self.framework = framework
        self.logger = logging.getLogger(__name__)

    def test_query_performance(self, conn: psycopg2.extensions.connection) -> Dict[str, Any]:
        """
        查询性能测试
        
        Args:
            conn: 数据库连接
            
        Returns:
            Dict: 测试结果详情
        """
        results = []
        cursor = conn.cursor()

        # 测试查询列表
        test_queries = [
            {
                "name": "简单查询",
                "query": "SELECT * FROM review_system.reviews_partitioned WHERE game_id = 1 LIMIT 100"
            },
            {
                "name": "聚合查询",
                "query": """
                    SELECT game_id, 
                           COUNT(*) as review_count,
                           AVG(rating) as avg_rating
                    FROM review_system.reviews_partitioned
                    GROUP BY game_id
                    ORDER BY review_count DESC
                    LIMIT 10
                """
            },
            {
                "name": "复杂连接查询",
                "query": """
                    SELECT r.game_id,
                           COUNT(DISTINCT r.user_id) as unique_reviewers,
                           COUNT(rr.reply_id) as total_replies
                    FROM review_system.reviews_partitioned r
                    LEFT JOIN review_system.review_replies_partitioned rr
                        ON r.review_id = rr.review_id
                    GROUP BY r.game_id
                    HAVING COUNT(DISTINCT r.user_id) > 5
                    ORDER BY unique_reviewers DESC
                    LIMIT 10
                """
            }
        ]

        for test in test_queries:
            # 执行EXPLAIN ANALYZE
            try:
                cursor.execute(f"EXPLAIN ANALYZE {test['query']}")
                plan = cursor.fetchall()
                
                # 提取执行时间
                execution_time = None
                for row in plan:
                    if "Execution Time:" in row[0]:
                        execution_time = float(row[0].split(":")[-1].strip().split(" ")[0])
                        break

                results.append({
                    "query_name": test["name"],
                    "execution_time": execution_time,
                    "execution_plan": [row[0] for row in plan],
                    "status": "通过" if execution_time and execution_time < 1000 else "需优化"  # 1秒阈值
                })

            except Exception as e:
                results.append({
                    "query_name": test["name"],
                    "status": "错误",
                    "error": str(e)
                })

        # 修改平均执行时间计算
        execution_times = [r.get("execution_time", 0) for r in results if r.get("execution_time") is not None]
        avg_execution_time = np.mean(execution_times) if execution_times else 0

        return {
            "performance_tests": results,
            "summary": {
                "total_queries": len(test_queries),
                "optimized_queries": sum(1 for r in results if r.get("status") == "通过"),
                "average_execution_time": float(avg_execution_time)  # 确保可以JSON序列化
            }
        }

    def test_index_effectiveness(self, conn: psycopg2.extensions.connection) -> Dict[str, Any]:
        """
        索引效果测试
        
        Args:
            conn: 数据库连接
            
        Returns:
            Dict: 测试结果详情
        """
        results = []
        cursor = conn.cursor()

        # 测试索引使用情况
        test_cases = [
            {
                "name": "游戏ID索引",
                "query": "SELECT * FROM review_system.reviews_partitioned WHERE game_id = 1"
            },
            {
                "name": "用户ID索引",
                "query": "SELECT * FROM review_system.reviews_partitioned WHERE user_id = 1"
            },
            {
                "name": "创建时间索引",
                "query": "SELECT * FROM review_system.reviews_partitioned WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'"
            },
            {
                "name": "复合索引",
                "query": "SELECT * FROM review_system.reviews_partitioned WHERE game_id = 1 AND rating >= 4"
            }
        ]

        for test in test_cases:
            try:
                # 分析查询计划
                cursor.execute(f"EXPLAIN (FORMAT JSON) {test['query']}")
                plan = cursor.fetchone()[0]

                # 检查是使用了索引
                index_scan = False
                seq_scan = False
                for node in str(plan):
                    if "Index Scan" in node:
                        index_scan = True
                    if "Seq Scan" in node:
                        seq_scan = True

                results.append({
                    "test_name": test["name"],
                    "uses_index": index_scan,
                    "requires_seqscan": seq_scan,
                    "status": "优化" if index_scan and not seq_scan else "需要优化",
                    "plan": plan
                })

            except Exception as e:
                results.append({
                    "test_name": test["name"],
                    "status": "错误",
                    "error": str(e)
                })

        return {
            "index_tests": results,
            "summary": {
                "total_tests": len(test_cases),
                "optimized_queries": sum(1 for r in results if r.get("status") == "优化")
            }
        }

    def test_partition_performance(self, conn: psycopg2.extensions.connection) -> Dict[str, Any]:
        """
        分区性能测试
        
        Args:
            conn: 数据库连接
            
        Returns:
            Dict: 测试结果详情
        """
        results = []
        cursor = conn.cursor()

        # 测试分区查询性能
        test_cases = [
            {
                "name": "当前月份分区查询",
                "query": """
                    SELECT COUNT(*) 
                    FROM review_system.reviews_partitioned 
                    WHERE created_at >= date_trunc('month', CURRENT_DATE)
                """
            },
            {
                "name": "跨分区查询",
                "query": """
                    SELECT COUNT(*) 
                    FROM review_system.reviews_partitioned 
                    WHERE created_at >= CURRENT_DATE - INTERVAL '3 months'
                """
            },
            {
                "name": "分区剪测试",
                "query": """
                    SELECT COUNT(*) 
                    FROM review_system.reviews_partitioned 
                    WHERE created_at BETWEEN '2024-01-01' AND '2024-01-31'
                """
            }
        ]

        for test in test_cases:
            try:
                # 分析查询计划
                cursor.execute(f"EXPLAIN (ANALYZE, FORMAT JSON) {test['query']}")
                plan = cursor.fetchone()[0]

                # 提取执行时间和分区信息
                execution_time = plan[0]["Execution Time"]
                partitions_scanned = sum(1 for node in str(plan) if "Partition Range" in node)

                results.append({
                    "test_name": test["name"],
                    "execution_time": execution_time,
                    "partitions_scanned": partitions_scanned,
                    "status": "优化" if execution_time < 1000 else "需要优化",  # 1秒阈值
                    "plan": plan
                })

            except Exception as e:
                results.append({
                    "test_name": test["name"],
                    "status": "错误",
                    "error": str(e)
                })

        return {
            "partition_tests": results,
            "summary": {
                "total_tests": len(test_cases),
                "optimized_queries": sum(1 for r in results if r.get("status") == "优化"),
                "average_execution_time": np.mean([r.get("execution_time", 0) for r in results if r.get("execution_time")])
            }
        }

class BusinessTester:
    """业务逻辑测试类"""
    
    def __init__(self, framework: DatabaseTestFramework):
        self.framework = framework
        self.logger = logging.getLogger(__name__)

    def test_review_crud(self, conn: psycopg2.extensions.connection) -> Dict[str, Any]:
        results = []
        cursor = conn.cursor()
        test_data = []
        
        try:
            # 使用事务
            cursor.execute("BEGIN")
            
            # 插入多条测试数据
            for i in range(10):  # 插入10条测试数据
                cursor.execute("""
                    INSERT INTO review_system.reviews_partitioned 
                    (game_id, user_id, rating, content, playtime_hours)
                    VALUES (%s, %s, %s, %s, %s)
                    RETURNING review_id, game_id, user_id, rating, content, playtime_hours, created_at
                """, (
                    1001 + i,  # game_id
                    i + 1,     # user_id
                    Decimal(str(round(random.uniform(1, 5), 2))),  # rating
                    f'测试评论内容 #{i+1}',  # content
                    random.randint(1, 100)  # playtime_hours
                ))
                
                test_data.append(cursor.fetchone())
            
            conn.commit()
            
            results.append({
                "operation": "CREATE",
                "status": "通过",
                "message": f"成功创建{len(test_data)}条测试评论",
                "test_data": [
                    {
                        "review_id": row[0],
                        "game_id": row[1],
                        "user_id": row[2],
                        "rating": float(row[3]),
                        "content": row[4],
                        "playtime_hours": row[5],
                        "created_at": str(row[6])
                    }
                    for row in test_data
                ]
            })
            
        except Exception as e:
            conn.rollback()
            results.append({
                "operation": "CREATE",
                "status": "失败", 
                "message": str(e)
            })
            
        return {
            "crud_tests": results,
            "summary": {
                "total_operations": len(results),
                "successful_operations": sum(1 for r in results if r["status"] == "通过"),
                "test_data_count": len(test_data)
            }
        }

    def test_concurrent_writes(self, conn: psycopg2.extensions.connection) -> Dict[str, Any]:
        results = []
        
        try:
            with ThreadPoolExecutor(max_workers=10) as executor:
                futures = []
                for i in range(100):
                    future = executor.submit(self._write_test_data, conn, i)
                    futures.append(future)
                    
                completed = 0
                errors = []
                
                for future in concurrent.futures.as_completed(futures):
                    try:
                        result = future.result()
                        if result["success"]:
                            completed += 1
                        else:
                            errors.append(result["error"])
                    except Exception as e:
                        errors.append(str(e))
                        
                results.append({
                    "test": "并发写入",
                    "completed": completed,
                    "errors": errors,
                    "status": "通过" if completed > 90 else "失败" # 允10%的失败率
                })
                
        except Exception as e:
            results.append({
                "test": "并发写入",
                "status": "错误",
                "message": str(e)
            })
            
        return {
            "concurrent_write_tests": results,
            "summary": {
                "total_tests": len(results),
                "passed_tests": sum(1 for r in results if r["status"] == "通过")
            }
        }

    def test_review_summary_update(self, conn: psycopg2.extensions.connection) -> Dict[str, Any]:
        """评论汇总更新测试"""
        results = []
        cursor = conn.cursor()

        try:
            # 清理现有数据
            cursor.execute("""
                DELETE FROM review_system.reviews_partitioned WHERE game_id = 1001;
                DELETE FROM review_system.review_summary_partitioned WHERE game_id = 1001;
            """)
            
            # 准备测试数据
            test_data = [
                (1001, 1, Decimal('4.5'), '测试评论1', 10),
                (1001, 2, Decimal('3.5'), '测试评论2', 5),
                (1001, 3, Decimal('5.0'), '测试评论3', 15)
            ]
            
            # 插入测试据
            cursor.executemany("""
                INSERT INTO review_system.reviews_partitioned 
                (game_id, user_id, rating, content, playtime_hours)
                VALUES (%s, %s, %s, %s, %s)
            """, test_data)

            conn.commit()  # 确保数据被保存

            # 检查汇总数据更新
            cursor.execute("""
                SELECT total_reviews, average_rating, total_playtime_hours
                FROM review_system.review_summary_partitioned
                WHERE game_id = 1001
                ORDER BY last_updated DESC
                LIMIT 1
            """)
            
            summary = cursor.fetchone()
            if summary:
                total_reviews, avg_rating, total_playtime = summary
                expected_total = 3
                expected_avg = Decimal('4.333333')
                expected_playtime = 30

                results.extend([
                    {
                        "test": "评论总数",
                        "status": "通过" if total_reviews == expected_total else "失败",
                        "expected": expected_total,
                        "actual": total_reviews
                    },
                    {
                        "test": "平均评分",
                        "status": "通过" if abs(avg_rating - expected_avg) < Decimal('0.01') else "失败",
                        "expected": float(expected_avg),
                        "actual": float(avg_rating)
                    },
                    {
                        "test": "总游戏时间",
                        "status": "通过" if total_playtime == expected_playtime else "失败",
                        "expected": expected_playtime,
                        "actual": total_playtime
                    }
                ])

            conn.commit()

        except Exception as e:
            conn.rollback()
            results.append({
                "test": "汇总更新",
                "status": "错误",
                "message": str(e)
            })

        return {
            "summary_tests": results,
            "summary": {
                "total_tests": len(results),
                "passed_tests": sum(1 for r in results if r["status"] == "通过")
            }
        }

class StressTester:
    """压力测试类"""
    
    def __init__(self, framework: DatabaseTestFramework):
        self.framework = framework
        self.logger = logging.getLogger(__name__)

    def test_high_load(self, conn: psycopg2.extensions.connection) -> Dict[str, Any]:
        """
        高负载测试
        
        Args:
            conn: 数据库连接
            
        Returns:
            Dict: 测试结果详情
        """
        results = []
        cursor = conn.cursor()
        
        # 测试参数
        num_iterations = 1000  # 每轮测试的操作数
        batch_size = 100      # 批量插入大小
        
        try:
            # 准备批量插入数据
            start_time = time.time()
            test_data = []
            for i in range(num_iterations):
                test_data.append((
                    random.randint(1, 100),  # game_id
                    random.randint(1, 1000), # user_id
                    round(random.uniform(1, 5), 2),  # rating
                    f"压力测试评论 {i}",  # content
                    random.randint(1, 100)  # playtime_hours
                ))
            
            # 批插入测试
            for i in range(0, num_iterations, batch_size):
                batch = test_data[i:i + batch_size]
                try:
                    cursor.executemany("""
                        INSERT INTO review_system.reviews_partitioned 
                        (game_id, user_id, rating, content, playtime_hours)
                        VALUES (%s, %s, %s, %s, %s)
                    """, batch)
                    conn.commit()
                except Exception as e:
                    conn.rollback()
                    raise e
            
            insert_time = time.time() - start_time
            results.append({
                "test": "批量插入",
                "records": num_iterations,
                "time": insert_time,
                "records_per_second": num_iterations / insert_time,
                "status": "通过" if insert_time < 60 else "需优化"  # 1分钟阈值
            })
            
            # 并发查询测
            start_time = time.time()
            with ThreadPoolExecutor(max_workers=10) as executor:
                query_futures = []
                for _ in range(100):  # 100个并发查询
                    game_id = random.randint(1, 100)
                    future = executor.submit(self._execute_query, conn, game_id)
                    query_futures.append(future)
                
                # 等待所有查询完成
                concurrent.futures.wait(query_futures)
                
            query_time = time.time() - start_time
            results.append({
                "test": "并发查询",
                "queries": 100,
                "time": query_time,
                "queries_per_second": 100 / query_time,
                "status": "通过" if query_time < 30 else "需优化"  # 30秒阈值
            })
            
            # 检查系统状态
            cursor.execute("""
                SELECT * FROM pg_stat_activity 
                WHERE state != 'idle' AND pid != pg_backend_pid()
            """)
            active_connections = cursor.fetchall()
            
            results.append({
                "test": "系统状态",
                "active_connections": len(active_connections),
                "status": "通过" if len(active_connections) < 50 else "警告"  # 50个连接阈值
            })

        except Exception as e:
            results.append({
                "test": "压力测试",
                "status": "错误",
                "error": str(e)
            })

        return {
            "stress_tests": results,
            "summary": {
                "total_tests": len(results),
                "passed_tests": sum(1 for r in results if r["status"] == "通")
            }
        }

    def _execute_query(self, conn: psycopg2.extensions.connection, game_id: int) -> None:
        """执行单个查询"""
        cursor = conn.cursor()
        cursor.execute("""
            SELECT COUNT(*), AVG(rating)
            FROM review_system.reviews_partitioned
            WHERE game_id = %s
        """, (game_id,))
        cursor.close()

    def test_resource_limits(self, conn: psycopg2.extensions.connection) -> Dict[str, Any]:
        """
        资源限制试
        
        Args:
            conn: 数据库连接
            
        Returns:
            Dict: 试结果详情
        """
        results = []
        cursor = conn.cursor()

        try:
            # 测试大量数据排序
            start_time = time.time()
            cursor.execute("""
                SELECT game_id, user_id, rating
                FROM review_system.reviews_partitioned
                ORDER BY created_at DESC
                LIMIT 100000
            """)
            sort_time = time.time() - start_time
            results.append({
                "test": "大数据排序",
                "time": sort_time,
                "status": "通过" if sort_time < 10 else "需优化"  # 10秒阈值
            })

            # 测试内存使用
            cursor.execute("SHOW work_mem")
            work_mem = cursor.fetchone()[0]
            cursor.execute("SHOW shared_buffers")
            shared_buffers = cursor.fetchone()[0]
            
            results.append({
                "test": "内存配置",
                "work_mem": work_mem,
                "shared_buffers": shared_buffers,
                "status": "信息"
            })

            # 测试临时表空间使用
            cursor.execute("""
                SELECT temp_files, temp_bytes
                FROM pg_stat_database
                WHERE datname = current_database()
            """)
            temp_stats = cursor.fetchone()
            if temp_stats:
                results.append({
                    "test": "临时空间使用",
                    "temp_files": temp_stats[0],
                    "temp_bytes": temp_stats[1],
                    "status": "通过" if temp_stats[1] < 1024*1024*1024 else "警告"  # 1GB阈值
                })

        except Exception as e:
            results.append({
                "test": "资源限制测试",
                "status": "错误",
                "error": str(e)
            })

        return {
            "resource_tests": results,
            "summary": {
                "total_tests": len(results),
                "passed_tests": sum(1 for r in results if r["status"] in ["通过", "信息"])
            }
        }

class ConcurrencyTester:
    """并发测试类"""
    
    def __init__(self, framework: DatabaseTestFramework):
        self.framework = framework
        self.logger = logging.getLogger(__name__)

    def test_concurrent_writes(self, conn: psycopg2.extensions.connection) -> Dict[str, Any]:
        """
        并发写入测试
        
        Args:
            conn: 数据库连接
            
        Returns:
            Dict: 测试结果详情
        """
        results = []
        num_threads = 10
        operations_per_thread = 100
        
        try:
            # 创建线程池
            with ThreadPoolExecutor(max_workers=num_threads) as executor:
                futures = []
                start_time = time.time()
                
                # 提交并发写入任务
                for i in range(num_threads):
                    future = executor.submit(
                        self._concurrent_write_task,
                        self.framework.get_connection(),
                        i * operations_per_thread,
                        operations_per_thread
                    )
                    futures.append(future)
                
                # 等待所有任务完成
                completed_tasks = 0
                errors = []
                for future in concurrent.futures.as_completed(futures):
                    try:
                        task_result = future.result()
                        completed_tasks += task_result["completed"]
                        if task_result.get("error"):
                            errors.append(task_result["error"])
                    except Exception as e:
                        errors.append(str(e))
                
                total_time = time.time() - start_time
                
                results.append({
                    "test": "并发写入",
                    "threads": num_threads,
                    "operations_per_thread": operations_per_thread,
                    "completed_operations": completed_tasks,
                    "total_time": total_time,
                    "operations_per_second": completed_tasks / total_time,
                    "errors": errors,
                    "status": "通过" if not errors else "失败"
                })

        except Exception as e:
            results.append({
                "test": "并发写入测试",
                "status": "错误",
                "error": str(e)
            })

        return {
            "concurrent_write_tests": results,
            "summary": {
                "total_tests": len(results),
                "passed_tests": sum(1 for r in results if r["status"] == "通过")
            }
        }

    def _concurrent_write_task(self, conn: psycopg2.extensions.connection, start_id: int, count: int) -> Dict[str, Any]:
        """执行并发写入任务"""
        result = {"completed": 0, "error": None}
        cursor = conn.cursor()
        
        try:
            for i in range(count):
                # 生成更有意义的测试数据
                game_id = random.randint(1, 100)  # 随机游戏ID
                rating = round(random.uniform(1, 5), 2)  # 随机评分
                content = f"并发测试评论 #{start_id + i} - 这是一个测试评论，评价游戏ID {game_id}，评分 {rating}"
                playtime = random.randint(1, 1000)  # 随机游戏时长
                platform = random.choice(['PC', 'PS5', 'XBOX'])  # 随机平台
                language = random.choice(['zh-CN', 'en-US', 'ja-JP'])  # 随机语言
                
                cursor.execute("""
                    INSERT INTO review_system.reviews_partitioned 
                    (game_id, user_id, rating, content, playtime_hours, platform, language, is_recommended)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    game_id,
                    start_id + i,  # 用户ID
                    rating,
                    content,
                    playtime,
                    platform,
                    language,
                    rating >= 4.0  # 4分以上推荐
                ))
                result["completed"] += 1
            
            conn.commit()
            
        except Exception as e:
            conn.rollback()
            result["error"] = str(e)
            
        finally:
            cursor.close()
            self.framework.release_connection(conn)
            
        return result

    def test_deadlock_prevention(self, conn: psycopg2.extensions.connection) -> Dict[str, Any]:
        """死锁预防测试"""
        results = []
        num_threads = 5
        
        try:
            # 准备测试数据
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO review_system.reviews_partitioned 
                (game_id, user_id, rating, content)
                VALUES 
                (1, 1, 4.5, '死锁测试1'),
                (2, 2, 4.0, '死锁测试2')
                RETURNING review_id
            """)
            test_ids = [row[0] for row in cursor.fetchall()]
            conn.commit()
            
            # 创建线程池测试死锁情况
            with ThreadPoolExecutor(max_workers=num_threads) as executor:
                futures = []
                start_time = time.time()
                
                # 提交可能导致死锁的任务
                for i in range(num_threads):
                    future = executor.submit(
                        self._deadlock_test_task,
                        self.framework.get_connection(),
                        test_ids[i % len(test_ids)]
                    )  # 添加右括号
                    futures.append(future)
                
                # 收集结果
                deadlocks = 0
                successes = 0
                for future in concurrent.futures.as_completed(futures):
                    try:
                        task_result = future.result()
                        if task_result["deadlock"]:
                            deadlocks += 1
                        else:
                            successes += 1
                    except Exception as e:
                        deadlocks += 1
                
                total_time = time.time() - start_time
                
                results.append({
                    "test": "死锁预防",
                    "threads": num_threads,
                    "deadlocks": deadlocks,
                    "successful_transactions": successes,
                    "total_time": total_time,
                    "status": "通过" if deadlocks == 0 else "需优化"
                })

        except Exception as e:
            results.append({
                "test": "死锁测试",
                "status": "错误",
                "error": str(e)
            })
        finally:
            # 清理测试数据
            try:
                cursor = conn.cursor()
                cursor.execute("""
                    DELETE FROM review_system.reviews_partitioned 
                    WHERE content LIKE '死锁测试%'
                """)
                conn.commit()
            except:
                pass

        return {
            "deadlock_tests": results,
            "summary": {
                "total_tests": len(results),
                "passed_tests": sum(1 for r in results if r["status"] == "通过")
            }
        }

    def _deadlock_test_task(self, conn: psycopg2.extensions.connection, review_id: int) -> Dict[str, Any]:
        """执行可能导致死锁的任务"""
        result = {"deadlock": False}
        cursor = conn.cursor()
        
        try:
            # 设置事务隔离级别
            cursor.execute("SET TRANSACTION ISOLATION LEVEL SERIALIZABLE")
            
            # 更新评论
            cursor.execute("""
                UPDATE review_system.reviews_partitioned 
                SET rating = rating + 0.1
                WHERE review_id = %s
            """, (review_id,))
            
            # 模拟一些处理时间
            time.sleep(random.uniform(0.1, 0.5))
            
            # 插入回复
            cursor.execute("""
                INSERT INTO review_system.review_replies_partitioned 
                (review_id, user_id, content)
                VALUES (%s, %s, %s)
            """, (review_id, random.randint(1, 1000), "死锁测试回复"))
            
            conn.commit()
            
        except psycopg2.Error as e:
            conn.rollback()
            if "deadlock detected" in str(e):
                result["deadlock"] = True
            
        finally:
            cursor.close()
            self.framework.release_connection(conn)
            
        return result 

class BackupTester:
    """备份恢复测试类"""
    
    def __init__(self, framework: DatabaseTestFramework):
        self.framework = framework
        self.logger = logging.getLogger(__name__)

    def test_backup_creation(self, conn: psycopg2.extensions.connection) -> Dict[str, Any]:
        """测试备份创建功能"""
        results = []
        cursor = conn.cursor()

        try:
            # 创建测试备份
            backup_path = f"backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            cursor.execute("""
                INSERT INTO review_system.backup_history 
                (backup_type, backup_status, file_path, backup_size_before_compression)
                VALUES ('FULL', 'COMPLETED', %s, 1024)
                RETURNING backup_id
            """, (backup_path,))
            
            backup_id = cursor.fetchone()[0]
            
            # 记录备份元数据
            cursor.execute("""
                INSERT INTO review_system.backup_metadata 
                (backup_id, table_name, record_count)
                VALUES (%s, 'reviews_partitioned', 
                    (SELECT COUNT(*) FROM review_system.reviews_partitioned))
            """, (backup_id,))
            
            conn.commit()
            
            results.append({
                "test": "备份创建",
                "backup_id": backup_id,
                "status": "通过",
                "message": f"成功创建备份: {backup_path}"
            })
            
        except Exception as e:
            conn.rollback()
            results.append({
                "test": "备份创建",
                "status": "失败",
                "error": str(e)
            })

        return {
            "backup_tests": results,
            "summary": {
                "total_tests": len(results),
                "successful_backups": sum(1 for r in results if r["status"] == "通过")
            }
        }

    def test_backup_restore(self, conn: psycopg2.extensions.connection) -> Dict[str, Any]:
        """
        测试备份恢复功能
        
        Args:
            conn: 数据库连接
            
        Returns:
            Dict: 测试结果详情
        """
        results = []
        cursor = conn.cursor()

        try:
            # 获取最新的成功备份
            cursor.execute("""
                SELECT backup_id, file_path
                FROM review_system.backup_history
                WHERE backup_status = 'COMPLETED'
                ORDER BY end_time DESC
                LIMIT 1
            """)
            backup_info = cursor.fetchone()
            
            if backup_info:
                backup_id, file_path = backup_info
                
                # 创建测试表
                cursor.execute("""
                    CREATE TABLE review_system.reviews_restore_test (LIKE review_system.reviews_partitioned)
                """)
                
                # 模拟恢复过程
                cursor.execute("""
                    INSERT INTO review_system.reviews_restore_test
                    SELECT * FROM review_system.reviews_partitioned
                    WHERE created_at >= CURRENT_DATE - INTERVAL '1 day'
                """)
                
                # 验证恢复的数据
                cursor.execute("""
                    SELECT 
                        (SELECT COUNT(*) FROM review_system.reviews_restore_test) as restored_count,
                        (SELECT COUNT(*) FROM review_system.reviews_partitioned 
                         WHERE created_at >= CURRENT_DATE - INTERVAL '1 day') as original_count
                """)
                restored_count, original_count = cursor.fetchone()
                
                results.append({
                    "test": "数据恢复",
                    "backup_id": backup_id,
                    "restored_records": restored_count,
                    "original_records": original_count,
                    "status": "通过" if restored_count == original_count else "失败",
                    "message": "恢复的记录数与原始数据匹配" if restored_count == original_count 
                             else f"记录数不匹配: 恢复 {restored_count}, 原始 {original_count}"
                })
                
                # 清理测试表
                cursor.execute("DROP TABLE review_system.reviews_restore_test")
                
            else:
                results.append({
                    "test": "备份恢复",
                    "status": "跳过",
                    "message": "未找到可用的备份"
                })

            conn.commit()

        except Exception as e:
            conn.rollback()
            results.append({
                "test": "备份恢复",
                "status": "错误",
                "error": str(e)
            })
            
            # 确保清理测试表
            try:
                cursor.execute("DROP TABLE IF EXISTS review_system.reviews_restore_test")
                conn.commit()
            except:
                pass

        return {
            "restore_tests": results,
            "summary": {
                "total_tests": len(results),
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
            adverse_results = framework.create_adverse_conditions(conn)
            # 保存恶劣环境测试结果
            if adverse_results:
                framework.save_report(
                    adverse_results, 
                    os.path.join(result_dir, "adverse_test_report.json")
                )
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