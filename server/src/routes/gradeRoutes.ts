import { Router } from 'express';
import { createGrade, getGrades, updateGrade, deleteGrade } from '../controllers/gradeController.ts';

const router = Router();

// Route to get all grades with optional search
router.get('/', getGrades);

// Route to create a new grade
router.post('/', createGrade);

// Route to update a grade
router.put('/:id', updateGrade);

// Route to delete a grade
router.delete('/:id', deleteGrade);

export default router;

