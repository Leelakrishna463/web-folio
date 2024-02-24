import { useMotionValue, animate, useTransform } from "framer-motion";
import { useEffect, useState } from "react";

const domainName = "spirit-wing.info";
const terminalUser = `user@${domainName} ~ %`


import { motion } from "framer-motion";

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

	return (
		<div className="sm:w-1/2 sm:translate-x-1/2 w-screen border-2 border-green-500 mt-4 fixed z-20 mockup-code bg-base-200 text-base-500 overflow-visible">
			<pre className="pl-4 text-2xl text-green-500 flex flex-row justify-between">
				<code className="mt-auto overflow-scroll text-base sm:text-2xl mr-4">
				<span className="mr-2">spiritwing.io:~</span>
				<motion.span>{displayText}</motion.span>
				<motion.code variants={cursorVariants} animate="blinking" className="bg-green-500">_</motion.code>
				</code>
				<div className="tooltip tooltip-bottom text-green-500 text-wrap before:-translate-x-[95%] before:translate-y-[20%] before:active:block before:hidden sm:before:hover:block select-none after:hidden after:active:inline" data-tip={commandInfo.description}>
  					<kbd className="kbd kbd-md self-end bg-slate-900">?</kbd>
				</div>
			</pre>
		</div>
	)
}

export default Terminal;