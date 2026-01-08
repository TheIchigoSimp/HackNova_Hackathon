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
 */

/**
 * Get the current user's resume session.
 * Returns null if no session exists.
 *
 * @returns {Promise<Object|null>} The session object or null
 */
export const getResumeSession = async () => {
    const response = await api.get('/api/resume-session');
    return response.data.data.session;
};

/**
 * Save or update the user's resume session.
 * Called after successful resume upload/analysis.
 *
 * @param {Object} data - Session data
 * @param {string} data.threadId - The Python service thread ID
 * @param {string} [data.filename] - Original resume filename
 * @param {Object} [data.analysisResult] - ATS score and suggestions
 * @returns {Promise<Object>} The saved session
 */
export const saveResumeSession = async (data) => {
    const response = await api.post('/api/resume-session', data);
    return response.data.data.session;
};

/**
 * Add a chat message to the session history.
 *
 * @param {string} role - 'user' or 'assistant'
 * @param {string} content - Message content
 * @returns {Promise<Object>} The updated session
 */
export const addChatMessage = async (role, content) => {
    const response = await api.post('/api/resume-session/chat', { role, content });
    return response.data.data.session;
};

/**
 * Clear the user's resume session.
 * Called when user wants to upload a different resume.
 *
 * @returns {Promise<boolean>} Whether a session was deleted
 */
export const clearResumeSession = async () => {
    const response = await api.delete('/api/resume-session');
    return response.data.data.deleted;
};
