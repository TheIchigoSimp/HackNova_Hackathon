import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiUsers, FiMap, FiStar } from 'react-icons/fi';

const Container = styled.div`
  display: flex;
  justify-content: center;
  gap: 24px;
  flex-wrap: wrap;
  margin-top: 48px;
  padding: 24px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(102, 126, 234, 0.1);
  border-radius: 16px;
  backdrop-filter: blur(10px);
`;

const StatItem = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 32px;
  min-width: 140px;

  @media (max-width: 640px) {
    padding: 12px 20px;
    min-width: 100px;
  }
`;

const IconWrapper = styled.div`
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%);
  border-radius: 12px;
  color: #667eea;

  @media (max-width: 640px) {
    width: 40px;
    height: 40px;
  }
`;

const StatValue = styled.span`
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  @media (max-width: 640px) {
    font-size: 1.5rem;
  }
`;

const StatLabel = styled.span`
  font-size: 0.875rem;
  color: #94a3b8;
  text-align: center;

  @media (max-width: 640px) {
    font-size: 0.75rem;
  }
`;

const stats = [
  { icon: FiUsers, value: '5,000+', label: 'Active Learners' },
  { icon: FiMap, value: '12,000+', label: 'Paths Created' },
  { icon: FiStar, value: '4.9', label: 'User Rating' },
];

/**
 * StatsBar Component
 * 
 * Displays key statistics.
 */
const StatsBar = () => {
  return (
    <Container>
      {stats.map((stat, index) => (
        <StatItem
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
        >
          <IconWrapper>
            <stat.icon size={24} />
          </IconWrapper>
          <StatValue>{stat.value}</StatValue>
          <StatLabel>{stat.label}</StatLabel>
        </StatItem>
      ))}
    </Container>
  );
};

export default StatsBar;

