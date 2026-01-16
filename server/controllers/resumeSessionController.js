import ResumeSession from '../models/ResumeSession.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

/**
 * Resume Session Controller
 * 
 * Handles CRUD operations for user resume sessions.
 * All endpoints are protected and operate on the authenticated user's sessions.
 * Users can have multiple sessions (history feature).
 */
export default {
  /**
   * Get all sessions for the current user (for history panel).
   * Returns sessions sorted by updatedAt (most recent first).
   */
  getAllSessions: asyncHandler(async (req, res) => {
    const userId = req.user.id;
    
    const sessions = await ResumeSession.find({ userId })
      .sort({ updatedAt: -1 })
      .select('_id threadId title filename analysisResult.ats_score createdAt updatedAt')
      .limit(20); // Limit to 20 most recent sessions
    
    res.status(200).json(
      new ApiResponse(200, { sessions }, 'Sessions retrieved successfully')
    );
  }),

  /**
   * Get the current (most recent) user's resume session.
   * Returns null if no session exists.
   */
  getCurrentSession: asyncHandler(async (req, res) => {
    const userId = req.user.id;
    
    const session = await ResumeSession.findOne({ userId })
      .sort({ updatedAt: -1 });
    
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
   * Get a specific session by ID.
   * Validates that the session belongs to the current user.
   */
  getSessionById: asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    
    const session = await ResumeSession.findOne({ _id: id, userId });
    
    if (!session) {
      throw new ApiError(404, 'Session not found');
    }
    
    res.status(200).json(
      new ApiResponse(200, { session }, 'Session retrieved successfully')
    );
  }),

  /**
   * Create a new resume session.
   * Called after successful resume upload/analysis.
   */
  createSession: asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { threadId, filename, analysisResult, title } = req.body;
    
    if (!threadId) {
      throw new ApiError(400, 'threadId is required');
    }
    
    // Create new session (allows multiple sessions per user)
    const session = await ResumeSession.create({
      userId,
      threadId,
      title: title || filename || 'Resume Analysis',
      filename: filename || '',
      analysisResult: analysisResult || {},
      chatMessages: [],
    });
    
    res.status(201).json(
      new ApiResponse(201, { session }, 'Session created successfully')
    );
  }),

  /**
   * Update an existing session (for adding chat messages or updating analysis).
   */
  updateSession: asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    const { title, analysisResult } = req.body;
    
    const updateData = { updatedAt: new Date() };
    if (title) updateData.title = title;
    if (analysisResult) updateData.analysisResult = analysisResult;
    
    const session = await ResumeSession.findOneAndUpdate(
      { _id: id, userId },
      { $set: updateData },
      { new: true }
    );
    
    if (!session) {
      throw new ApiError(404, 'Session not found');
    }
    
    res.status(200).json(
      new ApiResponse(200, { session }, 'Session updated successfully')
    );
  }),

  /**
   * Add a chat message to a session's history.
   * Appends both user and assistant messages.
   */
  addChatMessage: asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { sessionId, role, content } = req.body;
    
    if (!role || !content) {
      throw new ApiError(400, 'role and content are required');
    }
    
    if (!['user', 'assistant'].includes(role)) {
      throw new ApiError(400, 'role must be "user" or "assistant"');
    }
    
    // Find session by sessionId (threadId) or most recent if not specified
    const query = sessionId 
      ? { threadId: sessionId, userId }
      : { userId };
    
    const session = await ResumeSession.findOneAndUpdate(
      query,
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
      { new: true, sort: { updatedAt: -1 } }
    );
    
    if (!session) {
      throw new ApiError(404, 'No session found. Upload a resume first.');
    }
    
    res.status(200).json(
      new ApiResponse(200, { session }, 'Message added successfully')
    );
  }),

  /**
   * Delete a specific session by ID.
   */
  deleteSession: asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    
    const result = await ResumeSession.deleteOne({ _id: id, userId });
    
    if (result.deletedCount === 0) {
      throw new ApiError(404, 'Session not found');
    }
    
    res.status(200).json(
      new ApiResponse(200, { deleted: true }, 'Session deleted successfully')
    );
  }),

  /**
   * Clear all sessions for the current user.
   * Use with caution - deletes all history.
   */
  clearAllSessions: asyncHandler(async (req, res) => {
    const userId = req.user.id;
    
    const result = await ResumeSession.deleteMany({ userId });
    
    res.status(200).json(
      new ApiResponse(200, { deletedCount: result.deletedCount }, 'All sessions cleared successfully')
    );
  }),
};
