import { useRef, useEffect } from "react";
import { useInView, motion } from "framer-motion";

const profileInfo = {
  greetMessage: "Hello!",
  name: "Leelakrishna Thiyagarajan",
  jobBrief: "I Build software for web",
  jobLong:
    "Passionate Software Engineer with 3 years of experience in developing Backend systems",
  residence: "Residing at Bengaluru, India",
  imagePath: "images/ProfileImage.jpeg",
};

const command = { name: "whoami", description: "Know about me" };

function AboutMe({ updateCommand }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { amount: 1 });

  useEffect(() => {
    if (isInView) {
      updateCommand(command);
    }
  }, [isInView]);

  const div_1 = "snap-start snap-always bg-custom";
  const div_2 = "bg-base-200 bg-opacity-[0.98] hero h-svh sm:h-screen text-white";
  const div_3 =
    "hero-content h-4/5 flex-col mt-auto xl:mt-0 xl:flex-row text-sm justify-evenly";
  const img_1 =
    "max-h-[50%] sm:max-w-[50%] sm:max-h-full overflow-auto xl:w-[30%] rounded-full drop-shadow-[0_0_2px_rgba(255,255,255,0.5)]";
  const div_4 = "[text-shadow:0px_0px_0px_rgba(255,255,255,0.5)]";
  const h1_1 = "sm:text-5xl text-3xl font-bold xl:text-left text-center";
  const h2_1 = "pt-6 sm:text-3xl text-lg";
  const p_1 = "py-3 text-lg";
  const p_2 = "xl:text-left text-lg text-center";

  return (
    <div className={div_1}>
      <motion.div className={div_2}>
        <div ref={ref} className={div_3}>
          <motion.img alt="Profile Image" src={profileInfo.imagePath} className={img_1} initial={{ scale: 0 }}
            whileInView={{scale: 1, transition: {type: "spring", delay: 1, bounce: 0.3}}}
            viewport={{once: true}}
          />
          <motion.div className={div_4} initial={{ opacity: 0 }}
            whileInView={{opacity: 1, transition: {type: "spring", delay: 1.2, bounce: 0.2}}}
            viewport={{ amount: 0, once: true }}
          >
            <h1 className={h1_1}>{profileInfo.greetMessage}</h1>
            <h2 className={h2_1}>I am {profileInfo.name}. {profileInfo.jobBrief}</h2>
            <p className={p_1}>{profileInfo.jobLong}</p>
            <p className={p_2}>{profileInfo.residence}</p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

export default AboutMe;
