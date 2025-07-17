// import { SearchForm } from './search-form'
// import { VersionSwitcher } from './version-switcher'
import type { Location } from '@/payload-types'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import { PaginatedDocs } from 'payload'
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

type Props = {
  locations: PaginatedDocs<Location>
} & React.ComponentProps<typeof Sidebar>

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

const LocationsSidebar: React.FC<Props> = ({ locations, ...props }) => {
  return (
    <Sidebar variant="inset" data-theme="dark" {...props}>
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
                    <button className="flex items-center gap-3 h-fit ">
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
  )
}
export default LocationsSidebar
