'use client'

import Marker from '@/components/map/map-marker'
import MapSearch from '@/components/map/map-search'
import MapStyles from '@/components/map/map-styles'
import { Location } from '@/payload-types'
import MapProvider from '@/utilities/mapbox/provider'
import { PaginatedDocs } from 'payload'
import { useRef, useEffect } from 'react'
import { useMap } from '@/providers/map-context'
import MapboxDraw from '@mapbox/mapbox-gl-draw'
import * as turf from '@turf/turf'

type Props = {
  locations: PaginatedDocs<Location>
}
const LocationsMap: React.FC<Props> = ({ locations }) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const geojson = {
    type: 'Feature' as const,
    properties: {},
    geometry: {
      type: 'Polygon' as const,
      coordinates: [
        [
          [18.4233, -33.9189],
          [18.4746, -33.915],
          [18.511, -33.8908],
          [18.555, -33.87],
          [18.6, -33.9],
          [18.65, -33.95],
          [18.6, -34.0],
          [18.5, -34.05],
          [18.4, -34.02],
          [18.35, -33.97],
          [18.37, -33.93],
          [18.4233, -33.9189],
        ],
      ],
    },
  }

  // const GeoJSONLayer = () => {
  //   const { map } = useMap()

  //   useEffect(() => {
  //     if (!map) return

  //     map.addSource('geojson', {
  //       type: 'geojson',
  //       data: geojson,
  //     })

  //     map.addLayer({
  //       id: 'geojson-layer',
  //       type: 'fill',
  //       source: 'geojson',
  //       paint: {
  //         'fill-color': '#088',
  //         'fill-opacity': 0.4,
  //       },
  //     })

  //     return () => {
  //       if (map.getLayer('geojson-layer')) {
  //         map.removeLayer('geojson-layer')
  //       }
  //       if (map.getSource('geojson')) {
  //         map.removeSource('geojson')
  //       }
  //     }
  //   }, [map])

  //   return null
  // }
  return (
    <div className="w-screen h-screen">
      <div id="map-container" ref={mapContainerRef} className="absolute inset-0 h-full w-full" />

      <MapProvider
        mapContainerRef={mapContainerRef}
        initialViewState={{
          longitude: 24.7499,
          latitude: -28.7282,
          zoom: 5,
        }}
      >
        {/* <GeoJSONLayer /> */}
        {locations?.docs?.map((location) => (
          <Marker
            key={location.id}
            longitude={location.coordinates.longitude}
            latitude={location.coordinates.latitude}
            data={location}
          >
            HELLO WORLD
          </Marker>
        ))}
        <MapSearch />
        {/* <MapCotrols /> */}
        <MapStyles />
      </MapProvider>
    </div>
  )
}
export default LocationsMap
