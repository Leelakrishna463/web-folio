import ToolItem from "./ToolItem";


function ProfessionalTools() {

  return (
    <div className="h-screen flex flex-row justify-center items-center bg-lime-800">
      <div className="h-3/4 aspect-square justify-center justify-items-center items-center grid grid-cols-5 grid-rows-5 gap-2">
        <ToolItem />
      </div>
    </div>
  );
}

export default ProfessionalTools;
