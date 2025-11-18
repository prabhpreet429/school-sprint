import { Router } from 'express';
import { createStudent, getStudents } from '../controllers/studentController.ts';

const router = Router();

// Route to get all students with optional search
router.get('/', getStudents);

// Route to create a new student
router.post('/', createStudent);

export default router;