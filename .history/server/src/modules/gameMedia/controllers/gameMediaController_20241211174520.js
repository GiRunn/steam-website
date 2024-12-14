// src/modules/gameMedia/controllers/gameMediaController.js
class GameMediaController {
    constructor(service) {
      this.service = service;
    }
  
    async getGameMedia(req, res) {
      const { gameId } = req.params;
      console.log('Received request for gameId:', gameId); // 添加日志
  
      try {
        if (!gameId || isNaN(gameId)) {
          return res.status(400).json({
            error: "Invalid game ID",
            timestamp: new Date().toISOString()
          });
        }
  
        const mediaData = await this.service.getGameMedia(gameId);
        console.log('Media data:', mediaData); // 添加日志
        
        return res.status(200).json({
          data: mediaData,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error in getGameMedia:', error); // 添加错误日志
        return res.status(500).json({
          error: "Failed to fetch game media",
          timestamp: new Date().toISOString()
        });
      }
    }
  }
  
  module.exports = GameMediaController;