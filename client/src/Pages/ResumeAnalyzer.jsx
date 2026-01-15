import React, { useState, useCallback, useRef, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUploadCloud, FiFile, FiX, FiCheckCircle, FiAlertCircle, FiRefreshCw, FiStar } from 'react-icons/fi';
import { HiDocumentText, HiSparkles } from 'react-icons/hi';

import ATSScoreCard from '../components/ResumeAgent/ATSScoreCard';
import SuggestionsPanel from '../components/ResumeAgent/SuggestionsPanel';
import ResumeChat from '../components/ResumeAgent/ResumeChat';
import SessionHistoryPanel from '../components/ResumeAgent/SessionHistoryPanel';
import SlideButton from '../components/Buttons/SlideButton';

import { uploadResume, streamChatWithAgent, chatWithAgent } from '../api/resumeAgentApi';
import { 
    getAllResumeSessions,
    getResumeSessionById,
    createResumeSession, 
    addChatMessage as persistChatMessage, 
    deleteResumeSession 
} from '../api/resumeSessionApi';
import { useNavbarVisibility } from '../hooks/useNavbarVisibility';
import { useSession } from '../lib/auth-client';

// Animations
const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.8; }
`;

const borderDash = keyframes`
  0% { stroke-dashoffset: 0; }
  100% { stroke-dashoffset: 20; }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const PageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  
  /* Hero gradient mesh background */
  &::before {
    content: '';
    position: fixed;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(ellipse at 20% 20%, rgba(102, 126, 234, 0.08) 0%, transparent 50%),
                radial-gradient(ellipse at 80% 80%, rgba(118, 75, 162, 0.06) 0%, transparent 50%),
                radial-gradient(ellipse at 50% 50%, rgba(102, 126, 234, 0.04) 0%, transparent 70%);
    pointer-events: none;
    z-index: -1;
  }
`;

const ContentArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0 16px;
  transition: padding-top 0.5s ease;
  position: relative;
  
  @media (min-width: 640px) {
    padding: 0 24px;
  }
  
  @media (min-width: 1024px) {
    padding: 0 32px;
  }
`;

const Header = styled(motion.div)`
  max-width: 1600px;
  margin: 0 auto;
  text-align: center;
  padding-top: 48px;
  padding-bottom: 36px;
  position: relative;
`;

const TitleWrapper = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

const TitleIcon = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.15) 100%);
  border-radius: 14px;
  color: #667eea;
  animation: ${float} 3s ease-in-out infinite;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 800;
  background: linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;
  
  @media (min-width: 768px) {
    font-size: 2.5rem;
  }
`;

const Subtitle = styled.p`
  color: #94a3b8;
  font-size: 0.9rem;
  max-width: 500px;
  margin: 0 auto;
  line-height: 1.6;
  
  @media (min-width: 768px) {
    font-size: 1rem;
  }
`;

const MainLayout = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
`;

const HistoryColumn = styled.div`
  position: fixed;
  top: 100px;
  left: 20px;
  z-index: 50;
  
  @media (max-width: 1023px) {
    position: fixed;
    top: auto;
    bottom: 20px;
    left: 20px;
  }
`;

const MainColumn = styled.div`
  width: 100%;
`;

const UploadSection = styled(motion.div)`
  max-width: 640px;
  margin: 0 auto 48px;
`;

const DropZone = styled(motion.div)`
  position: relative;
  padding: 56px 36px;
  background: ${props => props.$isDragOver
    ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.18) 0%, rgba(118, 75, 162, 0.15) 100%)'
    : 'linear-gradient(135deg, rgba(25, 25, 40, 0.9) 0%, rgba(15, 15, 25, 0.95) 100%)'
  };
  border: 2px dashed transparent;
  border-radius: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(20px);
  overflow: hidden;

  /* Animated dashed border using SVG */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 20px;
    padding: 2px;
    background: linear-gradient(
      135deg, 
      ${props => props.$isDragOver 
        ? 'rgba(102, 126, 234, 0.6)' 
        : 'rgba(102, 126, 234, 0.25)'
      } 0%, 
      ${props => props.$isDragOver 
        ? 'rgba(118, 75, 162, 0.5)' 
        : 'rgba(118, 75, 162, 0.2)'
      } 100%
    );
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    animation: ${pulse} 2s ease-in-out infinite;
  }
  
  /* Inner glow on hover */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 20px;
    background: radial-gradient(ellipse at center, rgba(102, 126, 234, 0.08) 0%, transparent 70%);
    opacity: ${props => props.$isDragOver ? 1 : 0};
    transition: opacity 0.3s ease;
  }

  &:hover::before {
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.4) 0%, rgba(118, 75, 162, 0.35) 100%);
  }
  
  &:hover::after {
    opacity: 1;
  }
`;

