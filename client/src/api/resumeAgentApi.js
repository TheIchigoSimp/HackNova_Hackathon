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
 * @param {string} userId - The user ID to associate this resume with
 * @param {string} [threadId] - Optional thread ID to reuse
 * @returns {Promise<Object>} Analysis results including ATS score and suggestions
 */
export const uploadResume = async (file, userId, threadId = null) => {
    const formData = new FormData();
    formData.append('file', file);

    // Build URL with required user_id and optional thread_id
    const params = new URLSearchParams();
    params.append('user_id', userId);
    if (threadId) {
        params.append('thread_id', threadId);
    }

    const response = await resumeAgentAxios.post(`/resume/upload?${params.toString()}`, formData, {
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
 * Stream chat with the resume agent.
 * Tokens are delivered as they're generated for real-time display.
 *
 * @param {string} threadId - The thread ID from resume upload
 * @param {string} message - The message to send
 * @param {function} onToken - Callback for each token received
 * @param {function} onStatus - Callback for status updates (e.g., tool usage)
 * @param {function} onComplete - Callback when streaming is complete
 * @param {function} onError - Callback for errors
 * @returns {Promise<void>}
 */
export const streamChatWithAgent = async (
    threadId, 
    message, 
    onToken, 
    onStatus = null, 
    onComplete = null, 
    onError = null
) => {
    const baseURL = import.meta.env.VITE_RESUME_AGENT_URL || 'http://localhost:8001';
    
    try {
        const response = await fetch(`${baseURL}/chat/stream`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                thread_id: threadId,
                message: message,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to stream response');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullResponse = '';

        while (true) {
            const { done, value } = await reader.read();
            
            if (done) break;
            
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');
            
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6).trim();
                    
                    if (data === '[DONE]') {
                        if (onComplete) onComplete(fullResponse);
                        return fullResponse;
                    }
                    
                    try {
                        const parsed = JSON.parse(data);
                        
                        if (parsed.token) {
                            fullResponse += parsed.token;
                            if (onToken) onToken(parsed.token, fullResponse);
                        }
                        
                        if (parsed.status && onStatus) {
                            onStatus(parsed.status);
                        }
                        
                        if (parsed.error) {
                            throw new Error(parsed.error);
                        }
                        
                        if (parsed.done && onComplete) {
                            onComplete(parsed.full_response || fullResponse);
                        }
                    } catch (parseError) {
                        // Ignore JSON parse errors for incomplete chunks
                        if (data !== '' && !data.startsWith('[')) {
                            console.warn('Failed to parse SSE data:', data);
                        }
                    }
                }
            }
        }
        
        return fullResponse;
    } catch (error) {
        if (onError) {
            onError(error);
        }
        throw error;
    }
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

