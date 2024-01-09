

function AboutMe() {
  return (
    <div className="snap-start ssticky top-0 custom-background" id="about-me">
      <div className="bg-base-200 bg-opacity-[0.98] hero h-screen text-white">
        <div className="hero-content flex-col lg:flex-row">
          <img src="images/ProfileImage.jpeg" className="max-w-sm rounded-full drop-shadow-[0_0_2px_rgba(255,255,255,0.5)]" />
          <div className="[text-shadow:0px_0px_0px_rgba(255,255,255,0.5)]">
          <h1 className="text-5xl font-bold ">Hello!</h1>
          <h2 className="pt-6 text-3xl"> I am Leelakrishna Thiyagarajan. I build software for web</h2>
          <p className="py-3 text-lg">
            23 years old passionate Software Engineer with 2 years of experience in developing Backend systems.
          </p>
          <p>
          Residing at Bengaluru, India
          </p>
          </div>
        </div>
      </div>
      </div>
  );
}

export default AboutMe;
