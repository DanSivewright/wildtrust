'use client'

import React, { useEffect } from 'react'
import { useMap } from '@/providers/map-context'
import { Location } from '@/payload-types'

type Props = {
  locations: Location[]
}

const MapGeoJSONLayer: React.FC<Props> = ({ locations }) => {
  const { map } = useMap()

  useEffect(() => {
    if (!map || !locations?.length) {
      console.log('Map or locations not ready:', { map: !!map, locationsLength: locations?.length })
      return
    }

    console.log('Map is ready, adding layers for', locations.length, 'locations')

    // Create GeoJSON data from locations
    const geojsonData = {
      type: 'FeatureCollection' as const,
      features: locations
        .filter((location) => location.polygon && location.polygon.length > 0)
        .map((location) => {
          // Extract all coordinates from the polygon array
          // Note: Your data has latitude/longitude swapped, so we need to fix the order
          const coordinates = location.polygon!.map((coord) => [
            coord.coordinates![0].latitude, // This is actually longitude in your data
            coord.coordinates![0].longitude, // This is actually latitude in your data
          ])

          console.log('Polygon coordinates for', location.title, ':', coordinates)

          return {
            type: 'Feature' as const,
            properties: {
              id: location.id,
              title: location.title,
              locationName: location.locationName,
              // Add any other properties you want
            },
            geometry: {
              type: 'Polygon' as const,
              coordinates: [coordinates], // Wrap in array for GeoJSON Polygon format
            },
          }
        }),
    }

    console.log('Adding GeoJSON source with data:', geojsonData)

    // Add the GeoJSON source
    map.addSource('locations-polygons', {
      type: 'geojson',
      data: geojsonData,
    })

    // Add a fill layer for the polygons
    map.addLayer({
      id: 'locations-polygons-fill',
      type: 'fill',
      source: 'locations-polygons',
      paint: {
        'fill-color': '#ff0000', // Changed to red for better visibility
        'fill-opacity': 0.6,
      },
    })

    console.log('Added fill layer')

    // Add an outline layer for the polygons
    map.addLayer({
      id: 'locations-polygons-outline',
      type: 'line',
      source: 'locations-polygons',
      paint: {
        'line-color': '#ff0000',
        'line-width': 3,
      },
    })

    console.log('Added outline layer')

    // Cleanup function
    return () => {
      if (map.getLayer('locations-polygons-outline')) {
        map.removeLayer('locations-polygons-outline')
      }
      if (map.getLayer('locations-polygons-fill')) {
        map.removeLayer('locations-polygons-fill')
      }
      if (map.getSource('locations-polygons')) {
        map.removeSource('locations-polygons')
      }
    }
  }, [map, locations])

  return null
}

export default MapGeoJSONLayer
