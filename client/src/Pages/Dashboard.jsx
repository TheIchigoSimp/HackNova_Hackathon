import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";

import GradientInput from "../components/Input/GradientInput";
import { BsMagic } from "react-icons/bs";
import { FiFileText, FiAward, FiMap, FiSearch, FiPlus } from "react-icons/fi";
import MindmapCard from "../components/MindmapCard";
import SlideButton from "../components/Buttons/SlideButton";
import DashboardStats from "../components/Dashboard/DashboardStats";

import { requestHandler } from "../../utils/index";
import { showErrorToast } from "../../utils/toastUtils";

import { useSession } from "../lib/auth-client";
import { useNavbarVisibility } from "../hooks/useNavbarVisibility";
import pathgenieLogo from "../../public/logo2.png";
import {
  createMindmap,
  getAllMindmaps,
  updateMindmap,
  deleteMindmap,
} from "../api/mindmapApi";

/**
 * Get greeting based on time of day
 */
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

/**
 * Quick action buttons for common tasks
 */
const QuickActions = () => {
  const actions = [
    { icon: FiFileText, label: "Resume Analyzer", href: "/resume-analyzer", color: "#667eea" },
    { icon: FiAward, label: "Certifications", href: "/certifications", color: "#764ba2" },
    { icon: FiMap, label: "My Mindmaps", href: "#mindmaps", color: "#f093fb", isAnchor: true },
  ];

  const handleClick = (action, e) => {
    if (action.isAnchor) {
      e.preventDefault();
      const element = document.getElementById('mindmaps');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="flex flex-wrap justify-center gap-3 mt-6">
      {actions.map((action, index) => (
        <motion.div
          key={action.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 + index * 0.1 }}
        >
          {action.isAnchor ? (
            <button
              onClick={(e) => handleClick(action, e)}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-[rgba(102,126,234,0.2)] bg-[rgba(102,126,234,0.05)] text-[#94a3b8] hover:bg-[rgba(102,126,234,0.15)] hover:text-white hover:border-[rgba(102,126,234,0.4)] transition-all duration-200"
            >
              <action.icon size={16} style={{ color: action.color }} />
              <span className="text-sm font-medium">{action.label}</span>
            </button>
          ) : (
            <Link
              to={action.href}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-[rgba(102,126,234,0.2)] bg-[rgba(102,126,234,0.05)] text-[#94a3b8] hover:bg-[rgba(102,126,234,0.15)] hover:text-white hover:border-[rgba(102,126,234,0.4)] transition-all duration-200"
            >
              <action.icon size={16} style={{ color: action.color }} />
              <span className="text-sm font-medium">{action.label}</span>
            </Link>
          )}
        </motion.div>
      ))}
    </div>
  );
};

const Dashboard = () => {
  const [loading, setLoading] = useState(false);
  const [mindmaps, setMindmaps] = useState([]);
  const [title, setTitle] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { data: session } = useSession();
  const isNavbarVisible = useNavbarVisibility(600, 43);

  // Get user's first name
  const firstName = session?.user?.name?.split(" ")[0] || "there";

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
      () => {
        setMindmaps((prev) => prev.filter((m) => m._id !== mindmapId));
      }
    );
  }, []);

  // Filter mindmaps based on search
  const filteredMindmaps = mindmaps.filter((m) =>
    m.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col">
      <div className={`flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 transition-all duration-500 ${isNavbarVisible ? 'pt-16' : 'pt-0'}`}>
        
        {/* Top Section - Greeting & Create */}
        <div className="max-w-2xl mx-auto flex flex-col items-center text-center pt-8">
          {/* Personalized Greeting */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              {getGreeting()}, <span className="bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent">{firstName}</span>! 👋
            </h1>
            <p className="text-[#64748b] mt-1 text-sm">
              Ready to continue your learning journey?
            </p>
          </motion.div>

          {/* Quick Actions */}
          <QuickActions />

          {/* Stats Tiles */}
          <DashboardStats mindmaps={mindmaps} />

          {/* Logo */}
          <motion.img
            src={pathgenieLogo}
            alt="PathGenie"
            className="h-auto max-w-[160px] sm:max-w-[200px] mt-8 mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          />

          {/* Create Section */}
          <h2 className="text-xl md:text-2xl font-semibold text-white mb-2">
            Create New Learning Path
          </h2>
          <p className="text-[#94a3b8] mb-6 text-sm">
            Enter a topic and let AI generate your personalized roadmap
          </p>

          <div className="w-full">
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
              ]}
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="w-full mt-5 flex justify-center">
            <SlideButton
              text={loading ? "Creating..." : "Do Magic"}
              onClick={handleCreateMindmap}
              disabled={loading}
              icon={<BsMagic size={22} />}
              style={{ width: "260px", maxWidth: "100%" }}
            />
          </div>

          {loading && (
            <div className="mt-4 flex items-center space-x-3">
              <div className="w-5 h-5 border-2 border-[#667eea] border-t-transparent rounded-full animate-spin" />
              <p className="text-[#94a3b8] text-sm">Loading…</p>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="max-w-7xl mx-auto mt-10 mb-6">
          <div className="h-px bg-gradient-to-r from-transparent via-[rgba(102,126,234,0.3)] to-transparent" />
        </div>

        {/* Mindmaps Section */}
        <div id="mindmaps" className="max-w-7xl mx-auto mb-12">
          {/* Header with search */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-xl font-semibold text-white">Your Mindmaps</h2>
              <p className="text-[#64748b] text-sm">{mindmaps.length} learning paths</p>
            </div>
            
            {mindmaps.length > 0 && (
              <div className="relative w-full sm:w-64">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" size={16} />
                <input
                  type="text"
                  placeholder="Search mindmaps..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(102,126,234,0.2)] text-white text-sm placeholder-[#64748b] focus:outline-none focus:border-[rgba(102,126,234,0.5)] transition-colors"
                />
              </div>
            )}
          </div>

          {/* Mindmaps Grid */}
          {filteredMindmaps.length > 0 ? (
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {filteredMindmaps.map((mindmap, index) => (
                <motion.div
                  key={mindmap._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <MindmapCard
                    mindmap={mindmap}
                    onToggleVisibility={
                      mindmap.owner === session?.user?.id
                        ? handleUpdateMindmap
                        : null
                    }
                    onDelete={
                      mindmap.owner === session?.user?.id
                        ? handleDeleteMindmap
                        : null
                    }
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : mindmaps.length > 0 ? (
            // Search returned no results
            <div className="text-center py-12">
              <FiSearch className="w-12 h-12 mx-auto mb-4 text-[#64748b]" />
              <p className="text-[#94a3b8]">No mindmaps match "{searchQuery}"</p>
            </div>
          ) : (
            // Empty state
            <motion.div 
              className="text-center py-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[rgba(102,126,234,0.2)] to-[rgba(118,75,162,0.2)] flex items-center justify-center">
                <FiPlus className="w-10 h-10 text-[#667eea]" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No mindmaps yet</h3>
              <p className="text-[#94a3b8] mb-6 max-w-sm mx-auto">
                Create your first learning path above and start your journey!
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

