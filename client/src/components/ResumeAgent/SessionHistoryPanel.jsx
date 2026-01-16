import React, { useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiTrash2, FiClock, FiChevronLeft, FiChevronRight, FiX, FiFile } from 'react-icons/fi';
import { HiDocumentText } from 'react-icons/hi';

// Animations
const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 0 rgba(102, 126, 234, 0); }
  50% { box-shadow: 0 0 12px rgba(102, 126, 234, 0.3); }
`;

const PanelWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 8px;
`;

const PanelContainer = styled(motion.div)`
  background: linear-gradient(135deg, rgba(25, 25, 40, 0.95) 0%, rgba(15, 15, 25, 0.98) 100%);
  border: 1px solid rgba(102, 126, 234, 0.15);
  border-radius: 18px;
  padding: 18px;
  height: fit-content;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
  overflow-x: hidden;
  backdrop-filter: blur(20px);
  width: 250px;
  position: relative;

  /* Top glow line */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 20%;
    right: 20%;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.4), transparent);
  }

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 5px;
  }
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.03);
    border-radius: 3px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(102, 126, 234, 0.3);
    border-radius: 3px;
    &:hover {
      background: rgba(102, 126, 234, 0.5);
    }
  }
`;

const DesktopToggle = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
  border: 1px solid rgba(102, 126, 234, 0.25);
  color: #a78bfa;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover {
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.25) 0%, rgba(118, 75, 162, 0.25) 100%);
    border-color: rgba(102, 126, 234, 0.4);
    transform: scale(1.05);
  }

  @media (max-width: 1023px) {
    display: none;
  }
`;

const CollapsedPanel = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 8px;
  background: linear-gradient(135deg, rgba(25, 25, 40, 0.95) 0%, rgba(15, 15, 25, 0.98) 100%);
  border: 1px solid rgba(102, 126, 234, 0.15);
  border-radius: 16px;
  backdrop-filter: blur(20px);

  @media (max-width: 1023px) {
    display: none;
  }
`;

const CollapsedButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: ${props => props.$isActive 
    ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.25) 0%, rgba(118, 75, 162, 0.2) 100%)'
    : 'transparent'
  };
  border: 1px solid ${props => props.$isActive 
    ? 'rgba(102, 126, 234, 0.35)' 
    : 'transparent'
  };
  color: ${props => props.$isActive ? '#a78bfa' : '#64748b'};
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    background: rgba(102, 126, 234, 0.15);
    color: #a78bfa;
  }
`;

const SessionBadge = styled.span`
  position: absolute;
  top: -3px;
  right: -3px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 9px;
  font-size: 0.6rem;
  font-weight: 600;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
`;

const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 14px;
  border-bottom: 1px solid rgba(102, 126, 234, 0.1);
`;

const PanelTitle = styled.h3`
  font-size: 0.85rem;
  font-weight: 600;
  color: #e2e8f0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const TitleIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.15) 100%);
  border-radius: 8px;
  color: #667eea;
`;

const NewSessionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 14px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.15) 100%);
  border: 1px solid rgba(102, 126, 234, 0.25);
  border-radius: 10px;
  color: #a78bfa;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.25) 100%);
    border-color: rgba(102, 126, 234, 0.4);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
  }
`;

const SessionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const SessionItem = styled(motion.div)`
  position: relative;
  padding: 14px;
  background: ${props => props.$isActive 
    ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.1) 100%)'
    : 'rgba(255, 255, 255, 0.02)'
  };
  border: 1px solid ${props => props.$isActive 
    ? 'rgba(102, 126, 234, 0.35)' 
    : 'rgba(255, 255, 255, 0.05)'
  };
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${props => props.$isActive && css`
    animation: ${glow} 2s ease-in-out infinite;
  `}

  &:hover {
    background: ${props => props.$isActive 
      ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.15) 100%)'
      : 'rgba(102, 126, 234, 0.05)'
    };
    border-color: rgba(102, 126, 234, 0.3);
    transform: translateX(4px);
  }
`;

const SessionTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
`;

const FileIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  min-width: 28px;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.1) 100%);
  border-radius: 8px;
  color: #f87171;
`;

const SessionTitle = styled.div`
  font-size: 0.8rem;
  font-weight: 500;
  color: #e2e8f0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
