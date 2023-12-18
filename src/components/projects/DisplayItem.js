import Image from "next/image";
import PropTypes from 'prop-types';

function DisplayItem({displayProps}){
  let classNameValue = `clip-90 hover:bg-red-300 focus:bg-red-300 flex justify-center row-start-1 col-start-1 w-1/2 h-1/2 rounded-tl-full origin-bottom-right -rotate-${displayProps.index*45}deg`;
  let imageClassNameValue = `w-2/5 h-2/5`;
  return (
    <div tabIndex={`${displayProps.index}`}  className={classNameValue}>
      <div className={imageClassNameValue} style={{transform: `translateX(50%) translateY(25%) rotate(${displayProps.index*45}deg)`}}>
        <Image
          alt={displayProps.projectAlt}
          src={displayProps.projectImage}
          priority={false}
          className="w-full h-full"
          onClick={() => displayProps.onProjectClick(displayProps.projectName)}
        />
      </div>
    </div>
  );
}

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
