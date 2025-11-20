import { Router } from 'express';
import { createClass, getClasses, updateClass, deleteClass } from '../controllers/classController.js';

const router = Router();

// Route to get all classes with optional search
router.get('/', getClasses);

// Route to create a new class
router.post('/', createClass);

// Route to update a class
router.put('/:id', updateClass);

// Route to delete a class
router.delete('/:id', deleteClass);

export default router;

