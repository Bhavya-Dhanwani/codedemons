import { FeaturedWork } from '../../work/ui/FeaturedWork'
import { Hero } from './Hero'
import { Manifesto, Stats, WordMarquee } from './Intro'
import { Torch } from './Torch'
import { Services } from './Services'
import { Founders } from './Founders'
import { Reviews } from './Reviews'
import { Process } from './Process'
import { Faq } from './Faq'
import { Cta } from './Cta'

export default function HomePage() {
  return (
    <main>
      <Hero />
      <WordMarquee />
      <Manifesto />
      <Torch />
      <Services />
      <FeaturedWork />
      <Stats />
      <Founders />
      <Reviews />
      <Process />
      <Faq />
      <Cta />
    </main>
  )
}
