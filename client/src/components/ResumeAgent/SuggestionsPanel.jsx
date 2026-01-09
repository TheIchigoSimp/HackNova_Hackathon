import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown, FiCheck, FiAward, FiTarget } from 'react-icons/fi';

const Container = styled(motion.div)`
  background: linear-gradient(135deg, rgba(25, 25, 40, 0.9) 0%, rgba(15, 15, 25, 0.95) 100%);
  border: 1px solid rgba(102, 126, 234, 0.15);
  border-radius: 16px;
  padding: 24px;
  backdrop-filter: blur(20px);
`;

const SectionTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #f8fafc;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SuggestionsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SuggestionItem = styled(motion.li)`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(102, 126, 234, 0.05);
  border: 1px solid rgba(102, 126, 234, 0.1);
  border-radius: 10px;
  color: #e2e8f0;
  font-size: 0.875rem;
  line-height: 1.5;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(102, 126, 234, 0.1);
    border-color: rgba(102, 126, 234, 0.2);
  }
`;

const SuggestionIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  min-width: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  color: white;
  font-size: 0.625rem;
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
  padding: 12px 16px;
  background: rgba(102, 126, 234, 0.05);
  border: 1px solid rgba(102, 126, 234, 0.1);
  border-radius: 10px;
  color: #f8fafc;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

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
  padding-top: 12px;
`;

const Tag = styled(motion.span)`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: ${props => props.$variant === 'skill'
        ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)'
        : 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(52, 211, 153, 0.15) 100%)'
    };
  border: 1px solid ${props => props.$variant === 'skill'
        ? 'rgba(102, 126, 234, 0.3)'
        : 'rgba(16, 185, 129, 0.3)'
    };
  border-radius: 20px;
  font-size: 0.75rem;
  color: ${props => props.$variant === 'skill' ? '#a78bfa' : '#34d399'};
  font-weight: 500;
`;

const SuggestionsPanel = ({ suggestions = [], skillsFound = [], actionVerbsFound = [] }) => {
    console.log('SuggestionsPanel props:', { suggestions, skillsFound, actionVerbsFound });
    const [skillsExpanded, setSkillsExpanded] = useState(true);
    const [verbsExpanded, setVerbsExpanded] = useState(true);

    return (
        <Container
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
        >
            {/* Suggestions Section */}
            <SectionTitle>
                <FiTarget className="text-[#667eea]" />
                Improvement Suggestions
            </SectionTitle>
            <SuggestionsList>
                {suggestions.map((suggestion, index) => (
                    <SuggestionItem
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                        <SuggestionIcon>{index + 1}</SuggestionIcon>
                        {suggestion}
                    </SuggestionItem>
                ))}
            </SuggestionsList>

            <Divider />

            {/* Skills Found */}
            <div className="mb-4">
                <AccordionHeader onClick={() => setSkillsExpanded(!skillsExpanded)}>
                    <span className="flex items-center gap-2">
                        <FiAward className="text-[#667eea]" />
                        Skills Found ({skillsFound.length})
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
                    <span className="flex items-center gap-2">
                        <FiCheck className="text-[#10b981]" />
                        Action Verbs ({actionVerbsFound.length})
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
