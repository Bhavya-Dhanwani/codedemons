/** localStorage that never throws (private mode, blocked storage). */
export const storage = (key: string) => ({
  get: () => { try { return localStorage.getItem(key) } catch { return null } },
  set: (v: string | null) => { try { if (v) localStorage.setItem(key, v); else localStorage.removeItem(key) } catch { /* private mode */ } },
})
