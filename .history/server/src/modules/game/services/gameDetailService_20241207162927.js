class GameDetailService {
  constructor(gameDetailRepository) {
      this.gameDetailRepository = gameDetailRepository;
  }

  async getGameMainInfo(gameId) {
      try {
          return await this.gameDetailRepository.getGameMainInfo(gameId);
      } catch (error) {
          console.error('Error in getGameMainInfo service:', error);
          throw error;
      }
  }
}

module.exports = GameDetailService;