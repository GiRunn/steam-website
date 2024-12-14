// src/modules/gameOverview/services/gameOverviewService.js
class GameOverviewService {
    constructor(repository) {
        if (!repository) throw new Error('Repository is required');
        this.repository = repository;
    }

    async getGameOverview(gameId) {
        try {
            const overview = await this.repository.getGameOverview(gameId);
            
            if (!overview) {
                throw new Error('Game not found');
            }
            
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