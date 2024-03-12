import ToolItem from "./Tooltem";
import { useInView, motion, useAnimation } from "framer-motion";
import { useRef, useEffect } from "react";

const tools = [
  {name: 'apachekafka'},
  {name : 'bash'},
  {name: 'css3'},
  {name: 'django'},
  {name: 'docker'},
  {name: 'fastapi'},
  {name: 'firebase'},
  {name: 'flask'},
  {name: 'git'},
  {name: 'html5'},
  {name: 'javascript'},
  {name: 'nextjs'},
  {name: 'nodejs'},
  {name: 'postgresql'},
  {name: 'python'},
  {name: 'react'},
  {name: 'redis'},
  {name: 'tailwindcss'},
  {name: 'pytest'},
]

function ProfessionalTools({ updateCommand }) {

  const ref = useRef(null);
  const originOffset = useRef({ top: 0, left: 0 });
  const isInView = useInView(ref, {amount: 1});
  const controls = useAnimation();

  useEffect(() => {
    if(isInView){
      updateCommand({name: "unzip my_tools.zip", description: "Familiar Framerworks and languages"})
      controls.start("visible");
    }
  }, [isInView])

  return (
    <div ref={ref} className="snap-start snap-always bg-custom">
      <div className="h-screen flex flex-row justify-end items-end bg-base-200 bg-opacity-[0.98] ">
        <div className="h-3/4 w-full flex flex-row justify-center items-start">
          <motion.div className="sm:aspect-square sm:w-2/5 max-h-full justify-center justify-items-center items-center grid sm:grid-cols-5 sm:grid-rows-4 grid-cols-4 grid-rows-6 gap-2"
          initial="hidden" animate={controls}
          >
            {
              tools.map((tool, i) => {
                return (<ToolItem key={i}
                  i={i}
                  originIndex={0}
                  delayPerPixel={0.0005}
                  originOffset={originOffset} toolName={tool.name}/>)
              })
            }
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default ProfessionalTools;
