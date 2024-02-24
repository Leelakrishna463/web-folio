import { useInView, motion } from "framer-motion";
import { useRef, useEffect } from "react";


const jobInfo = [
  {
    title: "Software Engineer",
    location: "Chennai",
    period: "APR 2021 - DEC 2021",
    company: "embedUR Systems",
    locationImagePath: "images/ChennaiMonument.svg"
  },
  {
    title: "Software Engineer",
    location: "Bengaluru",
    period: "JAN 2022 - PRESENT",
    company: "Decathlon Technology UK",
    locationImagePath: "images/BengaluruMonument.svg"
  }
]

function WorkHistory({updateCommand}) {

  const ref = useRef(null)
  const isInView = useInView(ref, {amount: 1});

  useEffect(() => {
    if(isInView){
      updateCommand({name: "history | grep 'jobs'", description: "Display places where i worked"})
    }
  }, [isInView])

  return (
    <div ref={ref} className="snap-start snap-always bg-custom">
      <div className="bg-base-200 bg-opacity-[0.98] p-4 text-white-900 hero h-screen sticky">
        <ul className="h-3/4 sm:w-3/4 mt-[20%] sm:mt-0 justify-center timeline timeline-snap-icon  timeline-vertical">
          {
            jobInfo.map((job, index) => {
              let jobInfoClassName = `timeline-${index % 2 == 0 ? 'start items-end' : 'end items-start'}`;
              return (
                <li key={index} className="h-2/5">
                  <motion.hr className="bg-white rounded-none"
                  initial={{scaleY: 0, originY: 0}}
                  whileInView={{
                    scaleY: 1,
                    transition: {
                      delay: 1.5+(index*2),
                      duration: 0.5
                    }
                  }}
                  viewport={{once: true}}
                  />
                  <div className="timeline-middle">
                    <motion.img src={job.locationImagePath} className="w-20 sm:w-24 md:w-28 mask mask-hexagon"
                    initial={{scaleX: 0}}
                    whileInView={{
                      scaleX: 1,
                      transition: {
                        ease: "easeInOut",
                        delay: 2+(index*2),
                        duration: 0.5
                      }
                    }}
                    viewport={{once: true}}
                    />
                  </div>
                  <motion.div className={`${jobInfoClassName} flex flex-col`}
                  initial={index&1 ? {scaleX:0, originX: 0}: {scaleX:0, originX: 1}}
                  whileInView={{
                    scaleX: 1,
                    transition: {
                      ease: "easeInOut",
                      delay: 2.5+(index*2),
                      duration: 0.5
                    }
                  }}
                  viewport={{once: true}}
                  dir="ltr"
                  >
                    <time className="italic sm:text-md md:text-lg lg:text-lg text-xs">{job.period}</time>
                    <div className="sm:text-sm md:text-lg lg:text-lg text-sm">{job.title}</div>
                    <div className="block badge h-full badge-green-500 text-black rounded-none sm:text-sm md:text-lg lg:text-lg text-xs">{job.company}</div>
                  </motion.div>
                  <motion.hr className="bg-white rounded-none"
                  initial={{scaleY: 0, originY: 0}}
                  whileInView={{
                    scaleY: 1,
                    transition: {
                      type: "tween",
                      ease: "easeInOut",
                      delay: 3+(index*2),
                      duration: 0.5
                    }
                  }}
                  viewport={{once: true}}
                  />
                </li>
              )
            })
          }
        </ul>
      </div>
    </div>
  );
}

export default WorkHistory;
