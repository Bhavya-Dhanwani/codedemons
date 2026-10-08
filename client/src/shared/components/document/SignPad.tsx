import type { Signature } from '../../types/content'
import { useSignPad } from '../../hooks/useSignPad'
import { Button } from '../Button'
import { Field } from '../Field'

type Props = { onSign: (s: Signature) => void; busy?: boolean; label?: string }

/** Draw-and-type signature. */
export function SignPad({ onSign, busy, label = 'Sign document' }: Props) {
  const s = useSignPad(onSign)
  return (
    <div className="sign">
      <Field label="Full name"><input value={s.name} onChange={(e) => s.setName(e.target.value)} autoComplete="name" /></Field>
      <Field label="Signature" as="div">
        <div className="sign-pad">
          <canvas ref={s.canvas} width={600} height={180} {...s.pad} aria-label="Draw your signature here" />
          {!s.drawn && <span className="sign-hint">Draw your signature here</span>}
          {s.drawn && <Button variant="ghost" className="sign-clear" onClick={s.clear}>Clear</Button>}
        </div>
      </Field>
      <label className="sign-agree"><input type="checkbox" checked={s.agree} onChange={(e) => s.setAgree(e.target.checked)} /> I've read this document and agree to sign it electronically.</label>
      <Button variant="primary" disabled={!s.ready || busy} onClick={s.sign}>{busy ? 'Signing' : label}</Button>
    </div>
  )
}
