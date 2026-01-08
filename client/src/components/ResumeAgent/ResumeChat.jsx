import React, { useState, useRef, useEffect } from 'react';
import styled, { css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiUser, FiCpu, FiMaximize2, FiMinimize2, FiX } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Shared styles for both modes
const baseContainerStyles = css`
  background: linear-gradient(135deg, rgba(25, 25, 40, 0.95) 0%, rgba(15, 15, 25, 0.98) 100%);
  border: 1px solid rgba(102, 126, 234, 0.15);
  border-radius: 16px;
  backdrop-filter: blur(20px);
  display: flex;
  flex-direction: column;
`;

const Container = styled(motion.div)`
  ${baseContainerStyles}
  height: 500px;
  max-height: 500px;
`;

// Fullscreen overlay
const FullscreenOverlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(10, 10, 15, 0.9);
  backdrop-filter: blur(8px);
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
`;

const Header = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid rgba(102, 126, 234, 0.1);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #f8fafc;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 8px;
`;

const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: rgba(102, 126, 234, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 8px;
  color: #a78bfa;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(102, 126, 234, 0.2);
    border-color: rgba(102, 126, 234, 0.4);
    color: #c4b5fd;
  }
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;

  &::-webkit-scrollbar {
    width: 6px;
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
  padding: ${props => props.$expanded ? '16px 20px' : '12px 16px'};
  border-radius: 16px;
  font-size: ${props => props.$expanded ? '1rem' : '0.875rem'};
  line-height: 1.6;
  
  ${props => props.$isUser ? `
    align-self: flex-end;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-bottom-right-radius: 4px;
  ` : `
    align-self: flex-start;
    background: rgba(102, 126, 234, 0.1);
    border: 1px solid rgba(102, 126, 234, 0.15);
    color: #e2e8f0;
    border-bottom-left-radius: 4px;
  `}
`;

const MessageHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
  font-size: ${props => props.$expanded ? '0.85rem' : '0.75rem'};
  opacity: 0.8;
`;

// Styled markdown content for assistant messages
const MarkdownContent = styled.div`
  p {
    margin: 0 0 0.5em 0;
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  ul, ol {
    margin: 0.5em 0;
    padding-left: 1.5em;
  }
  
  li {
    margin: 0.25em 0;
  }
  
  code {
    background: rgba(0, 0, 0, 0.3);
    padding: 0.15em 0.4em;
    border-radius: 4px;
    font-family: 'Fira Code', 'Consolas', monospace;
    font-size: 0.85em;
  }
  
  pre {
    background: rgba(0, 0, 0, 0.4);
    padding: 12px;
    border-radius: 8px;
    overflow-x: auto;
    margin: 0.5em 0;
    
    code {
      background: transparent;
      padding: 0;
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
  
  h1 { font-size: 1.25em; }
  h2 { font-size: 1.15em; }
  h3 { font-size: 1.05em; }
  
  a {
    color: #a78bfa;
    text-decoration: underline;
    &:hover {
      color: #c4b5fd;
    }
  }
  
  blockquote {
    border-left: 3px solid rgba(102, 126, 234, 0.5);
    padding-left: 12px;
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
    border: 1px solid rgba(102, 126, 234, 0.3);
    padding: 8px 12px;
    text-align: left;
  }
  
  th {
    background: rgba(102, 126, 234, 0.15);
    font-weight: 600;
  }
`;

const InputContainer = styled.div`
  padding: 16px;
  border-top: 1px solid rgba(102, 126, 234, 0.1);
  flex-shrink: 0;
`;

const InputWrapper = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const Input = styled.input`
  flex: 1;
  padding: 12px 16px;
  background: rgba(25, 25, 40, 0.6);
  border: 1px solid rgba(102, 126, 234, 0.15);
  border-radius: 12px;
  color: #f8fafc;
  font-size: 0.875rem;
  transition: all 0.3s ease;

  &::placeholder {
    color: #64748b;
  }

  &:focus {
    outline: none;
    border-color: rgba(102, 126, 234, 0.4);
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
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
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 12px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;

  &:hover:not(:disabled) {
    transform: scale(1.05);
    box-shadow: 0 0 20px rgba(102, 126, 234, 0.4);
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
  gap: 4px;
  padding: 12px 16px;
  background: rgba(102, 126, 234, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.15);
  border-radius: 16px;
  border-bottom-left-radius: 4px;
  align-self: flex-start;
`;

const TypingDot = styled(motion.span)`
  width: 6px;
  height: 6px;
  background: #667eea;
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

const EmptyIcon = styled.div`
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  color: #667eea;
`;

const PlaceholderContainer = styled.div`
  ${baseContainerStyles}
  height: 500px;
  max-height: 500px;
  opacity: 0.3;
  pointer-events: none;
`;

/**
 * ResumeChat Component
 * 
 * Chat interface for the resume agent with markdown rendering, 
 * expand/minimize functionality, and persistence support.
 */
const ResumeChat = ({ threadId, onSendMessage, isLoading, initialMessages = [], onMessagesChange }) => {
    const [messages, setMessages] = useState(initialMessages);
    const [inputValue, setInputValue] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const expandedMessagesContainerRef = useRef(null);

    // Restore initial messages when they change
    useEffect(() => {
        if (initialMessages.length > 0 && messages.length === 0) {
            setMessages(initialMessages);
        }
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading || !threadId) return;

        const userMessage = inputValue.trim();
        setInputValue('');

        // Add user message
        const newUserMsg = { role: 'user', content: userMessage };
        setMessages(prev => [...prev, newUserMsg]);

        // Add placeholder for streaming assistant response
        const streamingMsgIndex = messages.length + 1; // Account for the user message we just added
        setMessages(prev => [...prev, { role: 'assistant', content: '', isStreaming: true }]);

        try {
            // Use streaming callback to update message in real-time
            const response = await onSendMessage(userMessage, (token, fullText) => {
                setMessages(prev => {
                    const updated = [...prev];
                    // Update the last message (the streaming one)
                    if (updated.length > 0) {
                        updated[updated.length - 1] = {
                            role: 'assistant',
                            content: fullText,
                            isStreaming: true
                        };
                    }
                    return updated;
                });
                // Scroll to bottom on each token
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
            // Update the streaming message to show error
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

    const renderMessages = (expanded, containerRef) => (
        <MessagesContainer ref={containerRef}>
            {messages.length === 0 ? (
                <EmptyState>
                    <EmptyIcon>
                        <FiCpu size={28} />
                    </EmptyIcon>
                    <p className="text-sm">
                        Ask me anything about your resume!
                    </p>
                    <p className="text-xs mt-2 text-[#94a3b8]">
                        Try: "What are my key strengths?" or "How can I improve my experience section?"
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
                                {message.role === 'user' ? <FiUser size={12} /> : <FiCpu size={12} />}
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
                    <FiSend size={18} />
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
                            <FiCpu className="text-[#667eea]" />
                            Chat with Resume Agent
                        </Title>
                        <HeaderActions>
                            <IconButton onClick={() => setIsExpanded(true)} title="Expand for better readability">
                                <FiMaximize2 size={16} />
                            </IconButton>
                        </HeaderActions>
                    </Header>
                    {renderMessages(false, messagesContainerRef)}
                    {renderInput()}
                </Container>
            )}

            {/* Placeholder when expanded to maintain grid layout */}
            {isExpanded && (
                <PlaceholderContainer>
                    <Header>
                        <Title>
                            <FiCpu className="text-[#667eea]" />
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
                                    <FiCpu className="text-[#667eea]" />
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
