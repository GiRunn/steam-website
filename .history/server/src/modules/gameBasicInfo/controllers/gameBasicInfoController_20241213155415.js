class GameBasicInfoController {
    constructor(service) {
        if (!service) throw new Error('Service is required');
        this.service = service;
    }

    async getGameBasicInfo(req, res) {
        try {
            const gameId = parseInt(req.params.gameId);
            
            if (isNaN(gameId)) {
                return res.status(400).json({
                    code: 400,
                    message: 'Invalid game ID',
                    timestamp: new Date().toISOString()
                });
            }

            const gameInfo = await this.service.getGameBasicInfo(gameId);
            
            return res.status(200).json({
                code: 200,
                data: gameInfo,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Controller error:', error);
            
            if (error.message === 'Game not found') {
                return res.status(404).json({
                    code: 404,
                    message: 'Game not found',
                    timestamp: new Date().toISOString()
                });
            }

            return res.status(500).json({
                code: 500,
                message: 'Internal server error',
                timestamp: new Date().toISOString()
            });
        }
    }
}

module.exports = GameBasicInfoController; 