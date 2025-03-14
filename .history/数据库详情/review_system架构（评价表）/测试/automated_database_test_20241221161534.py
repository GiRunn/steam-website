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
        """创建恶劣条件测试"""
        results = []
        
        try:
            # 1. 极限连接压力测试
            print(f"\n[{datetime.now()}] === 开始极限连接压力测试 ===")
            connection_results = self._test_connection_flood()
            results.append(connection_results)
            print(f"[{datetime.now()}] ✓ 极限连接压力测试完成")
            print(f"- 成功连接数: {connection_results.get('details', {}).get('成功连接数', 0)}")
            print(f"- 失败连接数: {connection_results.get('details', {}).get('失败连接数', 0)}")
            
            # 2. SQL注入攻击测试
            print(f"\n[{datetime.now()}] === 开始SQL注入攻击测试 ===")
            injection_results = self._test_sql_injection_attacks(conn)
            results.append(injection_results)
            
            # 显示每个注入测试的结果
            for test in injection_results.get('details', {}).get('测试结果', []):
                status_symbol = "✓" if test.get('status') == "安全" else "✗"
                print(f"[{datetime.now()}] {status_symbol} {test.get('pattern')} - {test.get('message')}")
            
            print(f"[{datetime.now()}] ✓ SQL注入测试完成")
            
            # 3. 数据库崩溃恢复测试
            print(f"\n[{datetime.now()}] === 开始数据库崩溃恢复测试 ===")
            crash_results = self._test_crash_recovery()
            results.append(crash_results)
            print(f"[{datetime.now()}] ✓ 崩溃恢复测试完成")
            
            # 4. 数据损坏测试
            print(f"\n[{datetime.now()}] === 开始数据损坏测试 ===")
            corruption_results = self._test_data_corruption(conn)
            results.append(corruption_results)
            print(f"[{datetime.now()}] ✓ 数据损坏测试完成")
            
            # 5. 网络故障模拟
            print(f"\n[{datetime.now()}] === 开始网络故障模拟测试 ===")
            network_results = self._test_network_failures()
            results.append(network_results)
            print(f"[{datetime.now()}] ✓ 网络故障模拟测试完成")
            
            # 汇总测试结果
            total_tests = len(results)
            passed_tests = sum(1 for r in results if r.get("status", "") == "通过")
            failed_tests = total_tests - passed_tests
            
            print(f"\n[{datetime.now()}] === 恶劣条件测试完成 ===")
            print(f"总测试数: {total_tests}")
            print(f"通过测试: {passed_tests}")
            print(f"失败测试: {failed_tests}")
            
            return {
                "adverse_condition_tests": results,
                "summary": {
                    "total_tests": total_tests,
                    "passed_tests": passed_tests,
                    "failed_tests": failed_tests,
                    "needs_optimization": sum(1 for r in results if r.get("status") == "需优化"),
                    "errors": sum(1 for r in results if r.get("status") == "错误")
                }
            }
            
        except Exception as e:
            print(f"\n[{datetime.now()}] ✗ 恶劣条件测试出错: {str(e)}")
            return {
                "adverse_condition_tests": [],
                "summary": {
                    "total_tests": 0,
                    "passed_tests": 0,
                    "failed_tests": 0,
                    "errors": 1,
                    "error_message": str(e)
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
            for i in range(10000):  # 插入10条测试数据
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
                        "test": "平均评",
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
        """高负载测试"""
        results = []
        cursor = conn.cursor()
        
        # 测试参数
        num_iterations = 10000  # 每轮测试的操作数
        batch_size = 1000      # 批量插入大小
        
        try:
            # 准备批量插入数据
            print(f"\n[{datetime.now()}] 开始准备批量插入数据...")
            start_time = time.time()
            test_data = []
            for i in range(num_iterations):
                if i % 100 == 0:  # 每准备100条数据显示一次进度
                    print(f"数据准备进度: {i}/{num_iterations} ({(i/num_iterations)*100:.1f}%)")
                test_data.append((
                    random.randint(1, 100),  # game_id
                    random.randint(1, 1000), # user_id
                    round(random.uniform(1, 5), 2),  # rating
                    f"压力测试评论 {i}",  # content
                    random.randint(1, 100)  # playtime_hours
                ))
            
            print(f"[{datetime.now()}] 数据准备完成，开始批量插入...")
            
            # 批量插入测试
            total_batches = num_iterations // batch_size
            for batch_num, i in enumerate(range(0, num_iterations, batch_size)):
                batch = test_data[i:i + batch_size]
                try:
                    print(f"执行批量插入: 第 {batch_num + 1}/{total_batches} 批 "
                          f"({((batch_num + 1)/total_batches)*100:.1f}%)")
                    cursor.executemany("""
                        INSERT INTO review_system.reviews_partitioned 
                        (game_id, user_id, rating, content, playtime_hours)
                        VALUES (%s, %s, %s, %s, %s)
                    """, batch)
                    conn.commit()
                except Exception as e:
                    conn.rollback()
                    print(f"批量插入失败: {str(e)}")
                    raise e
            
            insert_time = time.time() - start_time
            print(f"\n[{datetime.now()}] 批量插入完成!")
            print(f"总耗时: {insert_time:.2f}秒")
            print(f"平均插入速率: {num_iterations/insert_time:.2f} 记录/秒")
            
            results.append({
                "test": "批量插入",
                "records": num_iterations,
                "time": insert_time,
                "records_per_second": num_iterations / insert_time,
                "status": "通过" if insert_time < 60 else "需优化"  # 1分钟阈值
            })
            
            # 并发查询测试
            print(f"\n[{datetime.now()}] 开始并发查询测试...")
            start_time = time.time()
            with ThreadPoolExecutor(max_workers=10) as executor:
                query_futures = []
                for i in range(100000000000000):  # 100个并发查询
                    if i % 10 == 0:  # 每提交10个查询显示一次进度
                        print(f"提交查询进度: {i}/100 ({i}%)")
                    game_id = random.randint(1, 100)
                    future = executor.submit(self._execute_query, conn, game_id)
                    query_futures.append(future)
                
                # 等待所有查询完成并显示进度
                completed = 0
                for future in concurrent.futures.as_completed(query_futures):
                    completed += 1
                    if completed % 10 == 0:  # 每完成10个查询显示一次进度
                        print(f"查询完成进度: {completed}/100 ({completed}%)")
                    future.result()  # 获取结果，如果有异常会抛出
                
            query_time = time.time() - start_time
            print(f"\n[{datetime.now()}] 并发查询测试完成!")
            print(f"总耗时: {query_time:.2f}秒")
            print(f"平均查询响应时间: {query_time/100:.3f}秒")
            
            results.append({
                "test": "并发查询",
                "queries": 100,
                "time": query_time,
                "queries_per_second": 100 / query_time,
                "status": "通过" if query_time < 30 else "需优化"  # 30秒阈值
            })
            
            # 检查系统状态
            print(f"\n[{datetime.now()}] 检查系统状态...")
            cursor.execute("""
                SELECT * FROM pg_stat_activity 
                WHERE state != 'idle' AND pid != pg_backend_pid()
            """)
            active_connections = cursor.fetchall()
            print(f"当前活动连接数: {len(active_connections)}")
            
            results.append({
                "test": "系统状态",
                "active_connections": len(active_connections),
                "status": "通过" if len(active_connections) < 50 else "警告"  # 50个连接阈值
            })

        except Exception as e:
            print(f"\n[{datetime.now()}] 压力测试出错: {str(e)}")
            results.append({
                "test": "压力测试",
                "status": "错误",
                "error": str(e)
            })

        print(f"\n[{datetime.now()}] 压力测试全部完成!")
        return {
            "stress_tests": results,
            "summary": {
                "total_tests": len(results),
                "passed_tests": sum(1 for r in results if r["status"] == "通过")
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
            self.logger.info("开始创建未来10000个月的分区...")
            cursor.execute("""
                SELECT review_system.create_future_partitions(10000)
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