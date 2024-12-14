class PromotionService {
    constructor(repository) {
        if (!repository) throw new Error('Repository is required');
        this.repository = repository;
    }

    async getActivePromotions() {
        try {
            const promotions = await this.repository.getActivePromotions();
            console.log('Service received promotions:', promotions);
            
            const mappedPromotions = promotions.map(promotion => {
                const now = new Date();
                const startTime = new Date(promotion.start_time);
                const endTime = new Date(promotion.end_time);

                const mapped = {
                    id: promotion.promotion_id,
                    banner_url: promotion.banner_url || '',
                    name: promotion.name,
                    start_time: promotion.start_time,
                    end_time: promotion.end_time,
                    min_purchase: parseFloat(promotion.min_purchase || 0),
                    status: promotion.status,
                    priority: promotion.priority,
                    promotion_status: this.getPromotionStatus(now, startTime, endTime, promotion.status)
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

    getPromotionStatus(now, startTime, endTime, status) {
        if (status === 'ended') return 'ended';
        if (now < startTime) return 'upcoming';
        if (now > endTime) return 'expired';
        if (status === 'scheduled') return 'scheduled';
        return 'active';
    }
}

module.exports = PromotionService; 