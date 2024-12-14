// src/modules/gameFeature/controllers/gameFeatureController.js
class GameFeatureController {
    constructor(service) {
        if (!service) throw new Error('Service is required');
        this.service = service;
    }

    async getGameFeatureInfo(req, res) {
        try {
            const { gameId } = req.params;
            const gameInfo = await this.service.getGameFeatureInfo(gameId);
            
            res.json({
                data: gameInfo,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Controller error:', error);
            res.status(error.message === 'Game not found' ? 404 : 500).json({
                error: error.message,
                status: error.message === 'Game not found' ? 404 : 500,
                timestamp: new Date().toISOString()
            });
        }
    }
}

module.exports = GameFeatureController;