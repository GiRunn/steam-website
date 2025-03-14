class ResourceController {
    constructor(service) {
        if (!service) throw new Error('Service is required');
        this.service = service;
    }

    async getResource(req, res) {
        try {
            const id = parseInt(req.params.id);
            
            if (isNaN(id)) {
                return res.status(400).json({
                    error: 'Invalid ID'
                });
            }

            const resource = await this.service.getResource(id);
            return res.json(resource);
            
        } catch (error) {
            console.error('Controller error:', error);
            
            if (error.message === 'Resource not found') {
                return res.status(404).json({
                    error: 'Resource not found'
                });
            }
            
            return res.status(500).json({
                error: process.env.NODE_ENV === 'development' 
                    ? error.message 
                    : 'Internal server error'
            });
        }
    }
}

module.exports = ResourceController;
