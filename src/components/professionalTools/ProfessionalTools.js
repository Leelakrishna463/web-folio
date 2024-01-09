import ToolItem from "./Tooltem";


function ProfessionalTools() {

  return (
    <div className="snap-end ssticky top-0 custom-background">
    <div className="h-screen flex flex-row justify-end items-end bg-base-200 bg-opacity-[0.98] ssticky top-0">
      <div className="h-3/4 w-full flex flex-row justify-center items-start">
      <div className="aspect-square w-2/5 max-h-full justify-center justify-items-center items-center grid grid-cols-5 grid-rows-4 gap-2">
        <ToolItem />
      </div>
      </div>
    </div>
    </div>
  );
}

export default ProfessionalTools;
