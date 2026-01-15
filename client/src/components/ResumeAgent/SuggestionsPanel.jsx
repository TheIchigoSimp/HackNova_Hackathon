import React, { useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiChevronDown, FiCheck, FiAward, FiTarget, FiAlertCircle,
    FiEdit3, FiFileText, FiZap, FiTrendingUp
} from 'react-icons/fi';

// Animations
const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const Container = styled(motion.div)`
  position: relative;
  background: linear-gradient(135deg, rgba(25, 25, 40, 0.95) 0%, rgba(15, 15, 25, 0.98) 100%);
  border: 1px solid rgba(102, 126, 234, 0.15);
  border-radius: 20px;
  padding: 24px;
  backdrop-filter: blur(20px);
  overflow: hidden;
  
  /* Subtle top glow */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 60%;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.4), transparent);
  }
`;

const SectionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #f8fafc;
  margin-bottom: 16px;
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

const ProgressHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding: 12px 16px;
  background: rgba(102, 126, 234, 0.05);
  border: 1px solid rgba(102, 126, 234, 0.1);
  border-radius: 12px;
`;

const ProgressText = styled.span`
  font-size: 0.8rem;
  color: #94a3b8;
`;

const ProgressBar = styled.div`
  flex: 1;
  height: 6px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 3px;
  margin-left: 16px;
  overflow: hidden;
`;

const ProgressFill = styled(motion.div)`
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 3px;
`;

const SuggestionsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 300px;
  overflow-y: auto;
  padding-right: 4px;
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-track {
    background: rgba(102, 126, 234, 0.05);
    border-radius: 2px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(102, 126, 234, 0.3);
    border-radius: 2px;
  }
`;

const getPriorityStyles = (priority) => {
    switch (priority) {
        case 'high':
            return { color: '#f87171', bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.3)', label: 'High' };
        case 'medium':
            return { color: '#fbbf24', bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.3)', label: 'Medium' };
        default:
            return { color: '#34d399', bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.3)', label: 'Low' };
    }
};

const getCategoryIcon = (suggestion) => {
    const text = suggestion.toLowerCase();
    if (text.includes('keyword') || text.includes('ats')) return FiZap;
    if (text.includes('format') || text.includes('section') || text.includes('heading')) return FiFileText;
    if (text.includes('quantif') || text.includes('metric') || text.includes('result')) return FiTrendingUp;
    if (text.includes('action') || text.includes('verb')) return FiEdit3;
    return FiTarget;
};

const getPriority = (suggestion, index) => {
    const text = suggestion.toLowerCase();
    if (text.includes('missing') || text.includes('add') || text.includes('keyword') || index < 2) return 'high';
    if (text.includes('consider') || text.includes('improve') || index < 5) return 'medium';
    return 'low';
};

const SuggestionItem = styled(motion.li)`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  background: rgba(102, 126, 234, 0.03);
  border: 1px solid rgba(102, 126, 234, 0.08);
  border-left: 3px solid ${props => props.$priorityColor};
  border-radius: 12px;
  color: #e2e8f0;
  font-size: 0.85rem;
  line-height: 1.6;
  transition: all 0.2s ease;
  position: relative;
  
  &:hover {
    background: rgba(102, 126, 234, 0.08);
    border-color: rgba(102, 126, 234, 0.15);
    transform: translateX(4px);
  }
`;

const SuggestionIconWrapper = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  min-width: 28px;
  background: ${props => props.$bg};
  border-radius: 8px;
  color: ${props => props.$color};
`;

const SuggestionContent = styled.div`
  flex: 1;
`;

const PriorityBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  background: ${props => props.$bg};
  border: 1px solid ${props => props.$border};
  border-radius: 10px;
  font-size: 0.65rem;
  font-weight: 600;
  color: ${props => props.$color};
  margin-left: 8px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
`;

const Divider = styled.div`
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.2), transparent);
  margin: 24px 0;
`;

const AccordionHeader = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  background: rgba(102, 126, 234, 0.05);
  border: 1px solid rgba(102, 126, 234, 0.1);
  border-radius: 14px;
  color: #f8fafc;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(102, 126, 234, 0.1);
    border-color: rgba(102, 126, 234, 0.2);
  }
`;

const AccordionIcon = styled(motion.span)`
  display: flex;
  align-items: center;
  color: #667eea;
`;

const TagsContainer = styled(motion.div)`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 16px;
  padding-top: 14px;
