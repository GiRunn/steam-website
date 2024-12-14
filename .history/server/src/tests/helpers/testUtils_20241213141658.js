import sinon from 'sinon';

export const waitForConnection = async (pool, maxAttempts = 5, delay = 100) => {
    for (let i = 0; i < maxAttempts; i++) {
        try {
            const client = await pool.connect();
            client.release();
            return true;
        } catch (error) {
            if (i === maxAttempts - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    return false;
};

export const createMockClient = () => ({
    query: sinon.stub().resolves({ rows: [] }),
    release: sinon.stub()
}); 