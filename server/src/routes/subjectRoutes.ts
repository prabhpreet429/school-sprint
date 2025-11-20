import { Router } from 'express';
import { getSubjects, createSubject, updateSubject, deleteSubject } from '../controllers/subjectController.js';

const router = Router();

// Route to get all subjects with optional search
router.get('/', getSubjects);

// Route to create a new subject
router.post('/', createSubject);

// Route to update a subject
router.put('/:id', updateSubject);

// Route to delete a subject
router.delete('/:id', deleteSubject);

export default router;

