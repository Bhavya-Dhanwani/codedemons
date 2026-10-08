import { ScrubText } from '../../../../shared/components/motion/ScrubText'
import { NotFoundView } from '../../../not-found/ui/NotFoundView'
import { useProjectPage } from '../../hooks/useProjectPage'
import { ProjectHeader } from './ProjectHeader'
import { ProjectCover } from './ProjectCover'
import { ProjectStory } from './ProjectStory'
import { ProjectSplit } from './ProjectSplit'
import { ProjectGallery } from './ProjectGallery'
import { ProjectResults } from './ProjectResults'
import { NextProject } from './NextProject'

export default function ProjectPage() {
  const pj = useProjectPage()
  if (pj.state === 'loading') return <main className="pj pj-msg"><p className="mono">Loading</p></main>
  if (pj.state === 'missing') return <NotFoundView title="This project went back into the dark." action={{ href: '/work', label: 'See all work' }} />

  const { p } = pj
  return (
    <main className="pj" ref={pj.ref} key={pj.slug}>
      <ProjectHeader p={p} position={pj.position} meta={pj.meta} />
      <ProjectCover p={p} />
      <ProjectStory p={p} />
      <ProjectSplit p={p} tagline={pj.tagline} tintText={pj.tintText} />
      {p.intro && <section className="pj-quote"><ScrubText text={pj.quote} /></section>}
      <ProjectGallery p={p} />
      <ProjectResults p={p} />
      <NextProject next={pj.next} />
    </main>
  )
}
