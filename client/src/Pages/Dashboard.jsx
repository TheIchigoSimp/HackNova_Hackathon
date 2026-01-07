import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import GradientInput from "../components/Input/GradientInput";
import { BsMagic } from "react-icons/bs";
import MindmapCard from "../components/MindmapCard";
import SlideButton from "../components/Buttons/SlideButton";

import { requestHandler } from "../../utils/index";
import { showErrorToast } from "../../utils/toastUtils";

import { useSession } from "../lib/auth-client";
import { useNavbarVisibility } from "../hooks/useNavbarVisibility";
import pathgenieLogo from "../../public/pathgenie.png";
import {
  createMindmap,
  getAllMindmaps,
  updateMindmap,
  deleteMindmap,
} from "../api/mindmapApi";

const Dashboard = () => {
  const [loading, setLoading] = useState(false);
  const [mindmaps, setMindmaps] = useState([]);
  const [title, setTitle] = useState("");
  const navigate = useNavigate();
  const { data: session } = useSession();
  // Use the same hook as Navbar with matching parameters for synchronized behavior
  const isNavbarVisible = useNavbarVisibility(600, 43);

  const handleCreateMindmap = useCallback(async () => {
    if (!title.trim()) {
      showErrorToast("Please enter a title.");
      return;
    }
    await requestHandler(
      async () => createMindmap(title.trim()),
      setLoading,
      "Creating mindmap...",
      (res) => {
        const newMindmap = res.data.mindmap;
        setMindmaps((prev) => [...prev, newMindmap]);
        navigate(`/mindmap/${newMindmap._id}`, {
          state: { mindmap: newMindmap },
        });
      }
    );
  }, [navigate, title]);

  useEffect(() => {
    const fetchMindmaps = () => {
      setLoading(true);

      requestHandler(
        () => getAllMindmaps(),
        setLoading,
        "Fetching mindmaps...",
        (res) => {
          const fetchedMindmaps = res.data.mindmaps;
          setMindmaps(fetchedMindmaps);
        },
        null,
        false
      );
    };

    fetchMindmaps();
  }, []);

  const handleUpdateMindmap = useCallback((mindmapId, updates) => {
    requestHandler(
      () => updateMindmap(mindmapId, updates),
      setLoading,
      "Updating mindmap...",
      (res) => {
        const updatedMindmap = res.data.mindmap;
        setMindmaps((prev) =>
          prev.map((m) => (m._id === updatedMindmap._id ? updatedMindmap : m))
        );
      }
    );
  }, []);

  const handleDeleteMindmap = useCallback((mindmapId) => {
    requestHandler(
      () => deleteMindmap(mindmapId),
      setLoading,
      "Deleting mindmap...",
      // eslint-disable-next-line no-unused-vars
      (res) => {
        setMindmaps((prev) => prev.filter((m) => m._id !== mindmapId));
      }
    );
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Scrollable content area with smooth transition */}
      <div className={`flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 transition-all duration-500 ${isNavbarVisible ? 'pt-16' : 'pt-0'}`}>
        {/* Input + Button Section */}
        <div className="max-w-2xl mx-auto flex flex-col items-center text-center pt-12">
          {/* Logo */}
          <img
            src={pathgenieLogo}
            alt="PathGenie"
            className="h-auto max-w-[200px] sm:max-w-[280px] mb-6"
          />
          {/* Section header */}
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Create Your Learning Path
          </h1>
          <p className="text-[#94a3b8] mb-8 text-sm md:text-base">
            Enter a topic and let AI generate your personalized roadmap
          </p>

          <div className="w-full mt-4">
            <GradientInput
              id="title"
              name="title"
              type="text"
              placeholders={[
                "Type Your Idea",
                "Type something creative",
                "Type Your Topic",
                "Type Learning Headline",
                "Paste Syllabus",
                "Paste Your Notes",
              ]}
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="w-full mt-6 flex justify-center">
            <SlideButton
              text={loading ? "Creating..." : "Do Magic"}
              onClick={handleCreateMindmap}
              disabled={loading}
              icon={<BsMagic size={22} />}
              style={{ width: "280px", maxWidth: "100%" }}
            />
          </div>

          {loading && (
            <div className="mt-6 flex items-center space-x-3">
              <div className="w-5 h-5 border-2 border-[#667eea] border-t-transparent rounded-full animate-spin" />
              <p className="text-[#94a3b8] text-sm" role="status">
                Loading…
              </p>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="max-w-7xl mx-auto mt-12 mb-8">
          <div className="h-px bg-gradient-to-r from-transparent via-[rgba(102,126,234,0.3)] to-transparent" />
        </div>

        {/* Mindmaps Grid */}
        <div className="max-w-7xl mx-auto mb-12">
          <h2 className="text-xl font-semibold text-white mb-6">Your Mindmaps</h2>
          {mindmaps.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {mindmaps.map((mindmap) => (
                <MindmapCard
                  key={mindmap._id}
                  mindmap={mindmap}
                  onToggleVisibility={
                    mindmap.owner === session.user.id
                      ? handleUpdateMindmap
                      : null
                  }
                  onDelete={
                    mindmap.owner === session.user.id
                      ? handleDeleteMindmap
                      : null
                  }
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[rgba(102,126,234,0.2)] to-[rgba(118,75,162,0.2)] flex items-center justify-center">
                <BsMagic className="w-8 h-8 text-[#667eea]" />
              </div>
              <p className="text-[#94a3b8]">No mindmaps yet. Create your first one above!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
