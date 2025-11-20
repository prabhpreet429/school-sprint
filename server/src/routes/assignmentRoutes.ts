import { Router } from 'express';
import { createAssignment, getAssignments, updateAssignment, deleteAssignment } from '../controllers/assignmentController.js';

const router = Router();

// Route to get all assignments with optional search
router.get('/', getAssignments);

// Route to create a new assignment
router.post('/', createAssignment);

// Route to update an assignment
router.put('/:id', updateAssignment);

// Route to delete an assignment
router.delete('/:id', deleteAssignment);

export default router;

