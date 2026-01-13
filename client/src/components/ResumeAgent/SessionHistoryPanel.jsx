import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiTrash2, FiFileText, FiClock } from 'react-icons/fi';
import { HiDocumentText } from 'react-icons/hi';

const PanelContainer = styled.div`
  background: linear-gradient(135deg, rgba(25, 25, 40, 0.95) 0%, rgba(15, 15, 25, 0.98) 100%);
  border: 1px solid rgba(102, 126, 234, 0.15);
  border-radius: 16px;
  padding: 20px;
  height: fit-content;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
  backdrop-filter: blur(20px);

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(102, 126, 234, 0.3);
    border-radius: 3px;
  }
`;

const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(102, 126, 234, 0.1);
`;

const PanelTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: 600;
  color: #e2e8f0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const NewSessionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%);
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 8px;
  color: #a78bfa;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%);
    border-color: rgba(102, 126, 234, 0.5);
  }
`;

const SessionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SessionItem = styled(motion.div)`
  position: relative;
  padding: 12px;
  background: ${props => props.$isActive 
    ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.15) 100%)'
    : 'rgba(255, 255, 255, 0.02)'
  };
  border: 1px solid ${props => props.$isActive 
    ? 'rgba(102, 126, 234, 0.4)' 
    : 'rgba(255, 255, 255, 0.05)'
  };
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$isActive 
      ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.25) 0%, rgba(118, 75, 162, 0.2) 100%)'
      : 'rgba(255, 255, 255, 0.05)'
    };
    border-color: rgba(102, 126, 234, 0.3);
  }
`;

const SessionTitle = styled.div`
  font-size: 0.8rem;
  font-weight: 500;
  color: #e2e8f0;
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-right: 24px;
`;

const SessionMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.7rem;
  color: #64748b;
`;

const ScoreBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 2px 6px;
  background: ${props => {
    const score = props.$score || 0;
    if (score >= 80) return 'rgba(16, 185, 129, 0.15)';
    if (score >= 60) return 'rgba(245, 158, 11, 0.15)';
    return 'rgba(239, 68, 68, 0.15)';
  }};
  color: ${props => {
    const score = props.$score || 0;
    if (score >= 80) return '#34d399';
    if (score >= 60) return '#fbbf24';
    return '#f87171';
  }};
  border-radius: 4px;
  font-weight: 600;
`;

const DateText = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const DeleteButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px;
  background: transparent;
  border: none;
  color: #64748b;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s ease;
  border-radius: 4px;

  ${SessionItem}:hover & {
    opacity: 1;
  }

  &:hover {
    color: #ef4444;
    background: rgba(239, 68, 68, 0.1);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 24px 16px;
  color: #64748b;
  font-size: 0.8rem;
`;

const EmptyIcon = styled.div`
  width: 48px;
  height: 48px;
  margin: 0 auto 12px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #667eea;
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid rgba(102, 126, 234, 0.2);
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 24px auto;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
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
 * SessionHistoryPanel Component
 * 
 * Displays a list of past resume analysis sessions for the user.
 * Allows selecting a session to load, creating new sessions, and deleting old ones.
 */
const SessionHistoryPanel = ({
  sessions = [],
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  isLoading = false,
}) => {
  const handleDelete = (e, sessionId) => {
    e.stopPropagation(); // Prevent triggering onSelectSession
    if (onDeleteSession) {
      onDeleteSession(sessionId);
    }
  };

  return (
    <PanelContainer>
      <PanelHeader>
        <PanelTitle>
          <FiClock size={16} />
          History
        </PanelTitle>
        <NewSessionButton onClick={onNewSession}>
          <FiPlus size={14} />
          New
        </NewSessionButton>
      </PanelHeader>

      {isLoading ? (
        <LoadingSpinner />
      ) : sessions.length === 0 ? (
        <EmptyState>
          <EmptyIcon>
            <HiDocumentText size={24} />
          </EmptyIcon>
          <div>No resume sessions yet</div>
          <div style={{ marginTop: 4, fontSize: '0.7rem' }}>
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
                onClick={() => onSelectSession(session._id)}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <SessionTitle>
                  {session.title || session.filename || 'Resume Analysis'}
                </SessionTitle>
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
    </PanelContainer>
  );
};

export default SessionHistoryPanel;