const UploadIcon = styled(motion.div)`
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.15) 100%);
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #667eea;
  position: relative;
  z-index: 1;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.15);
`;

const UploadText = styled.p`
  color: #e2e8f0;
  font-size: 1.1rem;
  font-weight: 500;
  margin-bottom: 8px;
  position: relative;
  z-index: 1;
`;

const UploadHint = styled.p`
  color: #64748b;
  font-size: 0.875rem;
  position: relative;
  z-index: 1;
`;

const HiddenInput = styled.input`
  display: none;
`;

const FilePreview = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 22px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.12) 0%, rgba(118, 75, 162, 0.08) 100%);
  border: 1px solid rgba(102, 126, 234, 0.25);
  border-radius: 16px;
  margin-top: 18px;
`;

const FileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const FileIcon = styled.div`
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
`;

const FileName = styled.span`
  color: #e2e8f0;
  font-size: 0.9rem;
  font-weight: 600;
`;

const RemoveButton = styled.button`
  padding: 10px;
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 10px;
  color: #ef4444;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(239, 68, 68, 0.2);
    border-color: rgba(239, 68, 68, 0.4);
    transform: scale(1.05);
  }
`;

const ResultsSection = styled(motion.div)`
  margin-bottom: 48px;
`;

const ResultsGrid = styled.div`
  display: grid;
  gap: 24px;
  
  @media (min-width: 1024px) {
    grid-template-columns: 320px 1fr 400px;
  }
  
  @media (min-width: 1280px) {
    grid-template-columns: 340px 1fr 420px;
  }
`;

const ErrorMessage = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 22px;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(239, 68, 68, 0.08) 100%);
  border: 1px solid rgba(239, 68, 68, 0.25);
  border-radius: 14px;
  color: #f87171;
  font-size: 0.9rem;
  margin-top: 18px;
`;

const LoadingOverlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(10, 10, 15, 0.85);
  backdrop-filter: blur(12px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 100;
`;

const LoadingSpinner = styled(motion.div)`
  width: 72px;
  height: 72px;
  border: 4px solid rgba(102, 126, 234, 0.15);
  border-top-color: #667eea;
  border-radius: 50%;
  box-shadow: 0 0 30px rgba(102, 126, 234, 0.3);
`;

const LoadingText = styled.p`
  color: #e2e8f0;
  margin-top: 28px;
  font-size: 1.05rem;
  font-weight: 500;
`;

const LoadingSubtext = styled.p`
  color: #64748b;
  margin-top: 8px;
  font-size: 0.85rem;
`;

const SuccessHeader = styled(motion.div)`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 28px;
`;

const SuccessMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 22px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(16, 185, 129, 0.08) 100%);
  border: 1px solid rgba(16, 185, 129, 0.25);
  border-radius: 14px;
  color: #34d399;
  font-size: 0.9rem;
  font-weight: 500;
`;

const NewResumeButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 22px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.12) 0%, rgba(118, 75, 162, 0.1) 100%);
  border: 1px solid rgba(102, 126, 234, 0.25);
  border-radius: 14px;
  color: #a78bfa;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.15) 100%);
    border-color: rgba(102, 126, 234, 0.4);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.2);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' }
  }
};

