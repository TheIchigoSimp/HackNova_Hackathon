import mongoose from "mongoose";

/**
 * ResumeSession Model
 * 
 * Stores a user's active resume analysis session.
 * Each user can have at most one active session (userId is unique).
 * This enables persistence across tab navigation and page refreshes.
 */
const resumeSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true, // Index for efficient queries (no longer unique - allows multiple sessions)
  },
  threadId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    default: "Resume Analysis",
  },
  filename: {
    type: String,
    default: "",
  },
  analysisResult: {
    ats_score: {
      type: Number,
      default: 0,
    },
    ats_breakdown: {
      technical_skills: { type: Number, default: 0 },
      soft_skills: { type: Number, default: 0 },
      action_verbs: { type: Number, default: 0 },
      formatting: { type: Number, default: 0 },
    },
    skills_found: {
      type: [String],
      default: [],
    },
    action_verbs_found: {
      type: [String],
      default: [],
    },
    suggestions: {
      type: [String],
      default: [],
    },
  },
  chatMessages: [{
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp before saving
resumeSessionSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Update timestamp on findOneAndUpdate
resumeSessionSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: new Date() });
  next();
});

export default mongoose.model("ResumeSession", resumeSessionSchema);
