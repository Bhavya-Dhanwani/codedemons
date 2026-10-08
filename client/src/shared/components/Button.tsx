import type { ButtonHTMLAttributes } from 'react'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'danger'
  size?: 'sq' | 'big'
}

export const buttonClass = ({ variant, size, className }: Pick<ButtonProps, 'variant' | 'size' | 'className'> = {}) =>
  ['ad-btn', variant, size, className].filter(Boolean).join(' ')

/** The panel button (admin, portal, auth). Defaults to type="button"; pass type="submit" for forms. */
export function Button({ variant, size, className, type = 'button', ...rest }: ButtonProps) {
  return <button type={type} className={buttonClass({ variant, size, className })} {...rest} />
}
