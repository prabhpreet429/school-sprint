import { Router } from 'express';
import { createTeacher, getTeachers, updateTeacher, deleteTeacher } from '../controllers/teacherController.ts';

const router = Router();

// Route to get all teachers with optional search
router.get('/', getTeachers);

// Route to create a new teacher
router.post('/', createTeacher);

// Route to update a teacher
router.put('/:id', updateTeacher);

// Route to delete a teacher
router.delete('/:id', deleteTeacher);

export default router;

