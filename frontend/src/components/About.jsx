import React from "react";
import Tilt from "react-parallax-tilt";
import { motion } from "framer-motion";

import { styles } from "../styles";
import { services } from "../constants";
import { SectionWrapper } from "../hoc";
import { fadeIn, textVariant } from "../utils/motion";

const ServiceCard = ({ index, title, icon }) => (
  <Tilt className='xs:w-[250px] w-full'>
    <motion.div
      variants={fadeIn("right", "spring", index * 0.5, 0.75)}
      className='w-full green-pink-gradient p-[1px] rounded-[20px] shadow-card'
    >
      <div
        options={{
          max: 45,
          scale: 1,
          speed: 450,
        }}
        className='bg-tertiary rounded-[20px] py-5 px-12 min-h-[280px] flex justify-evenly items-center flex-col'
      >
        <img
          src={icon}
          alt='web-development'
          className='w-16 h-16 object-contain'
        />

        <h3 className='text-white text-[20px] font-bold text-center'>
          {title}
        </h3>
      </div>
    </motion.div>
  </Tilt>
);

const About = () => {
  return (
    <>
      <motion.div variants={textVariant()}>
        <p className={styles.sectionSubText}>Introduction</p>
        <h2 className={styles.sectionHeadText}>About.</h2>
      </motion.div>

      {/* 🌟 UPGRADED BUSINESS & GROWTH COPY */}
      <motion.div
        variants={fadeIn("", "", 0.1, 1)}
        className='mt-4 text-secondary text-[17px] max-w-3xl leading-[30px] flex flex-col gap-5'
      >
        <p>
          The internet is full of pretty websites that don't bring in a single dollar. 
          For a small business, a website that doesn't generate revenue is a liability.
        </p>
        <p>
          My job is to make sure your business thrives. I build the digital foundation you need to 
          survive and scale. Yes, I build beautiful, fast websites—but I also plug them into real 
          business intelligence. I help you rank higher on Google so customers can actually find you.
        </p>
        <p>
          Then, I build custom, easy-to-use dashboards so you can track your daily traffic, leads, 
          and sales at a glance. I give you the insights you need to stop guessing and start making 
          confident decisions that keep your business growing.
        </p>
      </motion.div>

      <div className='mt-20 flex flex-wrap gap-10'>
        {services.map((service, index) => (
          <ServiceCard key={service.title} index={index} {...service} />
        ))}
      </div>
    </>
  );
};

export default SectionWrapper(About, "about");
