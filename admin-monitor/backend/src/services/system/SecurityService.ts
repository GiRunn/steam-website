import BaseService from '../base/BaseService';

export default class SecurityService extends BaseService {
    async getSecurityEvents() {
        return this.withClient(async (client) => {
            // 检测SQL注入
            const sqlInjectionResult = await client.query(`
                SELECT 
                    query,
                    usename,
                    client_addr,
                    application_name,
                    backend_start,
                    state_change
                FROM pg_stat_activity
                WHERE query ~ '(''|;|--|/\\*|\\*/|@@|char|nchar|varchar|nvarchar|alter|begin|cast|create|cursor|declare|delete|drop|end|exec|execute|fetch|insert|kill|open|select|sys|sysobjects|syscolumns|table|update)'
                AND query !~ 'pg_stat_activity'
            `);

            // 检测可疑活动
            const suspiciousResult = await client.query(`
                SELECT 
                    query,
                    usename,
                    client_addr,
                    application_name,
                    backend_start,
                    state_change
                FROM pg_stat_activity
                WHERE (
                    query ~ 'truncate|drop|delete|update.*where.*true|insert.*select'
                    OR query_start < now() - interval '1 hour'
                )
                AND query !~ 'pg_stat_activity'
            `);

            return {
                events: [...sqlInjectionResult.rows, ...suspiciousResult.rows].map(event => ({
                    type: event.query.match(/(''|;|--|\/\*|\*\/)/) ? 'sql_injection' : 'suspicious_activity',
                    description: event.query.substring(0, 100) + '...',
                    ip_address: event.client_addr,
                    user_agent: event.application_name,
                    timestamp: event.state_change,
                    severity: event.query.match(/(drop|truncate|delete)/) ? 'high' : 'medium'
                })),
                alerts: this.generateSecurityAlerts([...sqlInjectionResult.rows, ...suspiciousResult.rows])
            };
        });
    }

    private generateSecurityAlerts(events: any[]) {
        const alerts = [];
        if (events.some(e => e.query.match(/(drop|truncate)/))) {
            alerts.push('检测到高危DDL操作！');
        }
        if (events.some(e => e.query.match(/(''|;|--|\/\*|\*\/)/))) {
            alerts.push('检测到潜在的SQL注入攻击！');
        }
        return alerts;
    }
} 