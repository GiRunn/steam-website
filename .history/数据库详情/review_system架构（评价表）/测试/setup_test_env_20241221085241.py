import os
import sys
import subprocess
import platform
import logging
from datetime import datetime
import psycopg2

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(f'setup_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

def check_python_version():
    """检查Python版本"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        logger.error("需要Python 3.8或更高版本")
        return False
    return True

def install_pip():
    """确保pip已安装"""
    try:
        import pip
        logger.info("pip已安装")
        return True
    except ImportError:
        logger.info("正在安装pip...")
        try:
            subprocess.check_call([sys.executable, "-m", "ensurepip"])
            return True
        except Exception as e:
            logger.error(f"安装pip失败: {str(e)}")
            return False

def install_requirements():
    """安装requirements.txt中的依赖"""
    requirements_file = os.path.join(os.path.dirname(__file__), "requirements.txt")
    
    if not os.path.exists(requirements_file):
        logger.error("requirements.txt文件不存在")
        return False
        
    try:
        logger.info("正在安装依赖包...")
        subprocess.check_call([
            sys.executable, 
            "-m", 
            "pip", 
            "install", 
            "-r", 
            requirements_file,
            "--upgrade"
        ])
        return True
    except Exception as e:
        logger.error(f"安装依赖包失败: {str(e)}")
        return False

def check_postgres():
    """检查PostgreSQL连接并确保schema和基础表存在"""
    try:
        conn = psycopg2.connect(
            dbname="postgres",
            user="postgres",
            password="123qweasdzxc..a",
            host="localhost",
            port="5432"
        )
        
        cursor = conn.cursor()
        
        # 检查schema是否存在
        cursor.execute("""
            CREATE SCHEMA IF NOT EXISTS review_system;
        """)
        
        # 创建基础分区表 - reviews_partitioned
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS review_system.reviews_partitioned (
                review_id BIGSERIAL,
                game_id BIGINT NOT NULL,
                user_id BIGINT NOT NULL,
                rating DECIMAL(3,2) NOT NULL CHECK (rating >= 0 AND rating <= 5),
                content TEXT NOT NULL,
                playtime_hours INTEGER DEFAULT 0,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                deleted_at TIMESTAMP WITH TIME ZONE,
                PRIMARY KEY (review_id, created_at)
            ) PARTITION BY RANGE (created_at);
        """)

        # 创建回复分区表 - review_replies_partitioned
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS review_system.review_replies_partitioned (
                reply_id BIGSERIAL,
                review_id BIGINT NOT NULL,
                user_id BIGINT NOT NULL,
                content TEXT NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                deleted_at TIMESTAMP WITH TIME ZONE,
                PRIMARY KEY (reply_id, created_at)
            ) PARTITION BY RANGE (created_at);
        """)

        # 创建汇总分区表 - review_summary_partitioned
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS review_system.review_summary_partitioned (
                game_id BIGINT NOT NULL,
                total_reviews INTEGER DEFAULT 0,
                average_rating DECIMAL(3,2) DEFAULT 0,
                total_playtime_hours INTEGER DEFAULT 0,
                total_likes INTEGER DEFAULT 0,
                total_replies INTEGER DEFAULT 0,
                replies_likes INTEGER DEFAULT 0,
                pc_count INTEGER DEFAULT 0,
                ps5_count INTEGER DEFAULT 0,
                xbox_count INTEGER DEFAULT 0,
                en_us_count INTEGER DEFAULT 0,
                en_gb_count INTEGER DEFAULT 0,
                zh_cn_count INTEGER DEFAULT 0,
                es_es_count INTEGER DEFAULT 0,
                ja_jp_count INTEGER DEFAULT 0,
                recommended_count INTEGER DEFAULT 0,
                last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (game_id, last_updated)
            ) PARTITION BY RANGE (last_updated);
        """)

        # 创建分区管理函数
        cursor.execute("""
            CREATE OR REPLACE FUNCTION review_system.create_future_partitions(
                months_ahead integer DEFAULT 6
            ) RETURNS void AS $$
            DECLARE
                current_date timestamp with time zone := CURRENT_TIMESTAMP;
                partition_date timestamp with time zone;
                partition_name text;
            BEGIN
                FOR i IN 0..months_ahead LOOP
                    partition_date := date_trunc('month', current_date + (i || ' months')::interval);
                    
                    -- 创建评论表分区
                    partition_name := 'reviews_y' || to_char(partition_date, 'YYYY') || 'm' || to_char(partition_date, 'MM');
                    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'review_system' AND tablename = partition_name) THEN
                        EXECUTE format(
                            'CREATE TABLE review_system.%I PARTITION OF review_system.reviews_partitioned
                            FOR VALUES FROM (%L) TO (%L)',
                            partition_name,
                            partition_date,
                            partition_date + interval '1 month'
                        );
                    END IF;

                    -- 创建回复表分区
                    partition_name := 'replies_y' || to_char(partition_date, 'YYYY') || 'm' || to_char(partition_date, 'MM');
                    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'review_system' AND tablename = partition_name) THEN
                        EXECUTE format(
                            'CREATE TABLE review_system.%I PARTITION OF review_system.review_replies_partitioned
                            FOR VALUES FROM (%L) TO (%L)',
                            partition_name,
                            partition_date,
                            partition_date + interval '1 month'
                        );
                    END IF;

                    -- 创建汇总表分区
                    partition_name := 'summary_y' || to_char(partition_date, 'YYYY') || 'm' || to_char(partition_date, 'MM');
                    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'review_system' AND tablename = partition_name) THEN
                        EXECUTE format(
                            'CREATE TABLE review_system.%I PARTITION OF review_system.review_summary_partitioned
                            FOR VALUES FROM (%L) TO (%L)',
                            partition_name,
                            partition_date,
                            partition_date + interval '1 month'
                        );
                    END IF;
                END LOOP;
            END;
            $$ LANGUAGE plpgsql;
        """)

        # 创建当前和未来6个月的分区
        cursor.execute("SELECT review_system.create_future_partitions(6)")
        
        conn.commit()
        cursor.close()
        conn.close()
        
        logger.info("PostgreSQL连接测试成功，基础表结构已创建")
        return True
        
    except Exception as e:
        logger.error(f"PostgreSQL连接测试失败: {str(e)}")
        return False

def main():
    """主函数"""
    logger.info("开始设置测试环境...")
    
    # 检查Python版本
    if not check_python_version():
        sys.exit(1)
    
    # 安装pip
    if not install_pip():
        sys.exit(1)
    
    # 安装依赖
    if not install_requirements():
        sys.exit(1)
    
    # 检查数据库连接
    if not check_postgres():
        sys.exit(1)
    
    logger.info("环境设置完成!")
    
    # 运行测试脚本
    try:
        logger.info("开始运行测试...")
        test_script = os.path.join(os.path.dirname(__file__), "automated_database_test.py")
        subprocess.check_call([sys.executable, test_script])
    except Exception as e:
        logger.error(f"运行测试失败: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main() 