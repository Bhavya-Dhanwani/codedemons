import { Link } from 'react-router'
import { buttonClass } from '../../../../shared/components/Button'
import { PanelHead } from '../../../../shared/components/PanelHead'
import { NewProjectForm } from './NewProjectForm'

/** /portal/projects/new */
export default function NewProjectPage() {
  return (
    <>
      <Link to="/portal" className={buttonClass({ variant: 'ghost' })}>All projects</Link>
      <PanelHead title="New project" sub="Tell us what you need, we reply within a working day" />
      <NewProjectForm />
    </>
  )
}
