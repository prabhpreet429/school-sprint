import { Router } from 'express';
import { createTeacher, getTeachers } from '../controllers/teacherController.ts';

const router = Router();

// Route to get all teachers with optional search
router.get('/', getTeachers);

// Route to create a new teacher
router.post('/', createTeacher);

export default router;

