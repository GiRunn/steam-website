#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import psycopg2
import os
import sys
from datetime import datetime
from dotenv import load_dotenv

# 加载.env文件
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), 'server', '.env'))

# 从环境变量获取数据库配置
DB_CONFIG = {
    'dbname': os.getenv('DB_NAME', 'games'),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD', '123qweasdzxc..a'),
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': os.getenv('DB_PORT', '5432')
}

def check_file_exists(filename):
    """检查文件是否存在"""
    if not os.path.exists(filename):
        print(f"✗ 文件不存在: {filename}")
        return False
    return True

def execute_sql_file(conn, filename):
    """执行SQL文件"""
    if not check_file_exists(filename):
        return False
        
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            sql = f.read()
        
        with conn.cursor() as cur:
            cur.execute(sql)
            
        print(f"✓ 成功执行: {filename}")
        return True
    except UnicodeDecodeError as e:
        print(f"✗ 文件编码错误: {filename}")
        print(f"错误信息: {str(e)}")
        return False
    except psycopg2.Error as e:
        print(f"✗ 数据库执行错误: {filename}")
        print(f"错误代码: {e.pgcode}")
        print(f"错误信息: {str(e)}")
        return False
    except Exception as e:
        print(f"✗ 执行失败: {filename}")
        print(f"错误类型: {type(e).__name__}")
        print(f"错误信息: {str(e)}")
        return False

def run_tests():
    """运行所有测试"""
    print("=== 开始执行review_system测试套件 ===")
    print(f"开始时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # 获取当前脚本所在目录
    current_dir = os.path.dirname(os.path.abspath(__file__))
    print(f"当前工作目录: {current_dir}")
    
    try:
        # 尝试连接数据库
        print("\n正在连接数据库...")
        conn = psycopg2.connect(**DB_CONFIG)
        conn.set_client_encoding('UTF8')
        print("✓ 数据库连接成功")
        
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
        
        print("\n开始执行测试文件:")
        # 执行测试文件
        success = True
        for test_file in test_files:
            file_path = os.path.join(current_dir, test_file)
            print(f"\n正在执行: {test_file}")
            print(f"完整路径: {file_path}")
            
            if not execute_sql_file(conn, file_path):
                success = False
                break
        
        # 提交或回滚事务
        if success:
            conn.commit()
            print("\n✓ 所有测试执行完成")
        else:
            conn.rollback()
            print("\n✗ 测试执行失败，已回滚所有更改")
        
    except psycopg2.Error as e:
        print(f"\n✗ 数据库连接错误:")
        print(f"错误代码: {e.pgcode}")
        print(f"错误信息: {str(e)}")
    except Exception as e:
        print(f"\n✗ 发生错误:")
        print(f"错误类型: {type(e).__name__}")
        print(f"错误信息: {str(e)}")
    finally:
        if 'conn' in locals():
            conn.close()
            print("\n数据库连接已关闭")
    
    print(f"\n结束时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=====================================")

if __name__ == "__main__":
    run_tests()
    input("按回车键退出...") 