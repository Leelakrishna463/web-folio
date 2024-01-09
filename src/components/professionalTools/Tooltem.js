const tools = [
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

function ToolItem() {
  const icons = [];
  tools.forEach((key) => {
    icons.push(
      <div key={key.name} className="avatar">
        <div className="w-24">
            <span className={`p-auto text-8xl text-[#fef9ff] block devicon-${key.name}-plain`} />
        </div>
      </div>
    );
  })
  return icons;
}

export default ToolItem;
