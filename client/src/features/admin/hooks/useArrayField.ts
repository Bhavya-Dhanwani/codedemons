/** Edit helpers for a list-valued field (results, gallery). */
export function useArrayField<T>(items: T[], onChange: (next: T[]) => void) {
  return {
    items,
    update: (i: number, v: T) => onChange(items.map((x, j) => (j === i ? v : x))),
    remove: (i: number) => onChange(items.filter((_, j) => j !== i)),
    add: (v: T) => onChange([...items, v]),
  }
}
