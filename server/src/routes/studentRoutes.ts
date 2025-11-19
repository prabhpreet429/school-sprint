import { Router } from 'express';
import { createStudent, getStudents, updateStudent, deleteStudent } from '../controllers/studentController.ts';

const router = Router();

// Route to get all students with optional search
router.get('/', getStudents);

// Route to create a new student
router.post('/', createStudent);

// Route to update a student
router.put('/:id', updateStudent);

// Route to delete a student
router.delete('/:id', deleteStudent);

export default router;