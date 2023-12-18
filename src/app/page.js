import Navbar from '@/components/Navbar'
import Aboutme from '@/components/Aboutme'
import WorkHistory from '@/components/WorkHistory'
import Project from '@/components/projects/Project'
import ProfessionalTools from '@/components/professionalTools/ProfessionalTools'

export default function Home() {
  return (
    <div>
      <Navbar />
      <Aboutme />
      <WorkHistory />
      <Project />
      <ProfessionalTools />
    </div>
  )
}
