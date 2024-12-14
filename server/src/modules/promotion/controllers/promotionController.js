class PromotionController {
    constructor(service) {
        if (!service) throw new Error('Service is required');
        this.service = service;
    }

    async getActivePromotions(req, res) {
        try {
            if (req.query.clearCache === 'true') {
                await this.service.clearCache();
            }

            const promotions = await this.service.getActivePromotions();
            
            return res.status(200).json({
                code: 200,
                data: promotions,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Controller error:', error);
            
            return res.status(500).json({
                code: 500,
                message: 'Internal server error',
                timestamp: new Date().toISOString()
            });
        }
    }
}

module.exports = PromotionController; 