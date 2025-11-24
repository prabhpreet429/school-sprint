import { Router } from 'express';
import { getSchoolById, getSchools, updateSchool } from '../controllers/schoolController.js';
import { verifyToken } from '../controllers/authController.js';
import { requireAdmin } from '../middleware/roleMiddleware.js';

const router = Router();

// Route to get all schools
router.get('/', getSchools);

// Route to get a single school by ID
router.get('/:id', getSchoolById);

// Route to update school (Admin only)
router.put('/:id', verifyToken, requireAdmin, updateSchool);

export default router;

