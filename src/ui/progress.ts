// ─── Campaign progress (per-browser; storage may be unavailable) ────────────

const KEY = 'foxstar.stage';

/** 0-based index of the last stage reached (0 = nothing to continue). */
export function getSavedStage(): number {
  try {
    const v = Math.floor(Number(localStorage.getItem(KEY) ?? 0));
    return v > 0 && v < 8 ? v : 0;
  } catch {
    return 0;
  }
}

export function saveStage(index: number): void {
  try {
    if (index > 0) localStorage.setItem(KEY, String(index));
    else localStorage.removeItem(KEY);
  } catch {
    // Private mode / blocked storage: progress just won't persist.
  }
}
