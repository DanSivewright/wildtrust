import configPromise from '@payload-config'
import { getPayload } from 'payload'
import LocationsMap from './components/locations-map'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'

import { Separator } from '@/components/ui/separator'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Suspense } from 'react'

type Props = {}
const Map: React.FC<Props> = async ({}) => {
  const payload = await getPayload({ config: configPromise })
  const locations = await payload.find({
    collection: 'locations',
    limit: 100,
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

  // await payload.update({
  //   collection: 'locations',
  //   id: '6887122bb7087a7087d43de6',
  //   data: {
  //     polygon: data?.features?.[0]?.geometry?.coordinates?.[0]?.map((coord) => ({
  //       coordinates: [
  //         {
  //           latitude: coord[1],
  //           longitude: coord[0],
  //         },
  //       ],
  //     })),
  //   },
  // })
  return (
    <Suspense>
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
    </Suspense>
  )
}
export default Map

const data = {
  type: 'FeatureCollection',
  features: [
    {
      id: 'mPwGf5IWv7uYBmHpK0JUvpgesXpQdDZR',
      type: 'Feature',
      properties: {},
      geometry: {
        coordinates: [
          [
            [12.730472723208294, -29.90187766877493],
            [12.722534942408174, -31.197821329905885],
            [12.210263816190576, -30.359530305464702],
            [12.730472723208294, -29.90187766877493],
          ],
        ],
        type: 'Polygon',
      },
    },
  ],
}
