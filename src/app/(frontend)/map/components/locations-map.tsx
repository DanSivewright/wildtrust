'use client'

import { Location } from '@/payload-types'
import { PaginatedDocs } from 'payload'
import { useRef, useState, useMemo, useEffect } from 'react'
import { mapSearchParams } from '../nuqs/params'
import { useQueryStates } from 'nuqs'
import Map, { Layer, Marker, Popup, Source, useMap } from 'react-map-gl/mapbox'
import type { FillLayer, LineLayer, CircleLayer, SymbolLayer } from 'mapbox-gl'
import MapboxDraw from '@mapbox/mapbox-gl-draw'
import * as turf from '@turf/turf'
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'
import 'mapbox-gl/dist/mapbox-gl.css'
import { MapPin, X, ExternalLink, Clock, DollarSign, Calendar } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

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
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const [unclusteredPoints, setUnclusteredPoints] = useState<Location[]>([])
  const [currentZoom, setCurrentZoom] = useState(5)
  const [{ markers, polygons }, setMarkers] = useQueryStates(mapSearchParams)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  // Create GeoJSON data for markers with clustering
  const markerGeoJSON = useMemo(() => {
    const features = (locations?.docs || []).map((location) => ({
      type: 'Feature' as const,
      properties: {
        id: location.id,
        title: location.title,
        locationName: location.locationName,
        category: location.category,
        status: location.status,
        description: location.description,
        additionalInfo: location.additionalInfo,
        contactInfo: location.contactInfo,
        tags: location.tags,
      },
      geometry: {
        type: 'Point' as const,
        coordinates: [location.coordinates.longitude, location.coordinates.latitude],
      },
    }))

    return {
      type: 'FeatureCollection' as const,
      features,
    }
  }, [locations?.docs])

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

  // Layer styles for polygons
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

  // Layer styles for clusters
  const clusterLayer: CircleLayer = {
    id: 'clusters',
    type: 'circle',
    source: 'markers',
    filter: ['has', 'point_count'],
    paint: {
      'circle-color': ['step', ['get', 'point_count'], '#51bbd6', 100, '#f1f075', 750, '#f28cb1'],
      'circle-radius': ['step', ['get', 'point_count'], 20, 100, 30, 750, 40],
    },
  }

  const clusterCountLayer: SymbolLayer = {
    id: 'cluster-count',
    type: 'symbol',
    source: 'markers',
    filter: ['has', 'point_count'],
    layout: {
      'text-field': '{point_count_abbreviated}',
      'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
      'text-size': 12,
    },
    paint: {
      'text-color': '#ffffff',
    },
  }

  // Layer styles for unclustered point markers (invisible - we'll use React components instead)
  const unclusteredPointLayer: CircleLayer = {
    id: 'unclustered-point',
    type: 'circle',
    source: 'markers',
    filter: ['!', ['has', 'point_count']],
    paint: {
      'circle-color': 'transparent',
      'circle-radius': 0,
    },
  }

  const getCategoryLabel = (category: string) => {
    const categoryMap: Record<string, string> = {
      'marine-protected-area': 'Marine Protected Area',
      'wildlife-sanctuary': 'Wildlife Sanctuary',
      'conservation-area': 'Conservation Area',
      'research-station': 'Research Station',
      'tourist-attraction': 'Tourist Attraction',
      'historical-site': 'Historical Site',
      beach: 'Beach',
      harbor: 'Harbor',
      other: 'Other',
    }
    return categoryMap[category] || category
  }

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      active: 'border-green-500 text-green-600',
      'under-development': 'border-yellow-500 text-yellow-600',
      closed: 'border-red-500 text-red-600',
      seasonal: 'border-blue-500 text-blue-600',
    }
    return statusColors[status] || 'border-gray-500 text-gray-600'
  }

  // Handle cluster click
  const handleClusterClick = (e: any) => {
    console.log('Cluster clicked!', e.features)
    const features = e.features
    if (!features.length) return

    const clusterId = features[0].properties.cluster_id
    const mapboxSource = e.target.getSource('markers')

    console.log('Cluster ID:', clusterId, 'Mapbox Source:', mapboxSource)

    if (!mapboxSource) return

    mapboxSource.getClusterExpansionZoom(clusterId, (err: any, zoom: number) => {
      if (err) {
        console.error('Error getting cluster expansion zoom:', err)
        return
      }

      console.log('Expanding cluster to zoom level:', zoom)
      e.target.easeTo({
        center: features[0].geometry.coordinates,
        zoom: zoom + 1,
        duration: 500, // Add smooth animation duration
      })
    })
  }

  // Handle individual marker click
  const handleMarkerClick = (location: Location) => {
    setSelectedLocation(location)
    setMarkers(
      {
        markers: markers.includes(location.id)
          ? markers.filter((m) => m !== location.id)
          : [...markers, location.id],
        polygons: polygons.includes(location.id)
          ? polygons.filter((p) => p !== location.id)
          : [...polygons, location.id],
      },
      {
        history: 'replace',
        shallow: true,
      },
    )
  }

  useEffect(() => {
    const updateUnclusteredPoints = () => {
      // Only show individual markers when zoomed in beyond the cluster max zoom
      if (currentZoom > 5) {
        const visibleLocations = locations?.docs || []
        setUnclusteredPoints(visibleLocations)
      } else {
        setUnclusteredPoints([])
      }
    }

    // Only update if map is loaded and we have locations
    if (mapLoaded && locations?.docs) {
      updateUnclusteredPoints()
    }
  }, [locations?.docs, currentZoom, mapLoaded])

  return (
    <div className="w-screen h-screen">
      <Map
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN!}
        initialViewState={{
          longitude: 24.7499,
          latitude: -28.7282,
          zoom: 5,
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v9"
        interactiveLayerIds={['unclustered-point', 'clusters']}
        onMove={(e) => {
          setCurrentZoom(e.viewState.zoom)
        }}
        onLoad={(e) => {
          const map = e.target

          // Set map as loaded and trigger initial update
          setMapLoaded(true)
          setCurrentZoom(map.getZoom())

          // Add cluster click handler
          map.on('click', 'clusters', handleClusterClick)

          // Add cursor change for clusters
          map.on('mouseenter', 'clusters', () => {
            map.getCanvas().style.cursor = 'pointer'
          })

          map.on('mouseleave', 'clusters', () => {
            map.getCanvas().style.cursor = ''
          })
        }}
      >
        {polygonGeoJSON.features.length > 0 && (
          <Source id="polygons" type="geojson" data={polygonGeoJSON}>
            <Layer {...fillLayer} />
            <Layer {...lineLayer} />
          </Source>
        )}

        <Source
          id="markers"
          type="geojson"
          data={markerGeoJSON}
          cluster={true}
          clusterMaxZoom={5} // Maximum zoom level for clustering
          clusterRadius={50} // Radius of each cluster when clustering points
        >
          <Layer {...clusterLayer} />
          <Layer {...clusterCountLayer} />
          <Layer {...unclusteredPointLayer} />
        </Source>

        {/* Custom React markers for unclustered points */}
        {unclusteredPoints.map((location) => (
          <Marker
            key={location.id}
            longitude={location.coordinates.longitude}
            latitude={location.coordinates.latitude}
            anchor="center"
            onClick={() => handleMarkerClick(location)}
          >
            <div className="bg-background px-3 py-1 rounded-full border shadow-sm cursor-pointer hover:bg-accent transition-colors">
              {location.title}
            </div>
          </Marker>
        ))}

        {selectedLocation && (
          <Popup
            longitude={selectedLocation.coordinates.longitude}
            latitude={selectedLocation.coordinates.latitude}
            anchor="bottom"
            onClose={() => setSelectedLocation(null)}
            closeButton={false}
            closeOnClick={false}
            className="location-popup"
          >
            <div className="w-[300px] sm:w-[350px] p-0">
              <div className="flex items-start justify-between p-4 pb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-base truncate">{selectedLocation.title}</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 shrink-0"
                      onClick={() => setSelectedLocation(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {selectedLocation.locationName}
                  </p>

                  <div className="flex flex-wrap gap-1 mb-2">
                    <Badge
                      variant="outline"
                      className={`text-xs ${getStatusColor(selectedLocation.status)}`}
                    >
                      {selectedLocation.status}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {getCategoryLabel(selectedLocation.category)}
                    </Badge>
                  </div>
                </div>
              </div>

              {selectedLocation.description && (
                <div className="px-4 pb-2">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {selectedLocation.description}
                  </p>
                </div>
              )}

              {selectedLocation.additionalInfo && (
                <div className="px-4 pb-2 space-y-1">
                  {selectedLocation.additionalInfo.operatingHours && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{selectedLocation.additionalInfo.operatingHours}</span>
                    </div>
                  )}
                  {selectedLocation.additionalInfo.entranceFee && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <DollarSign className="h-3 w-3" />
                      <span>{selectedLocation.additionalInfo.entranceFee}</span>
                    </div>
                  )}
                  {selectedLocation.additionalInfo.bestTimeToVisit && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{selectedLocation.additionalInfo.bestTimeToVisit}</span>
                    </div>
                  )}
                </div>
              )}

              {(selectedLocation.contactInfo?.website ||
                selectedLocation.contactInfo?.phone ||
                selectedLocation.contactInfo?.email) && (
                <>
                  <Separator className="mx-4" />
                  <div className="p-4 pt-2">
                    <div className="space-y-2">
                      {selectedLocation.contactInfo?.website && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full flex items-center justify-center gap-2"
                          onClick={() =>
                            window.open(selectedLocation.contactInfo!.website!, '_blank')
                          }
                        >
                          <ExternalLink className="h-4 w-4" />
                          Visit Website
                        </Button>
                      )}
                      {selectedLocation.contactInfo?.phone && (
                        <div className="text-xs text-muted-foreground">
                          📞 {selectedLocation.contactInfo.phone}
                        </div>
                      )}
                      {selectedLocation.contactInfo?.email && (
                        <div className="text-xs text-muted-foreground">
                          ✉️ {selectedLocation.contactInfo.email}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {selectedLocation.tags && selectedLocation.tags.length > 0 && (
                <>
                  <Separator className="mx-4" />
                  <div className="p-4 pt-2">
                    <div className="flex flex-wrap gap-1">
                      {selectedLocation.tags.slice(0, 5).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag.tag}
                        </Badge>
                      ))}
                      {selectedLocation.tags.length > 5 && (
                        <Badge variant="secondary" className="text-xs">
                          +{selectedLocation.tags.length - 5} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </Popup>
        )}
      </Map>
    </div>
  )
}

export default LocationsMap
