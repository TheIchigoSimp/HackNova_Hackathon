// SlideButton.jsx
import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

const BaseButton = styled.button`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  cursor: pointer;
  outline: none;
  border: none;
  background: transparent;
  padding: 0;
  font-size: 1rem;
  font-family: inherit;
  width: ${(props) => (props.$fullWidth ? "100%" : "auto")};
  height: auto;
  line-height: 1;

  &:focus-visible {
    outline: 2px solid #667eea;
    outline-offset: 3px;
    border-radius: 4px;
  }

  &:active {
    transform: scale(0.98);
    transition: transform 0.1s ease-in-out;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const BorderOverlay = styled.span`
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 2px solid transparent;
  background: linear-gradient(135deg, #667eea, #764ba2, #f093fb) border-box;
  -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  border-radius: 8px;
  box-sizing: border-box;
  z-index: 0;
  pointer-events: none;
  transition: all 0.3s ease;

  ${BaseButton}:hover & {
    box-shadow: 0 0 20px rgba(102, 126, 234, 0.4),
                0 0 40px rgba(118, 75, 162, 0.2);
  }
`;

const HighlightOverlay = styled.span`
  content: "";
  position: absolute;
  top: 4px;
  left: 4px;
  width: calc(100% - 8px);
  height: calc(100% - 8px);
  background: linear-gradient(135deg, rgba(25, 25, 40, 0.95) 0%, rgba(15, 15, 25, 0.98) 100%);
  border-radius: 6px;
  transform-origin: center;
  transform: scaleY(1);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1;
  pointer-events: none;

  ${BaseButton}:hover & {
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.1) 100%);
  }
`;

const IconContainer = styled.span`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  width: 3rem;
  height: 3rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 6px 0 0 6px;
  z-index: 2;
  transition: all 0.5s cubic-bezier(0.65, 0, 0.076, 1);
  overflow: hidden;

  ${BaseButton}:hover & {
    width: 100%;
    border-radius: 6px;
  }
`;

const IconWrapper = styled.span`
  position: relative;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  transition: transform 0.5s cubic-bezier(0.65, 0, 0.076, 1);

  ${BaseButton}:hover & {
    transform: translateX(calc(100% - 4.8rem));
  }
`;

const ButtonText = styled.span`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 0.85rem 0;
  margin-left: 1.2rem;
  color: #e2e8f0;
  font-weight: 600;
  font-size: 0.95rem;
  letter-spacing: 0.02em;
  text-align: center;
  z-index: 4;
  transition: all 0.4s cubic-bezier(0.65, 0, 0.076, 1);

  ${BaseButton}:hover & {
    color: #ffffff;
    letter-spacing: 0.05em;
    text-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
  }
`;

const SlideButton = ({ text, icon, style, onClick, fullWidth, disabled }) => {
  return (
    <div onClick={disabled ? undefined : onClick} className="relative">
      <BaseButton
        style={style || {}}
        type="button"
        $fullWidth={fullWidth}
        aria-label={text}
        disabled={disabled}
      >
        <BorderOverlay aria-hidden="true" />
        <HighlightOverlay aria-hidden="true" />
        <IconContainer aria-hidden="true">
          {icon && <IconWrapper>{icon}</IconWrapper>}
        </IconContainer>
        <ButtonText>{text}</ButtonText>
      </BaseButton>
    </div>
  );
};

SlideButton.propTypes = {
  text: PropTypes.string.isRequired,
  icon: PropTypes.node,
  style: PropTypes.object,
  onClick: PropTypes.func,
  fullWidth: PropTypes.bool,
  disabled: PropTypes.bool,
};

SlideButton.defaultProps = {
  icon: null,
  style: null,
  onClick: null,
  fullWidth: false,
};

export default SlideButton;
