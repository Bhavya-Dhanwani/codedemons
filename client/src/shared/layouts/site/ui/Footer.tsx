import { Mark } from '../../../components/brand/Logo'
import { Marquee } from '../../../components/motion/Marquee'

export function Footer() {
  return (
    <footer className="footer">
      <Marquee reverse>
        {[0, 1].map((i) => <span className="foot-word" key={i}>codedemons<Mark size={90} /></span>)}
      </Marquee>
      <div className="foot-row mono">
        <span>2026 codedemons</span>
        <span>Bhavya Dhanwani &amp; Sameer Bhagtani</span>
        <span>Made with mischief</span>
      </div>
    </footer>
  )
}
