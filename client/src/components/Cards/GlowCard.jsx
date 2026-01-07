import React from 'react';
import styled, { keyframes } from 'styled-components';

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
`;

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  position: relative;
`;

const Card = styled.div`
  position: relative;
  width: ${({ width }) => width || '280px'};
  max-width: ${({ maxWidth }) => maxWidth || 'none'};
  padding: ${({ padding }) => padding || '28px'};
  height: ${({ height }) => height || 'auto'};
  background: linear-gradient(135deg, rgba(25, 25, 40, 0.9) 0%, rgba(15, 15, 25, 0.95) 100%);
  border: 1px solid rgba(102, 126, 234, 0.15);
  border-radius: 16px;
  overflow: hidden;
  z-index: 1;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(20px);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.5), transparent);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      transparent 0%,
      rgba(102, 126, 234, 0.03) 50%,
      transparent 100%
    );
    pointer-events: none;
  }

  &:hover {
    transform: translateY(-8px);
    border-color: rgba(102, 126, 234, 0.3);
    box-shadow: 
      0 25px 50px -12px rgba(0, 0, 0, 0.5),
      0 0 40px rgba(102, 126, 234, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.05);

    &::before {
      opacity: 1;
    }
  }
`;

const GlowEffect = styled.div`
  position: absolute;
  width: 150%;
  height: 150%;
  top: -25%;
  left: -25%;
  background: radial-gradient(
    circle at center,
    rgba(102, 126, 234, 0.1) 0%,
    transparent 50%
  );
  opacity: 0;
  transition: opacity 0.5s ease;
  pointer-events: none;
  z-index: -1;

  ${Card}:hover & {
    opacity: 1;
  }
`;

const ShimmerBorder = styled.div`
  position: absolute;
  inset: -1px;
  border-radius: 17px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(102, 126, 234, 0.4),
    rgba(118, 75, 162, 0.4),
    transparent
  );
  background-size: 200% 100%;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: -1;

  ${Card}:hover & {
    opacity: 1;
    animation: ${shimmer} 2s linear infinite;
  }
`;

const GlowCard = ({ width, height, maxWidth, padding, children, className }) => (
  <Container className={className}>
    <Card width={width} height={height} maxWidth={maxWidth} padding={padding}>
      <ShimmerBorder />
      <GlowEffect />
      {children}
    </Card>
  </Container>
);

export default GlowCard;
