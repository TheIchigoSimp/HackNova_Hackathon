import React, { useState, useRef, useEffect } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiUser, FiCpu, FiMaximize2, FiMinimize2, FiX, FiZap } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Animations
const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(102, 126, 234, 0.2); }
  50% { box-shadow: 0 0 30px rgba(102, 126, 234, 0.4); }
`;

// Shared styles for both modes
const baseContainerStyles = css`
  background: linear-gradient(135deg, rgba(25, 25, 40, 0.9) 0%, rgba(15, 15, 25, 0.95) 100%);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 20px;
  backdrop-filter: blur(24px);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  
  /* Glassmorphism top highlight */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
  }
  
  /* Subtle inner glow */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 20px;
    background: radial-gradient(ellipse at top, rgba(102, 126, 234, 0.05) 0%, transparent 50%);
    pointer-events: none;
  }
`;

const Container = styled(motion.div)`
  ${baseContainerStyles}
  height: 520px;
  max-height: 520px;
`;

// Fullscreen overlay
const FullscreenOverlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(10, 10, 15, 0.9);
  backdrop-filter: blur(12px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
`;

const ExpandedContainer = styled(motion.div)`
  ${baseContainerStyles}
  width: 100%;
  max-width: 900px;
  height: 90vh;
  max-height: 90vh;
  animation: ${glow} 3s ease-in-out infinite;
`;

const Header = styled.div`
  padding: 18px 22px;
  border-bottom: 1px solid rgba(102, 126, 234, 0.1);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(102, 126, 234, 0.02);
  position: relative;
  z-index: 1;
`;

const Title = styled.h3`
  font-size: 0.95rem;
  font-weight: 600;
  color: #f8fafc;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const TitleIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%);
  border-radius: 10px;
  color: #667eea;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 8px;
`;

const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  background: rgba(102, 126, 234, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 10px;
  color: #a78bfa;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(102, 126, 234, 0.2);
    border-color: rgba(102, 126, 234, 0.4);
    color: #c4b5fd;
    transform: scale(1.05);
  }
`;

const QuickActions = styled.div`
  display: flex;
  gap: 8px;
  padding: 12px 18px;
  overflow-x: auto;
  flex-shrink: 0;
  border-bottom: 1px solid rgba(102, 126, 234, 0.08);
  
  &::-webkit-scrollbar {
    display: none;
  }
`;

const QuickActionChip = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: rgba(102, 126, 234, 0.08);
  border: 1px solid rgba(102, 126, 234, 0.15);
  border-radius: 20px;
  color: #94a3b8;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(102, 126, 234, 0.15);
    border-color: rgba(102, 126, 234, 0.3);
    color: #a78bfa;
    transform: translateY(-1px);
  }
  
  svg {
    color: #667eea;
  }
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-height: 0;
  position: relative;
  z-index: 1;

  &::-webkit-scrollbar {
    width: 5px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(25, 25, 40, 0.3);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(102, 126, 234, 0.4);
    border-radius: 3px;
    
    &:hover {
      background: rgba(102, 126, 234, 0.6);
    }
  }
`;

const MessageBubble = styled(motion.div)`
  max-width: ${props => props.$expanded ? '70%' : '85%'};
  padding: ${props => props.$expanded ? '16px 20px' : '14px 18px'};
  border-radius: 18px;
  font-size: ${props => props.$expanded ? '0.95rem' : '0.875rem'};
  line-height: 1.65;
  
  ${props => props.$isUser ? `
    align-self: flex-end;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-bottom-right-radius: 6px;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  ` : `
    align-self: flex-start;
    background: rgba(102, 126, 234, 0.08);
    border: 1px solid rgba(102, 126, 234, 0.12);
    color: #e2e8f0;
    border-bottom-left-radius: 6px;
  `}
`;

const MessageHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: ${props => props.$expanded ? '0.8rem' : '0.7rem'};
  opacity: 0.75;
  font-weight: 500;
