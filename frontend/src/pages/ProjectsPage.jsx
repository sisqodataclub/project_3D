// src/pages/ProjectsPage.jsx
import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Tilt from "react-parallax-tilt";
import { projects } from "../constants";
import { github } from "../assets";
import { styles } from "../styles";
import { textVariant, fadeIn } from "../utils/motion";
import { SectionWrapper } from "../hoc";

const ProjectCard = ({ index, name, description, tags, image, source_code_link }) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    transition={{ duration: 0.3 }}
    className="w-full h-full"
  >
    <Tilt
      options={{ max: 45, scale: 1, speed: 450 }}
      className="bg-tertiary p-5 rounded-2xl w-full h-full flex flex-col border border-white/10 hover:border-white/20 transition-colors cursor-pointer"
      onClick={() => window.open(source_code_link, "_blank")}
    >
      <div className="relative w-full h-[230px] rounded-2xl overflow-hidden group">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-in-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-50" />

        <div className="absolute inset-0 flex justify-end m-3">
          <div
            onClick={(e) => {
              e.stopPropagation();
              window.open(source_code_link, "_blank");
            }}
            className="black-gradient w-10 h-10 rounded-full flex justify-center items-center cursor-pointer shadow-lg hover:scale-110 hover:shadow-[#915EFF]/50 transition-all duration-300"
          >
            <img src={github} alt="source code" className="w-1/2 h-1/2 object-contain" />
          </div>
        </div>
      </div>

      <div className="mt-5 flex-grow">
        <h3 className="text-white font-bold text-[24px]">{name}</h3>
        <p className="mt-2 text-secondary text-[14px] line-clamp-3 leading-relaxed">
          {description}
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag.name}
            className={`text-[13px] font-medium px-2 py-1 rounded-md bg-black/20 ${tag.color}`}
          >
            #{tag.name}
          </span>
        ))}
      </div>
    </Tilt>
  </motion.div>
);

const ProjectsPage = () => {
  const [activeCategory, setActiveCategory] = useState("All");

  // Get unique categories, excluding "Blogs"
  const categories = useMemo(() => {
    const allCategories = projects.map((project) => project.category);
    const filtered = allCategories.filter(cat => cat && cat !== "Blogs");
    return ["All", ...new Set(filtered)];
  }, []);

  // Filter projects: exclude "Blogs" when "All" is selected
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      if (activeCategory === "All") {
        return project.category !== "Blogs";
      }
      return project.category === activeCategory;
    });
  }, [activeCategory, projects]);

  return (
    <div className="bg-primary min-h-screen py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div variants={textVariant()}>
          <p className={styles.sectionSubText}>My Portfolio</p>
          <h2 className={styles.sectionHeadText}>Projects.</h2>
        </motion.div>

        {/* Modern Sliding Category Filters */}
        <div className="flex flex-wrap gap-3 mt-8 justify-center lg:justify-start">
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
                  layoutId="activeCategoryTab"
                  className="absolute inset-0 bg-[#915EFF] rounded-full z-0"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{cat}</span>
            </button>
          ))}
        </div>

        {/* Project Grid with AnimatePresence for smooth filtering */}
        <motion.div layout className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project, index) => (
                <ProjectCard key={project.name || index} index={index} {...project} />
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="col-span-full flex flex-col items-center justify-center py-20"
              >
                <div className="w-16 h-16 mb-4 rounded-full bg-tertiary flex items-center justify-center">
                  <span className="text-2xl">🔍</span>
                </div>
                <p className="text-secondary text-lg">No projects found in this category.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default ProjectsPage;
