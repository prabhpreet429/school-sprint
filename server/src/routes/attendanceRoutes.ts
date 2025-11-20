import { Router } from 'express';
import { createAttendance, getAttendances, updateAttendance, deleteAttendance } from '../controllers/attendanceController.js';

const router = Router();

// Route to get all attendances with optional search
router.get('/', getAttendances);

// Route to create a new attendance
router.post('/', createAttendance);

// Route to update an attendance
router.put('/:id', updateAttendance);

// Route to delete an attendance
router.delete('/:id', deleteAttendance);

export default router;

