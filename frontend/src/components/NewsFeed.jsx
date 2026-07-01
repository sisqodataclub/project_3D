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
    return null; // or show a placeholder
  }

  return (
    <div className="mt-16">
      <motion.div variants={textVariant()}>
        <TechHeader title="Latest News" />
      </motion.div>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            variants={fadeIn("up", "spring", index * 0.2, 0.75)}
            className="bg-tertiary p-5 rounded-2xl hover:scale-[1.02] transition-transform duration-300"
          >
            <Link to={`/blog/${post.id}`} className="block h-full">
              <h3 className="text-white font-bold text-xl mb-2 line-clamp-2">
                {post.title}
              </h3>
              <p className="text-secondary text-sm line-clamp-3">
                {post.excerpt || "Click to read more..."}
              </p>
              <div className="mt-4 text-xs text-gray-400">
                {post.created_at
                  ? new Date(post.created_at).toLocaleDateString()
                  : ""}
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <Link
          to="/blog"
          className="px-6 py-2 border border-[#915EFF] text-[#915EFF] rounded-lg hover:bg-[#915EFF] hover:text-white transition-all duration-300"
        >
          View All News →
        </Link>
      </div>
    </div>
  );
};

export default NewsFeed;
