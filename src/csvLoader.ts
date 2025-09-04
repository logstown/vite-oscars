// src/utils/csvLoader.ts
import Papa, { type ParseResult, type ParseConfig } from 'papaparse'

export type LoaderOptions<T> = {
  /** PapaParse options; header:true is enforced by default */
  parseOptions?: Omit<ParseConfig<T>, 'header'>
  /** Cache key override (defaults to URL) */
  cacheKey?: string
  /** Pass an AbortSignal to cancel the request */
  signal?: AbortSignal
}

/**
 * Simple in-memory cache so multiple callers don’t refetch.
 * Keyed by URL (or provided cacheKey). Stores the in-flight Promise.
 */
const cache = new Map<string, Promise<TypedRow[]>>()

export type TypedRow = Record<string, string | number | boolean | null>

/**
 * Fetch & parse a CSV from /public (or any URL).
 * Returns an array of objects keyed by the CSV header row.
 */

export async function loadCsv<T extends TypedRow = TypedRow>(
  url: string,
  opts: LoaderOptions<T> = {},
): Promise<T[]> {
  const key = opts.cacheKey ?? url
  const existing = cache.get(key)
  if (existing) return existing as Promise<T[]>

  const promise = (async () => {
    try {
      const res = await fetch(url, { signal: opts.signal })
      if (!res.ok) throw new Error(`Failed to fetch CSV (${res.status}) ${url}`)
      const text = await res.text()

      const result: ParseResult<T> = Papa.parse<T>(text, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: 'greedy',
        transformHeader: h => h.trim(),
        ...opts.parseOptions,
      })

      if (result.errors?.length) {
        const e = result.errors[0]
        throw new Error(`CSV parse error at row ${e.row}: ${e.message}`)
      }

      return result.data
    } catch (err) {
      // IMPORTANT: don't leave a rejected/aborted promise in cache
      cache.delete(key)
      throw err
    }
  })()

  cache.set(key, promise)
  return promise
}

/** Clears one cached dataset or everything (e.g., when you ship a new version). */
export function clearCsvCache(key?: string) {
  if (key) cache.delete(key)
  else cache.clear()
}
