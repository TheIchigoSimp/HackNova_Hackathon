import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiEdit3, FiCpu, FiBookOpen } from 'react-icons/fi';

const Section = styled.section`
  padding: 80px 0;
  position: relative;
`;

const SectionTitle = styled.h2`
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
  color: #e2e8f0;
  margin-bottom: 16px;

  @media (max-width: 640px) {
    font-size: 1.75rem;
  }
`;

const SectionSubtitle = styled.p`
  text-align: center;
  color: #94a3b8;
  font-size: 1.125rem;
  max-width: 600px;
  margin: 0 auto 60px;

  @media (max-width: 640px) {
    font-size: 1rem;
    margin-bottom: 40px;
  }
`;

const StepsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 32px;
  flex-wrap: wrap;
  position: relative;
  max-width: 1000px;
  margin: 0 auto;

  @media (max-width: 900px) {
    flex-direction: column;
    align-items: center;
    gap: 40px;
  }
`;

const StepCard = styled(motion.div)`
  flex: 1;
  max-width: 300px;
  padding: 32px 24px;
  background: linear-gradient(135deg, rgba(25, 25, 40, 0.9) 0%, rgba(15, 15, 25, 0.95) 100%);
  border: 1px solid rgba(102, 126, 234, 0.15);
  border-radius: 20px;
  text-align: center;
  position: relative;
  backdrop-filter: blur(10px);

  &::before {
    content: '';
    position: absolute;
    inset: -1px;
    border-radius: 21px;
    padding: 1px;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%);
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: exclude;
    mask-composite: exclude;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover::before {
    opacity: 1;
  }
`;

const StepNumber = styled.div`
  position: absolute;
  top: -16px;
  left: 50%;
  transform: translateX(-50%);
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.875rem;
  color: white;
`;

const IconWrapper = styled.div`
  width: 72px;
  height: 72px;
  margin: 16px auto 24px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #667eea;
`;

const StepTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #e2e8f0;
  margin-bottom: 12px;
`;

const StepDescription = styled.p`
  font-size: 0.9rem;
  color: #94a3b8;
  line-height: 1.6;
`;

const ConnectorLine = styled.div`
  display: none;
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.3), rgba(118, 75, 162, 0.3), transparent);
  z-index: -1;

  @media (min-width: 901px) {
    display: block;
  }
`;

const steps = [
  {
    icon: FiEdit3,
    title: 'Enter Your Topic',
    description: 'Type any topic, paste your syllabus, or describe what you want to learn.',
  },
  {
    icon: FiCpu,
    title: 'AI Creates Your Path',
    description: 'Our AI instantly generates a personalized, interactive mindmap for your learning journey.',
  },
  {
    icon: FiBookOpen,
    title: 'Learn & Track Progress',
    description: 'Explore curated resources, track your progress, and master each topic step by step.',
  },
];

/**
 * HowItWorks Component
 * 
 * 3-step visual guide showing how PathGenie works.
 */
const HowItWorks = () => {
  return (
    <Section>
      <SectionTitle>How It Works</SectionTitle>
      <SectionSubtitle>
        Get your personalized learning path in seconds with our AI-powered platform
      </SectionSubtitle>

      <StepsContainer>
        <ConnectorLine />
        {steps.map((step, index) => (
          <StepCard
            key={step.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.15 }}
          >
            <StepNumber>{index + 1}</StepNumber>
            <IconWrapper>
              <step.icon size={32} />
            </IconWrapper>
            <StepTitle>{step.title}</StepTitle>
            <StepDescription>{step.description}</StepDescription>
          </StepCard>
        ))}
      </StepsContainer>
    </Section>
  );
};

export default HowItWorks;
