"use client";
import DisplayItem from "./DisplayItem";
import ReactIcon from "devicon/icons/react/react-original.svg";
import DjangoIcon from "devicon/icons/django/django-plain.svg";
import NodejsIcon from "devicon/icons/nodejs/nodejs-original.svg";
import PythonIcon from "devicon/icons/python/python-original.svg";

import { useState } from "react";

let projectData = {
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
};

function Project() {
  const [focusImage, setFocusImage] = useState("Click on any icon");
  const [displayProjectList, setdisplayProjectList] = useState("hidden");
  const [focusedProjects, setFocusedProjects] = useState([]);

  let updateFocusImage = (projectName) => {
    setFocusImage(projectData[projectName].display.name);
    setFocusedProjects(projectData[projectName].projects);
    setdisplayProjectList("block");
  };

  return (
    <div className="snap-end custom-background ssticky top-0">
    <div className="bg-base-200 bg-opacity-[0.98] p-4 hero flex flex-col h-screen items-center justify-around">
      <div className="sm:h-full sm:w-full sm:basis-full sm:flex sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-row justify-around items-center w-full h-3/4 overflow-hidden">
          <div className="grid grid-cols-1 grid-rows-1 h-3/4 aspect-square">
            {Object.keys(projectData).map((key, index) => {
              let displayProjectProps = {
                index: index,
                projectName: projectData[key].display.name,
                projectAlt: projectData[key].display.altText,
                projectImage: projectData[key].display.image,
                onProjectClick: updateFocusImage,
              };
              return (
                <DisplayItem key={key} displayProps={displayProjectProps} />
              );
            })}

            <div className="place-self-center z-10 bg-green-500 flex justify-center items-center row-start-1 col-start-1 h-2/5 aspect-square rounded-full origin-bottom-right">
              {focusImage && (
                <span className={`animate-jump-in-1s p-auto text-8xl text-black [text-shadow:0px_0px_10px_rgba(0,0,0,0.5)] block devicon-${focusImage}-plain`}/>
              )}
            </div>
          </div>

          <div className={`${displayProjectList} basis-2/5 flex flex-col justify-center items-center h-3/4`}>
          <div className="p-4 mb-4 w-full sticky glass text-black text-3xl font-bold bg-white text-center">Projects</div>
            <div className="w-full overflow-y-auto max-h-[75%] no-scrollbar">
              {focusedProjects.map((project) => (
                <div key={project["title"]} className="collapse border-2 mb-1 rounded-none bg-base-200">
                  <input type="checkbox" defaultValue={false} />
                  <div className="collapse-title text-2xl text-center font-medium">
                    {project["title"]}
                  </div>
                  <div className="collapse-content">
                    <p className="text-lg">{project["description"]}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}

export default Project;
