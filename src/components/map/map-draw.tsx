'use client'

import React, { useEffect, useState } from 'react'
import { useMap } from '@/providers/map-context'
import MapboxDraw from '@mapbox/mapbox-gl-draw'
import * as turf from '@turf/turf'
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'

const MapDraw: React.FC = () => {
  const { map } = useMap()
  const [roundedArea, setRoundedArea] = useState<number | undefined>()
  const [draw, setDraw] = useState<MapboxDraw | null>(null)

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
    setDraw(drawInstance)

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

export default MapDraw
