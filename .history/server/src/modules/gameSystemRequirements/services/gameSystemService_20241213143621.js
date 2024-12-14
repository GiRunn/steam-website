class GameSystemService {
    constructor(repository) {
        if (!repository) throw new Error('Repository is required');
        this.repository = repository;
    }

    async getSystemRequirements(gameId) {
        try {
            const systemReq = await this.repository.getSystemRequirements(gameId);
            
            if (!systemReq) {
                throw new Error('Game not found');
            }

            return this.formatSystemRequirements(systemReq);
        } catch (error) {
            console.error('Service error:', error);
            throw error;
        }
    }

    formatSystemRequirements(systemReq) {
        try {
            const requirements = typeof systemReq === 'string' 
                ? JSON.parse(systemReq) 
                : systemReq;

            return {
                minimum: {
                    os: requirements.minimum?.os || 'Not specified',
                    processor: requirements.minimum?.processor || 'Not specified',
                    memory: requirements.minimum?.memory || 'Not specified',
                    graphics: requirements.minimum?.graphics || 'Not specified',
                    storage: requirements.minimum?.storage || 'Not specified'
                },
                recommended: {
                    os: requirements.recommended?.os || 'Not specified',
                    processor: requirements.recommended?.processor || 'Not specified',
                    memory: requirements.recommended?.memory || 'Not specified',
                    graphics: requirements.recommended?.graphics || 'Not specified',
                    storage: requirements.recommended?.storage || 'Not specified'
                }
            };
        } catch (error) {
            console.error('Error formatting system requirements:', error);
            throw new Error('Invalid system requirements format');
        }
    }
}

module.exports = GameSystemService; 