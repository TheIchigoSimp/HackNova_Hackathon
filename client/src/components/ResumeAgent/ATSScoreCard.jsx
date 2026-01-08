import React from 'react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
`;

const Container = styled(motion.div)`
  background: linear-gradient(135deg, rgba(25, 25, 40, 0.9) 0%, rgba(15, 15, 25, 0.95) 100%);
  border: 1px solid rgba(102, 126, 234, 0.15);
  border-radius: 16px;
  padding: 24px;
  backdrop-filter: blur(20px);
`;

const ScoreCircle = styled.div`
  position: relative;
  width: 140px;
  height: 140px;
  margin: 0 auto 24px;
`;

const CircleSVG = styled.svg`
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
`;

const CircleBackground = styled.circle`
  fill: none;
  stroke: rgba(102, 126, 234, 0.1);
  stroke-width: 8;
`;

const CircleProgress = styled.circle`
  fill: none;
  stroke: url(#scoreGradient);
  stroke-width: 8;
  stroke-linecap: round;
  stroke-dasharray: ${props => props.$circumference};
  stroke-dashoffset: ${props => props.$offset};
  transition: stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1);
`;

const ScoreValue = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
`;

const ScoreNumber = styled.span`
  font-size: 2.5rem;
  font-weight: 700;
  background: ${props => props.$gradient};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const ScoreLabel = styled.div`
  font-size: 0.75rem;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-top: 4px;
`;

const BreakdownGrid = styled.div`
  display: grid;
  gap: 16px;
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
  font-size: 0.875rem;
  color: #e2e8f0;
`;

const BreakdownValue = styled.span`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${props => props.$color};
`;

const ProgressBar = styled.div`
  height: 6px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 3px;
  overflow: hidden;
`;

const ProgressFill = styled(motion.div)`
  height: 100%;
  background: ${props => props.$gradient};
  border-radius: 3px;
`;

const getScoreColor = (score, max) => {
    const percentage = (score / max) * 100;
    if (percentage >= 70) return '#10b981'; // Green
    if (percentage >= 40) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
};

const getScoreGradient = (score) => {
    if (score >= 70) return 'linear-gradient(135deg, #10b981 0%, #34d399 100%)';
    if (score >= 40) return 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)';
    return 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)';
};

const ATSScoreCard = ({ score, breakdown }) => {
    const radius = 58;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    const breakdownItems = [
        { label: 'Technical Skills', value: breakdown.technical_skills, max: 35 },
        { label: 'Soft Skills', value: breakdown.soft_skills, max: 25 },
        { label: 'Action Verbs', value: breakdown.action_verbs, max: 20 },
        { label: 'Formatting', value: breakdown.formatting, max: 20 },
    ];

    return (
        <Container
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <ScoreCircle>
                <CircleSVG viewBox="0 0 140 140">
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
                    <CircleBackground cx="70" cy="70" r={radius} />
                    <CircleProgress
                        cx="70"
                        cy="70"
                        r={radius}
                        $circumference={circumference}
                        $offset={offset}
                    />
                </CircleSVG>
                <ScoreValue>
                    <ScoreNumber $gradient={getScoreGradient(score)}>{Math.round(score)}</ScoreNumber>
                    <ScoreLabel>ATS Score</ScoreLabel>
                </ScoreValue>
            </ScoreCircle>

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
                                transition={{ duration: 0.8, delay: index * 0.1 }}
                            />
                        </ProgressBar>
                    </BreakdownItem>
                ))}
            </BreakdownGrid>
        </Container>
    );
};

export default ATSScoreCard;
