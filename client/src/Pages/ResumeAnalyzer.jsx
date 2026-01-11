import React, { useState, useCallback, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUploadCloud, FiFile, FiX, FiCheckCircle, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';
import { HiDocumentText } from 'react-icons/hi';

import ATSScoreCard from '../components/ResumeAgent/ATSScoreCard';
import SuggestionsPanel from '../components/ResumeAgent/SuggestionsPanel';
import ResumeChat from '../components/ResumeAgent/ResumeChat';
import SlideButton from '../components/Buttons/SlideButton';

import { uploadResume, streamChatWithAgent, chatWithAgent } from '../api/resumeAgentApi';
import { 
    getResumeSession, 
    saveResumeSession, 
    addChatMessage as persistChatMessage, 
    clearResumeSession 
} from '../api/resumeSessionApi';
import { useNavbarVisibility } from '../hooks/useNavbarVisibility';
import { useSession } from '../lib/auth-client';

const PageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const ContentArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0 16px;
  transition: padding-top 0.5s ease;
  
  @media (min-width: 640px) {
    padding: 0 24px;
  }
  
  @media (min-width: 1024px) {
    padding: 0 32px;
  }
`;

const Header = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  text-align: center;
  padding-top: 48px;
  padding-bottom: 32px;
`;

const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: #f8fafc;
  margin-bottom: 8px;
  
  @media (min-width: 768px) {
    font-size: 2.25rem;
  }
`;

const Subtitle = styled.p`
  color: #94a3b8;
  font-size: 0.875rem;
  
  @media (min-width: 768px) {
    font-size: 1rem;
  }
`;

const UploadSection = styled.div`
  max-width: 600px;
  margin: 0 auto 48px;
`;

const DropZone = styled.div`
  position: relative;
  padding: 48px 32px;
  background: ${props => props.$isDragOver
        ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)'
        : 'linear-gradient(135deg, rgba(25, 25, 40, 0.9) 0%, rgba(15, 15, 25, 0.95) 100%)'
    };
  border: 2px dashed ${props => props.$isDragOver
        ? 'rgba(102, 126, 234, 0.5)'
        : 'rgba(102, 126, 234, 0.2)'
    };
  border-radius: 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(20px);

  &:hover {
    border-color: rgba(102, 126, 234, 0.4);
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  }
`;

const UploadIcon = styled(motion.div)`
  width: 72px;
  height: 72px;
  margin: 0 auto 16px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #667eea;
`;

const UploadText = styled.p`
  color: #e2e8f0;
  font-size: 1rem;
  margin-bottom: 8px;
`;

const UploadHint = styled.p`
  color: #64748b;
  font-size: 0.875rem;
`;

const HiddenInput = styled.input`
  display: none;
`;

const FilePreview = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: rgba(102, 126, 234, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 12px;
  margin-top: 16px;
`;

const FileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const FileIcon = styled.div`
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const FileName = styled.span`
  color: #e2e8f0;
  font-size: 0.875rem;
  font-weight: 500;
`;

const RemoveButton = styled.button`
  padding: 8px;
  background: rgba(239, 68, 68, 0.1);
  border: none;
  border-radius: 8px;
  color: #ef4444;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(239, 68, 68, 0.2);
  }
`;

const ResultsSection = styled(motion.div)`
  max-width: 1400px;
  margin: 0 auto 48px;
`;

const ResultsGrid = styled.div`
  display: grid;
  gap: 24px;
  
  @media (min-width: 1024px) {
    grid-template-columns: 300px 1fr 380px;
  }
`;

const ErrorMessage = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 12px;
  color: #f87171;
  font-size: 0.875rem;
  margin-top: 16px;
`;

const LoadingOverlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(10, 10, 15, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 100;
`;

const LoadingSpinner = styled(motion.div)`
  width: 64px;
  height: 64px;
  border: 3px solid rgba(102, 126, 234, 0.2);
  border-top-color: #667eea;
  border-radius: 50%;
`;

const LoadingText = styled.p`
  color: #e2e8f0;
  margin-top: 24px;
  font-size: 1rem;
`;

const SuccessHeader = styled(motion.div)`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
`;

const SuccessMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 12px;
  color: #34d399;
  font-size: 0.875rem;
`;

const NewResumeButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: rgba(102, 126, 234, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 12px;
  color: #a78bfa;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(102, 126, 234, 0.2);
    border-color: rgba(102, 126, 234, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ResumeAnalyzer = () => {
    const [file, setFile] = useState(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [isRestoringSession, setIsRestoringSession] = useState(true);
    const [error, setError] = useState(null);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [threadId, setThreadId] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);
    const [filename, setFilename] = useState('');
    const fileInputRef = useRef(null);
    const isNavbarVisible = useNavbarVisibility(600, 43);
    const { data: session } = useSession();

    // Restore session from MongoDB on mount
    useEffect(() => {
        const restoreSession = async () => {
            try {
                const session = await getResumeSession();
                console.log('Restored session from MongoDB:', session);
                if (session) {
                    console.log('Session analysisResult:', session.analysisResult);
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
                }
            } catch (err) {
                console.error('Failed to restore session:', err);
                // Silently fail - user can just upload a new resume
            } finally {
                setIsRestoringSession(false);
            }
        };

        restoreSession();
    }, []);

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
            console.log('Uploading with userId:', userId, 'session:', session);
            const result = await uploadResume(file, userId);
            console.log('Upload result:', result);
            setAnalysisResult(result);
            setThreadId(result.thread_id);
            setFilename(file.name);
            setChatMessages([]); // Reset chat for new resume

            // Save session to MongoDB
            await saveResumeSession({
                threadId: result.thread_id,
                filename: file.name,
                analysisResult: {
                    ats_score: result.ats_score,
                    ats_breakdown: result.ats_breakdown,
                    skills_found: result.skills_found,
                    action_verbs_found: result.action_verbs_found,
                    suggestions: result.suggestions,
                },
            });
        } catch (err) {
            console.error('Upload error:', err);
            // Handle FastAPI validation errors which return an array of error objects
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
            await persistChatMessage('user', message);
            
            let finalResponse = '';
            
            // If streaming callback provided, use streaming API
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
                // Fallback to non-streaming
                const response = await chatWithAgent(threadId, message);
                finalResponse = response.response;
            }
            
            // Persist assistant response to MongoDB (only if non-empty)
            if (finalResponse && finalResponse.trim()) {
                await persistChatMessage('assistant', finalResponse);
            } else {
                console.warn('Skipping persist: empty assistant response');
            }
            
            return finalResponse;
        } catch (err) {
            console.error('Chat error:', err);
            throw err;
        } finally {
            setIsChatLoading(false);
        }
    }, [threadId]);

    const handleUploadDifferentResume = useCallback(async () => {
        try {
            await clearResumeSession();
        } catch (err) {
            console.error('Failed to clear session:', err);
        }
        
        // Reset all state
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

    // Show loading state while restoring session
    if (isRestoringSession) {
        return (
            <PageContainer>
                <ContentArea style={{ paddingTop: isNavbarVisible ? '64px' : '0' }}>
                    <Header>
                        <Title>Resume Analyzer</Title>
                        <Subtitle>Loading your session...</Subtitle>
                    </Header>
                    <div className="flex justify-center">
                        <div className="w-8 h-8 border-2 border-[#667eea] border-t-transparent rounded-full animate-spin" />
                    </div>
                </ContentArea>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <ContentArea style={{ paddingTop: isNavbarVisible ? '64px' : '0' }}>
                <Header>
                    <Title>Resume Analyzer</Title>
                    <Subtitle>
                        Upload your resume and get AI-powered ATS scoring, suggestions, and chat assistance
                    </Subtitle>
                </Header>

                {/* Upload Section */}
                {!analysisResult && (
                    <UploadSection>
                        <DropZone
                            $isDragOver={isDragOver}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <HiddenInput
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf"
                                onChange={handleFileSelect}
                            />
                            <UploadIcon
                                animate={{ y: isDragOver ? -10 : 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <FiUploadCloud size={32} />
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
                                            <FiFile size={20} />
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
                                    <FiAlertCircle size={20} />
                                    {error}
                                </ErrorMessage>
                            )}
                        </AnimatePresence>

                        {file && (
                            <div className="mt-6 flex justify-center">
                                <SlideButton
                                    text={isUploading ? 'Analyzing...' : 'Analyze Resume'}
                                    icon={<HiDocumentText size={22} />}
                                    onClick={handleUpload}
                                    disabled={isUploading}
                                    style={{ width: '280px', maxWidth: '100%' }}
                                />
                            </div>
                        )}
                    </UploadSection>
                )}

                {/* Results Section */}
                <AnimatePresence>
                    {analysisResult && (
                        <ResultsSection
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <SuccessHeader>
                                <SuccessMessage>
                                    <FiCheckCircle size={20} />
                                    {filename ? `Analyzing: ${filename}` : 'Resume analyzed successfully!'}
                                </SuccessMessage>
                                <NewResumeButton onClick={handleUploadDifferentResume}>
                                    <FiRefreshCw size={16} />
                                    Upload Different Resume
                                </NewResumeButton>
                            </SuccessHeader>

                            <ResultsGrid>
                                {/* ATS Score Card */}
                                <ATSScoreCard
                                    score={analysisResult.ats_score}
                                    breakdown={analysisResult.ats_breakdown}
                                />

                                {/* Suggestions Panel */}
                                <SuggestionsPanel
                                    suggestions={analysisResult.suggestions}
                                    skillsFound={analysisResult.skills_found}
                                    actionVerbsFound={analysisResult.action_verbs_found}
                                />

                                {/* Chat Interface */}
                                <ResumeChat
                                    threadId={threadId}
                                    onSendMessage={handleSendMessage}
                                    isLoading={isChatLoading}
                                    initialMessages={chatMessages}
                                />
                            </ResultsGrid>
                        </ResultsSection>
                    )}
                </AnimatePresence>
            </ContentArea>

            {/* Loading Overlay */}
            <AnimatePresence>
                {isUploading && (
                    <LoadingOverlay
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <LoadingSpinner
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        />
                        <LoadingText>Analyzing your resume with AI...</LoadingText>
                    </LoadingOverlay>
                )}
            </AnimatePresence>
        </PageContainer>
    );
};

export default ResumeAnalyzer;