`;

const SessionMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.7rem;
  color: #64748b;
  padding-left: 38px;
`;

const ScoreBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 3px 8px;
  background: ${props => {
    const score = props.$score || 0;
    if (score >= 80) return 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%)';
    if (score >= 60) return 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(245, 158, 11, 0.1) 100%)';
    return 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.1) 100%)';
  }};
  color: ${props => {
    const score = props.$score || 0;
    if (score >= 80) return '#34d399';
    if (score >= 60) return '#fbbf24';
    return '#f87171';
  }};
  border-radius: 6px;
  font-weight: 700;
  font-size: 0.7rem;
  box-shadow: ${props => {
    const score = props.$score || 0;
    if (score >= 80) return '0 0 8px rgba(16, 185, 129, 0.2)';
    if (score >= 60) return '0 0 8px rgba(245, 158, 11, 0.2)';
    return '0 0 8px rgba(239, 68, 68, 0.2)';
  }};
`;

const DateText = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const DeleteButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 6px;
  background: transparent;
  border: none;
  color: #64748b;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s ease;
  border-radius: 6px;

  ${SessionItem}:hover & {
    opacity: 1;
  }

  &:hover {
    color: #ef4444;
    background: rgba(239, 68, 68, 0.15);
    transform: scale(1.1);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 28px 16px;
  color: #64748b;
  font-size: 0.8rem;
`;

const EmptyIcon = styled.div`
  width: 52px;
  height: 52px;
  margin: 0 auto 14px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #667eea;
`;

const LoadingSpinner = styled.div`
  width: 22px;
  height: 22px;
  border: 2px solid rgba(102, 126, 234, 0.2);
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 28px auto;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

// Mobile Components
const MobileToggle = styled.button`
  display: none;
  position: fixed;
  bottom: 24px;
  left: 24px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  cursor: pointer;
  z-index: 100;
  box-shadow: 0 4px 25px rgba(102, 126, 234, 0.5);
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.08);
    box-shadow: 0 6px 30px rgba(102, 126, 234, 0.6);
  }

  @media (max-width: 1023px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const MobileOverlay = styled(motion.div)`
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 200;
  backdrop-filter: blur(6px);

  @media (max-width: 1023px) {
    display: block;
  }
`;

const MobileDrawer = styled(motion.div)`
  display: none;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 300px;
  max-width: 85vw;
  background: linear-gradient(135deg, rgba(25, 25, 40, 0.98) 0%, rgba(15, 15, 25, 0.99) 100%);
  border-right: 1px solid rgba(102, 126, 234, 0.2);
  z-index: 201;
  padding: 24px;
  overflow-y: auto;

  @media (max-width: 1023px) {
    display: block;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 18px;
  right: 18px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 10px;
  color: #e2e8f0;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.05);
  }
`;

const SessionCount = styled.span`
  position: absolute;
  top: -5px;
  right: -5px;
  min-width: 22px;
  height: 22px;
  padding: 0 7px;
  background: linear-gradient(135deg, #ef4444, #f87171);
  border-radius: 11px;
  font-size: 0.7rem;
  font-weight: 700;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 10px rgba(239, 68, 68, 0.4);
`;

/**
 * Format a date to a relative or short format
 */
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return diffMins <= 1 ? 'Just now' : `${diffMins}m ago`;
    }
    return `${diffHours}h ago`;
  }
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

/**
 * Session List Content (shared between desktop and mobile)
 */