`;

// Styled markdown content for assistant messages
const MarkdownContent = styled.div`
  p {
    margin: 0 0 0.6em 0;
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  ul, ol {
    margin: 0.5em 0;
    padding-left: 1.5em;
  }
  
  li {
    margin: 0.3em 0;
  }
  
  code {
    background: rgba(0, 0, 0, 0.35);
    padding: 0.2em 0.5em;
    border-radius: 6px;
    font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
    font-size: 0.85em;
    color: #c4b5fd;
  }
  
  pre {
    background: rgba(0, 0, 0, 0.45);
    padding: 14px;
    border-radius: 10px;
    overflow-x: auto;
    margin: 0.6em 0;
    border: 1px solid rgba(102, 126, 234, 0.15);
    
    code {
      background: transparent;
      padding: 0;
      color: #e2e8f0;
    }
  }
  
  strong {
    font-weight: 600;
    color: #f8fafc;
  }
  
  em {
    font-style: italic;
  }
  
  h1, h2, h3, h4, h5, h6 {
    margin: 0.75em 0 0.25em 0;
    font-weight: 600;
    color: #f8fafc;
    &:first-child {
      margin-top: 0;
    }
  }
  
  h1 { font-size: 1.2em; }
  h2 { font-size: 1.1em; }
  h3 { font-size: 1em; }
  
  a {
    color: #a78bfa;
    text-decoration: underline;
    &:hover {
      color: #c4b5fd;
    }
  }
  
  blockquote {
    border-left: 3px solid rgba(102, 126, 234, 0.5);
    padding-left: 14px;
    margin: 0.5em 0;
    opacity: 0.9;
  }
  
  table {
    border-collapse: collapse;
    margin: 0.5em 0;
    font-size: 0.9em;
    width: 100%;
  }
  
  th, td {
    border: 1px solid rgba(102, 126, 234, 0.25);
    padding: 10px 14px;
    text-align: left;
  }
  
  th {
    background: rgba(102, 126, 234, 0.12);
    font-weight: 600;
  }
`;

const InputContainer = styled.div`
  padding: 16px 18px;
  border-top: 1px solid rgba(102, 126, 234, 0.1);
  flex-shrink: 0;
  background: rgba(102, 126, 234, 0.02);
  position: relative;
  z-index: 1;
`;

const InputWrapper = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const Input = styled.input`
  flex: 1;
  padding: 14px 18px;
  background: rgba(25, 25, 40, 0.7);
  border: 1px solid rgba(102, 126, 234, 0.15);
  border-radius: 14px;
  color: #f8fafc;
  font-size: 0.875rem;
  transition: all 0.3s ease;

  &::placeholder {
    color: #64748b;
  }

  &:focus {
    outline: none;
    border-color: rgba(102, 126, 234, 0.5);
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
    background: rgba(25, 25, 40, 0.9);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SendButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 14px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;

  &:hover:not(:disabled) {
    transform: scale(1.05);
    box-shadow: 0 0 25px rgba(102, 126, 234, 0.5);
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const TypingIndicator = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 14px 18px;
  background: rgba(102, 126, 234, 0.08);
  border: 1px solid rgba(102, 126, 234, 0.12);
  border-radius: 18px;
  border-bottom-left-radius: 6px;
  align-self: flex-start;
`;

const TypingDot = styled(motion.span)`
  width: 7px;
  height: 7px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 50%;
`;

const EmptyState = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 32px;
  color: #64748b;
`;

const EmptyIcon = styled(motion.div)`
  width: 72px;
  height: 72px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 18px;
  color: #667eea;
  animation: ${float} 3s ease-in-out infinite;
`;

const PlaceholderContainer = styled.div`
  ${baseContainerStyles}
  height: 520px;
  max-height: 520px;
  opacity: 0.3;
  pointer-events: none;
`;

const QUICK_ACTIONS = [
    { label: 'Key strengths', prompt: 'What are my key strengths based on this resume?' },
    { label: 'Improve experience', prompt: 'How can I improve my experience section?' },
    { label: 'ATS tips', prompt: 'What ATS optimization tips do you have for my resume?' },
    { label: 'Missing skills', prompt: 'What important skills might be missing from my resume?' },
];

/**
 * ResumeChat Component
 * 
 * Chat interface for the resume agent with markdown rendering, 
 * expand/minimize functionality, quick actions, and persistence support.
 */
const ResumeChat = ({ threadId, onSendMessage, isLoading, initialMessages = [], onMessagesChange }) => {
    const [messages, setMessages] = useState(initialMessages);
    const [inputValue, setInputValue] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const expandedMessagesContainerRef = useRef(null);

    // Sync messages with initialMessages when they change (e.g., session switch)
    useEffect(() => {
        setMessages(initialMessages);
    }, [initialMessages]);

    const scrollToBottom = () => {
        const container = isExpanded ? expandedMessagesContainerRef.current : messagesContainerRef.current;
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading, isExpanded]);

    // Notify parent of messages change for persistence
    useEffect(() => {
        if (onMessagesChange && messages.length > 0) {
            onMessagesChange(messages);
        }
    }, [messages, onMessagesChange]);

    // Handle escape key to close expanded view
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isExpanded) {
                setIsExpanded(false);
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isExpanded]);

    const handleSubmit = async (e, customMessage = null) => {
        if (e) e.preventDefault();
        const messageToSend = customMessage || inputValue.trim();
        if (!messageToSend || isLoading || !threadId) return;

        setInputValue('');

        // Add user message
        const newUserMsg = { role: 'user', content: messageToSend };
        setMessages(prev => [...prev, newUserMsg]);

        // Add placeholder for streaming assistant response
        setMessages(prev => [...prev, { role: 'assistant', content: '', isStreaming: true }]);

        try {
            // Use streaming callback to update message in real-time
            const response = await onSendMessage(messageToSend, (token, fullText) => {
                setMessages(prev => {
                    const updated = [...prev];
                    if (updated.length > 0) {
                        updated[updated.length - 1] = {
                            role: 'assistant',
                            content: fullText,
                            isStreaming: true
                        };
                    }
                    return updated;
                });
                scrollToBottom();
            });

            // Mark streaming complete
            setMessages(prev => {
                const updated = [...prev];
                if (updated.length > 0) {
                    updated[updated.length - 1] = {
                        role: 'assistant',
                        content: response || updated[updated.length - 1].content,
                        isStreaming: false
                    };
                }
                return updated;
            });
        } catch (error) {
            setMessages(prev => {
                const updated = [...prev];
                if (updated.length > 0 && updated[updated.length - 1].isStreaming) {
                    updated[updated.length - 1] = {
                        role: 'assistant',
                        content: 'Sorry, I encountered an error. Please try again.',
                        isStreaming: false
                    };
                }
                return updated;
            });
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const handleQuickAction = (prompt) => {
        handleSubmit(null, prompt);
    };

    const renderMessageContent = (message) => {
        if (message.role === 'assistant') {
            return (
                <MarkdownContent>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.content}
                    </ReactMarkdown>
                </MarkdownContent>
            );
        }
        return message.content;
    };

    const renderQuickActions = () => (
        <QuickActions>
            {QUICK_ACTIONS.map((action, index) => (
                <QuickActionChip
                    key={action.label}
                    onClick={() => handleQuickAction(action.prompt)}
                    disabled={isLoading || !threadId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <FiZap size={12} />
                    {action.label}
                </QuickActionChip>
            ))}
        </QuickActions>
    );

    const renderMessages = (expanded, containerRef) => (
        <MessagesContainer ref={containerRef}>
            {messages.length === 0 ? (
                <EmptyState>
                    <EmptyIcon>
                        <FiCpu size={32} />
                    </EmptyIcon>
                    <p className="text-sm font-medium text-slate-300">
                        Ask me anything about your resume!
                    </p>
                    <p className="text-xs mt-2 text-slate-500 max-w-xs">
                        I can help you improve your resume, explain ATS scores, and suggest optimizations.
                    </p>
                </EmptyState>
            ) : (
                <>
                    {messages.map((message, index) => (
                        <MessageBubble
                            key={index}
                            $isUser={message.role === 'user'}
                            $expanded={expanded}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.2 }}
                        >
                            <MessageHeader $expanded={expanded}>
                                {message.role === 'user' ? <FiUser size={13} /> : <FiCpu size={13} />}
                                {message.role === 'user' ? 'You' : 'Resume Agent'}
                            </MessageHeader>
                            {renderMessageContent(message)}
                        </MessageBubble>
                    ))}

                    {isLoading && (
                        <TypingIndicator
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <TypingDot
                                animate={{ y: [0, -6, 0] }}
                                transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                            />
                            <TypingDot
                                animate={{ y: [0, -6, 0] }}
                                transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
                            />
                            <TypingDot
                                animate={{ y: [0, -6, 0] }}
                                transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
                            />
                        </TypingIndicator>
                    )}
                </>
            )}
            <div ref={messagesEndRef} />
        </MessagesContainer>
    );

    const renderInput = () => (
        <InputContainer>
            <InputWrapper>
                <Input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={threadId ? "Ask about your resume..." : "Upload a resume first"}
                    disabled={!threadId || isLoading}
                />
                <SendButton
                    onClick={handleSubmit}
                    disabled={!threadId || !inputValue.trim() || isLoading}
                >
                    <FiSend size={20} />
                </SendButton>
            </InputWrapper>
        </InputContainer>
    );

    return (
        <>
            {/* Normal view - only show when NOT expanded */}
            {!isExpanded && (
                <Container
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <Header>
                        <Title>
                            <TitleIcon>
                                <FiCpu size={18} />
                            </TitleIcon>
                            Chat with Resume Agent
                        </Title>
                        <HeaderActions>
                            <IconButton onClick={() => setIsExpanded(true)} title="Expand for better readability">
                                <FiMaximize2 size={16} />
                            </IconButton>
                        </HeaderActions>
                    </Header>
                    {messages.length === 0 && renderQuickActions()}
                    {renderMessages(false, messagesContainerRef)}
                    {renderInput()}
                </Container>
            )}

            {/* Placeholder when expanded to maintain grid layout */}
            {isExpanded && (
                <PlaceholderContainer>
                    <Header>
                        <Title>
                            <TitleIcon>
                                <FiCpu size={18} />
                            </TitleIcon>
                            Chat with Resume Agent
                        </Title>
                    </Header>
                    <EmptyState>
                        <p className="text-sm">Chat expanded - press Escape or click outside to return</p>
                    </EmptyState>
                </PlaceholderContainer>
            )}

            {/* Expanded fullscreen view */}
            <AnimatePresence>
                {isExpanded && (
                    <FullscreenOverlay
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={(e) => {
                            if (e.target === e.currentTarget) setIsExpanded(false);
                        }}
                    >
                        <ExpandedContainer
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Header>
                                <Title>
                                    <TitleIcon>
                                        <FiCpu size={18} />
                                    </TitleIcon>
                                    Chat with Resume Agent
                                </Title>
                                <HeaderActions>
                                    <IconButton onClick={() => setIsExpanded(false)} title="Minimize">
                                        <FiMinimize2 size={16} />
                                    </IconButton>
                                    <IconButton onClick={() => setIsExpanded(false)} title="Close">
                                        <FiX size={16} />
                                    </IconButton>
                                </HeaderActions>
                            </Header>
                            {messages.length === 0 && renderQuickActions()}
                            {renderMessages(true, expandedMessagesContainerRef)}
                            {renderInput()}
                        </ExpandedContainer>
                    </FullscreenOverlay>
                )}
            </AnimatePresence>
        </>
    );
};

export default ResumeChat;
