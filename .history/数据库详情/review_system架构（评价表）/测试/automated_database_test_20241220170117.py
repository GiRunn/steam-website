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