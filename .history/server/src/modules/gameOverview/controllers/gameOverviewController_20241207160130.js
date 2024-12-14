// server/src/modules/gameOverview/controllers/gameOverviewController.js
class GameOverviewController {
    constructor(gameOverviewService) {
        this.gameOverviewService = gameOverviewService;
    }

    async getGameOverview(req, res) {
        try {
            const gameId = parseInt(req.params.gameId);
            
            if (isNaN(gameId)) {
                return res.status(400).json({
                    error: 'Invalid game ID'
                });
            }

            console.log('Controller: Processing request for gameId:', gameId);
            const overview = await this.gameOverviewService.getGameOverview(gameId);
            
            return res.json(overview);
        } catch (error) {
            // 打印详细错误信息
            console.error('Detailed error in controller:', {
                message: error.message,
                stack: error.stack,
                gameId: req.params.gameId
            });
            
            if (error.message === 'Game not found') {
                return res.status(404).json({
                    error: 'Game not found'
                });
            }
            
            // 在开发环境返回详细错误
            return res.status(500).json({
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }
}

module.exports = GameOverviewController;