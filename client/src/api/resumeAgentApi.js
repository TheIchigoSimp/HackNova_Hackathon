import axios from 'axios';

// Create a separate axios instance for the resume agent service
const resumeAgentAxios = axios.create({
    baseURL: import.meta.env.VITE_RESUME_AGENT_URL || 'http://localhost:8001',
    withCredentials: false, // Resume agent service doesn't use cookies
});

/**
 * Upload a PDF resume for analysis.
 * Returns immediate ATS scoring and AI suggestions.
 *
 * @param {File} file - The PDF file to upload
 * @param {string} [threadId] - Optional thread ID to reuse
 * @returns {Promise<Object>} Analysis results including ATS score and suggestions
 */
export const uploadResume = async (file, threadId = null) => {
    const formData = new FormData();
    formData.append('file', file);

    let url = '/resume/upload';
    if (threadId) {
        url += `?thread_id=${encodeURIComponent(threadId)}`;
    }

    const response = await resumeAgentAxios.post(url, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response.data;
};

/**
 * Send a chat message to the resume agent.
 * Requires a valid thread_id with an uploaded resume.
 *
 * @param {string} threadId - The thread ID from resume upload
 * @param {string} message - The message to send
 * @returns {Promise<Object>} Chat response from the agent
 */
export const chatWithAgent = async (threadId, message) => {
    const response = await resumeAgentAxios.post('/chat', {
        thread_id: threadId,
        message: message,
    });

    return response.data;
};

/**
 * Get metadata for a specific thread's resume.
 *
 * @param {string} threadId - The thread ID to query
 * @returns {Promise<Object>} Thread metadata
 */
export const getThreadMetadata = async (threadId) => {
    const response = await resumeAgentAxios.get(`/threads/${threadId}/metadata`);
    return response.data;
};

/**
 * List all available thread IDs.
 *
 * @returns {Promise<Object>} Object containing array of thread IDs
 */
export const listThreads = async () => {
    const response = await resumeAgentAxios.get('/threads');
    return response.data;
};

/**
 * Health check for the resume agent service.
 *
 * @returns {Promise<Object>} Health status
 */
export const checkHealth = async () => {
    const response = await resumeAgentAxios.get('/health');
    return response.data;
};
