const gameDetailService = require('../services/gameDetailService');

class GameDetailController {
  async getGameMainInfo(req, res) {
    try {
      const gameId = parseInt(req.params.gameId);
      
      if (isNaN(gameId)) {
        return res.status(400).json({ error: 'Invalid game ID' });
      }

      const gameData = await gameDetailService.getGameMainInfo(gameId);
      
      if (!gameData) {
        return res.status(404).json({ error: 'Game not found' });
      }

      return res.json(gameData);
    } catch (error) {
      console.error('Error in getGameMainInfo:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new GameDetailController();