/**
 * Shared merge logic for templates and plans.
 * Used by both public and admin API routes to avoid 80% code duplication.
 */

interface MergeableItem {
  id: string
  title?: string
  active?: boolean
  [key: string]: any
}

/**
 * Merge DB items with admin overrides and fallback data.
 * Priority: DB first (source of truth) → admin overrides (for items NOT in DB) → fallback seed.
 *
 * @param dbItems - Items from the database (Supabase)
 * @param adminItems - Admin overrides from file-store
 * @param deletedIds - IDs marked as deleted
 * @param fallbackItems - Static fallback seed data
 * @param publicOnly - If true, only return active items (for public API)
 */
export function mergeItems<T extends MergeableItem>(
  dbItems: T[],
  adminItems: T[],
  deletedIds: Set<string>,
  fallbackItems: T[],
  publicOnly: boolean = false,
): T[] {
  const merged: T[] = []
  const seenIds = new Set<string>()
  const seenTitles = new Set<string>()

  // 1. DB rows first (source of truth)
  for (const item of dbItems) {
    if (deletedIds.has(item.id)) continue
    seenIds.add(item.id)
    if (item.title) seenTitles.add(item.title)
    if (publicOnly && item.active === false) continue
    merged.push(item)
  }

  // 2. Admin overrides — only for items NOT in DB
  for (const item of adminItems) {
    if (deletedIds.has(item.id)) continue
    if (seenIds.has(item.id)) continue
    if (item.title && seenTitles.has(item.title)) continue
    seenIds.add(item.id)
    if (item.title) seenTitles.add(item.title)
    if (publicOnly && item.active === false) continue
    merged.push(item)
  }

  // 3. Fallback seed — only if DB is empty/unavailable
  if (dbItems.length === 0) {
    for (const item of fallbackItems) {
      if (deletedIds.has(item.id)) continue
      if (seenIds.has(item.id)) continue
      if (item.title && seenTitles.has(item.title)) continue
      merged.push(item)
      seenIds.add(item.id)
      if (item.title) seenTitles.add(item.title)
    }
  }

  return merged
}
