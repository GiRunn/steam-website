import psycopg2
import os
from datetime import datetime
import time
from utils.test_monitor import TestMonitor  # 添加这行导入

# 数据库连接配置
conn_params = {
    "dbname": "games",
    "user": "postgres",
    "password": "123qweasdzxc..a",
    "host": "localhost",
    "port": "5432"
}

def execute_sql_file(cur, conn, file_path, category=None):
    """执行单个SQL文件并处理事务"""
    try:
        print(f"\n正在执行: {os.path.basename(file_path)}")
        print("-" * 50)
        
        # 创建监控器实例
        monitor = TestMonitor(conn)
        
        with open(file_path, 'r', encoding='utf-8') as f:
            sql = f.read()
            
            # 开始新事务
            conn.rollback()
            
            # 开始监控
            test_id = monitor.start_test_monitoring(os.path.basename(file_path))
            
            # 记录开始时间
            start_time = time.time()
            
            # 执行SQL
            cur.execute(sql)
            conn.commit()
            
            # 记录监控指标
            if test_id:
                monitor.record_metrics(test_id)
            
            # 计算执行时间
            execution_time = time.time() - start_time
            
            # 获取监控报告
            if test_id:
                monitoring_report = monitor.end_test_monitoring(test_id)
                if monitoring_report:
                    print("\n监控报告:")
                    print("=" * 50)
                    print(monitoring_report)
                    print("=" * 50)
                
                # 保存监控快照
                snapshot_file = monitor.save_snapshot(os.path.basename(file_path))
                if snapshot_file:
                    print(f"监控快照已保存: {snapshot_file}")
            
            # 记录成功
            if category:
                cur.execute("""
                    SELECT review_system.record_test_result(%s, %s, %s, %s, %s::interval)
                """, (os.path.basename(file_path), category, '通过', 
                     f'执行成功，耗时: {execution_time:.2f}秒', 
                     f'{int(execution_time)} seconds'))
                conn.commit()
            
            print(f"执行成功！耗时: {execution_time:.2f}秒")
            print(f"影响的行数: {cur.rowcount}")
            return True
            
    except Exception as e:
        conn.rollback()
        print(f"执行失败: {str(e)}")
        print(f"失败的SQL文件: {file_path}")
        print(f"错误位置: {e.__traceback__.tb_lineno}")
        
        # 记录失败
        if category:
            try:
                cur.execute("""
                    SELECT review_system.record_test_result(%s, %s, %s, %s, NULL)
                """, (os.path.basename(file_path), category, '失败', str(e)))
                conn.commit()
            except Exception as inner_e:
                print(f"记录测试结果失败: {str(inner_e)}")
        return False

def get_db_connection(max_retries=3, retry_delay=5):
    """获取数据库连接，带重试机制"""
    retry_count = 0
    while retry_count < max_retries:
        try:
            conn = psycopg2.connect(**conn_params)
            return conn
        except psycopg2.OperationalError as e:
            retry_count += 1
            if retry_count == max_retries:
                raise e
            print(f"连接失败，{retry_delay}秒后重试...")
            time.sleep(retry_delay)

def generate_test_report(cur):
    """生成详细的测试报告"""
    print("\n" + "=" * 80)
    print("详细测试报告")
    print("=" * 80)
    
    # 获取测试统计
    cur.execute("""
        SELECT 
            test_category,
            COUNT(*) as total_tests,
            COUNT(*) FILTER (WHERE status = '通过') as passed,
            COUNT(*) FILTER (WHERE status = '失败') as failed,
            AVG(EXTRACT(EPOCH FROM execution_time)) as avg_time
        FROM review_system.test_results
        GROUP BY test_category
        ORDER BY test_category
    """)
    
    stats = cur.fetchall()
    
    print("\n类别统计:")
    print("-" * 80)
    print(f"{'类别':<20} | {'总数':>8} | {'通过':>8} | {'失败':>8} | {'平均耗时(秒)':>12}")
    print("-" * 80)
    
    for stat in stats:
        print(f"{stat[0]:<20} | {stat[1]:>8} | {stat[2]:>8} | {stat[3]:>8} | {stat[4]:>12.2f}")
    
    # 获取失败的测试详情
    cur.execute("""
        SELECT test_name, test_category, error_message, execution_time
        FROM review_system.test_results
        WHERE status = '失败'
        ORDER BY executed_at DESC
    """)
    
    failures = cur.fetchall()
    
    if failures:
        print("\n失败的测试详情:")
        print("-" * 80)
        for failure in failures:
            print(f"测试名称: {failure[0]}")
            print(f"测试类别: {failure[1]}")
            print(f"错误信息: {failure[2]}")
            print(f"执行时间: {failure[3]}")
            print("-" * 80)
    else:
        print("\n没有失败的测试！")

