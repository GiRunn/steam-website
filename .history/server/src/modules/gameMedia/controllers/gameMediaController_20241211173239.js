class GameMediaController {
    constructor(service) {
      this.service = service;
    }
  
    async getGameMedia(req, res) {
      const { gameId } = req.params;
  
      try {
        if (!gameId || isNaN(gameId)) {
          return res.status(400).json({
            error: "Invalid game ID",
            timestamp: new Date().toISOString()
          });
        }
  
        const mediaData = await this.service.getGameMedia(gameId);
        
        return res.status(200).json({
          data: mediaData,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        return res.status(500).json({
          error: "Failed to fetch game media",
          timestamp: new Date().toISOString()
        });
      }
    }
  }
  
  module.exports = GameMediaController;