`;

const Tag = styled(motion.span)`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 7px 14px;
  background: ${props => props.$variant === 'skill'
    ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.12) 100%)'
    : 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(52, 211, 153, 0.12) 100%)'
  };
  border: 1px solid ${props => props.$variant === 'skill'
    ? 'rgba(102, 126, 234, 0.25)'
    : 'rgba(16, 185, 129, 0.25)'
  };
  border-radius: 20px;
  font-size: 0.75rem;
  color: ${props => props.$variant === 'skill' ? '#a78bfa' : '#34d399'};
  font-weight: 500;
  cursor: default;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${props => props.$variant === 'skill' 
      ? 'rgba(102, 126, 234, 0.2)' 
      : 'rgba(16, 185, 129, 0.2)'
    };
  }
`;

const TagCount = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 0 8px;
  background: rgba(102, 126, 234, 0.2);
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #a78bfa;
  margin-left: 8px;
`;

const SuggestionsPanel = ({ suggestions = [], skillsFound = [], actionVerbsFound = [] }) => {
    const [skillsExpanded, setSkillsExpanded] = useState(true);
    const [verbsExpanded, setVerbsExpanded] = useState(false);

    return (
        <Container
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
        >
            {/* Header with Progress */}
            <SectionTitle>
                <TitleIcon>
                    <FiTarget size={18} />
                </TitleIcon>
                Improvement Suggestions
            </SectionTitle>

            {suggestions.length > 0 && (
                <ProgressHeader>
                    <ProgressText>
                        {suggestions.length} suggestions to improve
                    </ProgressText>
                    <ProgressBar>
                        <ProgressFill
                            initial={{ width: 0 }}
                            animate={{ width: '0%' }}
                            transition={{ duration: 0.8 }}
                        />
                    </ProgressBar>
                </ProgressHeader>
            )}

            {/* Suggestions List */}
            <SuggestionsList>
                {suggestions.map((suggestion, index) => {
                    const priority = getPriority(suggestion, index);
                    const priorityStyles = getPriorityStyles(priority);
                    const CategoryIcon = getCategoryIcon(suggestion);
                    
                    return (
                        <SuggestionItem
                            key={index}
                            $priorityColor={priorityStyles.color}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                            <SuggestionIconWrapper $bg={priorityStyles.bg} $color={priorityStyles.color}>
                                <CategoryIcon size={14} />
                            </SuggestionIconWrapper>
                            <SuggestionContent>
                                {suggestion}
                                <PriorityBadge 
                                    $bg={priorityStyles.bg} 
                                    $border={priorityStyles.border} 
                                    $color={priorityStyles.color}
                                >
                                    {priorityStyles.label}
                                </PriorityBadge>
                            </SuggestionContent>
                        </SuggestionItem>
                    );
                })}
            </SuggestionsList>

            <Divider />

            {/* Skills Found */}
            <div className="mb-4">
                <AccordionHeader onClick={() => setSkillsExpanded(!skillsExpanded)}>
                    <span className="flex items-center gap-3">
                        <FiAward className="text-[#667eea]" size={18} />
                        Skills Found
                        <TagCount>{skillsFound.length}</TagCount>
                    </span>
                    <AccordionIcon
                        animate={{ rotate: skillsExpanded ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <FiChevronDown />
                    </AccordionIcon>
                </AccordionHeader>
                <AnimatePresence>
                    {skillsExpanded && (
                        <TagsContainer
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            {skillsFound.map((skill, index) => (
                                <Tag
                                    key={skill}
                                    $variant="skill"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.2, delay: index * 0.03 }}
                                >
                                    {skill}
                                </Tag>
                            ))}
                        </TagsContainer>
                    )}
                </AnimatePresence>
            </div>

            {/* Action Verbs Found */}
            <div>
                <AccordionHeader onClick={() => setVerbsExpanded(!verbsExpanded)}>
                    <span className="flex items-center gap-3">
                        <FiCheck className="text-[#10b981]" size={18} />
                        Action Verbs
                        <TagCount>{actionVerbsFound.length}</TagCount>
                    </span>
                    <AccordionIcon
                        animate={{ rotate: verbsExpanded ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <FiChevronDown />
                    </AccordionIcon>
                </AccordionHeader>
                <AnimatePresence>
                    {verbsExpanded && (
                        <TagsContainer
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            {actionVerbsFound.map((verb, index) => (
                                <Tag
                                    key={verb}
                                    $variant="verb"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.2, delay: index * 0.03 }}
                                >
                                    {verb}
                                </Tag>
                            ))}
                        </TagsContainer>
                    )}
                </AnimatePresence>
            </div>
        </Container>
    );
};

export default SuggestionsPanel;
