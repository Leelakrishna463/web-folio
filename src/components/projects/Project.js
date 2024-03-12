"use client";

import { useInView, motion, AnimatePresence } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import DisplayItem from "./DisplayItem";
import ReactIcon from "devicon/icons/react/react-original.svg";
import DjangoIcon from "devicon/icons/django/django-plain.svg";
import NodejsIcon from "devicon/icons/nodejs/nodejs-original.svg";
import PythonIcon from "devicon/icons/python/python-original.svg";

let projectInfo = {
  displayTitle: "Projects",
  projects: {
    python: {
      display: {
        image: PythonIcon,
        altText: "Icon of Python programming language",
        name: "python",
      },
      projects: [
        {
          title: "Single Layer Perceptron",
          description: "A simple ML model that can identify whether a given fruit is Orange or Apple based on the texture",
          hyperlink: "https://github.com/Leelakrishna463/Perceptron"
        }
      ]
    },
    django: {
      display: {
        image: DjangoIcon,
        altText: "Icon of Django framework",
        name: "django",
      },
      projects: [
        {
          title: "sw-marshal",
          description: "SpiritWing-Marshal - A personal life organization tool that contains personal passwords and more",
          hyperlink: "https://github.com/Leelakrishna463/sw_marshal"
        },
      ]
    },
    react: {
      display: {
        image: ReactIcon,
        altText: "Icon of ReactJs Library",
        name: "react"
      },
      projects: [
        {
          title: "web-folio",
          description: "Portfolio website that exhibit about me and my professional carrier",
          hyperlink: "https://github.com/Leelakrishna463/web-folio"
        }
      ]
    },
    nodejs: {
      display: {
        image: NodejsIcon,
        altText: "Icon of NodeJs Environment",
        name: "nodejs",
      },
      projects: [
        {
          title: "Algo-run API",
          description: "Backend Rest API to explore search and sort algorithms.",
          hyperlink: "https://github.com/Leelakrishna463/algo-run-api"
        }
      ],
    }
  }
};

function Project({updateCommand}) {

  const ref = useRef(null)
  const isInView = useInView(ref, {amount: 1});

  useEffect(() => {
    if(isInView){
      updateCommand({name: "cd projects & ls", description: "Lists technical projects done by me"});
    }
  }, [isInView]);

  const [focusImage, setFocusImage] = useState("");
  const [displayProjectList, setDisplayProjectList] = useState("hidden");
  const [focusedProjects, setFocusedProjects] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  let updateFocusImage = (projectName) => {
    setFocusImage(projectInfo.projects[projectName].display.name);
    setFocusedProjects(projectInfo.projects[projectName].projects);
    setDisplayProjectList("block");
    setIsOpen(true);
  };

  return (
    <div ref={ref} className="snap-start snap-always bg-custom">
      <div className="bg-base-200 bg-opacity-[0.98] p-4 hero flex flex-col h-screen items-center justify-around">
        <motion.div className="h-full w-full basis-full flex flex-row items-center justify-between"
          initial={{opacity: 0}}
          whileInView={{
            opacity: 1
          }}
          transition={{
            delay: 1.5,
            duration: 1,
            type: "spring",
          }}
          viewport={{amount: 1, once: true}}
        >
          <div className="flex sm:flex-row flex-col  justify-center items-center w-full h-3/4 overflow-hidden">
            <div className="grid grid-cols-1 grid-rows-1 sm:h-3/4 h-3/5 min-h-[50%] aspect-square">
              {Object.keys(projectInfo.projects).map((key, index) => {
                let displayProjectProps = {
                  index: index,
                  projectName: projectInfo.projects[key].display.name,
                  projectAlt: projectInfo.projects[key].display.altText,
                  projectImage: projectInfo.projects[key].display.image,
                  onProjectClick: updateFocusImage,
                  rotated: focusImage === "" ? 'inital': 'rotated'
                };
                return (
                  <DisplayItem key={key} displayProps={displayProjectProps} />
                );
              })}

              <div className="place-self-center z-10 bg-green-500 flex justify-center items-center row-start-1 col-start-1 h-2/5 aspect-square rounded-full origin-bottom-right">
                {
                focusImage ?
                <span className={`animate-jump-in-1s p-auto md:text-8xl text-6xl text-black [text-shadow:0px_0px_10px_rgba(0,0,0,0.5)] block devicon-${focusImage}-plain`} /> :
                <span className="font-bold md:text-3xl text-md text-center text-wrap text-black [text-shadow:0px_0px_10px_rgba(0,0,0,0.5)]">Click on any icon</span>
                }
              </div>
            </div>

            <AnimatePresence>
              {isOpen && 
            <motion.div layout="preserve-aspect" className="flex flex-col justify-center items-center h-3/4 sm:max-h-[75%] max-h-[50%]"
              transition={{
                duration: 1,
                delay: 1
              }}
              initial={{width: 0, flexBasis: 0, opacity: 0, transformOrigin: 'center'}}
              animate={{width: 'auto', flexBasis: '40%', opacity: 1}}
            >
              <div className="p-4 mb-4 w-full sticky glass text-black sm:text-3xl text-2xl font-bold bg-white text-center">{projectInfo.displayTitle}</div>
              <div className="w-full overflow-y-auto max-h-[100%] sm:max-h-[30%] min-h-fit no-scrollbar">
                {focusedProjects.map((project) => (
                  <div key={project["title"]} className="collapse border-2 mb-1 rounded-none bg-base-200">
                    <input type="checkbox" defaultValue={false} />
                    <div className="truncate collapse-title sm:text-2xl text-xl text-center ">
                      {project["title"]}
                    </div>
                    <div className="collapse-content">
                      <p className="sm:text-lg text-md">{project["description"]}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          }
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Project;
