import { Router } from 'express';
import { createGrade, getGrades } from '../controllers/gradeController.ts';

const router = Router();

// Route to get all grades with optional search
router.get('/', getGrades);

// Route to create a new grade
router.post('/', createGrade);

export default router;

