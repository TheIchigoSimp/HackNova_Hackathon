import { cn } from "../lib/utils";
import { TextGenerateEffect } from "../ui/text-generate-effect";
import SlideButton from "../Buttons/SlideButton";
import { GiMagicLamp } from "react-icons/gi";
import { FiPlay } from "react-icons/fi";
import { motion } from "framer-motion";

/**
 * The Hero component is the first thing users see when they visit the homepage.
 * It contains the logo, a tagline, and CTAs.
 */
const Hero = () => {
  const scrollToFeatures = () => {
    document.getElementById('info')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="pb-16 pt-[80px] relative z-10">
      {/* Subtle grid background */}
      <div
        className={cn(
          "absolute inset-0 opacity-30",
          "[background-size:40px_40px]",
          "[background-image:linear-gradient(to_right,rgba(102,126,234,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(102,126,234,0.1)_1px,transparent_1px)]"
        )}
      />

      {/* Radial gradient mask */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />

      <div className="flex justify-center align-middle">
        <div className="max-w-[100vw] relative z-10">
          {/* Logo with glow effect */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-[#667eea]/20 via-[#764ba2]/20 to-[#f093fb]/20 rounded-full scale-150" />
            <img
              src="/logo2.png"
              alt="Pathgenie"
              className="relative w-[200px] m-auto drop-shadow-2xl"
            />
          </motion.div>

          <TextGenerateEffect
            className="text-center md:text-5xl lg:text-6xl mt-6"
            words="Start Your Journey With PathGenie"
          />

          <motion.p 
            className="relative z-20 text-center text-lg md:text-xl mt-6 mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <span className="bg-gradient-to-r from-[#94a3b8] via-[#e2e8f0] to-[#94a3b8] bg-clip-text text-transparent font-medium italic">
              Define Your Path, Achieve Your Goals!
            </span>
          </motion.p>

          <motion.p 
            className="relative z-20 text-center text-sm md:text-base text-[#667eea] font-semibold tracking-wide uppercase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            ✨ Powered by Generative AI
          </motion.p>

          {/* CTA Button */}
          <motion.div 
            className="flex justify-center mt-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <SlideButton
              text="Start Magic"
              icon={<GiMagicLamp size={26} />}
              type="button"
              style={{ width: "100vw", maxWidth: "220px" }}
              fullWidth={true}
              onClick={() => (window.location.href = "/register")}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Hero;


