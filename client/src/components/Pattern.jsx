import React from 'react';
import styled from 'styled-components';

const Pattern = ({children}) => {
  return (
    <StyledWrapper>
      <div className="container min-w-screen">
        <div className="gradient-orb orb-1" />
        <div className="gradient-orb orb-2" />
        <div className="gradient-orb orb-3" />
        <div className="content-wrapper">
          {children}
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .container {
    width: 100%;
    height: 100%;
    min-height: 100vh;
    background: linear-gradient(135deg, #0a0a0f 0%, #0f0f1a 50%, #0a0a0f 100%);
    position: relative;
    overflow: hidden;
  }

  .content-wrapper {
    position: relative;
    z-index: 10;
  }

  /* Animated gradient orbs for depth */
  .gradient-orb {
    position: fixed;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.4;
    pointer-events: none;
    z-index: 1;
  }

  .orb-1 {
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(102, 126, 234, 0.4) 0%, transparent 70%);
    top: -200px;
    left: -200px;
    animation: float1 20s ease-in-out infinite;
  }

  .orb-2 {
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, rgba(118, 75, 162, 0.35) 0%, transparent 70%);
    bottom: -150px;
    right: -150px;
    animation: float2 25s ease-in-out infinite;
  }

  .orb-3 {
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(240, 147, 251, 0.25) 0%, transparent 70%);
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    animation: float3 30s ease-in-out infinite;
  }

  @keyframes float1 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(50px, 30px) scale(1.1); }
    66% { transform: translate(-30px, 50px) scale(0.95); }
  }

  @keyframes float2 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(-40px, -30px) scale(1.05); }
    66% { transform: translate(30px, -40px) scale(0.9); }
  }

  @keyframes float3 {
    0%, 100% { transform: translate(-50%, -50%) scale(1); }
    50% { transform: translate(-50%, -50%) scale(1.2); }
  }

  /* Subtle grid overlay */
  .container::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
    background-size: 60px 60px;
    pointer-events: none;
    z-index: 2;
  }

  /* Vignette effect */
  .container::after {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(ellipse at center, transparent 0%, rgba(10, 10, 15, 0.4) 100%);
    pointer-events: none;
    z-index: 3;
  }
`;

export default Pattern; 