import ReactIcon from "devicon/icons/react/react-original.svg";
import DjangoIcon from "devicon/icons/django/django-plain.svg";
import NodejsIcon from "devicon/icons/nodejs/nodejs-original.svg";
import PythonIcon from "devicon/icons/python/python-original.svg";

const profileInfo = {
  greetMessage: "Hello!",
  name: "Leelakrishna Thiyagarajan",
  jobBrief: "I Build software for web",
  jobLong:
    "Passionate Software Engineer with 3 years of experience in developing Backend systems",
  residence: "Residing at Bengaluru, India",
  imagePath: "images/ProfileImage.jpeg",
};


const toolsInfo = [
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


const projectInfo = {
  displayTitle: "Projects",
  projects: {
    python: {
      display: {
        image: PythonIcon,
        altText: "Icon of Python programming language",
        name: "python",
      },
      projects: [
        {
          title: "Single Layer Perceptron",
          description:
            "A simple ML model that can identify whether a given fruit is Orange or Apple based on the texture. ",
          hyperlink: "https://github.com/Leelakrishna463/Perceptron",
        },
      ],
    },
    django: {
      display: {
        image: DjangoIcon,
        altText: "Icon of Django framework",
        name: "django",
      },
      projects: [
        {
          title: "sw-marshal",
          description:
            "SpiritWing-Marshal - A personal life organization tool that contains personal passwords and more. ",
          hyperlink: "https://github.com/Leelakrishna463/sw_marshal",
        },
      ],
    },
    react: {
      display: {
        image: ReactIcon,
        altText: "Icon of ReactJs Library",
        name: "react",
      },
      projects: [
        {
          title: "web-folio",
          description:
            "Portfolio website that exhibit about me and my professional career. ",
          hyperlink: "https://github.com/Leelakrishna463/web-folio",
        },
      ],
    },
    nodejs: {
      display: {
        image: NodejsIcon,
        altText: "Icon of NodeJs Environment",
        name: "nodejs",
      },
      projects: [
        {
          title: "Algo-run API",
          description:
            "Backend Rest API to explore search and sort algorithms. ",
          hyperlink: "https://github.com/Leelakrishna463/algo-run-api",
        },
      ],
    },
  },
};


const contactInfo = {
	contacts: [
		{
			'name': 'Gmail',
			'hyperlink': "mailto:leelakrishnathiyagarajan@gmail.com",
			'imageAlt': 'Gmail Icon'
		},
		{
			'name': 'LinkedIn',
			'hyperlink': "https://www.linkedin.com/in/leelakrishna-thiyagarajan",
			'imageAlt': 'LinkedIn'
		}
	]
}


const jobInfo = [
  {
    title: "Software Engineer",
    location: "Chennai",
    period: "APR 2021 - DEC 2021",
    company: "embedUR Systems",
    locationImagePath: "images/ChennaiMonument.svg"
  },
  {
    title: "Software Engineer",
    location: "Bengaluru",
    period: "JAN 2022 - PRESENT",
    company: "Decathlon Technology UK",
    locationImagePath: "images/BengaluruMonument.svg"
  }
]

export {
  profileInfo,
  toolsInfo,
  projectInfo,
  contactInfo,
  jobInfo
};