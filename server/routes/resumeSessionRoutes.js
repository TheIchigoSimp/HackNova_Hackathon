import express from 'express';
import resumeSessionController from '../controllers/resumeSessionController.js';

const router = express.Router();

/**
 * Resume Session Routes
 * 
 * All routes are protected and operate on the authenticated user's session.
 */

// Get the current user's resume session
router.get('/', resumeSessionController.getSession);

// Create or update the user's resume session
router.post('/', resumeSessionController.saveSession);

// Add a chat message to the session history
router.post('/chat', resumeSessionController.addChatMessage);

// Clear the user's resume session (for re-upload)
router.delete('/', resumeSessionController.clearSession);

export default router;
