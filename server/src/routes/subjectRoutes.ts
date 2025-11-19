import { Router } from 'express';
import { getSubjects } from '../controllers/subjectController';

const router = Router();

// Route to get all subjects with optional search
router.get('/', getSubjects);

export default router;

