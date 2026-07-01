// src/components/Works.jsx
import React, { useState, useMemo } from "react";
import Tilt from "react-parallax-tilt";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import { styles } from "../styles";
import { github } from "../assets";
import { textVariant, fadeIn } from "../utils/motion";
import { projects } from "../constants";
import TechHeader from "../components/TechHeader";

const ProjectCard = ({ index, name, description, tags, image, source_code_link }) => (
  <motion.div variants={fadeIn("up", "spring", index * 0.5, 0.75)}>
    <Tilt
      options={{ max: 45, scale: 1, speed: 450 }}
      className="bg-tertiary p-5 rounded-2xl sm:w-[360px] w-full"
    >
      {/* Card clickable wrapper */}
      <div
        onClick={() => window.open(source_code_link, "_blank")}
        className="cursor-pointer"
      >
        <div className="relative w-full h-[230px]">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover rounded-2xl"
          />
          <div className="absolute inset-0 flex justify-end m-3 card-img_hover">
            <div
              onClick={(e) => {
                e.stopPropagation();
                window.open(source_code_link, "_blank");
              }}
              className="black-gradient w-10 h-10 rounded-full flex justify-center items-center cursor-pointer"
            >
              <img src={github} alt="source code" className="w-1/2 h-1/2 object-contain" />
            </div>
          </div>
        </div>

        <div className="mt-5">
          <h3 className="text-white font-bold text-[24px]">{name}</h3>
          <p className="mt-2 text-secondary text-[14px]">{description}</p>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <p key={`${name}-${tag.name}`} className={`text-[14px] ${tag.color}`}>
              #{tag.name}
            </p>
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
  }, [activeCategory, projects]);

  return (
    <>
      <motion.div variants={textVariant()}>
        <TechHeader title="My Projects" />
      </motion.div>

      <div className="mt-6 mb-10 flex flex-wrap gap-4 justify-center">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
              activeCategory === cat
                ? "bg-[#915EFF] text-white"
                : "bg-white text-[#915EFF] border border-[#915EFF] hover:bg-[#f0eaff]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-7 justify-center">
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project, index) => (
            <ProjectCard
              key={project.name}
              index={index}
              {...project}
            />
          ))
        ) : (
          <p className="text-center text-gray-400">No projects found.</p>
        )}
      </div>

      <div className="mt-12 flex justify-center">
        <Link
          to="/projects"
          className="px-8 py-3 bg-[#915EFF] text-white rounded-xl font-medium hover:bg-[#7a4fd0] transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          View All Projects →
        </Link>
      </div>
    </>
  );
};

export default Works;
