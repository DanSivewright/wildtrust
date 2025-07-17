'use client'

import type { Location } from '@/payload-types'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import { Label } from '@/components/ui/label'
import { FilterIcon, SearchIcon } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import useSupercluster from 'use-supercluster'
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

const categories: Record<Location['category'] | 'all', string> = {
  all: 'All Categories',
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

const statuses: Record<Location['status'] | 'all', string> = {
  all: 'All Statuses',
  active: 'Active',
  'under-development': 'Under Development',
  closed: 'Closed',
  seasonal: 'Seasonal',
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
    <>
      <Sidebar variant="inset" data-theme="dark">
        <SidebarHeader className="p-0">
          <SidebarMenu className="p-0">
            <SidebarMenuItem className="rounded-md">
              <SidebarMenuButton size="lg" asChild className="w-full rounded-md h-fit">
                <button className="flex items-center gap-3">
                  <Avatar className="object-contain">
                    <AvatarImage src="/media/wildtrust-logo.png" />
                    <AvatarFallback>WT</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <p className="text-lg font-medium">Wild Trust</p>
                    <p className="text-xs text-muted-foreground">Conservation Map</p>
                  </div>
                </button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <SidebarGroup className="p-0">
            <SidebarGroupContent className="relative">
              <Label htmlFor="search" className="sr-only">
                Search Locations
              </Label>
              <SidebarInput
                id="search"
                placeholder="Search for a location..."
                className="pl-8 h-14 rounded-2xl ring-1 ring-foreground/10 shadow-lg shadow-foreground/5"
              />
              <SearchIcon className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 select-none opacity-50" />
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup className="p-0 mt-4">
            <div className="flex items-center flex-wrap flex-1 gap-2">
              <div className="flex flex-col grow gap-2">
                <Label className="text-xs font-light">Show me:</Label>
                <Select defaultValue="all">
                  <SelectTrigger className="rounded-xl text-xs h-8 w-full">
                    <SelectValue className="text-xs" placeholder="Locations" />
                  </SelectTrigger>
                  <SelectContent
                    data-theme="dark"
                    className="rounded-2xl bg-background/50 backdrop-blur-md"
                  >
                    {Object.entries(categories).map(([key, value]) => (
                      <SelectItem
                        className="rounded-xl focus:bg-blue-500/80 focus:ring-1 focus:ring-blue-500 focus:shadow-lg focus:shadow-blue-500/20"
                        key={key}
                        value={key}
                      >
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col grow gap-2">
                <Label className="text-xs font-light">Status:</Label>
                <Select defaultValue="all">
                  <SelectTrigger className="rounded-xl text-xs h-8 w-full">
                    <SelectValue className="text-xs" placeholder="Locations" />
                  </SelectTrigger>
                  <SelectContent
                    data-theme="dark"
                    className="rounded-2xl bg-background/50 backdrop-blur-md"
                  >
                    {Object.entries(statuses).map(([key, value]) => (
                      <SelectItem
                        //
                        className="rounded-xl focus:bg-blue-500/80 focus:ring-1 focus:ring-blue-500 focus:shadow-lg focus:shadow-blue-500/20"
                        key={key}
                        value={key}
                      >
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col grow gap-2">
                <Label className="text-xs font-light">Sort by:</Label>
                <Select defaultValue="newest">
                  <SelectTrigger className="rounded-xl text-xs h-8 w-full">
                    <SelectValue className="text-xs" placeholder="Locations" />
                  </SelectTrigger>
                  <SelectContent
                    data-theme="dark"
                    className="rounded-2xl bg-background/50 backdrop-blur-md"
                  >
                    <SelectItem
                      className="rounded-xl focus:bg-blue-500/80 focus:ring-1 focus:ring-blue-500 focus:shadow-lg focus:shadow-blue-500/20"
                      value="newest"
                    >
                      Newest
                    </SelectItem>
                    <SelectItem
                      className="rounded-xl focus:bg-blue-500/80 focus:ring-1 focus:ring-blue-500 focus:shadow-lg focus:shadow-blue-500/20"
                      value="oldest"
                    >
                      Oldest
                    </SelectItem>
                    <SelectItem
                      className="rounded-xl focus:bg-blue-500/80 focus:ring-1 focus:ring-blue-500 focus:shadow-lg focus:shadow-blue-500/20"
                      value="a-z"
                    >
                      A-Z
                    </SelectItem>
                    <SelectItem
                      className="rounded-xl focus:bg-blue-500/80 focus:ring-1 focus:ring-blue-500 focus:shadow-lg focus:shadow-blue-500/20"
                      value="z-a"
                    >
                      Z-A
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="secondary"
                className="h-8 ring-1 ring-foreground/10 bg-background w-full rounded-xl gap-2 font-light"
              >
                <FilterIcon className="size-4" />
                More Filters
              </Button>
            </div>
          </SidebarGroup>
        </SidebarHeader>
        <SidebarContent>
          {/* We create a SidebarGroup for each parent. */}
          <SidebarGroup>
            <SidebarGroupLabel>Locations</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {locations?.docs?.map((location) => (
                  <SidebarMenuItem className="h-fit" key={location.id}>
                    <SidebarMenuButton
                      asChild
                      className="h-fit hover:bg-blue-500/80 hover:ring-1 hover:shadow-lg hover:shadow-blue-500/20 rounded-2xl"
                    >
                      <button
                        onClick={() => {
                          mapRef.current?.flyTo({
                            center: [location.coordinates.longitude, location.coordinates.latitude],
                            zoom: 10,
                          })
                        }}
                        className="flex items-center gap-3 h-fit "
                      >
                        <Avatar>
                          <AvatarFallback className="bg-blue-600">DS</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <p className="text-sm font-normal">{location.title}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-muted-foreground">
                              {statuses[location.status]}
                            </p>
                            <div className="w-px bg-muted-foreground h-3 rotate-12"></div>
                            <p className="text-xs text-muted-foreground">
                              {categories[location.category]}
                            </p>
                          </div>
                        </div>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
      <SidebarInset className="overflow-hidden" data-theme="light">
        <div data-theme="light" className="w-full h-full">
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
      </SidebarInset>
    </>
  )
}

export default LocationsMap
