import { motion } from "framer-motion";
import Lottie from "lottie-react";

import { styles } from "../styles";
import techLoop from "../assets/webbg.json";
import IntroCard from "./Introcard";

const Hero = () => {
  return (
    {/* 🌟 FIXED: Changed h-screen to min-h-screen so it can grow vertically if needed */}
    <section className="relative w-full min-h-screen overflow-hidden bg-[#050816] flex flex-col justify-center">

      {/* Lottie Background - Darkened slightly for better text contrast */}
      <div className="absolute inset-0 opacity-15 pointer-events-none mix-blend-screen">
        <Lottie animationData={techLoop} loop autoplay className="w-full h-full object-cover" />
      </div>

      {/* Gradient Overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050816]/50 to-[#050816] pointer-events-none" />

      {/* Main Content */}
      {/* 🌟 FIXED: Removed h-full and added py-24 (padding top/bottom) for breathing room on mobile */}
      <div className="relative z-10 w-full flex justify-center items-center px-4 sm:px-6 lg:px-8 py-24 max-w-7xl mx-auto">
        <IntroCard />
      </div>

      {/* Scroll Indicator - Modernized */}
      {/* Note: I added 'hidden md:flex' here so the scroll indicator doesn't overlap the tall card on small mobile screens. You can remove 'hidden md:flex' if you still want it on mobile! */}
      <div className="absolute xs:bottom-10 bottom-12 w-full hidden md:flex justify-center items-center z-20">
        <a href="#about" aria-label="Scroll down to about section">
          <div className="w-[30px] h-[50px] rounded-full border-[3px] border-white/30 flex justify-center items-start p-1 backdrop-blur-sm hover:border-[#915EFF] transition-colors duration-300">
            <motion.div
              animate={{ y: [0, 16, 0] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: "loop",
                ease: "easeInOut"
              }}
              className="w-2 h-2 rounded-full bg-[#915EFF] mb-1 shadow-[0_0_10px_#915EFF]"
            />
          </div>
        </a>
      </div>
    </section>
  );
};

export default Hero;
