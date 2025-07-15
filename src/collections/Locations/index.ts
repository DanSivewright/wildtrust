import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'
import { slugField } from '@/fields/slug'
import type { CollectionConfig } from 'payload'

export const Locations: CollectionConfig = {
  slug: 'locations',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'locationName', 'updatedAt'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Location Title',
      admin: {
        description: 'The main title for this location point',
      },
    },
    {
      name: 'locationName',
      type: 'text',
      required: true,
      label: 'Location Name',
      admin: {
        description: 'The specific name of the location (e.g., "Cape Point", "Robben Island")',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      label: 'Description',
      admin: {
        description: 'Detailed description of this location and its significance',
        rows: 4,
      },
    },
    {
      name: 'coordinates',
      type: 'group',
      required: true,
      label: 'Coordinates',
      admin: {
        description: 'The exact coordinates of this location on the map',
      },
      fields: [
        {
          name: 'latitude',
          type: 'number',
          required: true,
          label: 'Latitude',
          admin: {
            description: 'Latitude coordinate (e.g., -33.9249 for Cape Town)',
            step: 0.0001,
          },
        },
        {
          name: 'longitude',
          type: 'number',
          required: true,
          label: 'Longitude',
          admin: {
            description: 'Longitude coordinate (e.g., 18.4241 for Cape Town)',
            step: 0.0001,
          },
        },
      ],
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      label: 'Category',
      admin: {
        description: 'The type of location this represents',
      },
      options: [
        {
          label: 'Marine Protected Area',
          value: 'marine-protected-area',
        },
        {
          label: 'Wildlife Sanctuary',
          value: 'wildlife-sanctuary',
        },
        {
          label: 'Conservation Area',
          value: 'conservation-area',
        },
        {
          label: 'Research Station',
          value: 'research-station',
        },
        {
          label: 'Tourist Attraction',
          value: 'tourist-attraction',
        },
        {
          label: 'Historical Site',
          value: 'historical-site',
        },
        {
          label: 'Beach',
          value: 'beach',
        },
        {
          label: 'Harbor',
          value: 'harbor',
        },
        {
          label: 'Other',
          value: 'other',
        },
      ],
      defaultValue: 'other',
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      label: 'Status',
      admin: {
        description: 'The current status of this location',
      },
      options: [
        {
          label: 'Active',
          value: 'active',
        },
        {
          label: 'Under Development',
          value: 'under-development',
        },
        {
          label: 'Closed',
          value: 'closed',
        },
        {
          label: 'Seasonal',
          value: 'seasonal',
        },
      ],
      defaultValue: 'active',
    },
    {
      name: 'contactInfo',
      type: 'group',
      label: 'Contact Information',
      admin: {
        description: 'Optional contact information for this location',
      },
      fields: [
        {
          name: 'phone',
          type: 'text',
          label: 'Phone Number',
        },
        {
          name: 'email',
          type: 'email',
          label: 'Email Address',
        },
        {
          name: 'website',
          type: 'text',
          label: 'Website URL',
        },
      ],
    },
    {
      name: 'additionalInfo',
      type: 'group',
      label: 'Additional Information',
      admin: {
        description: 'Additional details about this location',
      },
      fields: [
        {
          name: 'operatingHours',
          type: 'text',
          label: 'Operating Hours',
          admin: {
            description: 'e.g., "Daily 8:00 AM - 6:00 PM" or "By appointment only"',
          },
        },
        {
          name: 'entranceFee',
          type: 'text',
          label: 'Entrance Fee',
          admin: {
            description: 'e.g., "Free", "R50 per person", "Donation suggested"',
          },
        },
        {
          name: 'bestTimeToVisit',
          type: 'text',
          label: 'Best Time to Visit',
          admin: {
            description: 'e.g., "Early morning for wildlife viewing", "Low tide for beach access"',
          },
        },
      ],
    },
    {
      name: 'images',
      type: 'array',
      label: 'Images',
      admin: {
        description: 'Images related to this location',
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'caption',
          type: 'text',
          label: 'Image Caption',
        },
      ],
    },
    {
      name: 'tags',
      type: 'array',
      label: 'Tags',
      admin: {
        description: 'Tags to help categorize and search for this location',
      },
      fields: [
        {
          name: 'tag',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        position: 'sidebar',
      },
      hooks: {
        beforeChange: [
          ({ siblingData, value }) => {
            if (siblingData._status === 'published' && !value) {
              return new Date()
            }
            return value
          },
        ],
      },
    },
    {
      name: 'polygon',
      type: 'array',
      label: 'Area Polygon',
      fields: [
        {
          name: 'coordinates',
          type: 'array',
          fields: [
            {
              name: 'latitude',
              type: 'number',
              required: true,
            },
            {
              name: 'longitude',
              type: 'number',
              required: true,
            },
          ],
        },
      ],
    },
    ...slugField(),
  ],
}
