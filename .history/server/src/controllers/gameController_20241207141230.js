class GameController {
    static async getGameMainInfo(req, res) {
      try {
        const gameId = parseInt(req.params.gameId);
        
        if (isNaN(gameId)) {
          return res.status(400).json({ error: 'Invalid game ID' });
        }
  
        // 暂时返回测试数据
        return res.json({ message: 'Game info endpoint working' });
      } catch (error) {
        console.error('Error in getGameMainInfo:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
    }
  }
  
  module.exports = { GameController };  // 修改这里，确保导出对象