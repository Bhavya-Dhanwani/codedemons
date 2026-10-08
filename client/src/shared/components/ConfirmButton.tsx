import type { ReactNode } from 'react'
import { useConfirm } from '../hooks/useConfirm'
import { Button, type ButtonProps } from './Button'

type Props = Omit<ButtonProps, 'onClick' | 'variant'> & { onConfirm: () => void; children: ReactNode; confirm?: ReactNode }

/** Destructive button: first click arms it ("Sure?"), second click within 3s runs it. */
export function ConfirmButton({ onConfirm, children, confirm = 'Sure?', className, ...rest }: Props) {
  const { armed, click } = useConfirm(onConfirm)
  return (
    <Button variant="danger" className={[armed && 'armed', className].filter(Boolean).join(' ')} onClick={click} {...rest}>
      {armed ? confirm : children}
    </Button>
  )
}
