import { motion } from "framer-motion";
import { FaGithub, FaLinkedin, FaTwitter, FaEnvelope, FaArrowRight, FaChartBar, FaCode } from "react-icons/fa";
import Lottie from "lottie-react";

import helloAnimation from "../assets/hello.json";

const IntroCard = () => {
  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="w-full max-w-5xl p-8 sm:p-10 lg:p-12 rounded-3xl bg-[#09090b]/80 shadow-[0_0_50px_rgba(145,94,255,0.1)] text-white backdrop-blur-xl border border-white/10 flex flex-col md:flex-row gap-10 items-center relative overflow-hidden"
    >
      {/* Subtle background glow inside the card */}
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#915EFF] rounded-full mix-blend-multiply filter blur-[100px] opacity-20 pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-[#00C6FF] rounded-full mix-blend-multiply filter blur-[100px] opacity-10 pointer-events-none" />

      {/* Left Column: Text & CTA */}
      <div className="flex-1 relative z-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 flex-shrink-0">
            <Lottie animationData={helloAnimation} loop={true} />
          </div>
          <p className="text-gray-400 font-medium tracking-widest uppercase text-sm">Welcome to my workspace</p>
        </div>
        
        <h1 className="text-5xl sm:text-6xl font-black text-white mb-4 tracking-tight leading-[1.1]">
          Hi, I'm <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#915EFF] to-[#00C6FF]">Francis.</span>
        </h1>
        
        <h2 className="text-xl sm:text-2xl font-bold text-gray-300 mb-6 flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-2"><FaChartBar className="text-[#00C6FF]"/> Data Analytics</span> 
          <span className="text-gray-600 hidden sm:inline">|</span> 
          <span className="flex items-center gap-2"><FaCode className="text-[#915EFF]"/> Web Developer</span>
        </h2>
        
        <p className="text-gray-400 text-lg max-w-xl leading-relaxed mb-8">
          I build custom, scalable web applications and data-driven tools that help businesses optimize decisions and accelerate growth.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <a 
            href="#work" 
            className="flex items-center gap-2 bg-[#915EFF] hover:bg-[#7a4be0] text-white px-7 py-3.5 rounded-full font-bold transition-all duration-300 shadow-[0_0_20px_rgba(145,94,255,0.3)] hover:shadow-[0_0_30px_rgba(145,94,255,0.5)] active:scale-95"
          >
            View Projects <FaArrowRight className="text-sm" />
          </a>
          <a 
            href="mailto:francis@dataclubcenter.com" 
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-7 py-3.5 rounded-full font-bold transition-all duration-300 border border-white/10 active:scale-95"
          >
            <FaEnvelope className="text-gray-300" /> Contact Me
          </a>
        </div>

        {/* Social Links */}
        <div className="flex items-center gap-6">
          <a href="https://github.com/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors duration-300 hover:scale-110 transform">
            <FaGithub size={26} />
          </a>
          <a href="https://linkedin.com/in/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#0077b5] transition-colors duration-300 hover:scale-110 transform">
            <FaLinkedin size={26} />
          </a>
          <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#1DA1F2] transition-colors duration-300 hover:scale-110 transform">
            <FaTwitter size={26} />
          </a>
        </div>
      </div>

      {/* Right Column: Talent Highlights */}
      <div className="hidden lg:flex flex-col gap-5 w-full max-w-[320px] relative z-10">
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white/[0.03] p-6 rounded-2xl border border-white/10 hover:border-[#00C6FF]/50 transition-all duration-300 group"
        >
          <div className="w-10 h-10 rounded-lg bg-[#00C6FF]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <FaChartBar className="text-[#00C6FF] text-xl" />
          </div>
          <h3 className="text-white font-bold text-lg mb-2">Data Intelligence</h3>
          <p className="text-gray-400 text-sm leading-relaxed">Transforming complex datasets into clear, actionable business insights.</p>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white/[0.03] p-6 rounded-2xl border border-white/10 hover:border-[#915EFF]/50 transition-all duration-300 group"
        >
          <div className="w-10 h-10 rounded-lg bg-[#915EFF]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <FaCode className="text-[#915EFF] text-xl" />
          </div>
          <h3 className="text-white font-bold text-lg mb-2">Scalable Systems</h3>
          <p className="text-gray-400 text-sm leading-relaxed">Architecting robust, high-performance web platforms from the ground up.</p>
        </motion.div>
      </div>

    </motion.div>
  );
};

export default IntroCard;
