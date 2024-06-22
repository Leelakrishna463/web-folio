import { useInView, motion } from "framer-motion";
import { useRef, useEffect } from "react";
import { contactInfo } from "@/data/appInfo";


function Contact({ updateCommand }) {

	const ref = useRef(null)
	const isInView = useInView(ref, { amount: 1 });

	useEffect(() => {
		if (isInView) {
			updateCommand({name: "cat contact.txt", description: "How can you contact me ?"})
		}
	}, [isInView])

	return (
		<div ref={ref} className="snap-start snap-always bg-custom ">
			<div className="h-screen bg-base-200 bg-opacity-[0.98] text-white">
				<motion.div className="flex flex-col justify-center items-center h-full" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.5, delay: 1.5 }} viewport={{amount: 1, once: true}}>
					<motion.div initial={{ width: '50%' }} whileInView={{ width: 'auto' }} transition={{ delay: 3 }} viewport={{once: true}} className="grid grid-cols-2 justify-items-center align-center">
						<div key='gmail' className="avatar">
							<div className="w-24 p-[2px] h-24 hover:drop-shadow-[0_0_5px_rgba(255,255,255,1)]">
								<a href={contactInfo.contacts[0]['hyperlink']}>
									<img src="images/GmailIcon.svg" className="rounded-lg" alt="gmail_icon" />
								</a>
							</div>
						</div>
						<div key='linkedin' className="avatar">
							<div className="w-24 hover:drop-shadow-[0_0_5px_rgba(255,255,255,1)]">
								<a href={contactInfo.contacts[1]['hyperlink']} target="_blank">
									<span className="p-auto text-8xl text-[#fef9ff] block devicon-linkedin-plain" alt="linkedin_icon" />
								</a>
							</div>
						</div>
					</motion.div>
				</motion.div>
			</div>
		</div>
	)
}

export default Contact;
