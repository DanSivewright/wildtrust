import { createSearchParamsCache, parseAsArrayOf, parseAsString } from 'nuqs/server'
export const mapSearchParams = {
  markers: parseAsArrayOf(parseAsString).withDefault([]),
  polygons: parseAsArrayOf(parseAsString).withDefault([]),
}
export const loadMapSearchParams = createSearchParamsCache(mapSearchParams)
