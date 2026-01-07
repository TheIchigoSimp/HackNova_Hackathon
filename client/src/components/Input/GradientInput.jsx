import React, { useState, useEffect } from "react";
import styled from "styled-components";

const FormControl = styled.div`
  position: relative;
  width: 100%;
`;

const Input = styled.input`
  color: #f8fafc;
  font-size: 1rem;
  font-weight: 400;
  background: rgba(25, 25, 40, 0.6);
  backdrop-filter: blur(10px);
  width: 100%;
  box-sizing: border-box;
  padding: 1rem 1.25rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    border-color: rgba(102, 126, 234, 0.3);
    background: rgba(30, 30, 50, 0.7);
  }

  &:focus {
    outline: none;
    border-color: rgba(102, 126, 234, 0.6);
    background: rgba(30, 30, 50, 0.8);
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.15),
                0 0 20px rgba(102, 126, 234, 0.1);
  }

  &::placeholder {
    color: rgba(148, 163, 184, 0.6);
  }
`;

const InputBorder = styled.span`
  position: absolute;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  height: 2px;
  width: 100%;
  bottom: 0;
  left: 0;
  border-radius: 0 0 10px 10px;
  transform: scaleX(0);
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  ${Input}:hover + &,
  ${Input}:focus + & {
    transform: scaleX(1);
  }
`;

const AnimatedPlaceholder = styled.span`
  position: absolute;
  top: 0;
  left: 0;
  padding: 1rem 1.25rem;
  color: rgba(148, 163, 184, 0.7);
  pointer-events: none;
  transition: opacity 0.3s ease;
  opacity: ${({ $isVisible }) => ($isVisible ? 1 : 0)};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  font-size: 1rem;
`;

const GradientInput = ({
  id,
  name,
  type = "text",
  value,
  onChange,
  placeholders = ["Type something intelligent", "Type something creative"],
  required = false,
  style,
  className,
  duration = 2000,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isInputFocused, setIsInputFocused] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % placeholders.length);
        setIsVisible(true);
      }, 300);
    }, duration);

    return () => clearInterval(interval);
  }, [placeholders, duration]);

  const handleFocus = () => setIsInputFocused(true);
  const handleBlur = () => setIsInputFocused(false);

  return (
    <FormControl>
      <Input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder=""
        required={required}
        className={className}
        style={style}
      />
      {value === "" && !isInputFocused && (
        <AnimatedPlaceholder $isVisible={isVisible}>
          {placeholders[currentIndex]}
        </AnimatedPlaceholder>
      )}
      <InputBorder />
    </FormControl>
  );
};

export default GradientInput;
