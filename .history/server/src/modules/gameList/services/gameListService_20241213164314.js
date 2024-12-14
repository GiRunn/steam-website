class GameListService {
    constructor(repository) {
        if (!repository) throw new Error('Repository is required');
        this.repository = repository;
    }

    async getAllGames() {
        try {
            const games = await this.repository.getAllGames();
            
            return games.map(game => ({
                game_id: game.game_id,
                title: game.title,
                rating: parseFloat(game.rating),
                banner_url: game.banner_url,
                price_info: {
                    base_price: parseFloat(game.base_price),
                    current_price: parseFloat(game.current_price),
                    discount: parseInt(game.discount)
                },
                tags: Array.isArray(game.tags) ? game.tags : []
            }));
        } catch (error) {
            console.error('Service error:', error);
            throw error;
        }
    }
}

module.exports = GameListService; 