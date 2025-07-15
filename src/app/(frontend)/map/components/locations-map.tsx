'use client'

import useSupercluster from 'use-supercluster'
import { Location } from '@/payload-types'
import MapboxDraw from '@mapbox/mapbox-gl-draw'
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'
import * as turf from '@turf/turf'
import type { FillLayer, LineLayer } from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useQueryStates } from 'nuqs'
import { PaginatedDocs } from 'payload'
import { useEffect, useMemo, useRef, useState } from 'react'
import Map, { Layer, MapRef, Marker, Source, useMap } from 'react-map-gl/mapbox'
import { mapSearchParams } from '../nuqs/params'
import { Badge } from '@/components/ui/badge'
// Define GeoJSON types inline to avoid import issues
type GeoJSONFeature = {
  type: 'Feature'
  properties: Record<string, any>
  geometry: {
    type: 'Polygon'
    coordinates: number[][][]
  }
}

type GeoJSONFeatureCollection = {
  type: 'FeatureCollection'
  features: GeoJSONFeature[]
}

type Props = {
  locations: PaginatedDocs<Location>
}

// Draw Control Component
const DrawControl: React.FC = () => {
  const { current: map } = useMap()
  const [roundedArea, setRoundedArea] = useState<number | undefined>()

  useEffect(() => {
    if (!map) return

    // Initialize MapboxDraw
    const drawInstance = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true,
      },
      defaultMode: 'draw_polygon',
    })

    map.addControl(drawInstance)

    // Event listeners for drawing
    const updateArea = (e: any) => {
      const data = drawInstance.getAll()
      console.log('data:::', data)
      if (data.features.length > 0) {
        const area = turf.area(data)
        setRoundedArea(Math.round(area * 100) / 100)
      } else {
        setRoundedArea(undefined)
        if (e.type !== 'draw.delete') {
          alert('Click the map to draw a polygon.')
        }
      }
    }

    map.on('draw.create', updateArea)
    map.on('draw.delete', updateArea)
    map.on('draw.update', updateArea)

    return () => {
      if (drawInstance) {
        map.off('draw.create', updateArea)
        map.off('draw.delete', updateArea)
        map.off('draw.update', updateArea)
        map.removeControl(drawInstance)
      }
    }
  }, [map])

  return (
    <div
      className="calculation-box"
      style={{
        height: 75,
        width: 150,
        position: 'absolute',
        bottom: 40,
        left: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 15,
        textAlign: 'center',
        borderRadius: 4,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        zIndex: 1000,
      }}
    >
      <p style={{ fontFamily: 'Open Sans', margin: 0, fontSize: 13 }}>
        Click the map to draw a polygon.
      </p>
      <div id="calculated-area">
        {roundedArea && (
          <>
            <p style={{ fontFamily: 'Open Sans', margin: 0, fontSize: 13 }}>
              <strong>{roundedArea}</strong>
            </p>
            <p style={{ fontFamily: 'Open Sans', margin: 0, fontSize: 13 }}>square meters</p>
          </>
        )}
      </div>
    </div>
  )
}

