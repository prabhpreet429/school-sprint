import { Router } from 'express';
import { getDashboardData } from '../controllers/dashboardController.ts';

const router = Router();

// Route to get dashboard data
router.get('/', getDashboardData);

export default router;