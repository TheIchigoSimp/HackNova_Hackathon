import React from 'react';
import styled, { keyframes } from 'styled-components';

const float1 = keyframes`
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(50px, -30px) scale(1.1); }
  50% { transform: translate(-20px, 50px) scale(0.95); }
  75% { transform: translate(-40px, -20px) scale(1.05); }
`;

const float2 = keyframes`
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(-60px, 40px) scale(1.15); }
  66% { transform: translate(40px, -50px) scale(0.9); }
`;

const float3 = keyframes`
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(30px, 60px) scale(1.1); }
`;

const Container = styled.div`
  position: fixed;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
`;

const Orb = styled.div`
  position: absolute;
  border-radius: 50%;
  filter: blur(${props => props.$blur || 80}px);
  opacity: ${props => props.$opacity || 0.4};
  animation: ${props => props.$animation} ${props => props.$duration || 20}s ease-in-out infinite;
`;

const Orb1 = styled(Orb)`
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(102, 126, 234, 0.3) 0%, transparent 70%);
  top: -200px;
  left: -100px;
  animation-name: ${float1};
`;

const Orb2 = styled(Orb)`
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(118, 75, 162, 0.25) 0%, transparent 70%);
  top: 50%;
  right: -150px;
  animation-name: ${float2};
  animation-duration: 25s;
`;

const Orb3 = styled(Orb)`
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(240, 147, 251, 0.2) 0%, transparent 70%);
  bottom: -100px;
  left: 30%;
  animation-name: ${float3};
  animation-duration: 18s;
`;

const Orb4 = styled(Orb)`
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(102, 126, 234, 0.2) 0%, transparent 70%);
  top: 40%;
  left: 10%;
  animation-name: ${float2};
  animation-duration: 22s;
  animation-delay: -5s;
`;

const Orb5 = styled(Orb)`
  width: 350px;
  height: 350px;
  background: radial-gradient(circle, rgba(118, 75, 162, 0.15) 0%, transparent 70%);
  top: 20%;
  right: 20%;
  animation-name: ${float1};
  animation-duration: 28s;
  animation-delay: -10s;
`;

/**
 * AnimatedBackground Component
 * 
 * Creates a beautiful animated gradient orb background effect.
 * Use as a fixed background for landing pages.
 */
const AnimatedBackground = () => {
  return (
    <Container>
      <Orb1 />
      <Orb2 />
      <Orb3 />
      <Orb4 />
      <Orb5 />
    </Container>
  );
};

export default AnimatedBackground;