const SessionListContent = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  isLoading,
  onClose,
}) => {
  const handleDelete = (e, sessionId) => {
    e.stopPropagation();
    if (onDeleteSession) {
      onDeleteSession(sessionId);
    }
  };

  const handleSelect = (sessionId) => {
    onSelectSession(sessionId);
    if (onClose) onClose();
  };

  return (
    <>
      <PanelHeader>
        <PanelTitle>
          <TitleIcon>
            <FiClock size={14} />
          </TitleIcon>
          History
        </PanelTitle>
        <NewSessionButton onClick={() => { onNewSession(); if (onClose) onClose(); }}>
          <FiPlus size={13} />
          New
        </NewSessionButton>
      </PanelHeader>

      {isLoading ? (
        <LoadingSpinner />
      ) : sessions.length === 0 ? (
        <EmptyState>
          <EmptyIcon>
            <HiDocumentText size={26} />
          </EmptyIcon>
          <div style={{ fontWeight: 500, color: '#94a3b8' }}>No resume sessions yet</div>
          <div style={{ marginTop: 6, fontSize: '0.7rem' }}>
            Upload a resume to get started
          </div>
        </EmptyState>
      ) : (
        <SessionList>
          <AnimatePresence>
            {sessions.map((session) => (
              <SessionItem
                key={session._id}
                $isActive={session._id === activeSessionId}
                onClick={() => handleSelect(session._id)}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                whileHover={{ scale: 1.01 }}
              >
                <SessionTitleRow>
                  <FileIcon>
                    <FiFile size={14} />
                  </FileIcon>
                  <SessionTitle>
                    {session.title || session.filename || 'Resume Analysis'}
                  </SessionTitle>
                </SessionTitleRow>
                <SessionMeta>
                  <ScoreBadge $score={session.analysisResult?.ats_score}>
                    {session.analysisResult?.ats_score || 0}%
                  </ScoreBadge>
                  <DateText>
                    <FiClock size={10} />
                    {formatDate(session.updatedAt)}
                  </DateText>
                </SessionMeta>
                <DeleteButton 
                  onClick={(e) => handleDelete(e, session._id)}
                  title="Delete session"
                >
                  <FiTrash2 size={14} />
                </DeleteButton>
              </SessionItem>
            ))}
          </AnimatePresence>
        </SessionList>
      )}
    </>
  );
};

/**
 * SessionHistoryPanel Component
 * 
 * Displays a list of past resume analysis sessions for the user.
 * Allows selecting a session to load, creating new sessions, and deleting old ones.
 * Includes collapsible desktop sidebar and mobile drawer.
 */
const SessionHistoryPanel = ({
  sessions = [],
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  isLoading = false,
}) => {
  const [isDesktopExpanded, setIsDesktopExpanded] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop Panel */}
      <PanelWrapper className="hidden lg:flex">
        <AnimatePresence mode="wait">
          {isDesktopExpanded ? (
            <PanelContainer
              key="expanded"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 250, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <SessionListContent
                sessions={sessions}
                activeSessionId={activeSessionId}
                onSelectSession={onSelectSession}
                onNewSession={onNewSession}
                onDeleteSession={onDeleteSession}
                isLoading={isLoading}
              />
            </PanelContainer>
          ) : (
            <CollapsedPanel
              key="collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <CollapsedButton 
                onClick={onNewSession}
                title="New Analysis"
              >
                <FiPlus size={18} />
              </CollapsedButton>
              <CollapsedButton 
                $isActive={true}
                onClick={() => setIsDesktopExpanded(true)}
                title={`${sessions.length} sessions`}
              >
                <FiClock size={18} />
                {sessions.length > 0 && <SessionBadge>{sessions.length}</SessionBadge>}
              </CollapsedButton>
            </CollapsedPanel>
          )}
        </AnimatePresence>
        <DesktopToggle 
          onClick={() => setIsDesktopExpanded(!isDesktopExpanded)}
          title={isDesktopExpanded ? "Collapse history" : "Expand history"}
        >
          {isDesktopExpanded ? <FiChevronLeft size={18} /> : <FiChevronRight size={18} />}
        </DesktopToggle>
      </PanelWrapper>

      {/* Mobile Toggle Button */}
      <MobileToggle onClick={() => setIsMobileOpen(true)}>
        <FiClock size={24} />
        {sessions.length > 0 && <SessionCount>{sessions.length}</SessionCount>}
      </MobileToggle>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <MobileOverlay
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
            />
            <MobileDrawer
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <CloseButton onClick={() => setIsMobileOpen(false)}>
                <FiX size={20} />
              </CloseButton>
              <div style={{ marginTop: 40 }}>
                <SessionListContent
                  sessions={sessions}
                  activeSessionId={activeSessionId}
                  onSelectSession={onSelectSession}
                  onNewSession={onNewSession}
                  onDeleteSession={onDeleteSession}
                  isLoading={isLoading}
                  onClose={() => setIsMobileOpen(false)}
                />
              </div>
            </MobileDrawer>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default SessionHistoryPanel;
