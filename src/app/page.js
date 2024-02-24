'use client';

import Aboutme from '@/components/Aboutme'
import WorkHistory from '@/components/JobHistory'
import Project from '@/components/projects/Project'
import ProfessionalTools from '@/components/professionalTools/ProfessionalTools'
import Terminal from '@/components/Terminal'
import Contact from '@/components/contact'
import React, { useState } from 'react';



export default function Home() {
  
  const [commandInfo, setCommandInfo] = useState({
    name: "_",
    description: ""
  });

  return (
    <div>
      <Terminal commandInfo={commandInfo} />
      <Aboutme updateCommand={setCommandInfo}/>
      <WorkHistory updateCommand={setCommandInfo}/>
      <Project updateCommand={setCommandInfo}/>
      <ProfessionalTools updateCommand={setCommandInfo}/>
      <Contact updateCommand={setCommandInfo}/>
    </div>
  )
}
