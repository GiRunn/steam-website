const GameSystemRepository = require('./repositories/gameSystemRepository');
const GameSystemService = require('./services/gameSystemService');
const GameSystemController = require('./controllers/gameSystemController');
const setupGameSystemRoutes = require('./routes/gameSystemRoutes');

const initializeGameSystem = (pool, redis) => {
    const repository = new GameSystemRepository(pool, redis);
    const service = new GameSystemService(repository);
    const controller = new GameSystemController(service);
    return setupGameSystemRoutes(controller);
};

module.exports = initializeGameSystem; 