class GameSystemController {
    constructor(service) {
        if (!service) throw new Error('Service is required');
        this.service = service;
    }

    async getSystemRequirements(req, res) {
        try {
            const gameId = parseInt(req.params.gameId);
            
            if (isNaN(gameId)) {
                return res.status(400).json({
                    error: 'Invalid game ID',
                    timestamp: new Date().toISOString()
                });
            }

            const systemReq = await this.service.getSystemRequirements(gameId);
            
            return res.json({
                data: systemReq,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Controller error:', error);
            
            if (error.message === 'Game not found') {
                return res.status(404).json({
                    error: 'Game not found',
                    timestamp: new Date().toISOString()
                });
            }

            return res.status(500).json({
                error: process.env.NODE_ENV === 'development' 
                    ? error.message 
                    : 'Internal server error',
                timestamp: new Date().toISOString()
            });
        }
    }
}

module.exports = GameSystemController; 