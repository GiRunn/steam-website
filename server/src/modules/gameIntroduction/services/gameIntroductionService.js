class GameIntroductionService {
    constructor(repository) {
        this.repository = repository;
    }

    async getGameIntroductions(gameId) {
        try {
            const introductions = await this.repository.getGameIntroductions(gameId);
            return {
                success: true,
                data: introductions
            };
        } catch (error) {
            console.error('Service error:', error);
            throw error;
        }
    }
}

module.exports = GameIntroductionService; 