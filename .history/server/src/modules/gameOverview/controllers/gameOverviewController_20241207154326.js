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
    
            console.log('Fetching game overview for ID:', gameId); // 添加日志
    
            const overview = await this.gameOverviewService.getGameOverview(gameId);
            
            return res.json(overview);
        } catch (error) {
            // 添加更详细的错误日志
            console.error('Error in getGameOverview:', {
                message: error.message,
                stack: error.stack,
                gameId: req.params.gameId
            });
            
            if (error.message === 'Game not found') {
                return res.status(404).json({
                    error: 'Game not found'
                });
            }
            
            return res.status(500).json({
                error: error.message // 返回具体错误信息（仅在开发环境）
            });
        }
    }
}



module.exports = GameOverviewController;