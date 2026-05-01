import { useState } from "react";
import { motion } from "framer-motion";
import {
  FaGithub,
  FaLinkedin,
  FaTwitter,
  FaLaptopCode,
  FaChartLine,
  FaCalendarAlt
} from "react-icons/fa";
import Lottie from "lottie-react";

import helloAnimation from "../assets/hello.json";

const IntroCard = () => {
  // State to track mouse position for the spotlight effect
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const { left, top } = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - left,
      y: e.clientY - top,
    });
  };

  // Animation variants for the right-side cards
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.4 }
    }
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      onMouseMove={handleMouseMove}
      className="w-full max-w-6xl p-8 sm:p-10 lg:p-12 rounded-3xl bg-[#09090b]/80 shadow-[0_0_50px_rgba(145,94,255,0.1)] text-white backdrop-blur-xl border border-white/10 flex flex-col md:flex-row gap-10 lg:gap-16 items-center relative overflow-hidden group"
    >
      {/* Dynamic Mouse Spotlight */}
      <div
        className="absolute inset-0 z-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100 pointer-events-none"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(145,94,255,0.06), transparent 40%)`
        }}
      />

      {/* Subtle static background glows */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-[#915EFF] rounded-full mix-blend-multiply filter blur-[120px] opacity-20 pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-[#00C6FF] rounded-full mix-blend-multiply filter blur-[120px] opacity-10 pointer-events-none" />

      {/* Left Column: Text & CTA */}
      <div className="flex-1 relative z-10">

        {/* Availability Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold tracking-wide uppercase mb-6">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          Open to Clients & Roles
        </div>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 flex-shrink-0">
            <Lottie animationData={helloAnimation} loop={true} />
          </div>
          <p className="text-gray-400 font-medium tracking-widest uppercase text-sm">Welcome to my workspace</p>
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white mb-4 tracking-tight leading-[1.1]">
          Hi, I'm <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#915EFF] to-[#00C6FF]">Francis.</span>
        </h1>

        <h2 className="text-xl sm:text-2xl font-bold text-gray-300 mb-6 flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-2">Technical Growth Partner</span>
          <span className="text-gray-600 hidden sm:inline">|</span>
          <span className="flex items-center gap-2">Business Ecosystems</span>
        </h2>

        {/* The Updated Pitch */}
        <p className="text-gray-400 text-lg max-w-xl leading-relaxed mb-8">
          Most agencies build you a website, hand over the keys, and wish you luck. But a website alone doesn't bring in customers. When we work together, you don't just get a website—you get an entire engine designed to run and grow your business.
        </p>

        {/* Trust Metrics */}
        <div className="flex items-center gap-6 sm:gap-10 mb-8 border-y border-white/5 py-5">
          <div>
            <h4 className="text-2xl font-black text-white mb-1">4+</h4>
            <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider font-semibold">Years Exp.</p>
          </div>
          <div className="w-px h-8 bg-white/10"></div>
          <div>
            <h4 className="text-2xl font-black text-white mb-1">20+</h4>
            <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider font-semibold">Projects Shipped</p>
          </div>
          <div className="w-px h-8 bg-white/10"></div>
          <div>
            <h4 className="text-2xl font-black text-white mb-1">100%</h4>
            <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider font-semibold">Client Success</p>
          </div>
        </div>

        {/* Social Links */}
        <div className="flex items-center gap-6">
          <a href="https://github.com/" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors duration-300 hover:scale-110 transform">
            <FaGithub size={26} />
          </a>
          <a href="https://linkedin.com/in/" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-[#0077b5] transition-colors duration-300 hover:scale-110 transform">
            <FaLinkedin size={26} />
          </a>
          <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-[#1DA1F2] transition-colors duration-300 hover:scale-110 transform">
            <FaTwitter size={26} />
          </a>
        </div>
      </div>

      {/* Right Column: 3-Pillar Business Highlights */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-4 w-full lg:max-w-[340px] relative z-10"
      >
        {/* Pillar 1: Trust */}
        <motion.div
          variants={cardVariants}
          whileHover={{ x: -5 }}
          className="bg-white/[0.02] p-5 rounded-2xl border border-white/5 hover:border-[#915EFF]/40 transition-all duration-300 group hover:bg-white/[0.04]"
        >
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 rounded-lg bg-[#915EFF]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FaLaptopCode className="text-[#915EFF] text-lg" />
            </div>
            <h3 className="text-white font-bold text-md">A Website That Builds Trust</h3>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed pl-14">
            A fast, professional site that makes you the obvious premium choice in your local market.
          </p>
        </motion.div>

        {/* Pillar 2: Bookings */}
        <motion.div
          variants={cardVariants}
          whileHover={{ x: -5 }}
          className="bg-white/[0.02] p-5 rounded-2xl border border-white/5 hover:border-green-400/40 transition-all duration-300 group hover:bg-white/[0.04]"
        >
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 rounded-lg bg-green-400/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FaCalendarAlt className="text-green-400 text-lg" />
            </div>
            <h3 className="text-white font-bold text-md">Frictionless Bookings</h3>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed pl-14">
            Built-in contact forms, booking calendars, or checkout carts so customers can buy from you instantly.
          </p>
        </motion.div>

        {/* Pillar 3: Analytics */}
        <motion.div
          variants={cardVariants}
          whileHover={{ x: -5 }}
          className="bg-white/[0.02] p-5 rounded-2xl border border-white/5 hover:border-[#00C6FF]/40 transition-all duration-300 group hover:bg-white/[0.04]"
        >
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 rounded-lg bg-[#00C6FF]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FaChartLine className="text-[#00C6FF] text-lg" />
            </div>
            <h3 className="text-white font-bold text-md">Clear Business Analytics</h3>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed pl-14">
            A simple dashboard. Log in every morning and see exactly how many visited, booked, and your profit margins.
          </p>
        </motion.div>
      </motion.div>

    </motion.div>
  );
};

export default IntroCard;
