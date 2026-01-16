import React from 'react';
import styled, { keyframes, css } from 'styled-components';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiTarget, FiZap } from 'react-icons/fi';

// Keyframe animations
const pulse = keyframes`
  0%, 100% { opacity: 1; box-shadow: 0 0 20px rgba(16, 185, 129, 0.3); }
  50% { opacity: 0.8; box-shadow: 0 0 40px rgba(16, 185, 129, 0.5); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const borderGlow = keyframes`
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
`;

const Container = styled(motion.div)`
  position: relative;
  background: linear-gradient(135deg, rgba(25, 25, 40, 0.95) 0%, rgba(15, 15, 25, 0.98) 100%);
  border-radius: 20px;
  padding: 28px;
  backdrop-filter: blur(20px);
  overflow: hidden;
  
  /* Animated gradient border */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 20px;
    padding: 1px;
    background: linear-gradient(
      135deg, 
      rgba(102, 126, 234, 0.6) 0%, 
      rgba(118, 75, 162, 0.4) 50%,
      rgba(102, 126, 234, 0.6) 100%
    );
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    animation: ${borderGlow} 3s ease-in-out infinite;
  }
  
  /* Inner glow effect */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 80%;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.5), transparent);
  }
`;

const ScoreCircleWrapper = styled.div`
  position: relative;
  width: 160px;
  height: 160px;
  margin: 0 auto 20px;
`;

const ScoreCircle = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  
  ${props => props.$highScore && css`
    animation: ${pulse} 2s ease-in-out infinite;
  `}
`;

const CircleSVG = styled.svg`
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
  filter: drop-shadow(0 0 10px rgba(102, 126, 234, 0.3));
`;

const CircleBackground = styled.circle`
  fill: none;
  stroke: rgba(102, 126, 234, 0.1);
  stroke-width: 10;
`;

const CircleProgress = styled.circle`
  fill: none;
  stroke: url(#scoreGradient);
  stroke-width: 10;
  stroke-linecap: round;
  stroke-dasharray: ${props => props.$circumference};
  stroke-dashoffset: ${props => props.$offset};
  transition: stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1);
  filter: drop-shadow(0 0 8px currentColor);
`;

const ScoreValue = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
`;

const ScoreNumber = styled(motion.span)`
  display: block;
  font-size: 3rem;
  font-weight: 800;
  background: ${props => props.$gradient};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -1px;
`;

const ScoreLabel = styled.div`
  font-size: 0.7rem;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  margin-top: 2px;
`;

const RatingBadge = styled(motion.div)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: ${props => props.$bg};
  border: 1px solid ${props => props.$border};
  border-radius: 20px;
  margin: 0 auto 20px;
  font-size: 0.75rem;
  font-weight: 600;
  color: ${props => props.$color};
`;

const QuickStats = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(102, 126, 234, 0.1);
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: #f8fafc;
  margin-bottom: 2px;
`;

const StatLabel = styled.div`
  font-size: 0.65rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const BreakdownGrid = styled.div`
  display: grid;
  gap: 14px;
`;

const BreakdownItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const BreakdownHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const BreakdownLabel = styled.span`
  font-size: 0.8rem;
  color: #cbd5e1;
  font-weight: 500;
`;

const BreakdownValue = styled.span`
  font-size: 0.8rem;
  font-weight: 700;
  color: ${props => props.$color};
`;

const ProgressBar = styled.div`
  height: 8px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
`;

const ProgressFill = styled(motion.div)`
  height: 100%;
  background: ${props => props.$gradient};
  border-radius: 4px;
  position: relative;
  
  /* Shimmer effect */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.2) 50%,
      transparent 100%
    );
    background-size: 200% 100%;
    animation: ${shimmer} 2s ease-in-out infinite;
  }
`;

// Helper functions
const getScoreColor = (score, max) => {
    const percentage = (score / max) * 100;
    if (percentage >= 70) return '#10b981';
    if (percentage >= 40) return '#f59e0b';
    return '#ef4444';
};

const getScoreGradient = (score) => {
    if (score >= 70) return 'linear-gradient(135deg, #10b981 0%, #34d399 100%)';
    if (score >= 40) return 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)';
    return 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)';
};

