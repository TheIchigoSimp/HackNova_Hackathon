import axios from 'axios';
import constants from '../../constants';

// Use the main server axios instance with credentials
const api = axios.create({
    baseURL: constants.serverUrl,
    withCredentials: true,
});

/**
 * Resume Session API
 * 
 * Functions for persisting resume analysis sessions to MongoDB.
 * All endpoints require authentication.
 * Users can have multiple sessions (history feature).
 */

/**
 * Get all sessions for the current user (for history panel).
 * Returns sessions sorted by most recent first.
 *
 * @returns {Promise<Array>} List of session objects
 */
export const getAllResumeSessions = async () => {
    const response = await api.get('/api/resume-session/all');
    return response.data.data.sessions;
};

/**
 * Get the current (most recent) user's resume session.
 * Returns null if no session exists.
 *
 * @returns {Promise<Object|null>} The session object or null
 */
export const getCurrentResumeSession = async () => {
    const response = await api.get('/api/resume-session/current');
    return response.data.data.session;
};

/**
 * Get a specific session by ID.
 *
 * @param {string} sessionId - The session's MongoDB _id
 * @returns {Promise<Object>} The session object
 */
export const getResumeSessionById = async (sessionId) => {
    const response = await api.get(`/api/resume-session/${sessionId}`);
    return response.data.data.session;
};

/**
 * Create a new resume session.
 * Called after successful resume upload/analysis.
 *
 * @param {Object} data - Session data
 * @param {string} data.threadId - The Python service thread ID
 * @param {string} [data.filename] - Original resume filename
 * @param {string} [data.title] - Session title for display
 * @param {Object} [data.analysisResult] - ATS score and suggestions
 * @returns {Promise<Object>} The created session
 */
export const  createResumeSession = async (data) => {
    const response = await api.post('/api/resume-session', data);
    return response.data.data.session;
};

/**
 * Update an existing session.
 *
 * @param {string} sessionId - The session's MongoDB _id
 * @param {Object} data - Update data (title, analysisResult)
 * @returns {Promise<Object>} The updated session
 */
export const updateResumeSession = async (sessionId, data) => {
    const response = await api.put(`/api/resume-session/${sessionId}`, data);
    return response.data.data.session;
};

/**
 * Add a chat message to a session's history.
 *
 * @param {string} sessionId - The session's threadId (optional, uses most recent if not provided)
 * @param {string} role - 'user' or 'assistant'
 * @param {string} content - Message content
 * @returns {Promise<Object>} The updated session
 */
export const addChatMessage = async (sessionId, role, content) => {
    const response = await api.post('/api/resume-session/chat', { 
        sessionId, 
        role, 
        content 
    });
    return response.data.data.session;
};

/**
 * Delete a specific session by ID.
 *
 * @param {string} sessionId - The session's MongoDB _id
 * @returns {Promise<boolean>} Whether deletion was successful
 */
export const deleteResumeSession = async (sessionId) => {
    const response = await api.delete(`/api/resume-session/${sessionId}`);
    return response.data.data.deleted;
};

/**
 * Clear all sessions for the current user.
 * Use with caution - deletes all history.
 *
 * @returns {Promise<number>} Number of sessions deleted
 */
export const clearAllResumeSessions = async () => {
    const response = await api.delete('/api/resume-session');
    return response.data.data.deletedCount;
};

// Legacy exports for backward compatibility
export const getResumeSession = getCurrentResumeSession;
export const saveResumeSession = createResumeSession;
export const clearResumeSession = clearAllResumeSessions;