const LocationsMap: React.FC<Props> = ({ locations }) => {
  const mapRef = useRef<MapRef>(null)
  const [defaultBounds, setDefaultBounds] = useState<number[] | null>(null)
  const [{ markers, polygons, ...viewState }, setSearchParams] = useQueryStates(mapSearchParams)

  // Create GeoJSON data for selected polygons
  const polygonGeoJSON = useMemo((): GeoJSONFeatureCollection => {
    const selectedLocations = locations?.docs || []
    // const selectedLocations =
    //   locations?.docs?.filter(
    //     (location) =>
    //       polygons.includes(location.id) && location.polygon && location.polygon.length > 0,
    //   ) || []

    return {
      type: 'FeatureCollection',
      features: selectedLocations.map((location) => {
        // Convert polygon coordinates to GeoJSON format
        // Note: The polygon data structure has latitude/longitude in each coordinate object
        const coordinates = location.polygon!.map((coord) => [
          coord.coordinates![0].longitude, // GeoJSON expects [longitude, latitude]
          coord.coordinates![0].latitude,
        ])

        return {
          type: 'Feature' as const,
          properties: {
            id: location.id,
            title: location.title,
            locationName: location.locationName,
            category: location.category,
            status: location.status,
          },
          geometry: {
            type: 'Polygon' as const,
            coordinates: [coordinates], // Wrap in array for GeoJSON Polygon format
          },
        }
      }),
    }
  }, [locations?.docs, polygons])

  // Layer styles
  const fillLayer: FillLayer = {
    id: 'polygon-fill',
    type: 'fill',
    source: 'polygons',
    paint: {
      'fill-color': [
        'case',
        ['==', ['get', 'status'], 'active'],
        '#10b981', // green for active
        ['==', ['get', 'status'], 'under-development'],
        '#f59e0b', // yellow for under development
        ['==', ['get', 'status'], 'closed'],
        '#ef4444', // red for closed
        ['==', ['get', 'status'], 'seasonal'],
        '#3b82f6', // blue for seasonal
        '#6b7280', // gray for default
      ],
      'fill-opacity': 0.3,
    },
  }

  const lineLayer: LineLayer = {
    id: 'polygon-outline',
    type: 'line',
    source: 'polygons',
    paint: {
      'line-color': [
        'case',
        ['==', ['get', 'status'], 'active'],
        '#10b981',
        ['==', ['get', 'status'], 'under-development'],
        '#f59e0b',
        ['==', ['get', 'status'], 'closed'],
        '#ef4444',
        ['==', ['get', 'status'], 'seasonal'],
        '#3b82f6',
        '#6b7280',
      ],
      'line-width': 2,
      'line-opacity': 0.8,
    },
  }

  const points = locations?.docs?.map((location) => ({
    type: 'Feature' as const,
    properties: {
      ...location,
    },
    geometry: {
      type: 'Point' as const,
      coordinates: [location.coordinates.longitude, location.coordinates.latitude],
    },
  }))

  const bounds = mapRef.current
    ? (mapRef.current.getMap()?.getBounds()?.toArray().flat() as
        | [number, number, number, number]
        | undefined)
    : defaultBounds
      ? (defaultBounds as [number, number, number, number])
      : undefined

  const { clusters, supercluster } = useSupercluster({
    points,
    bounds,
    zoom: viewState.zoom,
    options: {
      radius: 50,
      maxZoom: 20,
    },
  })

  return (
    <div className="w-screen h-screen">
      <Map
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN!}
        initialViewState={viewState}
        onLoad={() => {
          setDefaultBounds(mapRef.current?.getMap()?.getBounds()?.toArray().flat() || null)
        }}
        onMove={(e) => {
          setSearchParams(
            {
              longitude: e.viewState.longitude,
              latitude: e.viewState.latitude,
              zoom: e.viewState.zoom,
            },
            {
              history: 'replace',
              shallow: true,
              throttleMs: 500,
            },
          )
        }}
        maxZoom={20}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v9"
        ref={mapRef}
      >
        <DrawControl />
        {polygonGeoJSON.features.length > 0 && (
          <Source id="polygons" type="geojson" data={polygonGeoJSON}>
            <Layer {...fillLayer} />
            <Layer {...lineLayer} />
          </Source>
        )}
        {clusters?.map((cluster) => {
          const [longitude, latitude] = cluster.geometry.coordinates

          const { cluster: isCluster, point_count: pointCount } = cluster.properties as {
            cluster: boolean
            point_count: number
          }

          if (isCluster) {
            return (
              <Marker
                key={`cluster-${cluster.id}`}
                latitude={latitude}
                longitude={longitude}
                anchor="right"
              >
                <button
                  onClick={() => {
                    const expansionZoom = Math.min(
                      // @ts-ignore
                      supercluster.getClusterExpansionZoom(cluster.id),
                      30,
                    )
                    mapRef.current?.flyTo({
                      center: [longitude, latitude],
                      zoom: expansionZoom,
                    })
                  }}
                  className="bg-background px-3 py-1 rounded-full"
                >
                  {pointCount}: Locations
                </button>
              </Marker>
            )
          }
          return (
            <Marker
              key={`cluster-${cluster.properties.id}`}
              latitude={latitude}
              longitude={longitude}
              anchor="right"
            >
              <button className="bg-background px-3 py-1 rounded-full">
                {cluster.properties.title}
              </button>
            </Marker>
          )
        })}
      </Map>
    </div>
  )
}

export default LocationsMap
