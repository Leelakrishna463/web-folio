'use client';

import Aboutme from '@/components/Aboutme'
import WorkHistory from '@/components/JobHistory'
import Project from '@/components/projects/Project'
import ProfessionalTools from '@/components/professionalTools/ProfessionalTools'
import Terminal from '@/components/Terminal'
import Contact from '@/components/contact'
import React, { useState, useEffect } from 'react';


export default function Home() {

  const [scrollPosition, setScrollPosition] = useState("About Me!");
  const [displayComponent, setDisplayComponent] = useState(Aboutme);
  const handleScroll = () => {
      const position = window.scrollY;
      console.log(window.WheelEvent)
      const screenIndex = position/window.innerHeight;
      if (screenIndex == 0){
        let displayText = "whoami"
        let textIndex = Math.round(1 * displayText.length);
        setScrollPosition(displayText.slice(0, textIndex));
        setDisplayComponent(Aboutme)
      }
      if (screenIndex > 0 && screenIndex <= 1){
        let displayText = "history | grep 'jobs'"
        let textIndex = Math.round(screenIndex * displayText.length);
        setScrollPosition(displayText.slice(0, textIndex));
        setDisplayComponent(WorkHistory)
      }
      else if(screenIndex > 1 && screenIndex <= 2){
        let displayText = "cd projects/ & ls"
        let textIndex = Math.round((screenIndex-1) * displayText.length);
        setScrollPosition(displayText.slice(0, textIndex));
        setDisplayComponent(Project)
      }
      else if(screenIndex > 2 && screenIndex <= 3){
        let displayText = "unzip my_tools.zip"
        let textIndex = Math.round((screenIndex-2) * displayText.length);
        setScrollPosition(displayText.slice(0, textIndex));
        setDisplayComponent(ProfessionalTools)
      }
      else if(screenIndex > 3 && screenIndex <= 4){
        let displayText = "cat contact.txt"
        let textIndex = Math.round((screenIndex-3) * displayText.length);
        setScrollPosition(displayText.slice(0, textIndex));
        setDisplayComponent(Contact)
      }
  };

  const handleWheel = (event) => {
    console.log(event);
    setDisplayComponent(WorkHistory)
    window.removeEventListener('wheel', handleWheel)
  }

  useEffect(() => {
      window.addEventListener('scroll', handleScroll, { passive: false });
      window.addEventListener('wheel', handleWheel, {once: true})

      return () => {
          window.removeEventListener('scroll', handleScroll);
      };
  }, []);

  return (
    <div>
      <Terminal command={`${scrollPosition}`} />
      {displayComponent}
      {/* <Aboutme />
      <WorkHistory />
      <Project />
      <ProfessionalTools />
      <Contact /> */}
    </div>
  )
}
