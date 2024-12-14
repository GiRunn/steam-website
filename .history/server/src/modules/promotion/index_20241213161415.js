const PromotionRepository = require('./repositories/promotionRepository');
const PromotionService = require('./services/promotionService');
const PromotionController = require('./controllers/promotionController');
const setupPromotionRoutes = require('./routes/promotionRoutes');

const initializePromotion = (pool, redis) => {
    const repository = new PromotionRepository(pool, redis);
    const service = new PromotionService(repository);
    const controller = new PromotionController(service);
    return setupPromotionRoutes(controller);
};

module.exports = initializePromotion; 