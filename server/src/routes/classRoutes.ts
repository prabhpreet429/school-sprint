import { Router } from 'express';
import { createClass, getClasses } from '../controllers/classController.ts';

const router = Router();

// Route to get all classes with optional search
router.get('/', getClasses);

// Route to create a new class
router.post('/', createClass);

export default router;

