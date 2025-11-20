import { Router } from 'express';
import { createLesson, getLessons, updateLesson, deleteLesson } from '../controllers/lessonController.js';

const router = Router();

// Route to get all lessons with optional search
router.get('/', getLessons);

// Route to create a new lesson
router.post('/', createLesson);

// Route to update a lesson
router.put('/:id', updateLesson);

// Route to delete a lesson
router.delete('/:id', deleteLesson);

export default router;

