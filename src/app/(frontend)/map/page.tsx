import configPromise from '@payload-config'
import { getPayload } from 'payload'
import LocationsMap from './components/locations-map'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import LocationsSidebar from './components/locations-sidebar'
import { Separator } from '@/components/ui/separator'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

type Props = {}
const Map: React.FC<Props> = async ({}) => {
  const payload = await getPayload({ config: configPromise })
  const locations = await payload.find({
    collection: 'locations',
  })

  // async function updateGeometry() {
  //   await payload.create({
  //     collection: 'features',
  //     data: {
  //       name: 'Mining Right',
  //       type: 'FeatureCollection',
  //       features: miningRight.features.map((feature) => ({
  //         type: 'Feature',
  //         properties: Object.entries(feature.properties).map(([key, value]) => ({
  //           key,
  //           value: String(value || ''),
  //         })),
  //         geometry: {
  //           type: feature.geometry.type as 'MultiPolygon' | 'Polygon',
  //           coordinates: feature.geometry.coordinates.map((coord) => ({
  //             latitude: coord[1],
  //             longitude: coord[0],
  //           })),
  //         },
  //       })),
  //     },
  //   })

  // }
  // console.log('payload:::', {
  //   collection: 'features',
  //   id: '6878f62b634f8c215a870e27',
  //   data: {
  //     features: miningRight.features.map((feature) => ({
  //       type: 'Feature',
  //       properties: Object.entries(feature.properties).map(([key, value]) => ({
  //         key,
  //         value: String(value || ''),
  //       })),
  //       geometry: {
  //         type: feature.geometry.type as 'MultiPolygon' | 'Polygon',
  //         coordinates: feature.geometry.coordinates?.[0]?.[0]?.map((coord) => ({
  //           point: [coord[0], coord[1]],
  //         })),
  //       },
  //     })),
  //   },
  // })
  // console.log('payload:::', {
  //   collection: 'features',
  //   data: {
  //     name: 'Mining Right',
  //     type: 'FeatureCollection',
  //     features: miningRight.features.slice(0, 1).map((feature) => ({
  //       type: 'Feature',
  //       properties: Object.entries(feature.properties).map(([key, value]) => ({
  //         key,
  //         value: String(value || ''),
  //       })),
  //       geometry: {
  //         type: feature.geometry.type as 'MultiPolygon' | 'Polygon',

  //         coordinates: [
  //           {
  //             point: [1, 2],
  //           },
  //         ],
  //       },
  //       // properties: Object.entries(feature.properties).map(([key, value]) => ({
  //       //   key,
  //       //   value: String(value || ''),
  //       // })),
  //       // geometry: {
  //       //   type: feature.geometry.type as 'MultiPolygon' | 'Polygon',
  //       //   coordinates: feature.geometry.coordinates?.[0]?.[0]?.map((coord) => ({
  //       //     point: [coord[0], coord[1]],
  //       //   })),
  //       // },
  //     })),
  //   },
  // })
  // await payload.create({
  //   collection: 'features',
  //   data: {
  //     name: 'Mining Right',
  //     type: 'FeatureCollection',
  //     features: miningRight.features.map((feature) => ({
  //       type: 'Feature',
  //       properties: Object.entries(feature.properties).map(([key, value]) => ({
  //         key,
  //         value: String(value || ''),
  //       })),
  //       geometry: {
  //         type: feature.geometry.type as 'MultiPolygon' | 'Polygon',
  //         coordinates: feature.geometry.coordinates?.[0]?.[0]?.map((coord) => ({
  //           point: [coord[0], coord[1]],
  //         })),
  //       },
  //       // properties: Object.entries(feature.properties).map(([key, value]) => ({
  //       //   key,
  //       //   value: String(value || ''),
  //       // })),
  //       // geometry: {
  //       //   type: feature.geometry.type as 'MultiPolygon' | 'Polygon',
  //       //   coordinates: feature.geometry.coordinates?.[0]?.[0]?.map((coord) => ({
  //       //     point: [coord[0], coord[1]],
  //       //   })),
  //       // },
  //     })),
  //   },
  // })

  return (
    <SidebarProvider
      data-theme="dark"
      style={
        {
          '--sidebar-width': '30rem',
        } as React.CSSProperties
      }
    >
      <LocationsMap locations={locations} />
    </SidebarProvider>
  )
}
export default Map
