// src/components/Works.jsx
import React, { useState, useMemo } from "react";
import Tilt from "react-parallax-tilt";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

import { styles } from "../styles";
import { github } from "../assets";
import { textVariant, fadeIn } from "../utils/motion";
import { projects } from "../constants";
import TechHeader from "../components/TechHeader";

const ProjectCard = ({ index, name, description, tags, image, source_code_link }) => (
  <motion.div 
    layout
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    transition={{ duration: 0.3 }}
    className="w-full sm:w-[360px]"
  >
    <Tilt
      options={{ max: 45, scale: 1, speed: 450 }}
      className="bg-tertiary p-5 rounded-2xl w-full h-full flex flex-col border border-white/10 hover:border-white/20 transition-colors"
    >
      {/* Card clickable wrapper */}
      <div
        onClick={() => window.open(source_code_link, "_blank")}
        className="cursor-pointer flex flex-col h-full"
      >
        <div className="relative w-full h-[230px] rounded-2xl overflow-hidden group">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-in-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-50" />
          
          <div className="absolute inset-0 flex justify-end m-3 card-img_hover">
            <div
              onClick={(e) => {
                e.stopPropagation();
                window.open(source_code_link, "_blank");
              }}
              className="black-gradient w-10 h-10 rounded-full flex justify-center items-center cursor-pointer shadow-lg hover:scale-110 transition-all duration-300"
            >
              <img src={github} alt="source code" className="w-1/2 h-1/2 object-contain" />
            </div>
          </div>
        </div>

        <div className="mt-5 flex-grow">
          <h3 className="text-white font-bold text-[24px]">{name}</h3>
          <p className="mt-2 text-secondary text-[14px] line-clamp-3 leading-relaxed">{description}</p>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span 
              key={`${name}-${tag.name}`} 
              className={`text-[13px] font-medium px-2 py-1 rounded-md bg-black/20 ${tag.color}`}
            >
              #{tag.name}
            </span>
          ))}
        </div>
      </div>
    </Tilt>
  </motion.div>
);

const Works = () => {
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = useMemo(() => {
    const allCategories = projects.map((project) => project.category);
    const filtered = allCategories.filter(cat => cat && cat !== "Blogs");
    return ["All", ...new Set(filtered)];
  }, []);

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      if (activeCategory === "All") {
        return project.category !== "Blogs";
      }
      return project.category === activeCategory;
    });
  }, [activeCategory]);

  return (
    <>
      <motion.div variants={textVariant()}>
        <TechHeader title="My Projects" />
      </motion.div>

      {/* Modern Sliding Category Filters (matches ProjectsPage) */}
      <div className="flex flex-wrap gap-3 mt-8 justify-center">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`relative px-5 py-2 rounded-full text-sm font-semibold tracking-wider transition-colors duration-300 ${
              activeCategory === cat
                ? "text-white"
                : "text-secondary bg-tertiary hover:text-white hover:bg-white/10"
            }`}
          >
            {activeCategory === cat && (
              <motion.div
                layoutId="worksCategoryTab"
                className="absolute inset-0 bg-[#915EFF] rounded-full z-0"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{cat}</span>
          </button>
        ))}
      </div>

      {/* Project Grid with Smooth Filtering */}
      <motion.div layout className="mt-12 flex flex-wrap gap-8 justify-center">
        <AnimatePresence mode="popLayout">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project, index) => (
              <ProjectCard
                key={project.name}
                index={index}
                {...project}
              />
            ))
          ) : (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center text-gray-400 w-full"
            >
              No projects found.
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="mt-12 flex justify-center">
        <Link
          to="/projects"
          /* ADDED inline-block HERE to make the entire padded area a clickable hitbox */
          className="inline-block px-8 py-3 bg-[#915EFF] text-white rounded-full font-semibold tracking-wider hover:bg-[#7a4fd0] transition-all duration-300 shadow-[0_0_15px_rgba(145,94,255,0.4)] hover:shadow-[0_0_25px_rgba(145,94,255,0.6)] transform hover:-translate-y-1"
        >
          View All Projects →
        </Link>
      </div>
    </>
  );
};

export default Works;
