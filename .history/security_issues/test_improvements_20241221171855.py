# 1. 添加更详细的错误分类
ERROR_TYPES = {
    'syntax_error': '语法错误',
    'permission_error': '权限错误',
    'type_error': '类型错误',
    'transaction_error': '事务错误',
    'connection_error': '连接错误'
}

# 2. 改进测试结果记录
def record_test_result(test_name, error, error_type):
    return {
        'test_name': test_name,
        'status': 'failed' if error else 'passed',
        'error_type': ERROR_TYPES.get(error_type, '未知错误'),
        'error_message': str(error) if error else None,
        'timestamp': datetime.now().isoformat()
    } 