def generate_html_report(cur):
    """生成HTML测试报告"""
    try:
        cur.execute("SELECT review_system.generate_visual_report()")
        report_html = cur.fetchone()[0]
        
        # 保存报告到文件
        report_path = os.path.join(script_dir, "test_report.html")
        with open(report_path, "w", encoding="utf-8") as f:
            f.write(report_html)
        
        print(f"\n测试报告已生成: {report_path}")
        
        # 在浏览器中打开报告
        import webbrowser
        webbrowser.open(f"file://{report_path}")
        
    except Exception as e:
        print(f"生成测试报告失败: {str(e)}")

def monitor_database_status(cur):
    """监控数据库状态"""
    try:
        cur.execute("SELECT * FROM review_system.monitor_database_metrics()")
        metrics = cur.fetchall()
        
        print("\n数据库状态监控")
        print("-" * 50)
        print(f"{'指标名称':<20} | {'当前值':>10} | {'阈值':>10} | {'状态':>10}")
        print("-" * 50)
        
        for metric in metrics:
            print(f"{metric[0]:<20} | {metric[1]:>10.2f} | {metric[2]:>10.2f} | {metric[3]:>10}")
            
    except Exception as e:
        print(f"监控数据库状态失败: {str(e)}")

def run_tests():
    try:
        print("正在连接数据库...")
        conn = get_db_connection()
        cur = conn.cursor()
        
        print(f"开始测试 - {datetime.now()}")
        
        script_dir = os.path.dirname(os.path.abspath(__file__))

        # 首先执行测试框架脚本（不使用监控）
        framework_file = os.path.join(script_dir, "00_测试框架.sql")
        if os.path.exists(framework_file):
            print("\n创建测试框架...")
            with open(framework_file, 'r', encoding='utf-8') as f:
                cur.execute(f.read())
                conn.commit()

        # 然后初始化监控系统
        monitor = TestMonitor(conn)
        
        # 运行一键部署脚本
        deploy_script = os.path.join(script_dir, "..", "生成review_system架构SQL命令", "一键部署review_system架构（评价表）.py")
        if os.path.exists(deploy_script):
            print("\n运行一键部署脚本...")
            import subprocess
            try:
                subprocess.run(['python', deploy_script], check=True)
                print("一键部署脚本执行完成")
            except subprocess.CalledProcessError as e:
                print(f"一键部署脚本执行失败: {str(e)}")
                raise

        # 执行测试文件
        test_files = [
            ("01_基础数据测试.sql", "基础数据测试"),
            ("02_分区测试.sql", "分区测试"),
            # ... 其他测试文件
        ]
        
        for test_file, category in test_files:
            print(f"\n执行测试: {test_file}")
            file_path = os.path.join(script_dir, test_file)
            
            if os.path.exists(file_path):
                execute_sql_file(cur, conn, file_path, category)
            else:
                print(f"错误: 找不到文件 {file_path}")

        # 执行极限测试
        extreme_test_dir = os.path.join(script_dir, "极限测试")
        if os.path.exists(extreme_test_dir):
            print("\n执行极限测试...")
            extreme_test_files = [
                ("01_安全测试.sql", "安全测试"),
                ("02_容量测试.sql", "容量测试"),
                ("03_特殊情况测试.sql", "特殊情况测试"),
                ("04_并发测试.sql", "并发测试"),
                ("05_故障恢复测试.sql", "故障恢复测试")
            ]
            
            for test_file, category in extreme_test_files:
                file_path = os.path.join(extreme_test_dir, test_file)
                if os.path.exists(file_path):
                    print(f"\n执行: {test_file}")
                    execute_sql_file(cur, conn, file_path, f"极限测试-{category}")
        
        # 获取测试报告
        try:
            # 确保所有测试完成后再生成报告
            conn.commit()
            
            # 生成报告
            generate_test_report(cur)
            
        except Exception as e:
            print(f"获取测试报告时出错: {str(e)}")
            
        # 在主测试流程结束后调用这些函数
        generate_html_report(cur)
        monitor_database_status(cur)
        
    except Exception as e:
        print(f"发生错误: {str(e)}")
    finally:
        if cur:
            cur.close()
        if conn and not conn.closed:
            conn.close()
            print("\n数据库连接已关闭")

if __name__ == "__main__":
    run_tests()