import React, { useEffect, useState, useCallback } from "react";
import { useSession } from "../lib/auth-client";
import { useNavigate } from "react-router-dom";
import { getUserProfile, updateUserProfile } from "../api/userApi";
import { requestHandler } from "../../utils/index";
import SlideButton from "../components/Buttons/SlideButton";
import GradientInput from "../components/Input/GradientInput.jsx";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { IoMdCloudUpload } from "react-icons/io";
import { FiAlertCircle } from "react-icons/fi";
import { FaUserEdit } from "react-icons/fa";

const Profile = () => {
  const [formData, setFormData] = useState({
    bio: "",
    language: "",
    background: "",
    interests: "",
    learningGoals: "",
    learningStyle: "",
    knowledgeLevel: "",
    contentTypes: "",
    timeCommitment: "",
  });
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const { data: session, isPending, error, refetch } = useSession();

  const handleRefetch = useCallback(() => {
    refetch();
  }, [refetch]);

  const SkeletonLoader = () => (
    <div className="space-y-4 animate-pulse">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-12 bg-[rgba(102,126,234,0.1)] rounded-lg" />
      ))}
    </div>
  );

  const fetchProfile = useCallback(() => {
    if (!session) return;
    setProfileError("");
    requestHandler(
      () => getUserProfile(),
      setIsProfileLoading,
      "Fetching profile...",
      (res) => {
        const profileData = res.data.profile;
        setFormData({
          bio: profileData.bio || "",
          language: profileData.language || "",
          background: profileData.background || "",
          interests: profileData.interests || "",
          learningGoals: profileData.learningGoals || "",
          learningStyle: profileData.learningStyle || "",
          knowledgeLevel: profileData.knowledgeLevel || "",
          contentTypes: profileData.contentTypes || "",
          timeCommitment: profileData.timeCommitment || "",
        });
      },
      (err) => {
        setProfileError(err.message || "Failed to fetch profile");
      }
    );
  }, [session]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleUpdateProfile = useCallback(() => {
    requestHandler(
      () => updateUserProfile(formData),
      setIsUpdating,
      "Updating profile...",
      () => {
        // Successfully updated - switch back to view mode
        setIsEditing(false);
      },
      (err) => {
        setProfileError(err.message || "Failed to update profile");
      }
    );
  }, [formData]);

  const handleEditToggle = () => {
    setIsEditing((prev) => !prev);
  };

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 border-2 border-[#667eea] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#94a3b8]">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 rounded-2xl bg-[rgba(25,25,40,0.8)] border border-red-500/20 max-w-md">
          <p className="text-red-400 mb-4">{error.message}</p>
          <SlideButton text="Try Again" onClick={handleRefetch} fullWidth />
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 rounded-2xl bg-[rgba(25,25,40,0.8)] border border-[rgba(102,126,234,0.2)] max-w-md">
          <p className="text-[#94a3b8] mb-4">No session found. Please log in.</p>
          <SlideButton text="Login" onClick={() => navigate("/login")} fullWidth />
        </div>
      </div>
    );
  }

  const { user } = session;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-6xl"
      >
        <h2 className="text-3xl font-bold text-white mb-8 text-center">
          Your Profile
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Avatar Column */}
          <div className="flex flex-col items-center justify-start p-6 rounded-2xl bg-gradient-to-br from-[rgba(25,25,40,0.8)] to-[rgba(15,15,25,0.9)] border border-[rgba(102,126,234,0.15)]">
            <div className="relative group mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-[#667eea] to-[#764ba2] rounded-full blur-lg opacity-30 group-hover:opacity-50 transition-opacity" />
              {user.image ? (
                <img
                  src={user.image}
                  className="relative w-24 h-24 rounded-full object-cover ring-4 ring-[rgba(102,126,234,0.3)] transition-all duration-300 group-hover:ring-[rgba(102,126,234,0.5)]"
                  alt="Profile"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                className="relative w-24 h-24 rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] ring-4 ring-[rgba(102,126,234,0.3)] flex items-center justify-center text-white text-2xl font-bold"
                style={{ display: user.image ? 'none' : 'flex' }}
              >
                {(user.name || 'U').charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold text-white mb-1">
                {user.name}
              </h3>
              <p className="text-[#94a3b8] text-sm">{user.email}</p>
            </div>
          </div>

          {/* Fields Column */}
          <div className="md:col-span-3">
            {isProfileLoading ? (
              <SkeletonLoader />
            ) : profileError ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center p-4 text-sm text-red-400 rounded-lg bg-red-500/10 border border-red-500/20"
                role="alert"
              >
                <FiAlertCircle className="flex-shrink-0 mr-3 w-5 h-5" />
                <span>{profileError}</span>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                <ProfileField
                  label="Bio"
                  value={formData.bio}
                  isEditing={isEditing}
                  isTextarea
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell us about yourself…"
                />
                <ProfileField
                  label="Preferred Language"
                  value={formData.language}
                  isEditing={isEditing}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  placeholders={["Preferred language", "e.g., English, Spanish"]}
                />
                <ProfileField
                  label="Background"
                  value={formData.background}
                  isEditing={isEditing}
                  isTextarea
                  onChange={(e) => setFormData({ ...formData, background: e.target.value })}
                  placeholder="Your professional or educational background"
                />
                <ProfileField
                  label="Interests"
                  value={formData.interests}
                  isEditing={isEditing}
                  onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                  placeholders={["Your interests", "e.g., machine learning, web dev"]}
                />
                <ProfileField
                  label="Learning Goals"
                  value={formData.learningGoals}
                  isEditing={isEditing}
                  onChange={(e) => setFormData({ ...formData, learningGoals: e.target.value })}
                  placeholders={["What do you want to achieve?", "e.g., Master React"]}
                />
                <ProfileField
                  label="Learning Style"
                  value={formData.learningStyle}
                  isEditing={isEditing}
                  onChange={(e) => setFormData({ ...formData, learningStyle: e.target.value })}
                  placeholders={["How do you learn best?", "e.g., Visual, Auditory"]}
                />
                <ProfileField
                  label="Knowledge Level"
                  value={formData.knowledgeLevel}
                  isEditing={isEditing}
                  onChange={(e) => setFormData({ ...formData, knowledgeLevel: e.target.value })}
                  placeholders={["Your current level", "e.g., Beginner, Intermediate"]}
                />
                <ProfileField
                  label="Content Types"
                  value={formData.contentTypes}
                  isEditing={isEditing}
                  onChange={(e) => setFormData({ ...formData, contentTypes: e.target.value })}
                  placeholders={["Preferred content", "e.g., Videos, Articles"]}
                />
                <ProfileField
                  label="Time Commitment"
                  value={formData.timeCommitment}
                  isEditing={isEditing}
                  onChange={(e) => setFormData({ ...formData, timeCommitment: e.target.value })}
                  placeholders={["Available time", "e.g., 5 hours/week"]}
                />

                <div className="lg:col-span-3 mt-6 flex justify-center">
                  <SlideButton
                    text={isEditing ? "Save Changes" : "Edit Profile"}
                    icon={isEditing ? <IoMdCloudUpload /> : <FaUserEdit />}
                    onClick={isEditing ? handleUpdateProfile : handleEditToggle}
                    disabled={isUpdating}
                    isLoading={isUpdating}
                    style={{ width: "280px", maxWidth: "100%" }}
                  />
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const ProfileField = ({ label, value, isEditing, isTextarea, onChange, placeholder, placeholders }) => (
  <div>
    <label className="block text-sm font-medium text-[#94a3b8] mb-2">
      {label}
    </label>
    {isEditing ? (
      isTextarea ? (
        <textarea
          value={value}
          onChange={onChange}
          className="w-full px-4 py-3 bg-[rgba(25,25,40,0.6)] border border-[rgba(102,126,234,0.2)] rounded-lg text-white placeholder-[#64748b] focus:outline-none focus:border-[rgba(102,126,234,0.5)] focus:ring-2 focus:ring-[rgba(102,126,234,0.15)] transition-all resize-none"
          placeholder={placeholder}
          rows={3}
          maxLength={500}
        />
      ) : (
        <GradientInput
          value={value}
          onChange={onChange}
          placeholders={placeholders || [placeholder]}
        />
      )
    ) : (
      <p className="text-[#e2e8f0] px-4 py-3 bg-[rgba(25,25,40,0.4)] border border-[rgba(102,126,234,0.1)] rounded-lg min-h-[48px] whitespace-pre-wrap">
        {value || <span className="text-[#64748b]">-- Not Provided --</span>}
      </p>
    )}
  </div>
);

export default React.memo(Profile);
