const GameDetailService = require('../services/gameDetailService');
const GameDetailRepository = require('../repositories/gameDetailRepository');
const { pool } = require('../../../config/database');

class GameDetailController {
    constructor() {
        const gameDetailRepository = new GameDetailRepository(pool);
        this.gameDetailService = new GameDetailService(gameDetailRepository);
    }

    async getGameDetail(req, res) {
        try {
            const { gameId } = req.params;
            const gameDetail = await this.gameDetailService.getGameMainInfo(gameId);
            
            if (!gameDetail) {
                return res.status(404).json({
                    error: 'Game not found'
                });
            }
            
            res.json(gameDetail);
        } catch (error) {
            console.error('Error in getGameDetail:', error);
            res.status(500).json({
                error: 'Internal server error'
            });
        }
    }
}

module.exports = GameDetailController;