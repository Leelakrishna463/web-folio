function HomeCarousel() {
  return (
    <div className="p-4 flex flex-col h-screen items-center justify-around">
      <h1 className="text-5xl font-sans">lee:~$ history</h1>
      <ul className="h-3/4 timeline timeline-snap-icon max-md:timeline-compact timeline-vertical">
        <li className="h-2/5 ">
          <div className="timeline-middle">
          <img src="images/chennai.svg" className="w-24 mask mask-hexagon"></img>
          </div>
          <div className="timeline-start flex flex-col items-end">
            <time className="font-mono italic">APR 2021 - DEC 2021</time>
            <div className="text-lg font-black">Software Engineer</div>
            <div className="block badge badge-primary">embedUR systems</div>
          </div>
          <hr />
        </li>
        <li className="h-2/5">
          <hr />
          <div className="timeline-middle">
          <img src="images/bangalore.svg" className="w-24 mask mask-hexagon"></img>
          </div>
          <div className="timeline-end flex flex-col items-start">
            <time className="font-mono italic">JAN 2022 - PRESENT</time>
            <div className="text-lg font-black">Software Engineer</div>
            <div className="block badge badge-primary">Decathlon Technology UK</div>
          </div>
          <hr />
        </li>
      </ul>
    </div>
  );
}

export default HomeCarousel;
