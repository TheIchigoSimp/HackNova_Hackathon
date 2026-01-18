/**
 * Wake-up utility for backend services hosted on Render.
 * 
 * Render free tier services go to sleep after inactivity.
 * This module sends lightweight requests to wake them up
 * when the frontend loads, reducing cold-start delays.
 */

const BACKEND_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:8000';
const RESUME_AGENT_URL = import.meta.env.VITE_RESUME_AGENT_URL || 'http://localhost:8001';

/**
 * Send a lightweight request to wake up a service.
 * Uses HEAD request when possible to minimize data transfer.
 * 
 * @param {string} url - The service URL to ping
 * @param {string} serviceName - Name for logging purposes
 * @returns {Promise<boolean>} - True if service responded, false otherwise
 */
const pingService = async (url, serviceName) => {
    try {
        // Use AbortController to timeout after 10 seconds
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(url, {
            method: 'GET',
            mode: 'cors',
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
            console.log(`✅ ${serviceName} is awake`);
            return true;
        } else {
            console.log(`⚠️ ${serviceName} responded with status: ${response.status}`);
            return true; // Still awake even if error response
        }
    } catch (error) {
        if (error.name === 'AbortError') {
            console.log(`⏳ ${serviceName} is waking up (timeout, will retry in background)`);
        } else {
            console.log(`🔄 ${serviceName} wake-up ping sent (${error.message})`);
        }
        return false;
    }
};

/**
 * Wake up all backend services in parallel.
 * This function is fire-and-forget - it doesn't block the UI.
 */
export const wakeUpAllServices = async () => {
    console.log('🚀 Waking up backend services...');

    // Send pings to all services in parallel
    const results = await Promise.allSettled([
        pingService(`${BACKEND_URL}/api/health`, 'Backend Server'),
        pingService(`${RESUME_AGENT_URL}/health`, 'Resume Agent Service'),
    ]);

    const awakeCount = results.filter(r => r.status === 'fulfilled' && r.value).length;
    console.log(`📊 ${awakeCount}/${results.length} services responded`);

    return results;
};

/**
 * Initialize service wake-up on app load.
 * Call this once when the app mounts.
 */
export const initializeServiceWakeUp = () => {
    // Run wake-up in the background without blocking
    wakeUpAllServices().catch(err => {
        console.warn('Service wake-up failed:', err);
    });
};

export default initializeServiceWakeUp;
