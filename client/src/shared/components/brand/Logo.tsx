/** Brand mark: the two oval demons (one per founder). Eyes blink via CSS. */
export function Mark({ size = 36 }: { size?: number }) {
  return (
    <svg className="mark" width={size * 1.25} height={size} viewBox="0 0 50 40" aria-hidden>
      <g className="mark-a">
        <rect x="4" y="2" width="20" height="36" rx="10" fill="currentColor" />
        <ellipse className="eye" cx="11.5" cy="15" rx="2" ry="3.4" fill="var(--eye, #f2f1ed)" />
        <ellipse className="eye" cx="18" cy="15" rx="2" ry="3.4" fill="var(--eye, #f2f1ed)" />
      </g>
      <g className="mark-b">
        <rect x="27" y="12" width="19" height="26" rx="9.5" fill="#2b3bff" />
        <ellipse className="eye" cx="33" cy="22" rx="1.9" ry="3.1" fill="#fff" />
        <ellipse className="eye" cx="39.5" cy="22" rx="1.9" ry="3.1" fill="#fff" />
      </g>
    </svg>
  )
}

export function Logo() {
  return (
    <span className="logo-lockup">
      <Mark />
      <span className="logo-word">codedemons</span>
    </span>
  )
}
