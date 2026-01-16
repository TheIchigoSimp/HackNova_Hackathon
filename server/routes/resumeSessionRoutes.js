import express from 'express';
import resumeSessionController from '../controllers/resumeSessionController.js';

const router = express.Router();

/**
 * Resume Session Routes
 * 
 * All routes are protected and operate on the authenticated user's sessions.
 * Users can have multiple sessions (history feature).
 */

// Get all sessions for history panel
router.get('/all', resumeSessionController.getAllSessions);

// Get the current (most recent) session
router.get('/current', resumeSessionController.getCurrentSession);

// Get a specific session by ID
router.get('/:id', resumeSessionController.getSessionById);

// Create a new session (after resume upload)
router.post('/', resumeSessionController.createSession);

// Update a specific session
router.put('/:id', resumeSessionController.updateSession);

// Add a chat message to a session
router.post('/chat', resumeSessionController.addChatMessage);

// Delete a specific session
router.delete('/:id', resumeSessionController.deleteSession);

// Clear all sessions (use with caution)
router.delete('/', resumeSessionController.clearAllSessions);

export default router;
