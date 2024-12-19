#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import psycopg2
import os
import sys
from datetime import datetime

# 数据库连接配置
DB_CONFIG = {
    'dbname': 'your_database',
    'user': 'your_username',
    'password': '123qweasdzxc..a',
    'host': 'localhost',
    'port': '5432'
}

def execute_sql_file(conn, filename):
    """执行SQL文件"""
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            sql = f.read()
        
        with conn.cursor() as cur:
            cur.execute(sql)
            
        print(f"✓ 成功执行: {filename}")
        return True
    except Exception as e:
        print(f"✗ 执行失败: {filename}")
        print(f"错误信息: {str(e)}")
        return False

def run_tests():
    """运行所有测试"""
    print("=== 开始执行review_system测试套件 ===")
    print(f"开始时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    try:
        # 连接数据库
        conn = psycopg2.connect(**DB_CONFIG)
        conn.set_client_encoding('UTF8')
        
        # 测试文件列表
        test_files = [
            '00_测试框架.sql',
            '01_基础数据测试.sql',
            '02_分区测试.sql',
            '03_触发器测试.sql',
            '04_性能测试.sql',
            '06_边界测试.sql',
            '07_性能基准测试.sql',
            '08_极限测试.sql',
            'run_all_tests.sql'
        ]
        
        # 执行测试文件
        success = True
        for test_file in test_files:
            file_path = os.path.join(os.path.dirname(__file__), test_file)
            if not execute_sql_file(conn, file_path):
                success = False
                break
        
        # 提交事务
        if success:
            conn.commit()
            print("\n✓ 所有测试执行完成")
        else:
            conn.rollback()
            print("\n✗ 测试执行失败，已回滚所有更改")
        
    except Exception as e:
        print(f"\n✗ 发生错误: {str(e)}")
        if 'conn' in locals():
            conn.rollback()
    finally:
        if 'conn' in locals():
            conn.close()
    
    print(f"\n结束时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=====================================")

if __name__ == "__main__":
    run_tests()
    input("按回车键退出...") 