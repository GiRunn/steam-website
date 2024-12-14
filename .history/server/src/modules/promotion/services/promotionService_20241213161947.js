class PromotionService {
    constructor(repository) {
        if (!repository) throw new Error('Repository is required');
        this.repository = repository;
    }

    async getActivePromotions() {
        try {
            const promotions = await this.repository.getActivePromotions();
            
            return promotions.map((promotion, index) => ({
                id: index + 1,
                banner_url: promotion.banner_url,
                name: promotion.name,
                start_time: promotion.start_time,
                min_purchase: parseFloat(promotion.min_purchase)
            }));
        } catch (error) {
            console.error('Service error:', error);
            throw error;
        }
    }
}

module.exports = PromotionService; 