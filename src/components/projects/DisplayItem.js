import Image from "next/image";
import PropTypes from 'prop-types';

function DisplayItem({displayProps}){
  let rotationMultiplier = 90;
  let rotationAdder = 45;
  // let rotationMultiplier = 60;
  // let rotationAdder = 225;
  let classNameValue = `clip-90 hover:bg-black focus:bg-black rounded-tl-full flex justify-center items-center row-start-1 col-start-1 w-1/2 h-1/2 origin-bottom-right rotate-${((displayProps.index)*rotationMultiplier + rotationAdder)%360}deg custom-animate-rotate-ac-${(360 - (displayProps.index)*60 - 225)%360}-deg`;
  let imageClassNameValue = `w-2/5 h-2/5 flex flex-row rounded-full justify-center items-center custom-animate-rotate-c-${(360 - (displayProps.index)*60 - 225)%360}-deg`;
  return (
    <div tabIndex={`${displayProps.index}`}  className={classNameValue}>
      <div className={imageClassNameValue} style={{transform: `rotate(-${((displayProps.index)*rotationMultiplier + rotationAdder)%360}deg)`}}>
          <span className={`p-auto text-8xl text-white [text-shadow:0px_0px_10px_rgba(255,255,255,0.5)] block devicon-${displayProps.projectName}-plain`} onClick={() => displayProps.onProjectClick(displayProps.projectName)}/>
      </div>
    </div>
  );
}

//text-[#40513B]

DisplayItem.propTypes = { 
  displayProps: PropTypes.shape({
    index: PropTypes.number.isRequired,
    projectAlt: PropTypes.string.isRequired,
    projectImage: PropTypes.object.isRequired,
    onProjectClick: PropTypes.func.isRequired,
    projectName: PropTypes.string.isRequired
  })
}

export default DisplayItem;
