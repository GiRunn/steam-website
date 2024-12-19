import psycopg2
import json
from datetime import datetime

class TestMonitor:
    def __init__(self, conn):
        self.conn = conn
        self.cur = conn.cursor()
        self.setup_monitoring()

    def setup_monitoring(self):
        """初始化监控系统"""
        try:
            # 执行监控系统设置SQL
            setup_files = [
                "enhanced_monitoring.sql",
                "test_wrapper.sql"
            ]
            
            for file in setup_files:
                with open(f"utils/{file}", "r", encoding="utf-8") as f:
                    self.cur.execute(f.read())
            self.conn.commit()
            
        except Exception as e:
            print(f"监控系统设置失败: {str(e)}")
            self.conn.rollback()

    def start_test_monitoring(self, test_name):
        """开始测试监控"""
        try:
            self.cur.execute("""
                SELECT review_system.start_monitoring(%s)
            """, (test_name,))
            test_id = self.cur.fetchone()[0]
            self.conn.commit()
            return test_id
        except Exception as e:
            print(f"开始监控失败: {str(e)}")
            return None

    def record_metrics(self, test_id):
        """记录监控指标"""
        try:
            self.cur.execute("""
                SELECT review_system.monitor_resource_usage(%s);
                SELECT review_system.monitor_query_performance(%s);
                SELECT review_system.monitor_locks(%s);
                SELECT review_system.monitor_connections(%s);
            """, (test_id, test_id, test_id, test_id))
            self.conn.commit()
        except Exception as e:
            print(f"记录监控指标失败: {str(e)}")

    def end_test_monitoring(self, test_id):
        """结束测试监控并获取报告"""
        try:
            self.cur.execute("""
                SELECT review_system.generate_monitoring_report(%s)
            """, (test_id,))
            report = self.cur.fetchone()[0]
            self.conn.commit()
            return report
        except Exception as e:
            print(f"生成监控报告失败: {str(e)}")
            return None

    def save_snapshot(self, test_name):
        """保存监控快照"""
        try:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"utils/db_monitor_snapshot_{timestamp}.txt"
            
            self.cur.execute("SELECT * FROM review_system.enhanced_monitor_metrics()")
            metrics = self.cur.fetchall()
            
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(f"数据库监控快照 - {datetime.now()}\n")
                f.write("=" * 80 + "\n\n")
                
                last_category = None
                for metric in metrics:
                    category, name, value, threshold, status, details = metric
                    
                    if category != last_category:
                        f.write(f"\n=== {category} ===\n\n")
                        last_category = category
                    
                    f.write(f"{name}:\n")
                    f.write(f"  值: {value:.2f}\n")
                    f.write(f"  阈值: {threshold:.2f}\n")
                    f.write(f"  状态: {status}\n")
                    
                    if details:
                        f.write("  详细信息:\n")
                        if isinstance(details, str):
                            details = json.loads(details)
                        for key, value in details.items():
                            f.write(f"    {key}: {value}\n")
            
            return filename
        except Exception as e:
            print(f"保存监控快照失败: {str(e)}")
            return None 