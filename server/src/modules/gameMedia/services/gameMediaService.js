class GameMediaService {
    constructor(repository) {
      this.repository = repository;
    }
  
    async getGameMedia(gameId) {
      try {
        const mediaData = await this.repository.getGameMedia(gameId);
        
        return {
          screenshots: mediaData.screenshots.map(item => ({
            url: item.url,
            title: item.title,
            description: item.description,
            order: item.order
          })),
          video: mediaData.video || null
        };
      } catch (error) {
        throw new Error(`Error in media service: ${error.message}`);
      }
    }
  }
  
  module.exports = GameMediaService;