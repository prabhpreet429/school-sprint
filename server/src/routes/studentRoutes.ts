import { Router } from 'express';
import { createStudent, getStudents, getStudentById, updateStudent, deleteStudent } from '../controllers/studentController.js';

const router = Router();

// Route to get all students with optional search
router.get('/', getStudents);

// Route to get a single student by ID
router.get('/:id', getStudentById);

// Route to create a new student
router.post('/', createStudent);

// Route to update a student
router.put('/:id', updateStudent);

// Route to delete a student
router.delete('/:id', deleteStudent);

export default router;