import ResumeSession from '../models/ResumeSession.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

/**
 * Resume Session Controller
 * 
 * Handles CRUD operations for user resume sessions.
 * All endpoints are protected and operate on the authenticated user's session.
 */
export default {
  /**
   * Get the current user's resume session.
   * Returns null if no session exists.
   */
  getSession: asyncHandler(async (req, res) => {
    const userId = req.user.id;
    
    const session = await ResumeSession.findOne({ userId });
    
    if (!session) {
      return res.status(200).json(
        new ApiResponse(200, { session: null }, 'No active session')
      );
    }
    
    res.status(200).json(
      new ApiResponse(200, { session }, 'Session retrieved successfully')
    );
  }),

  /**
   * Create or update the user's resume session.
   * Called after successful resume upload/analysis.
   */
  saveSession: asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { threadId, filename, analysisResult } = req.body;
    
    if (!threadId) {
      throw new ApiError(400, 'threadId is required');
    }
    
    // Upsert: create if not exists, update if exists
    const session = await ResumeSession.findOneAndUpdate(
      { userId },
      {
        userId,
        threadId,
        filename: filename || '',
        analysisResult: analysisResult || {},
        chatMessages: [], // Reset chat when new resume uploaded
        updatedAt: new Date(),
      },
      { 
        new: true, 
        upsert: true,
        setDefaultsOnInsert: true 
      }
    );
    
    res.status(200).json(
      new ApiResponse(200, { session }, 'Session saved successfully')
    );
  }),

  /**
   * Add a chat message to the session history.
   * Appends both user and assistant messages.
   */
  addChatMessage: asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { role, content } = req.body;
    
    if (!role || !content) {
      throw new ApiError(400, 'role and content are required');
    }
    
    if (!['user', 'assistant'].includes(role)) {
      throw new ApiError(400, 'role must be "user" or "assistant"');
    }
    
    const session = await ResumeSession.findOneAndUpdate(
      { userId },
      {
        $push: {
          chatMessages: {
            role,
            content,
            timestamp: new Date(),
          },
        },
        $set: { updatedAt: new Date() },
      },
      { new: true }
    );
    
    if (!session) {
      throw new ApiError(404, 'No active session found. Upload a resume first.');
    }
    
    res.status(200).json(
      new ApiResponse(200, { session }, 'Message added successfully')
    );
  }),

  /**
   * Clear the user's resume session.
   * Called when user wants to upload a different resume.
   */
  clearSession: asyncHandler(async (req, res) => {
    const userId = req.user.id;
    
    const result = await ResumeSession.deleteOne({ userId });
    
    res.status(200).json(
      new ApiResponse(200, { deleted: result.deletedCount > 0 }, 'Session cleared successfully')
    );
  }),
};
