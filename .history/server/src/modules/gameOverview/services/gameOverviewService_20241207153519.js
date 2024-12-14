// server/src/modules/gameOverview/services/gameOverviewService.js
class GameOverviewService {
    constructor(gameOverviewRepository) {
        this.gameOverviewRepository = gameOverviewRepository;
    }

    async getGameOverview(gameId) {
        const overview = await this.gameOverviewRepository.getGameOverview(gameId);
        
        if (!overview) {
            throw new Error('Game not found');
        }
        
        return {
            description: overview.description,
            rating: parseFloat(overview.rating),
            positiveRate: parseFloat(overview.positive_rate),
            avgPlaytimeHours: parseFloat(overview.avg_playtime_hours),
            totalReviews: parseInt(overview.total_reviews)
        };
    }
}

module.exports = GameOverviewService;
