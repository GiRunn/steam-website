# SQL注入漏洞清单

## 1. LIKE查询漏洞
- 文件: review_system.reviews_partitioned
- 漏洞点: content LIKE查询
- 注入样例:
  ```sql
  ' OR '1'='1
  ' OR 1=1 --
  admin'--
  '; DELETE FROM review_system.reviews_partitioned; --
  '; TRUNCATE TABLE review_system.reviews_partitioned; --
  ```
- 风险等级: 高
- 影响: 可能导致未授权数据访问或数据删除

## 2. 权限检查不足
- 问题: review_readonly角色可以执行写操作
- 受影响操作: INSERT, UPDATE, DELETE
- 风险等级: 高
- 建议: 严格限制只读角色的权限

## 3. 事务处理问题
- 问题: 部分查询在事务回滚后仍可能执行成功
- 风险等级: 中
- 建议: 确保所有操作都在正确的事务控制下 