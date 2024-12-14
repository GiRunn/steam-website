class PromotionService {
    constructor(repository) {
        if (!repository) throw new Error('Repository is required');
        this.repository = repository;
    }

    async getActivePromotions() {
        try {
            const promotions = await this.repository.getActivePromotions();
            console.log('Service received promotions:', promotions);
            
            const mappedPromotions = promotions.map((promotion, index) => {
                const mapped = {
                    id: index + 1,
                    banner_url: promotion.banner_url,
                    name: promotion.name,
                    start_time: promotion.start_time,
                    min_purchase: parseFloat(promotion.min_purchase || 0)
                };
                console.log('Mapped promotion:', mapped);
                return mapped;
            });
            
            return mappedPromotions;
        } catch (error) {
            console.error('Service error:', error);
            throw error;
        }
    }
}

module.exports = PromotionService; 