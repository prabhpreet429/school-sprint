import { Router } from 'express';
import { createTeacher, getTeachers, getTeacherById, updateTeacher, deleteTeacher } from '../controllers/teacherController.js';

const router = Router();

// Route to get all teachers with optional search
router.get('/', getTeachers);

// Route to get a single teacher by ID
router.get('/:id', getTeacherById);

// Route to create a new teacher
router.post('/', createTeacher);

// Route to update a teacher
router.put('/:id', updateTeacher);

// Route to delete a teacher
router.delete('/:id', deleteTeacher);

export default router;

