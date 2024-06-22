import { useMotionValue, animate, useTransform, motion } from "framer-motion";
import { useEffect, useState } from "react";

const domainName = "spiritwing.io:~";

const cursorVariants = {
	blinking: {
		opacity: [0, 0, 1, 1],
		transition: {
			duration: 1,
			repeat: Infinity,
			repeatDelay: 0,
			ease: "linear",
			times: [0, 0.5, 0.5, 1]
		}
	}
};

function Terminal({commandInfo}) {
	const count = useMotionValue(0);

	const rounded = useTransform(count, (latest) => Math.round(latest));
	const displayText = useTransform(rounded, (latest) => commandInfo.name.slice(0, latest));

	useEffect(() => {
		count.set(0);
		const controls = animate(count, commandInfo.name.length, {
			type: "tween",
			duration: 1,
			ease: "easeInOut",
		});
		return controls.stop;
	}, [commandInfo.name]);


	const div_1 = "w-full sm:w-1/2 sm:translate-x-1/2 border-2 border-green-500 mt-4 fixed z-20 mockup-code bg-base-200 text-base-500 overflow-visible";
	const pre_1 = "pl-5 sm:text-md md:text-md lg:text-lg text-green-500 flex flex-row justify-between";
	const code_1 = "mt-auto overflow-auto text-md md:text-xl lg:text-xl mr-4";
	const code_2 = "bg-green-500";
	const span_1 = "mr-2";
	const div_2 = "tooltip tooltip-bottom text-green-500 before:-translate-x-[95%] before:translate-y-[20%] before:active:block before:hidden sm:before:hover:block select-none after:hidden after:active:inline";
	const kbd_1 = "kbd kbd-md self-end bg-slate-900"

	return (
		<div className={div_1}>
			<pre className={pre_1}>
				<code className={code_1}>
				<span className={span_1}>{domainName}</span>
				<motion.span>{displayText}</motion.span>
				<motion.code variants={cursorVariants} animate="blinking" className={code_2}>_</motion.code>
				</code>
				<div className={div_2} data-tip={commandInfo.description}>
  					<kbd className={kbd_1}>?</kbd>
				</div>
			</pre>
		</div>
	);
}




export default Terminal;
