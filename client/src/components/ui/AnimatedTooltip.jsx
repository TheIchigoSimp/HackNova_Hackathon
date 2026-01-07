import React, { useState } from "react";
import {
  // eslint-disable-next-line no-unused-vars
  motion,
  useTransform,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from "motion/react";

export const AnimatedTooltip = ({ items }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const springConfig = { stiffness: 100, damping: 5 };
  const x = useMotionValue(0);
  const rotate = useSpring(
    useTransform(x, [-100, 100], [-45, 45]),
    springConfig
  );
  const translateX = useSpring(
    useTransform(x, [-100, 100], [-50, 50]),
    springConfig
  );
  const handleMouseMove = (event) => {
    const halfWidth = event.target.offsetWidth / 2;
    x.set(event.nativeEvent.offsetX - halfWidth);
  };

  return (
    <>
      {items.map((item) => (
        <div
          className="group relative -mr-2"
          key={item.name}
          onMouseEnter={() => setHoveredIndex(item.id)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence mode="popLayout">
            {hoveredIndex === item.id && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.6 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: {
                    type: "spring",
                    stiffness: 260,
                    damping: 10,
                  },
                }}
                exit={{ opacity: 0, y: 20, scale: 0.6 }}
                style={{
                  translateX: translateX,
                  rotate: rotate,
                  whiteSpace: "nowrap",
                }}
                className="absolute bottom-full mb-3 transform -translate-x-1/2 z-50 flex flex-col items-center justify-center rounded-xl bg-gradient-to-br from-[rgba(25,25,40,0.95)] to-[rgba(15,15,25,0.98)] backdrop-blur-xl px-5 py-3 text-xs shadow-2xl border border-[rgba(102,126,234,0.2)] -left-[25px]"
              >
                <div className="absolute inset-x-10 -bottom-px z-30 h-px w-[20%] bg-gradient-to-r from-transparent via-[#667eea] to-transparent" />
                <div className="absolute -bottom-px left-10 z-30 h-px w-[40%] bg-gradient-to-r from-transparent via-[#764ba2] to-transparent" />
                <div className="relative z-30 text-base font-semibold text-white">
                  {item.name}
                  <div className="text-xs text-[#94a3b8] mt-0.5">{item.designation}</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <img
            onMouseMove={handleMouseMove}
            height={100}
            width={100}
            src={item.image}
            alt={item.name}
            className="relative !m-0 h-14 w-14 rounded-full border-2 border-[rgba(102,126,234,0.4)] object-cover object-top !p-0 transition-all duration-300 group-hover:z-30 group-hover:scale-110 group-hover:border-[rgba(102,126,234,0.7)] group-hover:shadow-[0_0_20px_rgba(102,126,234,0.3)]"
          />
        </div>
      ))}
    </>
  );
};