const getRating = (score) => {
    if (score >= 80) return { label: 'Excellent', icon: FiZap, bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.3)', color: '#34d399' };
    if (score >= 60) return { label: 'Good', icon: FiTrendingUp, bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)', color: '#fbbf24' };
    if (score >= 40) return { label: 'Fair', icon: FiTarget, bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)', color: '#fbbf24' };
    return { label: 'Needs Work', icon: FiTarget, bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.3)', color: '#f87171' };
};

const ATSScoreCard = ({ score = 0, breakdown = {}, suggestionsCount = 0, skillsCount = 0 }) => {
    const radius = 65;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    const rating = getRating(score);
    const RatingIcon = rating.icon;

    const breakdownItems = [
        { label: 'Technical Skills', value: breakdown.technical_skills || 0, max: 35 },
        { label: 'Soft Skills', value: breakdown.soft_skills || 0, max: 25 },
        { label: 'Action Verbs', value: breakdown.action_verbs || 0, max: 20 },
        { label: 'Formatting', value: breakdown.formatting || 0, max: 20 },
    ];

    // Calculate totals for quick stats
    const totalBreakdown = Object.values(breakdown).reduce((a, b) => a + (b || 0), 0);
    const maxTotal = 100;

    return (
        <Container
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
        >
            <ScoreCircleWrapper>
                <ScoreCircle $highScore={score >= 70}>
                    <CircleSVG viewBox="0 0 160 160">
                        <defs>
                            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                {score >= 70 ? (
                                    <>
                                        <stop offset="0%" stopColor="#10b981" />
                                        <stop offset="100%" stopColor="#34d399" />
                                    </>
                                ) : score >= 40 ? (
                                    <>
                                        <stop offset="0%" stopColor="#f59e0b" />
                                        <stop offset="100%" stopColor="#fbbf24" />
                                    </>
                                ) : (
                                    <>
                                        <stop offset="0%" stopColor="#ef4444" />
                                        <stop offset="100%" stopColor="#f87171" />
                                    </>
                                )}
                            </linearGradient>
                        </defs>
                        <CircleBackground cx="80" cy="80" r={radius} />
                        <CircleProgress
                            cx="80"
                            cy="80"
                            r={radius}
                            $circumference={circumference}
                            $offset={offset}
                        />
                    </CircleSVG>
                    <ScoreValue>
                        <ScoreNumber 
                            $gradient={getScoreGradient(score)}
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.5, type: 'spring' }}
                        >
                            {Math.round(score)}
                        </ScoreNumber>
                        <ScoreLabel>ATS Score</ScoreLabel>
                    </ScoreValue>
                </ScoreCircle>
            </ScoreCircleWrapper>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <RatingBadge
                    $bg={rating.bg}
                    $border={rating.border}
                    $color={rating.color}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <RatingIcon size={14} />
                    {rating.label}
                </RatingBadge>
            </div>

            <QuickStats>
                <StatItem>
                    <StatValue>{suggestionsCount || breakdownItems.filter(i => i.value < i.max * 0.7).length}</StatValue>
                    <StatLabel>Tips</StatLabel>
                </StatItem>
                <StatItem>
                    <StatValue>{skillsCount || Object.keys(breakdown).length}</StatValue>
                    <StatLabel>Skills</StatLabel>
                </StatItem>
                <StatItem>
                    <StatValue>{totalBreakdown}/{maxTotal}</StatValue>
                    <StatLabel>Points</StatLabel>
                </StatItem>
            </QuickStats>

            <BreakdownGrid>
                {breakdownItems.map((item, index) => (
                    <BreakdownItem key={item.label}>
                        <BreakdownHeader>
                            <BreakdownLabel>{item.label}</BreakdownLabel>
                            <BreakdownValue $color={getScoreColor(item.value, item.max)}>
                                {item.value}/{item.max}
                            </BreakdownValue>
                        </BreakdownHeader>
                        <ProgressBar>
                            <ProgressFill
                                $gradient={getScoreGradient((item.value / item.max) * 100)}
                                initial={{ width: 0 }}
                                animate={{ width: `${(item.value / item.max) * 100}%` }}
                                transition={{ duration: 0.8, delay: 0.2 + index * 0.1, ease: 'easeOut' }}
                            />
                        </ProgressBar>
                    </BreakdownItem>
                ))}
            </BreakdownGrid>
        </Container>
    );
};

export default ATSScoreCard;
