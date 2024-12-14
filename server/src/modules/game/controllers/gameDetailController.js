// src/modules/game/controllers/gameDetailController.js
class GameDetailController {
  constructor(service) {
      if (!service) {
          throw new Error('Service is required');
      }
      this.service = service;
  }

  async getGameMainInfo(req, res) {
      try {
          const gameId = parseInt(req.params.gameId);
          
          if (isNaN(gameId)) {
              return res.status(400).json({ error: 'Invalid game ID' });
          }

          const gameData = await this.service.getGameMainInfo(gameId);
          
          if (!gameData) {
              return res.status(404).json({ error: 'Game not found' });
          }

          return res.json(gameData);
      } catch (error) {
          console.error('Controller error:', {
              message: error.message,
              stack: error.stack,
              code: error.code
          });
          
          return res.status(500).json({ 
              error: 'Internal server error',
              details: error.message
          });
      }
  }
}

module.exports = GameDetailController;