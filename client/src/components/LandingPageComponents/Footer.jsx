import React from 'react';
import styled from 'styled-components';
import { FiGithub, FiTwitter, FiLinkedin, FiMail } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const FooterContainer = styled.footer`
  padding: 64px 24px 32px;
  background: linear-gradient(180deg, transparent 0%, rgba(15, 15, 25, 0.5) 100%);
  border-top: 1px solid rgba(102, 126, 234, 0.1);
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const TopSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 48px;
  margin-bottom: 48px;

  @media (max-width: 640px) {
    gap: 32px;
    text-align: center;
  }
`;

const BrandSection = styled.div`
  @media (max-width: 640px) {
    order: -1;
  }
`;

const Logo = styled.img`
  height: 48px;
  margin-bottom: 16px;
`;

const BrandDescription = styled.p`
  color: #64748b;
  font-size: 0.875rem;
  line-height: 1.6;
  max-width: 280px;

  @media (max-width: 640px) {
    max-width: none;
  }
`;

const LinkSection = styled.div``;

const LinkTitle = styled.h4`
  color: #e2e8f0;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 16px;
`;

const LinkList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const LinkItem = styled.li`
  margin-bottom: 12px;
`;

const FooterLink = styled(Link)`
  color: #64748b;
  font-size: 0.875rem;
  text-decoration: none;
  transition: color 0.2s ease;

  &:hover {
    color: #a78bfa;
  }
`;

const ExternalLink = styled.a`
  color: #64748b;
  font-size: 0.875rem;
  text-decoration: none;
  transition: color 0.2s ease;

  &:hover {
    color: #a78bfa;
  }
`;

const SocialSection = styled.div``;

const SocialLinks = styled.div`
  display: flex;
  gap: 16px;

  @media (max-width: 640px) {
    justify-content: center;
  }
`;

const SocialLink = styled.a`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(102, 126, 234, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 10px;
  color: #64748b;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(102, 126, 234, 0.2);
    border-color: rgba(102, 126, 234, 0.4);
    color: #a78bfa;
  }
`;

const BottomSection = styled.div`
  padding-top: 32px;
  border-top: 1px solid rgba(102, 126, 234, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;

  @media (max-width: 640px) {
    justify-content: center;
    text-align: center;
  }
`;

const Copyright = styled.p`
  color: #475569;
  font-size: 0.875rem;
`;

const MadeWith = styled.p`
  color: #475569;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 4px;
`;

/**
 * Footer Component
 * 
 * Site footer with links, social media, and copyright.
 */
const Footer = () => {
  return (
    <FooterContainer>
      <FooterContent>
        <TopSection>
          <BrandSection>
            <Logo src="/logo2.png" alt="PathGenie" />
            <BrandDescription>
              AI-powered learning paths that adapt to your goals. 
              Transform how you learn with personalized mindmaps.
            </BrandDescription>
          </BrandSection>

          <LinkSection>
            <LinkTitle>Product</LinkTitle>
            <LinkList>
              <LinkItem><FooterLink to="/dashboard">Dashboard</FooterLink></LinkItem>
              <LinkItem><FooterLink to="/resume-analyzer">Resume Analyzer</FooterLink></LinkItem>
              <LinkItem><FooterLink to="/certifications">Certifications</FooterLink></LinkItem>
            </LinkList>
          </LinkSection>

          <LinkSection>
            <LinkTitle>Company</LinkTitle>
            <LinkList>
              <LinkItem><ExternalLink href="#info">Features</ExternalLink></LinkItem>
              <LinkItem><ExternalLink href="#testimonials">Testimonials</ExternalLink></LinkItem>
              <LinkItem><ExternalLink href="mailto:support@pathgenie.com">Contact</ExternalLink></LinkItem>
            </LinkList>
          </LinkSection>

          <SocialSection>
            <LinkTitle>Connect</LinkTitle>
            <SocialLinks>
              <SocialLink href="https://github.com" target="_blank" rel="noopener noreferrer">
                <FiGithub size={18} />
              </SocialLink>
              <SocialLink href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                <FiTwitter size={18} />
              </SocialLink>
              <SocialLink href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                <FiLinkedin size={18} />
              </SocialLink>
              <SocialLink href="mailto:support@pathgenie.com">
                <FiMail size={18} />
              </SocialLink>
            </SocialLinks>
          </SocialSection>
        </TopSection>

        <BottomSection>
          <Copyright>
            © {new Date().getFullYear()} PathGenie. All rights reserved.
          </Copyright>
          <MadeWith>
            Made for learners everywhere
          </MadeWith>
        </BottomSection>
      </FooterContent>
    </FooterContainer>
  );
};

export default Footer;
