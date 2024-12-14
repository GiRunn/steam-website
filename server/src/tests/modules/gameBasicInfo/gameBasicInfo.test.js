const chai = require('chai');
const { expect } = chai;
const sinon = require('sinon');
const { pool } = require('../../../config/database');
const redis = require('../../../config/redis');

const GameBasicInfoRepository = require('../../../modules/gameBasicInfo/repositories/gameBasicInfoRepository');
const GameBasicInfoService = require('../../../modules/gameBasicInfo/services/gameBasicInfoService');
const GameBasicInfoController = require('../../../modules/gameBasicInfo/controllers/gameBasicInfoController');

describe('Game Basic Info Module Tests', () => {
    let repository;
    let service;
    let controller;
    let req;
    let res;

    beforeEach(() => {
        // 初始化存储库
        repository = new GameBasicInfoRepository(pool, redis);

        // 初始化服务
        service = new GameBasicInfoService(repository);

        // 初始化控制器
        controller = new GameBasicInfoController(service);

        // Mock request object
        req = {
            params: {
                gameId: '1001'
            }
        };

        // Mock response object
        res = {
            status: sinon.stub().returnsThis(),
            json: sinon.spy()
        };
    });

    describe('Repository Tests', () => {
        it('should fetch game basic info from database', async () => {
            const result = await repository.getGameBasicInfo(1001);
            
            expect(result).to.be.an('object');
            expect(result).to.have.property('game_id');
            expect(result).to.have.property('current_price');
            expect(result).to.have.property('discount');
            expect(result).to.have.property('developer_name');
            expect(result).to.have.property('release_date');
            expect(result).to.have.property('player_count');
            expect(result).to.have.property('tags');
        });

        it('should return null for non-existent game', async () => {
            const result = await repository.getGameBasicInfo(99999);
            expect(result).to.be.null;
        });
    });

    describe('Service Tests', () => {
        it('should format game basic info correctly', async () => {
            const result = await service.getGameBasicInfo(1001);
            
            expect(result).to.be.an('object');
            expect(result).to.have.property('game_id');
            expect(result).to.have.property('price_info').that.is.an('object');
            expect(result.price_info).to.have.property('current_price');
            expect(result.price_info).to.have.property('discount');
            expect(result).to.have.property('developer');
            expect(result).to.have.property('release_date');
            expect(result).to.have.property('player_mode');
            expect(result).to.have.property('tags').that.is.an('array');
        });

        it('should throw error for non-existent game', async () => {
            try {
                await service.getGameBasicInfo(99999);
                expect.fail('Should have thrown an error');
            } catch (error) {
                expect(error.message).to.equal('Game not found');
            }
        });
    });

    describe('Controller Tests', () => {
        it('should return 200 and game data for valid request', async () => {
            await controller.getGameBasicInfo(req, res);
            
            expect(res.status.calledWith(200)).to.be.true;
            expect(res.json.called).to.be.true;
            
            const response = res.json.firstCall.args[0];
            expect(response).to.have.property('code', 200);
            expect(response).to.have.property('data');
            expect(response).to.have.property('timestamp');
        });

        it('should return 400 for invalid game ID', async () => {
            req.params.gameId = 'invalid';
            await controller.getGameBasicInfo(req, res);
            
            expect(res.status.calledWith(400)).to.be.true;
            expect(res.json.called).to.be.true;
            
            const response = res.json.firstCall.args[0];
            expect(response).to.have.property('code', 400);
            expect(response).to.have.property('message', 'Invalid game ID');
        });

        it('should return 404 for non-existent game', async () => {
            req.params.gameId = '99999';
            await controller.getGameBasicInfo(req, res);
            
            expect(res.status.calledWith(404)).to.be.true;
            expect(res.json.called).to.be.true;
            
            const response = res.json.firstCall.args[0];
            expect(response).to.have.property('code', 404);
            expect(response).to.have.property('message', 'Game not found');
        });
    });
}); 