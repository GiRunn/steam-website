require('dotenv').config();
const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:5000';

async function testGameBasicInfo() {
    try {
        console.log('Testing Game Basic Info API...\n');

        // 测试成功案例
        console.log('1. Testing valid game ID (1001):');
        const successResponse = await axios.get(`${API_URL}/api/v1/games/1001/basic`);
        console.log('Response:', JSON.stringify(successResponse.data, null, 2));
        console.log('\n');

        // 测试无效ID
        console.log('2. Testing invalid game ID:');
        try {
            await axios.get(`${API_URL}/api/v1/games/invalid/basic`);
        } catch (error) {
            console.log('Error Response:', JSON.stringify(error.response.data, null, 2));
        }
        console.log('\n');

        // 测试不存在的游戏
        console.log('3. Testing non-existent game ID:');
        try {
            await axios.get(`${API_URL}/api/v1/games/99999/basic`);
        } catch (error) {
            console.log('Error Response:', JSON.stringify(error.response.data, null, 2));
        }
        console.log('\n');

    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

testGameBasicInfo(); 