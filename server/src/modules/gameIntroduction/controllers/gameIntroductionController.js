class GameIntroductionController {
    constructor(service) {
        this.service = service;
    }

    async getGameIntroductions(req, res) {
        try {
            const gameId = parseInt(req.params.gameId);
            
            if (isNaN(gameId)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid game ID'
                });
            }

            const result = await this.service.getGameIntroductions(gameId);
            return res.json(result);
        } catch (error) {
            console.error('Controller error:', error);
            return res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
}

module.exports = GameIntroductionController; 