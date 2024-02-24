import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { useState, useReducer, useEffect } from 'react';


const containerVariants = {
  initial: (index) => ({
    rotateZ: (index*90+45)%360,
  }),
  rotated: (index) => ({
    rotateZ: -(360 - index*60 - 225)%360 + 0,
    transition: {
      duration: 1
    }
  })
}

const iconVariants = {
  initial: (index) => ({
    rotateZ: -(index*90+45)%360
  }),
  rotated: (index) =>({
    rotateZ: (360 - (index)*60 - 225)%360 - 0,
    transition: {
      duration: 1
    }
  })
}


function DisplayItem({displayProps}){

  return (
    <motion.div
      tabIndex={`${displayProps.index}`}
      custom={displayProps.index}
      initial="initial"
      variants={containerVariants}
      animate={displayProps.rotated}
      className="clip-90 hover:bg-black focus:bg-black rounded-tl-full flex justify-center items-center row-start-1 col-start-1 w-1/2 h-1/2 origin-bottom-right"
    >
      <motion.div
        className="w-2/5 h-2/5 flex flex-row rounded-full justify-center items-center"
        custom={displayProps.index}
        initial="initial"
        animate={displayProps.rotated}
        variants={iconVariants}
      >
          <motion.span
            className={`p-auto md:text-8xl text-6xl text-white [text-shadow:0px_0px_10px_rgba(255,255,255,0.5)] block devicon-${displayProps.projectName}-plain`}
            whileTap={
              () => {displayProps.onProjectClick(displayProps.projectName);}
            }
          />
      </motion.div>
    </motion.div>
  );
}

//text-[#40513B]

DisplayItem.propTypes = { 
  displayProps: PropTypes.shape({
    index: PropTypes.number.isRequired,
    projectAlt: PropTypes.string.isRequired,
    projectImage: PropTypes.object.isRequired,
    onProjectClick: PropTypes.func.isRequired,
    projectName: PropTypes.string.isRequired,
    rotated: PropTypes.string.isRequired
  })
}

export default DisplayItem;
