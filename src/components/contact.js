const contactTools = [
    {name: 'apachekafka'},
    {name : 'bash'}
  ]

function Contact() {
    return (
        <div className="snap-end custom-background ssticky top-0">
        <div className="h-screen flex flex-col justify-center items-center bg-base-200 bg-opacity-[0.98] text-white">
            <div className="grid grid-cols-2 w-3/4 justify-items-center">
                <div key={'asdf'} className="avatar">
                    <div className="w-24 p-[2px] hover:drop-shadow-[0_0_5px_rgba(255,255,255,1)]">
                        <a href="mailto:leelakrishnathiyagarajan@gmail.com">
                        <img src="images/GmailIcon.svg" className="rounded-lg" alt="gmail_icon"/>
                        </a>
                    </div>
                </div>
                <div key={'bcdg'} className="avatar">
                    <div className="w-24 hover:drop-shadow-[0_0_5px_rgba(255,255,255,1)]">
                        <a href="https://www.linkedin.com/in/leelakrishna-thiyagarajan" target="_blank">
                        <span className="p-auto text-8xl text-[#fef9ff] block devicon-linkedin-plain" alt="linkedin_icon"/>
                        </a>
                    </div>
                </div>
            </div>
            <hr className="bg-red-300 w-2/4 rotate-[45deg]"></hr>
        </div>
        </div>
    )
}

export default Contact;