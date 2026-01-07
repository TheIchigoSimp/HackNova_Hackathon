import React, { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import GlowCard from "./Cards/GlowCard";
import { MdPublic, MdLock, MdDelete } from "react-icons/md";
import { showErrorToast } from "../../utils/toastUtils";

const MindmapCard = ({ mindmap, onToggleVisibility, onDelete }) => {
  const navigate = useNavigate();
  const [toggling, setToggling] = useState(false);

  const handleToggleVisibility = useCallback(async () => {
    const newVisibility =
      mindmap.visibility === "public" ? "private" : "public";
    setToggling(true);
    try {
      await onToggleVisibility(mindmap._id, { visibility: newVisibility });
    } catch (err) {
      console.error("Failed to toggle visibility:", err);
      showErrorToast(
        `Failed to toggle visibility: ${err.message || "Unknown error"}`
      );
    } finally {
      setToggling(false);
    }
  }, [mindmap._id, mindmap.visibility, onToggleVisibility]);

  const handleDeleteClick = () => {
    const confirmDelete = () => {
      const userInput = window.prompt(
        `Please enter the title of the mindmap to confirm deletion:`
      );
      if (userInput === mindmap.title) {
        onDelete(mindmap._id);
      } else {
        showErrorToast("The title entered does not match. Deletion canceled.");
      }
    };
    confirmDelete();
  };

  return (
    <GlowCard
      key={mindmap._id}
      width="100%"
      maxWidth="360px"
      height="auto"
      padding="28px"
      className="mx-auto flex items-center justify-center relative group"
    >
      {/* Delete Icon */}
      {onDelete && (
        <button
          onClick={handleDeleteClick}
          className="absolute top-4 right-4 p-2 rounded-lg bg-[rgba(239,68,68,0.1)] text-red-400 hover:bg-[rgba(239,68,68,0.2)] hover:text-red-300 transition-all duration-300 opacity-0 group-hover:opacity-100"
          aria-label="Delete mindmap"
        >
          <MdDelete size={20} />
        </button>
      )}

      <div className="flex flex-col items-center justify-center text-center w-full">
        <div
          className="cursor-pointer w-full"
          onClick={() => navigate(`/mindmap/${mindmap._id}`)}
        >
          <h2 className="text-xl font-bold text-white mb-3 line-clamp-2 hover:text-[#667eea] transition-colors duration-300">
            {mindmap.title}
          </h2>

          <div className="space-y-1.5 text-sm">
            <p className="text-[#94a3b8]">
              Created:{" "}
              <span className="text-[#e2e8f0]">
                {new Date(mindmap.createdAt).toLocaleString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </p>
            <p className="text-[#94a3b8]">
              Updated:{" "}
              <span className="text-[#e2e8f0]">
                {new Date(mindmap.updatedAt).toLocaleString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </p>
          </div>

          <div className="mt-4 inline-flex items-center px-3 py-1.5 rounded-full bg-[rgba(102,126,234,0.1)] border border-[rgba(102,126,234,0.2)]">
            <span className="text-[#667eea] font-medium text-sm">
              {mindmap.nodeCount} node{mindmap.nodeCount === 1 ? "" : "s"}
            </span>
          </div>

          {mindmap.tags && mindmap.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {mindmap.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs rounded-md bg-[rgba(118,75,162,0.1)] text-[#a78bfa] border border-[rgba(118,75,162,0.2)]"
                >
                  {tag}
                </span>
              ))}
              {mindmap.tags.length > 3 && (
                <span className="px-2 py-1 text-xs text-[#94a3b8]">
                  +{mindmap.tags.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Visibility Toggle Button */}
        {onToggleVisibility && (
          <div className="mt-5 w-full">
            <button
              onClick={handleToggleVisibility}
              disabled={toggling}
              className={`flex items-center justify-center space-x-2 w-full px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 cursor-pointer ${
                mindmap.visibility === "public"
                  ? "bg-gradient-to-r from-[rgba(34,197,94,0.15)] to-[rgba(34,197,94,0.1)] text-emerald-400 border border-emerald-500/30 hover:border-emerald-500/50"
                  : "bg-gradient-to-r from-[rgba(239,68,68,0.15)] to-[rgba(239,68,68,0.1)] text-red-400 border border-red-500/30 hover:border-red-500/50"
              }`}
            >
              {mindmap.visibility === "public" ? (
                <>
                  <MdPublic size={18} />
                  <span>Public</span>
                </>
              ) : (
                <>
                  <MdLock size={18} />
                  <span>Private</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </GlowCard>
  );
};

export default MindmapCard;
