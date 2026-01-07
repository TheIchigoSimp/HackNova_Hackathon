import { cn } from "../lib/utils";
import { TextGenerateEffect } from "../ui/text-generate-effect";
import SlideButton from "../Buttons/SlideButton";
import { GiMagicLamp } from "react-icons/gi";

/**
 * The Hero component is the first thing users see when they visit the homepage.
 * It contains the logo, a tagline, and a button to start the magic.
 *
 * @returns {JSX.Element} The Hero component.
 * @constructor
 */
const Hero = () => {
  return (
    <div className="pb-24 pt-[80px]">
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
          <div className="relative">
            <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-[#667eea]/20 via-[#764ba2]/20 to-[#f093fb]/20 rounded-full scale-150" />
            <img
              src="/pathgenie.png"
              alt="Pathgenie"
              className="relative w-[200px] m-auto drop-shadow-2xl"
            />
          </div>
          
          <TextGenerateEffect
            className="text-center md:text-5xl lg:text-6xl mt-6"
            words="Start Your Journey With PathGenie"
          />

          <p className="relative z-20 text-center text-lg md:text-xl mt-6 mb-2">
            <span className="bg-gradient-to-r from-[#94a3b8] via-[#e2e8f0] to-[#94a3b8] bg-clip-text text-transparent font-medium italic">
              Define Your Path, Achieve Your Goals!
            </span>
          </p>
          
          <p className="relative z-20 text-center text-sm md:text-base text-[#667eea] font-semibold tracking-wide uppercase">
            ✨ Powered by Generative AI
          </p>

          <div className="flex justify-center mt-10">
            <SlideButton
              text="Start Magic"
              icon={<GiMagicLamp size={26} />}
              type="button"
              style={{ width: "100vw", maxWidth: "260px" }}
              fullWidth={true}
              onClick={() => (window.location.href = "/register")}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
