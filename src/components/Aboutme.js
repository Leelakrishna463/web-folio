import { useRef, useEffect } from "react";
import { useInView, motion } from "framer-motion";

const profileInfo = {
  "greetMessage": "Hello!",
  "name": "Leelakrishna Thiyagarajan",
  "jobBrief": "I Build software for web",
  "jobLong": "Passionate Software Engineer with 2 years of experience in developing Backend systems",
  "residence": "Residing at Bengaluru, India",
  "imagePath": "images/ProfileImage.jpeg"
}




function AboutMe({updateCommand}) {
  const ref = useRef(null)
  const isInView = useInView(ref, {amount: 1});

  useEffect(() => {
    if(isInView){
      updateCommand({name: "whoami", description: "Know about me"});
    }
  }, [isInView])

  return (
    <div ref={ref} className="snap-start snap-always bg-custom">
      <motion.div className="bg-base-200 bg-opacity-[0.98] hero h-screen text-white">
        <div className="hero-content h-4/5 flex-col mt-auto xl:mt-0 xl:flex-row text-sm justify-evenly">
          <motion.img alt="Profile Image" src={profileInfo.imagePath} className="max-h-[50%] sm:max-w-[50%] sm:max-h-full overflow-auto xl:w-[30%] rounded-full drop-shadow-[0_0_2px_rgba(255,255,255,0.5)]"
          initial={{scale: 0}}
          whileInView={{
            scale: 1,
            transition: {
              type: "spring",
              delay: 1,
              bounce: 0.3
            }
          }}
          viewport={{once: true}}
          />
          <motion.div className="[text-shadow:0px_0px_0px_rgba(255,255,255,0.5)]"
          initial= {{opacity: 0}}
          whileInView={{
            opacity: 1,
            transition: {
              type: "spring",
              delay: 1.2,
              bounce: 0.2
            }
          }}
          viewport={{amount: 0, once: true}}
          >
            <h1 className="sm:text-5xl text-3xl font-bold xl:text-left text-center">{profileInfo.greetMessage}</h1>
            <h2 className="pt-6 sm:text-3xl text-lg">I am {profileInfo.name}. {profileInfo.jobBrief}</h2>
            <p className="py-3 text-lg ">{profileInfo.jobLong}</p>
            <p className="xl:text-left text-lg text-center">{profileInfo.residence}</p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

export default AboutMe;
