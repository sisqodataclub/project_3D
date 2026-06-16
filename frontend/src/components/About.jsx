import React from "react";
import Tilt from "react-parallax-tilt";
import { motion } from "framer-motion";

import { styles } from "../styles";
import { services } from "../constants";
import { SectionWrapper } from "../hoc";
import { fadeIn, textVariant } from "../utils/motion";

const ServiceCard = ({ index, title, description, icon }) => (
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
        className='bg-tertiary rounded-[20px] py-6 px-8 min-h-[320px] flex justify-start items-center flex-col gap-4'
      >
        <img
          src={icon}
          alt={title}
          className='w-16 h-16 object-contain'
        />

        <h3 className='text-white text-[18px] font-bold text-center'>
          {title}
        </h3>
        
        {/* Value-Driven Description */}
        <p className='text-secondary text-[14px] text-center leading-[22px]'>
          {description}
        </p>
      </div>
    </motion.div>
  </Tilt>
);

const About = () => {
  return (
    <>
      <motion.div variants={textVariant()}>
        <p className={styles.sectionSubText}>Introduction</p>
        <h2 className={styles.sectionHeadText}>About Us.</h2>
      </motion.div>

      {/* 🌟 UPGRADED BUSINESS & GROWTH COPY */}
      <motion.div
        variants={fadeIn("", "", 0.1, 1)}
        className='mt-4 text-secondary text-[17px] max-w-3xl leading-[30px] flex flex-col gap-5'
      >
        <p>
          The internet is crowded with "pretty" websites that look great but fail to generate a single pound of revenue. 
          For a small business fighting in a flooded market, a digital storefront that doesn't actively drive sales isn't an asset—it is a liability.
        </p>
        <p>
          That is where a true technical growth partner changes the game. We don't just write code; we engineer the digital 
          foundation your business needs to survive and scale. By bridging the gap between high-performance web design and 
          real business intelligence, the focus shifts from simply "getting online" to taking total control of your growth.
        </p>
        <p>
          This means building lightning-fast, trustworthy websites and plugging them directly into custom, easy-to-read 
          analytics dashboards. From ranking higher on search engines to tracking daily traffic, leads, and profit margins 
          at a glance, you are armed with the exact insights required to stop guessing and start making data-driven decisions.
        </p>
      </motion.div>

      {/* SERVICES MAPPING */}
      <div className='mt-20 flex flex-wrap gap-10'>
        {services.map((service, index) => (
          <ServiceCard key={service.title} index={index} {...service} />
        ))}
      </div>
    </>
  );
};

export default SectionWrapper(About, "about");
