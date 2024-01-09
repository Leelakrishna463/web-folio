
const jobs = [
  {
    title: "Software Engineer",
    location: "Chennai",
    period: "APR 2021 - DEC 2021",
    company: "embedUR Systems"
  },
  {
    title: "Software Engineer",
    location: "Bengaluru",
    period: "JAN 2022 - PRESENT",
    company: "Decathlon Technology UK"
  }
]

function WorkHistory() {
  return (
    <div className="custom-background snap-start ssticky top-0">
    <div className="bg-base-200 bg-opacity-[0.98] p-4 text-white-900 hero h-screen sticky">
      <ul className="h-3/4 w-3/4 justify-center timeline timeline-snap-icon max-md:timeline-compact timeline-vertical">
        {
          jobs.map((job, index) => {
            let jobInfoClassName = `timeline-${index%2 == 0 ? 'start items-end': 'end items-start'}`;
            return (
              <li key={index} className="h-2/5">
                <hr className="bg-white rounded-none"/>
                <div className="timeline-middle">
                  <img src={`images/${job.location}Monument.svg`} className="w-36 mask mask-hexagon" />
                </div>
                <div className={`${jobInfoClassName} flex flex-col`}>
                  <time className="font-mono italic">{job.period}</time>
                  <div className="text-2xl">{job.title}</div>
                  <div className="block badge h-full badge-green-500 text-black rounded-none text-xl">{job.company}</div>
                </div>
                <hr className="bg-white rounded-none" />
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
