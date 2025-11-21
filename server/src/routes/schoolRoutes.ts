import { Router } from 'express';
import { getSchoolById, getSchools } from '../controllers/schoolController.js';

const router = Router();

// Route to get all schools
router.get('/', getSchools);

// Route to get a single school by ID
router.get('/:id', getSchoolById);

export default router;

