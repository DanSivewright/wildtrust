import configPromise from '@payload-config'
import { getPayload } from 'payload'
import LocationsMap from './components/locations-map'

type Props = {}
const Map: React.FC<Props> = async ({}) => {
  const payload = await getPayload({ config: configPromise })
  const locations = await payload.find({
    collection: 'locations',
  })

  return (
    <>
      <LocationsMap locations={locations} />
    </>
  )
}
export default Map
