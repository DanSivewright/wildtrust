import { createSearchParamsCache, parseAsArrayOf, parseAsFloat, parseAsString } from 'nuqs/server'
export const mapSearchParams = {
  markers: parseAsArrayOf(parseAsString).withDefault([]),
  polygons: parseAsArrayOf(parseAsString).withDefault([]),
  longitude: parseAsFloat.withDefault(24.7499),
  latitude: parseAsFloat.withDefault(-28.7282),
  zoom: parseAsFloat.withDefault(5),
  selectedLocationId: parseAsString.withDefault(''),
}
export const loadMapSearchParams = createSearchParamsCache(mapSearchParams)
