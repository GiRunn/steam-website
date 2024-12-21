import psycopg2
from psycopg2 import Error
import time
from datetime import datetime
import json

class ReviewSystemValidator:
    def __init__(self):
        self.connection = None
        self.cursor = None
        self.test_results = []
        
    def connect_db(self):
        """连接数据库"""
        try:
            self.connection = psycopg2.connect(
                database="postgres",
                user="postgres",
                password="123456",
                host="localhost",
                port="5432"
            )
            self.cursor = self.connection.cursor()
            print("✓ 数据库连接成功")
            return True
        except Error as e:
            print(f"✗ 数据库连接失败: {str(e)}")
            return False

    def test_table_structure(self):
        """测试表结构完整性"""
        required_tables = [
            'reviews',
            'users',
            'products',
            'review_ratings',
            'review_comments'
        ]
        
        for table in required_tables:
            try:
                self.cursor.execute(f"""
                    SELECT EXISTS (
                        SELECT FROM information_schema.tables 
                        WHERE table_schema = 'review_system' 
                        AND table_name = '{table}'
                    );
                """)
                exists = self.cursor.fetchone()[0]
                self.test_results.append({
                    'test': f'表 {table} 存在性检查',
                    'result': '通过' if exists else '失败',
                    'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                })
            except Error as e:
                self.test_results.append({
                    'test': f'表 {table} 存在性检查',
                    'result': '错误',
                    'error': str(e),
                    'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                })

    def test_data_insertion(self):
        """测试数据插入功能"""
        try:
            # 测试用户插入
            self.cursor.execute("""
                INSERT INTO review_system.users (username, email) 
                VALUES ('test_user', 'test@example.com')
                RETURNING user_id;
            """)
            user_id = self.cursor.fetchone()[0]
            
            # 测试产品插入
            self.cursor.execute("""
                INSERT INTO review_system.products (product_name, description) 
                VALUES ('测试产品', '这是一个测试产品')
                RETURNING product_id;
            """)
            product_id = self.cursor.fetchone()[0]
            
            # 测试评论插入
            self.cursor.execute("""
                INSERT INTO review_system.reviews (user_id, product_id, rating, review_text) 
                VALUES (%s, %s, 5, '这是一个测试评论')
                RETURNING review_id;
            """, (user_id, product_id))
            
            self.connection.commit()
            self.test_results.append({
                'test': '数据插入测试',
                'result': '通过',
                'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            })
        except Error as e:
            self.connection.rollback()
            self.test_results.append({
                'test': '数据插入测试',
                'result': '失败',
                'error': str(e),
                'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            })

    def test_indexes(self):
        """测试索引性能"""
        try:
            self.cursor.execute("""
                EXPLAIN ANALYZE
                SELECT r.*, u.username, p.product_name
                FROM review_system.reviews r
                JOIN review_system.users u ON r.user_id = u.user_id
                JOIN review_system.products p ON r.product_id = p.product_id
                WHERE r.rating > 3;
            """)
            
            execution_plan = self.cursor.fetchall()
            self.test_results.append({
                'test': '索引性能测试',
                'result': '通过',
                'execution_plan': execution_plan,
                'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            })
        except Error as e:
            self.test_results.append({
                'test': '索引性能测试',
                'result': '失败',
                'error': str(e),
                'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            })

    def test_constraints(self):
        """测试约束条件"""
        try:
            # 测试评分范围约束
            self.cursor.execute("""
                INSERT INTO review_system.reviews (user_id, product_id, rating, review_text)
                VALUES (1, 1, 6, '测试非法评分');
            """)
            self.connection.rollback()
            self.test_results.append({
                'test': '评分范围约束测试',
                'result': '失败',
                'error': '允许了超出范围的评分',
                'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            })
        except Error as e:
            if "check constraint" in str(e).lower():
                self.test_results.append({
                    'test': '评分范围约束测试',
                    'result': '通过',
                    'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                })
            else:
                self.test_results.append({
                    'test': '评分范围约束测试',
                    'result': '失败',
                    'error': str(e),
                    'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                })

    def test_triggers(self):
        """测试触发器功能"""
        try:
            # 测试评论更新触发器
            self.cursor.execute("""
                UPDATE review_system.reviews 
                SET rating = 4 
                WHERE review_id = (SELECT MIN(review_id) FROM review_system.reviews);
            """)
            self.connection.commit()
            
            # 验证更新时间是否已更新
            self.cursor.execute("""
                SELECT updated_at 
                FROM review_system.reviews 
                WHERE review_id = (SELECT MIN(review_id) FROM review_system.reviews);
            """)
            updated_at = self.cursor.fetchone()[0]
            
            if (datetime.now() - updated_at).total_seconds() < 5:
                self.test_results.append({
                    'test': '触发器功能测试',
                    'result': '通过',
                    'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                })
            else:
                self.test_results.append({
                    'test': '触发器功能测试',
                    'result': '失败',
                    'error': '更新时间戳未正确更新',
                    'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                })
        except Error as e:
            self.test_results.append({
                'test': '触发器功能测试',
                'result': '失败',
                'error': str(e),
                'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            })

    def generate_report(self):
        """生成测试报告"""
        report = {
            'test_time': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'total_tests': len(self.test_results),
            'passed_tests': len([t for t in self.test_results if t['result'] == '通过']),
            'failed_tests': len([t for t in self.test_results if t['result'] == '失败']),
            'test_results': self.test_results
        }
        
        # 保存报告到文件
        with open('review_system_validation_report.json', 'w', encoding='utf-8') as f:
            json.dump(report, f, ensure_ascii=False, indent=2)
        
        # 打印报告摘要
        print("\n=== 测试报告摘要 ===")
        print(f"测试时间: {report['test_time']}")
        print(f"总测试数: {report['total_tests']}")
        print(f"通过测试: {report['passed_tests']}")
        print(f"失败测试: {report['failed_tests']}")
        print("\n详细测试结果已保存到 review_system_validation_report.json")

    def cleanup(self):
        """清理测试数据"""
        try:
            self.cursor.execute("""
                DELETE FROM review_system.reviews WHERE review_text = '这是一个测试评论';
                DELETE FROM review_system.users WHERE username = 'test_user';
                DELETE FROM review_system.products WHERE product_name = '测试产品';
            """)
            self.connection.commit()
        except Error as e:
            print(f"清理测试数据时出错: {str(e)}")
        finally:
            if self.cursor:
                self.cursor.close()
            if self.connection:
                self.connection.close()

    def run_all_tests(self):
        """运行所有测试"""
        if not self.connect_db():
            return False
        
        print("\n开始运行测试...")
        self.test_table_structure()
        self.test_data_insertion()
        self.test_indexes()
        self.test_constraints()
        self.test_triggers()
        
        self.generate_report()
        self.cleanup()
        print("\n测试完成！")
        return True

if __name__ == "__main__":
    validator = ReviewSystemValidator()
    validator.run_all_tests() 