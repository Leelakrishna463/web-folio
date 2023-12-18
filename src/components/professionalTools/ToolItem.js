import dynamic from 'next/dynamic';

const tools = {
  apachekafka: dynamic(("devicon/icons/apachekafka/apachekafka-original.svg")),
  bash: dynamic(import("devicon/icons/bash/bash-original.svg")),
  css3: dynamic(import("devicon/icons/css3/css3-original.svg")),
  django: dynamic(import("devicon/icons/django/django-plain.svg")),
  docker: dynamic(import("devicon/icons/docker/docker-original.svg")),
  fastapi: dynamic(import("devicon/icons/fastapi/fastapi-original.svg")),
  flask: dynamic(import("devicon/icons/flask/flask-original.svg")),
  git: dynamic(import("devicon/icons/git/git-original.svg")),
  html5: dynamic(import("devicon/icons/html5/html5-original.svg")),
  javascript: dynamic(import("devicon/icons/javascript/javascript-original.svg")),
  nextjs: dynamic(import("devicon/icons/nextjs/nextjs-original.svg")),
  nodejs: dynamic(import("devicon/icons/nodejs/nodejs-original.svg")),
  postgresql: dynamic(import("devicon/icons/postgresql/postgresql-original.svg")),
  python: dynamic(import("devicon/icons/python/python-original.svg")),
  react: dynamic(import("devicon/icons/react/react-original.svg")),
  redis: dynamic(import("devicon/icons/redis/redis-original.svg")),
  tailwindcss: dynamic(import("devicon/icons/tailwindcss/tailwindcss-plain.svg")),
  pytest: dynamic(import("devicon/icons/pytest/pytest-original.svg")),
  fastapi: dynamic(import("devicon/icons/fastapi/fastapi-original.svg")),
  pycharm: dynamic(import("devicon/icons/pycharm/pycharm-original.svg")),
  firebase: dynamic(import("devicon/icons/firebase/firebase-plain.svg")),
};



function ToolItem() {
  const icons = [];
  Object.keys(tools).forEach(async (key) => {
    icons.push(
      <div key={key} className="avatar">
        <div className="w-24 mask mask-squircle">
          <img src={await tools[key]} />
        </div>
      </div>
    );
  })
  return icons;
}

export default ToolItem;
