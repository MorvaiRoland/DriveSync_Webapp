'use client'

import { useEffect, useRef } from 'react'
// A CSS-t tedd át a layout.tsx-be! Ha lusta vagy, hagyd itt, de jobb helye van ott.
import * as mapboxgl from 'mapbox-gl'

interface TripMapProps {
  startPos: [number, number] | null
  endPos: [number, number] | null
  routeGeoJson: any | null
}

export default function TripMap({ startPos, endPos, routeGeoJson }: TripMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const startMarker = useRef<mapboxgl.Marker | null>(null)
  const endMarker = useRef<mapboxgl.Marker | null>(null)

  useEffect(() => {
    if (map.current || !mapContainer.current) return

    // Ellenőrzés: Van token?
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
        console.error("HIBA: Nincs beállítva a NEXT_PUBLIC_MAPBOX_TOKEN!");
        return;
    }
    
    (mapboxgl as any).accessToken = token

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      // Biztonságosabb stílus teszteléshez:
      style: 'mapbox://styles/mapbox/dark-v11', 
      center: [19.0402, 47.4979],
      zoom: 6,
    })

    return () => {
      map.current?.remove()
      map.current = null
    }
  }, [])

  // ... (A marker és route logika változatlan marad, az jó volt) ...
  // Másolom a marker logikát a teljesség kedvéért:
  useEffect(() => {
    if (!map.current) return

    if (startPos) {
      if (!startMarker.current) {
        const el = document.createElement('div')
        el.className = 'w-6 h-6 bg-emerald-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-xs text-white font-bold'
        el.innerHTML = 'A'
        startMarker.current = new mapboxgl.Marker({ element: el, anchor: 'bottom' }).setLngLat([startPos[1], startPos[0]]).addTo(map.current)
      } else {
        startMarker.current.setLngLat([startPos[1], startPos[0]])
      }
    }

    if (endPos) {
      if (!endMarker.current) {
        const el = document.createElement('div')
        el.className = 'w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-xs text-white font-bold'
        el.innerHTML = 'B'
        endMarker.current = new mapboxgl.Marker({ element: el, anchor: 'bottom' }).setLngLat([endPos[1], endPos[0]]).addTo(map.current)
      } else {
        endMarker.current.setLngLat([endPos[1], endPos[0]])
      }
    }

    if (startPos && endPos) {
        const bounds = new mapboxgl.LngLatBounds().extend([startPos[1], startPos[0]]).extend([endPos[1], endPos[0]])
        map.current.fitBounds(bounds, { padding: 50, duration: 1000 })
    } else if (startPos) {
        map.current.flyTo({ center: [startPos[1], startPos[0]], zoom: 12 })
    }
  }, [startPos, endPos])

  return (
    <div 
        ref={mapContainer} 
        className="w-full h-full min-h-[400px] rounded-xl overflow-hidden shadow-inner" 
    />
  )
}