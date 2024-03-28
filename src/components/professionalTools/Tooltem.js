import { motion } from "framer-motion";
import { useRef, useLayoutEffect, useEffect } from "react";

  const itemVariants = {
    hidden: {
      opacity: 0,
      scale: 0.5
    },
    visible: delayRef => ({
      opacity: 1,
      scale: 1,
      transition: { delay: 1.5+delayRef.current }
    })
  };


function ToolItem({toolName, i, originIndex, delayPerPixel, originOffset}) {

  const delayRef = useRef(0);
  const offset = useRef({ top: 0, left: 0 });
  const ref = useRef();

  // The measurement for all elements happens in the layoutEffect cycle
  // This ensures that when we calculate distance in the effect cycle
  // all elements have already been measured
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    offset.current = {
      top: element.offsetTop,
      left: element.offsetLeft
    };

    if (i === originIndex) {
      originOffset.current = offset.current;
    }
  }, [delayPerPixel]);

  useEffect(() => {
    const dx = Math.abs(offset.current.left - originOffset.current.left);
    const dy = Math.abs(offset.current.top - originOffset.current.top);
    const d = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
    delayRef.current = d * delayPerPixel;
  }, [delayPerPixel]);

  // const div_2 = "tooltip tooltip-bottom text-green-500 before:-translate-x-[95%] before:translate-y-[20%] before:active:block before:hidden sm:before:hover:block select-none after:hidden after:active:inline";

  return(
    <motion.div ref={ref} variants={itemVariants} key={toolName} custom={delayRef} className="avatar">
      <div className="sm:w-24 w-20 text-center">
          <motion.span className={`p-auto sm:text-8xl md:text-7xl text-[#fef9ff] block devicon-${toolName}-plain`} />
          <motion.span className="inline-block capitalize text-sm">{toolName}</motion.span>
      </div>
    </motion.div>
  )
}

export default ToolItem;
