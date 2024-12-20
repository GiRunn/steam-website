import { Pool } from 'pg';

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'games',
    user: 'postgres',
    password: '123qweasdzxc..a',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    application_name: 'admin-monitor',
    log: (msg) => console.log(msg)
});

export default pool; 