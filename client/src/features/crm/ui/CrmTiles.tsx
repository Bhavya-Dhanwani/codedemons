import type { Tile } from '../hooks/useCrmList'

/** Summary numbers; the ones with a target view filter the list when clicked. */
export function CrmTiles({ tiles, onPick }: { tiles: Tile[]; onPick: (view: string) => void }) {
  return (
    <div className="crm-tiles">
      {tiles.map((t) => (
        <button key={t.k} className={'crm-tile' + (t.to ? '' : ' flat')} onClick={() => t.to && onPick(t.to)} disabled={!t.to}>
          <span className="mono">{t.k}</span><b>{t.v}</b><small>{t.s}</small>
        </button>
      ))}
    </div>
  )
}
