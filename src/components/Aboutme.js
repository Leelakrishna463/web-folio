function HomeCarousel() {
  return (
    // <div className="custom-background flex flex-row h-screen items-center justify-center">
    //   <div className="h-3/4 basis-full flex flex-row items-center">
    //     <img
    //       src="images/best_one_2.jpeg"
    //       className="drop-shadow-[0px_0px_15px_rgba(0,0,0,0.75)] h-2/3 basis-1/5 rounded-full m-auto"
    //     />
    //     <div className="flex items-center custom-background-2 drop-shadow-[0px_0px_10px_rgba(0,0,0,0.5)] basis-3/4 h-4/5 ml-auto rounded-tl-full rounded-bl-full">
    //       <p className="ml-auto basis-11/12">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum</p>
    //     </div>
    //   </div>
    // </div>
  <div className="hero h-screen bg-base-200">
  <div className="hero-content flex-col lg:flex-row">
    <img src="images/best_one_2.jpeg" className="max-w-sm rounded-full shadow-2xl" />
    <div>
      <h1 className="text-5xl font-sans">whoami</h1>
      <p className="py-6">Provident cupiditate voluptatem et in. Quaerat fugiat ut assumenda excepturi exercitationem quasi. In deleniti eaque aut repudiandae et a id nisi.</p>
    </div>
  </div>
</div>
  );
}

export default HomeCarousel;
