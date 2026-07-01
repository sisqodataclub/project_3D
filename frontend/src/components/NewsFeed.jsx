// src/components/NewsFeed.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api";
import { textVariant, fadeIn } from "../utils/motion";
import TechHeader from "./TechHeader";

const NewsFeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await api.get("/api/blogs/");
        // Same sorting logic as in Blog.jsx
        const dataArray = res.data.results ? res.data.results : res.data;
        const sorted = dataArray.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setPosts(sorted.slice(0, 3)); // take latest 3
      } catch (err) {
        console.error("Failed to load news:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLatest();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-8 h-8 border-4 border-[#915EFF] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (posts.length === 0) {
    return null;
  }

  return (
    <div className="mt-16 relative z-10">
      <motion.div variants={textVariant()}>
        {/* Updated header to fit the business theme */}
        <TechHeader title="Market & Business Insights" />
      </motion.div>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            variants={fadeIn("up", "spring", index * 0.2, 0.75)}
            className="group bg-tertiary rounded-2xl border border-white/5 sm:hover:border-[#915EFF]/50 transition-all duration-300 flex flex-col overflow-hidden shadow-lg relative"
          >
            {/* Sharp editorial accent line at the top of the card */}
            <div className="h-1 w-full bg-gradient-to-r from-[#915EFF] to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Link wraps the entire internal content for a massive clickable area */}
            <Link to={`/blog/${post.id}`} className="flex flex-col h-full p-6 cursor-pointer">
              <div className="flex-grow">
                {/* Business/Economy Kicker */}
                <span className="text-[10px] font-bold tracking-widest text-[#915EFF] uppercase mb-3 block">
                  Market Insight
                </span>

                <h3 className="text-white font-bold text-xl mb-3 leading-snug line-clamp-2 sm:group-hover:text-[#915EFF] transition-colors duration-300">
                  {post.title}
                </h3>
                <p className="text-secondary text-sm leading-relaxed line-clamp-3">
                  {post.excerpt || "Explore the latest economic trends and business insights in this detailed report."}
                </p>
              </div>

              {/* Editorial Footer with separated date and action */}
              <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center">
                <div className="text-xs text-gray-400 font-medium">
                  {post.created_at
                    ? new Date(post.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })
                    : "Recent"}
                </div>
                <div className="text-[#915EFF] text-xs font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform duration-300">
                  Read Article <span className="text-[10px]">▶</span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Button fixed: inline-block, mobile-friendly active states, desktop-only hovers */}
      <div className="mt-12 flex justify-center">
        <Link
          to="/blog"
          className="inline-block px-8 py-3 border border-[#915EFF] text-[#915EFF] rounded-full font-semibold tracking-wider transition-all duration-300 sm:hover:bg-[#915EFF] sm:hover:text-white sm:hover:shadow-[0_0_20px_rgba(145,94,255,0.4)] transform sm:hover:-translate-y-1 active:scale-95"
        >
          View All News →
        </Link>
      </div>
    </div>
  );
};

export default NewsFeed;