const ResumeAnalyzer = () => {
    const [file, setFile] = useState(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [isRestoringSession, setIsRestoringSession] = useState(true);
    const [isLoadingSession, setIsLoadingSession] = useState(false);
    const [error, setError] = useState(null);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [threadId, setThreadId] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);
    const [filename, setFilename] = useState('');
    
    // History state
    const [allSessions, setAllSessions] = useState([]);
    const [activeSessionId, setActiveSessionId] = useState(null);
    
    const fileInputRef = useRef(null);
    const isNavbarVisible = useNavbarVisibility(600, 43);
    const { data: session } = useSession();

    // Fetch all sessions on mount
    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const sessions = await getAllResumeSessions();
                setAllSessions(sessions || []);
                
                // If there are sessions, load the most recent one with FULL data
                if (sessions && sessions.length > 0) {
                    const mostRecent = sessions[0];
                    // Fetch full session data to get all analysis result fields
                    const fullSession = await getResumeSessionById(mostRecent._id);
                    
                    if (fullSession) {
                        setActiveSessionId(fullSession._id);
                        setThreadId(fullSession.threadId);
                        setFilename(fullSession.filename || '');
                        setAnalysisResult({
                            ats_score: fullSession.analysisResult?.ats_score || 0,
                            ats_breakdown: fullSession.analysisResult?.ats_breakdown || {},
                            skills_found: fullSession.analysisResult?.skills_found || [],
                            action_verbs_found: fullSession.analysisResult?.action_verbs_found || [],
                            suggestions: fullSession.analysisResult?.suggestions || [],
                        });
                        setChatMessages(fullSession.chatMessages || []);
                    }
                }
            } catch (err) {
                console.error('Failed to fetch sessions:', err);
            } finally {
                setIsRestoringSession(false);
            }
        };

        fetchSessions();
    }, []);

    // Load a specific session from history
    const handleLoadSession = useCallback(async (sessionId) => {
        if (sessionId === activeSessionId) return;
        
        setIsLoadingSession(true);
        try {
            const session = await getResumeSessionById(sessionId);
            if (session) {
                setActiveSessionId(session._id);
                setThreadId(session.threadId);
                setFilename(session.filename || '');
                setAnalysisResult({
                    ats_score: session.analysisResult?.ats_score || 0,
                    ats_breakdown: session.analysisResult?.ats_breakdown || {},
                    skills_found: session.analysisResult?.skills_found || [],
                    action_verbs_found: session.analysisResult?.action_verbs_found || [],
                    suggestions: session.analysisResult?.suggestions || [],
                });
                setChatMessages(session.chatMessages || []);
                setFile(null);
                setError(null);
            }
        } catch (err) {
            console.error('Failed to load session:', err);
            setError('Failed to load session. Please try again.');
        } finally {
            setIsLoadingSession(false);
        }
    }, [activeSessionId]);

    // Start a new session (show upload UI)
    const handleNewSession = useCallback(() => {
        setActiveSessionId(null);
        setFile(null);
        setAnalysisResult(null);
        setThreadId(null);
        setChatMessages([]);
        setFilename('');
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, []);

    // Delete a session from history
    const handleDeleteSession = useCallback(async (sessionId) => {
        try {
            await deleteResumeSession(sessionId);
            setAllSessions(prev => prev.filter(s => s._id !== sessionId));
            
            // If we deleted the active session, clear the view
            if (sessionId === activeSessionId) {
                handleNewSession();
            }
        } catch (err) {
            console.error('Failed to delete session:', err);
        }
    }, [activeSessionId, handleNewSession]);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(false);
        setError(null);

        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            if (!droppedFile.name.toLowerCase().endsWith('.pdf')) {
                setError('Please upload a PDF file.');
                return;
            }
            setFile(droppedFile);
        }
    }, []);

    const handleFileSelect = useCallback((e) => {
        const selectedFile = e.target.files[0];
        setError(null);

        if (selectedFile) {
            if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
                setError('Please upload a PDF file.');
                return;
            }
            setFile(selectedFile);
        }
    }, []);

    const handleRemoveFile = useCallback(() => {
        setFile(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, []);

    const handleUpload = useCallback(async () => {
        if (!file) return;

        setIsUploading(true);
        setError(null);

        try {
            const userId = session?.user?.id || 'anonymous';
            const result = await uploadResume(file, userId);
            
            const newAnalysisResult = {
                ats_score: result.ats_score,
                ats_breakdown: result.ats_breakdown,
                skills_found: result.skills_found,
                action_verbs_found: result.action_verbs_found,
                suggestions: result.suggestions,
            };
            
            setAnalysisResult(newAnalysisResult);
            setThreadId(result.thread_id);
            setFilename(file.name);
            setChatMessages([]);

            // Create new session in MongoDB
            const newSession = await createResumeSession({
                threadId: result.thread_id,
                filename: file.name,
                title: file.name.replace('.pdf', '').replace('.PDF', ''),
                analysisResult: newAnalysisResult,
            });
            
            // Update history list
            setActiveSessionId(newSession._id);
            setAllSessions(prev => [newSession, ...prev]);
            
        } catch (err) {
            console.error('Upload error:', err);
            let errorMessage = 'Failed to analyze resume. Please try again.';
            if (err.response?.data?.detail) {
                const detail = err.response.data.detail;
                if (Array.isArray(detail)) {
                    errorMessage = detail.map(e => e.msg || JSON.stringify(e)).join(', ');
                } else if (typeof detail === 'string') {
                    errorMessage = detail;
                } else {
                    errorMessage = JSON.stringify(detail);
                }
            }
            setError(errorMessage);
        } finally {
            setIsUploading(false);
        }
    }, [file, session]);

    const handleSendMessage = useCallback(async (message, onStreamToken = null) => {
        if (!threadId) return;

        setIsChatLoading(true);
        try {
            // Persist user message to MongoDB
            await persistChatMessage(threadId, 'user', message);
            
            let finalResponse = '';
            
            if (onStreamToken) {
                finalResponse = await streamChatWithAgent(
                    threadId,
                    message,
                    (token, fullText) => {
                        onStreamToken(token, fullText);
                    },
                    (status) => {
                        console.log('Tool status:', status);
                    },
                    null,
                    (error) => {
                        console.error('Stream error:', error);
                    }
                );
            } else {
                const response = await chatWithAgent(threadId, message);
                finalResponse = response.response;
            }
            
            if (finalResponse && finalResponse.trim()) {
                await persistChatMessage(threadId, 'assistant', finalResponse);
            }
            
            return finalResponse;
        } catch (err) {
            console.error('Chat error:', err);
            throw err;
        } finally {
            setIsChatLoading(false);
        }
    }, [threadId]);

    // Show loading state while restoring session
    if (isRestoringSession) {
        return (
            <PageContainer>
                <ContentArea style={{ paddingTop: isNavbarVisible ? '64px' : '0' }}>
                    <Header>
                        <TitleWrapper>
                            <TitleIcon>
                                <HiSparkles size={24} />
                            </TitleIcon>
                            <Title>Resume Analyzer</Title>
                        </TitleWrapper>
                        <Subtitle>Loading your sessions...</Subtitle>
                    </Header>
                    <div className="flex justify-center">
                        <LoadingSpinner
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        />
                    </div>
                </ContentArea>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <ContentArea style={{ paddingTop: isNavbarVisible ? '64px' : '0' }}>
                <Header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <TitleWrapper>
                        <TitleIcon
                            whileHover={{ scale: 1.1, rotate: 10 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                        >
                            <HiSparkles size={24} />
                        </TitleIcon>
                        <Title>Resume Analyzer</Title>
                    </TitleWrapper>
                    <Subtitle>
                        Upload your resume and get AI-powered ATS scoring, suggestions, and chat assistance
                    </Subtitle>
                </Header>

                <MainLayout>
                    {/* History Panel */}
                    <HistoryColumn>
                        <SessionHistoryPanel
                            sessions={allSessions}
                            activeSessionId={activeSessionId}
                            onSelectSession={handleLoadSession}
                            onNewSession={handleNewSession}
                            onDeleteSession={handleDeleteSession}
                            isLoading={isLoadingSession}
                        />
                    </HistoryColumn>

                    <MainColumn>
                        {/* Upload Section - Show when no active session */}
                        {!analysisResult && (
                            <UploadSection
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                            >
                                <DropZone
                                    $isDragOver={isDragOver}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                >
                                    <HiddenInput
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".pdf"
                                        onChange={handleFileSelect}
                                    />
                                    <UploadIcon
                                        animate={{ y: isDragOver ? -12 : 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <FiUploadCloud size={36} />
                                    </UploadIcon>
                                    <UploadText>
                                        {isDragOver ? 'Drop your resume here' : 'Drag & drop your resume here'}
                                    </UploadText>
                                    <UploadHint>or click to browse (PDF only)</UploadHint>
                                </DropZone>

                                <AnimatePresence>
                                    {file && (
                                        <FilePreview
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                        >
                                            <FileInfo>
                                                <FileIcon>
                                                    <FiFile size={22} />
                                                </FileIcon>
                                                <FileName>{file.name}</FileName>
                                            </FileInfo>
                                            <RemoveButton onClick={handleRemoveFile}>
                                                <FiX size={18} />
                                            </RemoveButton>
                                        </FilePreview>
                                    )}
                                </AnimatePresence>

                                <AnimatePresence>
                                    {error && (
                                        <ErrorMessage
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                        >
                                            <FiAlertCircle size={22} />
                                            {error}
                                        </ErrorMessage>
                                    )}
                                </AnimatePresence>

                                {file && (
                                    <div className="mt-7 flex justify-center">
                                        <SlideButton
                                            text={isUploading ? 'Analyzing...' : 'Analyze Resume'}
                                            icon={<HiDocumentText size={22} />}
                                            onClick={handleUpload}
                                            disabled={isUploading}
                                            style={{ width: '300px', maxWidth: '100%' }}
                                        />
                                    </div>
                                )}
                            </UploadSection>
                        )}

                        {/* Results Section */}
                        <AnimatePresence>
                            {analysisResult && (
                                <ResultsSection
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                >
                                    <SuccessHeader variants={itemVariants}>
                                        <SuccessMessage>
                                            <FiCheckCircle size={22} />
                                            {filename ? `Analyzing: ${filename}` : 'Resume analyzed successfully!'}
                                        </SuccessMessage>
                                        <NewResumeButton 
                                            onClick={handleNewSession}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <FiRefreshCw size={18} />
                                            New Analysis
                                        </NewResumeButton>
                                    </SuccessHeader>

                                    <ResultsGrid>
                                        <motion.div variants={itemVariants}>
                                            <ATSScoreCard
                                                score={analysisResult.ats_score}
                                                breakdown={analysisResult.ats_breakdown}
                                                suggestionsCount={analysisResult.suggestions?.length}
                                                skillsCount={analysisResult.skills_found?.length}
                                            />
                                        </motion.div>

                                        <motion.div variants={itemVariants}>
                                            <SuggestionsPanel
                                                suggestions={analysisResult.suggestions}
                                                skillsFound={analysisResult.skills_found}
                                                actionVerbsFound={analysisResult.action_verbs_found}
                                            />
                                        </motion.div>

                                        <motion.div variants={itemVariants}>
                                            <ResumeChat
                                                threadId={threadId}
                                                onSendMessage={handleSendMessage}
                                                isLoading={isChatLoading}
                                                initialMessages={chatMessages}
                                            />
                                        </motion.div>
                                    </ResultsGrid>
                                </ResultsSection>
                            )}
                        </AnimatePresence>
                    </MainColumn>
                </MainLayout>
            </ContentArea>

            {/* Loading Overlay */}
            <AnimatePresence>
                {(isUploading || isLoadingSession) && (
                    <LoadingOverlay
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <LoadingSpinner
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        />
                        <LoadingText>
                            {isUploading ? 'Analyzing your resume with AI...' : 'Loading session...'}
                        </LoadingText>
                        <LoadingSubtext>
                            {isUploading ? 'This may take a few seconds' : 'Please wait'}
                        </LoadingSubtext>
                    </LoadingOverlay>
                )}
            </AnimatePresence>
        </PageContainer>
    );
};

export default ResumeAnalyzer;
