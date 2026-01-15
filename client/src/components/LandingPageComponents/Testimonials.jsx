import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiStar } from 'react-icons/fi';

const Section = styled.section`
  padding: 80px 0;
  position: relative;
  overflow: hidden;
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
  margin: 0 auto 48px;

  @media (max-width: 640px) {
    font-size: 1rem;
  }
`;

const CarouselContainer = styled.div`
  position: relative;
  max-width: 800px;
  margin: 0 auto;
  padding: 0 48px;

  @media (max-width: 640px) {
    padding: 0 16px;
  }
`;

const TestimonialCard = styled(motion.div)`
  padding: 40px;
  background: linear-gradient(135deg, rgba(25, 25, 40, 0.9) 0%, rgba(15, 15, 25, 0.95) 100%);
  border: 1px solid rgba(102, 126, 234, 0.15);
  border-radius: 24px;
  text-align: center;
  backdrop-filter: blur(10px);

  @media (max-width: 640px) {
    padding: 24px;
  }
`;

const Avatar = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin: 0 auto 20px;
  border: 3px solid rgba(102, 126, 234, 0.3);
  object-fit: cover;

  @media (max-width: 640px) {
    width: 64px;
    height: 64px;
  }
`;

const Stars = styled.div`
  display: flex;
  justify-content: center;
  gap: 4px;
  margin-bottom: 20px;
  color: #fbbf24;
`;

const Quote = styled.p`
  font-size: 1.125rem;
  color: #e2e8f0;
  line-height: 1.8;
  margin-bottom: 24px;
  font-style: italic;

  @media (max-width: 640px) {
    font-size: 1rem;
  }
`;

const AuthorName = styled.h4`
  font-size: 1.125rem;
  font-weight: 600;
  color: #e2e8f0;
  margin-bottom: 4px;
`;

const AuthorRole = styled.p`
  font-size: 0.875rem;
  color: #667eea;
`;

const NavButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(102, 126, 234, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.3);
  color: #a78bfa;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 10;

  &:hover {
    background: rgba(102, 126, 234, 0.2);
    border-color: rgba(102, 126, 234, 0.5);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  @media (max-width: 640px) {
    width: 40px;
    height: 40px;
  }
`;

const PrevButton = styled(NavButton)`
  left: 0;
`;

const NextButton = styled(NavButton)`
  right: 0;
`;

const Dots = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 24px;
`;

const Dot = styled.button`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: none;
  background: ${props => props.$isActive ? '#667eea' : 'rgba(102, 126, 234, 0.3)'};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$isActive ? '#667eea' : 'rgba(102, 126, 234, 0.5)'};
  }
`;

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'Computer Science Student',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    quote: 'PathGenie transformed how I approach learning! The AI-generated mindmaps helped me visualize complex topics and ace my exams.',
    rating: 5,
  },
  {
    name: 'Rahul Verma',
    role: 'Software Developer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    quote: 'I use PathGenie to upskill in new technologies. The personalized resources save me hours of searching for quality content.',
    rating: 5,
  },
  {
    name: 'Ananya Patel',
    role: 'Data Science Enthusiast',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    quote: 'The Resume Analyzer feature is incredible! It helped me optimize my CV and land my dream internship.',
    rating: 5,
  },
];

/**
 * Testimonials Component
 * 
 * Carousel showcasing user testimonials.
 */
const Testimonials = () => {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const next = useCallback(() => {
    setCurrent(prev => (prev + 1) % testimonials.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent(prev => (prev - 1 + testimonials.length) % testimonials.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(next, 5000);
    return () => clearInterval(interval);
  }, [isPaused, next]);

  return (
    <Section>
      <SectionTitle>What Our Users Say</SectionTitle>
      <SectionSubtitle>
        Join thousands of learners who transformed their learning journey
      </SectionSubtitle>

      <CarouselContainer
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <PrevButton onClick={prev}>
          <FiChevronLeft size={24} />
        </PrevButton>

        <AnimatePresence mode="wait">
          <TestimonialCard
            key={current}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Avatar src={testimonials[current].avatar} alt={testimonials[current].name} />
            <Stars>
              {[...Array(testimonials[current].rating)].map((_, i) => (
                <FiStar key={i} fill="#fbbf24" />
              ))}
            </Stars>
            <Quote>"{testimonials[current].quote}"</Quote>
            <AuthorName>{testimonials[current].name}</AuthorName>
            <AuthorRole>{testimonials[current].role}</AuthorRole>
          </TestimonialCard>
        </AnimatePresence>

        <NextButton onClick={next}>
          <FiChevronRight size={24} />
        </NextButton>

        <Dots>
          {testimonials.map((_, index) => (
            <Dot
              key={index}
              $isActive={index === current}
              onClick={() => setCurrent(index)}
            />
          ))}
        </Dots>
      </CarouselContainer>
    </Section>
  );
};

export default Testimonials;
