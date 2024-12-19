import express from 'express';
import MonitorController from '../modules/admin/controllers/monitorController';
import { adminLogin, requireAdminAuth } from '../middleware/adminAuth';

const router = express.Router();
const monitorController = new MonitorController(/* PostgreSQL Pool */);

router.post('/login', adminLogin);
router.get('/system-metrics', requireAdminAuth, monitorController.getSystemMetrics);
router.get('/realtime-metrics', requireAdminAuth, monitorController.getRealTimeMetrics);

export default router;