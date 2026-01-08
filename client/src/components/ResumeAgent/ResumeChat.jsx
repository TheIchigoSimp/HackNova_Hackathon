import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiUser, FiCpu } from 'react-icons/fi';

const Container = styled(motion.div)`
  background: linear-gradient(135deg, rgba(25, 25, 40, 0.9) 0%, rgba(15, 15, 25, 0.95) 100%);
  border: 1px solid rgba(102, 126, 234, 0.15);
  border-radius: 16px;
  backdrop-filter: blur(20px);
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 400px;
`;

const Header = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid rgba(102, 126, 234, 0.1);
`;

const Title = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #f8fafc;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(102, 126, 234, 0.3);
    border-radius: 2px;
  }
`;

const MessageBubble = styled(motion.div)`
  max-width: 85%;
  padding: 12px 16px;
  border-radius: 16px;
  font-size: 0.875rem;
  line-height: 1.5;
  
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
  margin-bottom: 4px;
  font-size: 0.75rem;
  opacity: 0.8;
`;

const InputContainer = styled.div`
  padding: 16px;
  border-top: 1px solid rgba(102, 126, 234, 0.1);
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

const ResumeChat = ({ threadId, onSendMessage, isLoading }) => {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading || !threadId) return;

        const userMessage = inputValue.trim();
        setInputValue('');

        // Add user message
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

        // Call the onSendMessage prop and get response
        try {
            const response = await onSendMessage(userMessage);
            setMessages(prev => [...prev, { role: 'assistant', content: response }]);
        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.'
            }]);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            handleSubmit(e);
        }
    };

    return (
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
            </Header>

            <MessagesContainer>
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
                        <AnimatePresence>
                            {messages.map((message, index) => (
                                <MessageBubble
                                    key={index}
                                    $isUser={message.role === 'user'}
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <MessageHeader>
                                        {message.role === 'user' ? <FiUser size={12} /> : <FiCpu size={12} />}
                                        {message.role === 'user' ? 'You' : 'Resume Agent'}
                                    </MessageHeader>
                                    {message.content}
                                </MessageBubble>
                            ))}
                        </AnimatePresence>

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

            <InputContainer>
                <InputWrapper>
                    <Input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
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
        </Container>
    );
};

export default ResumeChat;
