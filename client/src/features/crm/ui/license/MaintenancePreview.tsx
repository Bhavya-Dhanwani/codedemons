import type { LicenseTabModel } from '../../hooks/useLicenseTab'

/** Scaled-down copy of the page the license script draws on the client's site (keep in step with license.router.ts). */
export function MaintenancePreview({ p }: { p: LicenseTabModel['preview'] }) {
  return (
    <div className="mp-preview" style={p.page} aria-label="Maintenance page preview">
      <span className="mp-bar mono">their website, while it's down</span>
      <div className="mp-box">
        {p.logo && <img src={p.logo} alt="" />}
        <h3>{p.heading}</h3>
        <p>{p.message}</p>
        {p.button && <span className="mp-btn" style={p.button.style}>{p.button.label}</span>}
      </div>
    </div>
  )
}
