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

# 配置日志记录
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(f'database_test_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log'),
        logging.StreamHandler()
    ]
)

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
        self._init_connection_pool()

    def _init_connection_pool(self):
        """初始化数据库连接池"""
        try:
            for _ in range(10):
                conn = psycopg2.connect(**self.db_config)
                self.connection_pool.put(conn)
        except Exception as e:
            self.logger.error(f"初始化连接池失败: {str(e)}")
            raise

    def get_connection(self) -> psycopg2.extensions.connection:
        """从连接池获取连接"""
        return self.connection_pool.get()

    def release_connection(self, conn: psycopg2.extensions.connection):
        """释放连接回连接池"""
        if not conn.closed:
            self.connection_pool.put(conn)

    def run_test(self, test_func, test_type: TestType, test_name: str, **kwargs) -> TestResult:
        """
        运行单个测试并记录结果
        
        Args:
            test_func: 测试函数
            test_type: 测试类型
            test_name: 测试名称
            **kwargs: 测试函数的额外参数
        
        Returns:
            TestResult: 测试结果对象
        """
        start_time = time.time()
        try:
            conn = self.get_connection()
            result = test_func(conn, **kwargs)
            success = True
            message = "测试通过"
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

    def save_report(self, report: Dict[str, Any], filename: str = None):
        """
        保存测试报告到文件
        
        Args:
            report: 测试报告字典
            filename: 保存的文件名
        """
        if filename is None:
            filename = f"test_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"

        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(report, f, ensure_ascii=False, indent=2)
            self.logger.info(f"测试报告已保存到: {filename}")
        except Exception as e:
            self.logger.error(f"保存测试报告失败: {str(e)}")

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

                # 测试直接字符串拼接（不安全）
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
                # 切换到测试角色
                cursor.execute(f"SET ROLE {role};")
                
                role_results = []
                for op_name, query in role_test["operations"]:
                    try:
                        cursor.execute(query)
                        conn.rollback()  # 回滚更改
                        role_results.append({
                            "operation": op_name,
                            "status": "需要检查",
                            "message": f"{role} 可以执行 {op_name} 操作"
                        })
                    except psycopg2.Error as e:
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
                results.append({
                    "role": role,
                    "status": "错误",
                    "message": str(e)
                })
            finally:
                # 恢复原始角色
                cursor.execute("RESET ROLE;")

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

        return {
            "performance_tests": results,
            "summary": {
                "total_queries": len(test_queries),
                "optimized_queries": sum(1 for r in results if r.get("status") == "通过"),
                "average_execution_time": np.mean([r.get("execution_time", 0) for r in results if r.get("execution_time")])
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

                # 检查是否使用了索引
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
                "name": "分区裁剪测试",
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
        """
        评论CRUD操作测试
        
        Args:
            conn: 数据库连接
            
        Returns:
            Dict: 测试结果详情
        """
        results = []
        cursor = conn.cursor()

        try:
            # 测试创建评论
            cursor.execute("""
                INSERT INTO review_system.reviews_partitioned 
                (game_id, user_id, rating, content, playtime_hours)
                VALUES (1001, 1, 4.5, '测试评论内容', 10)
                RETURNING review_id
            """)
            review_id = cursor.fetchone()[0]
            results.append({
                "operation": "CREATE",
                "status": "通过",
                "message": f"成功创建评论 ID: {review_id}"
            })

            # 测试读取评论
            cursor.execute("""
                SELECT * FROM review_system.reviews_partitioned 
                WHERE review_id = %s
            """, (review_id,))
            review = cursor.fetchone()
            results.append({
                "operation": "READ",
                "status": "通过" if review else "失败",
                "message": "成功读取评论" if review else "无法读取评论"
            })

            # 测试更新评论
            cursor.execute("""
                UPDATE review_system.reviews_partitioned 
                SET rating = 5.0, content = '更新后的评论内容'
                WHERE review_id = %s
            """, (review_id,))
            results.append({
                "operation": "UPDATE",
                "status": "通过",
                "message": "成功更新评论"
            })

            # 测试删除评论
            cursor.execute("""
                UPDATE review_system.reviews_partitioned 
                SET deleted_at = CURRENT_TIMESTAMP
                WHERE review_id = %s
            """, (review_id,))
            results.append({
                "operation": "DELETE",
                "status": "通过",
                "message": "成功标记评论为删除"
            })

            conn.commit()

        except Exception as e:
            conn.rollback()
            results.append({
                "operation": "ERROR",
                "status": "失败",
                "message": str(e)
            })

        return {
            "crud_tests": results,
            "summary": {
                "total_operations": len(results),
                "successful_operations": sum(1 for r in results if r["status"] == "通过")
            }
        }

    def test_review_summary_update(self, conn: psycopg2.extensions.connection) -> Dict[str, Any]:
        """
        评论汇总更新测试
        
        Args:
            conn: 数据库连接
            
        Returns:
            Dict: 测试结果详情
        """
        results = []
        cursor = conn.cursor()

        try:
            # 准备测试数据
            game_id = 1001
            cursor.execute("""
                INSERT INTO review_system.reviews_partitioned 
                (game_id, user_id, rating, content, playtime_hours)
                VALUES 
                (%s, 1, 4.5, '测试评论1', 10),
                (%s, 2, 3.5, '测试评论2', 5),
                (%s, 3, 5.0, '测试评论3', 15)
            """, (game_id, game_id, game_id))

            # 检查汇总数据更新
            cursor.execute("""
                SELECT total_reviews, average_rating, total_playtime_hours
                FROM review_system.review_summary_partitioned
                WHERE game_id = %s
                ORDER BY last_updated DESC
                LIMIT 1
            """, (game_id,))
            
            summary = cursor.fetchone()
            
            if summary:
                total_reviews, avg_rating, total_playtime = summary
                expected_total = 3
                expected_avg = (4.5 + 3.5 + 5.0) / 3
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
                        "status": "通过" if abs(avg_rating - expected_avg) < 0.01 else "失败",
                        "expected": expected_avg,
                        "actual": avg_rating
                    },
                    {
                        "test": "总游戏时间",
                        "status": "通过" if total_playtime == expected_playtime else "失败",
                        "expected": expected_playtime,
                        "actual": total_playtime
                    }
                ])
            else:
                results.append({
                    "test": "汇总数据",
                    "status": "失败",
                    "message": "未找到汇总数据"
                })

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
            
            # 批量插入测试
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
            
            # 并发查询测试
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
        资源限制测试
        
        Args:
            conn: 数据库连接
            
        Returns:
            Dict: 测试结果详情
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
                cursor.execute("""
                    INSERT INTO review_system.reviews_partitioned 
                    (game_id, user_id, rating, content)
                    VALUES (%s, %s, %s, %s)
                """, (
                    random.randint(1, 100),
                    start_id + i,
                    round(random.uniform(1, 5), 2),
                    f"并发测试评论 {start_id + i}"
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
        """
        死锁预防测试
        
        Args:
            conn: 数据库连接
            
        Returns:
            Dict: 测试结果详情
        """
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
                    )
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