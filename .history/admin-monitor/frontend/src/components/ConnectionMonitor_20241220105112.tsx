const fetchConnectionDetails = async (retryCount = 3) => {
    try {
        const response = await fetch('/api/connections/details');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.code === 200) {
            return data.data;
        }
        throw new Error(data.message || '获取数据失败');
    } catch (error) {
        if (retryCount > 0) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            return fetchConnectionDetails(retryCount - 1);
        }
        throw error;
    }
}; 