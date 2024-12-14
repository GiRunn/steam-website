// server/src/modules/gameOverview/services/gameOverviewService.js
class GameOverviewService {
    constructor(gameOverviewRepository) {
        this.gameOverviewRepository = gameOverviewRepository;
    }

    async getGameOverview(gameId) {
        try {
            console.log('Service: Fetching game overview for ID:', gameId);
            const overview = await this.gameOverviewRepository.getGameOverview(gameId);
            
            if (!overview) {
                throw new Error('Game not found');
            }
            
            console.log('Service: Retrieved overview:', overview);
            
            return {
                description: overview.description,
                rating: parseFloat(overview.rating || 0),
                positiveRate: parseFloat(overview.positive_rate || 0),
                avgPlaytimeHours: parseFloat(overview.avg_playtime_hours || 0),
                totalReviews: parseInt(overview.total_reviews || 0)
            };
        } catch (error) {
            console.error('Service error:', error);
            throw error;
        }
    }
}

module.exports = GameOverviewService;