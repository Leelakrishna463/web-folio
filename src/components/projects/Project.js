"use client";
import Image from "next/image";
import DisplayItem from "./DisplayItem";
import ReactIcon from "devicon/icons/react/react-original.svg";
import DjangoIcon from "devicon/icons/django/django-plain.svg";
import NodejsIcon from "devicon/icons/nodejs/nodejs-original.svg";
import PythonIcon from "devicon/icons/python/python-original.svg";

import { useState } from "react";

let projectData = {
  django: {
    display: {
      image: DjangoIcon,
      altText: "Icon of Django framework",
      name: "django",
    },
    projects: [
      {
        title: "sw-marshal",
        description: "sw-marshal description",
      },
    ],
  },
  react: {
    display: {
      image: ReactIcon,
      altText: "Icon of ReactJs Library",
      name: "react",
    },
    projects: [
      {
        title: "web-folio",
        description: "web-folio description",
      },
    ],
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
        description: "algo-run api description",
      },
    ],
  },
  python: {
    display: {
      image: PythonIcon,
      altText: "Icon of Python programming language",
      name: "python",
    },
    projects: [
      {
        title: "Single Layer Perceptron",
        description: "single layer perceptron description",
      },
      {
        title: "a",
        description: "single layer perceptron description",
      },
      {
        title: "b",
        description: "single layer perceptron description",
      },
      {
        title: "c",
        description: "single layer perceptron description",
      },
      {
        title: "d",
        description: "single layer perceptron description",
      },
      {
        title: "e",
        description: "single layer perceptron description",
      },
      {
        title: "f",
        description: "single layer perceptron description",
      },
      {
        title: "g",
        description: "single layer perceptron description",
      },
      {
        title: "h",
        description: "single layer perceptron description",
      },
    ],
  },
};

function Project() {
  const [focusImage, setFocusImage] = useState("");
  const [displayProjectList, setdisplayProjectList] = useState("hidden");
  const [focusedProjects, setFocusedProjects] = useState([]);

  let updateFocusImage = (projectName) => {
    setFocusImage(projectData[projectName].display.image);
    setFocusedProjects(projectData[projectName].projects);
    setdisplayProjectList("block");
  };

  return (
    <div className="p-4 flex flex-col h-screen items-center justify-around">
      <h1 className="text-5xl font-sans m-4">lee:~$ history</h1>
      <div className="sm:h-full sm:w-full sm:basis-full sm:flex sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-row justify-around items-center drop-shadow-[0px_0px_2px_rgba(0,0,0,0.5)] w-full h-full overflow-hidden">
          <div className="grid grid-cols-1 grid-rows-1 basis-2/5 aspect-square">
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

            <div className="place-self-center z-10 bg-slate-600 flex justify-center items-center  border-2 row-start-1 col-start-1 h-2/5 aspect-square rounded-full origin-bottom-right">
              {focusImage && (
                <Image
                  src={focusImage}
                  key={Math.random()}
                  alt=""
                  className="animate-jump-in-1s w-2/3 h-2/3"
                />
              )}
            </div>
          </div>

          <div className={`${displayProjectList} basis-2/5 flex flex-col justify-center items-center aspect-square`}>
          <div className="p-4 mb-4 w-full sticky glass text-center">asdf</div>
            <div className="w-full overflow-y-scroll overflow-x-clip  max-h-[75%] no-scrollbar">
              {focusedProjects.map((project) => (
                <div key={project["title"]} className="collapse border-2 mb-1 border-amber-300 bg-base-200">
                  <input type="checkbox" defaultValue={false} />
                  <div className="collapse-title text-xl font-medium">
                    {project["title"]}
                  </div>
                  <div className="collapse-content">
                    <p>{project["description"]}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Project;