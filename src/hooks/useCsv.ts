import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  loadCsv,
  clearCsvCache,
  type TypedRow,
  type LoaderOptions,
} from '../csvLoader'

interface UseCsvOptions<T extends TypedRow> {
  /** PapaParse options; header:true is enforced by default */
  parseOptions?: LoaderOptions<T>['parseOptions']
  /** Cache key override (defaults to URL) */
  cacheKey?: string
  /** Whether to automatically load the CSV when the hook is called */
  autoLoad?: boolean
  /** AbortSignal for cancelling the request */
  signal?: AbortSignal
}

interface UseCsvReturn<T extends TypedRow> {
  /** The loaded CSV data */
  data: T[] | null
  /** Loading state */
  loading: boolean
  /** Error state */
  error: Error | null
  /** Function to manually load/reload the CSV */
  load: () => Promise<void>
  /** Function to clear the cache for this CSV */
  clearCache: () => void
  /** Function to refresh the data (clear cache and reload) */
  refresh: () => Promise<void>
}

/**
 * Custom hook for loading CSV files with React state management
 *
 * @param url - URL to the CSV file
 * @param options - Configuration options
 * @returns Object with data, loading state, error state, and utility functions
 *
 * @example
 * ```tsx
 * const { data, loading, error, refresh } = useCsv('/data/songs.csv');
 *
 * if (loading) return <div>Loading...</div>;
 * if (error) return <div>Error: {error.message}</div>;
 *
 * return (
 *   <div>
 *     {data?.map(row => <div key={row.id}>{row.title}</div>)}
 *   </div>
 * );
 * ```
 */
export function useCsv<T extends TypedRow = TypedRow>(
  url: string,
  options: UseCsvOptions<T> = {},
): UseCsvReturn<T> {
  const { autoLoad = true, ...csvOptions } = options

  // Memoize the csvOptions to prevent unnecessary re-renders
  const memoizedCsvOptions = useMemo(
    () => csvOptions,
    [csvOptions.parseOptions, csvOptions.cacheKey, csvOptions.signal],
  )

  const [data, setData] = useState<T[] | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)

  const load = useCallback(async () => {
    if (!url) return

    setLoading(true)
    setError(null)

    try {
      const csvData = await loadCsv<T>(url, memoizedCsvOptions)
      setData(csvData)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load CSV'))
    } finally {
      setLoading(false)
    }
  }, [url, memoizedCsvOptions])

  const clearCache = useCallback(() => {
    if (memoizedCsvOptions.cacheKey) {
      clearCsvCache(memoizedCsvOptions.cacheKey)
    } else {
      clearCsvCache(url)
    }
  }, [url, memoizedCsvOptions.cacheKey])

  const refresh = useCallback(async () => {
    clearCache()
    await load()
  }, [clearCache, load])

  // Auto-load when the hook is first called
  useEffect(() => {
    if (autoLoad) {
      load()
    }
  }, [autoLoad, load])

  return {
    data,
    loading,
    error,
    load,
    clearCache,
    refresh,
  }
}

/**
 * Hook for loading CSV data with automatic refresh on URL changes
 *
 * @param url - URL to the CSV file
 * @param options - Configuration options
 * @returns Same return object as useCsv but with automatic URL dependency tracking
 */
export function useCsvWithUrl<T extends TypedRow = TypedRow>(
  url: string,
  options: UseCsvOptions<T> = {},
): UseCsvReturn<T> {
  const result = useCsv<T>(url, { ...options, autoLoad: false })

  // Reload when URL changes
  useEffect(() => {
    if (url) {
      result.load()
    }
  }, [url, result.load])

  return result
}
