'use client'

import { useEffect, useRef, useState } from 'react'
import 'mapbox-gl/dist/mapbox-gl.css'
// Fontos: Itt is kellhet a "* as" import a TypeScript miatt
import * as mapboxgl from 'mapbox-gl' 

interface TripMapProps {
  startPos: [number, number] | null // [lat, lng]
  endPos: [number, number] | null   // [lat, lng]
  routeGeoJson: any | null
}

export default function TripMap({ startPos, endPos, routeGeoJson }: TripMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const startMarker = useRef<mapboxgl.Marker | null>(null)
  const endMarker = useRef<mapboxgl.Marker | null>(null)

  // 1. Térkép inicializálása (Csak egyszer fut le)
  useEffect(() => {
    if (map.current || !mapContainer.current) return

    // Token beállítása
    (mapboxgl as any).accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/navigation-night-v1',
      center: [19.0402, 47.4979], // Budapest [lng, lat]
      zoom: 6,
    })

    // Tisztítás unmountkor
    return () => {
      map.current?.remove()
      map.current = null
    }
  }, [])

  // 2. Markerek kezelése (Amikor a startPos vagy endPos változik)
  useEffect(() => {
    if (!map.current) return

    // --- Start Marker (A) ---
    if (startPos) {
      if (!startMarker.current) {
        // Marker DOM elem létrehozása manuálisan
        const el = document.createElement('div')
        el.className = 'w-6 h-6 bg-emerald-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-xs text-white font-bold'
        el.innerHTML = 'A'
        
        startMarker.current = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat([startPos[1], startPos[0]])
          .addTo(map.current)
      } else {
        startMarker.current.setLngLat([startPos[1], startPos[0]])
      }
    } else {
      startMarker.current?.remove()
      startMarker.current = null
    }

    // --- End Marker (B) ---
    if (endPos) {
      if (!endMarker.current) {
        const el = document.createElement('div')
        el.className = 'w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-xs text-white font-bold'
        el.innerHTML = 'B'

        endMarker.current = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat([endPos[1], endPos[0]])
          .addTo(map.current)
      } else {
        endMarker.current.setLngLat([endPos[1], endPos[0]])
      }
    } else {
      endMarker.current?.remove()
      endMarker.current = null
    }

    // --- Zoom igazítás (FitBounds) ---
    if (startPos && endPos) {
        const bounds = new mapboxgl.LngLatBounds()
            .extend([startPos[1], startPos[0]])
            .extend([endPos[1], endPos[0]])
        
        map.current.fitBounds(bounds, { padding: 50, duration: 1000 })
    } else if (startPos) {
        map.current.flyTo({ center: [startPos[1], startPos[0]], zoom: 12 })
    }

  }, [startPos, endPos])

  // 3. Útvonal réteg (Route) kezelése
  useEffect(() => {
    if (!map.current || !routeGeoJson) return

    const mapInstance = map.current

    // Megvárjuk, amíg a stílus betöltődik, különben hibát dob
    if (!mapInstance.isStyleLoaded()) {
        mapInstance.once('style.load', () => drawRoute(mapInstance, routeGeoJson))
    } else {
        drawRoute(mapInstance, routeGeoJson)
    }

  }, [routeGeoJson])

  // Segédfüggvény a vonal rajzoláshoz
  const drawRoute = (mapInstance: mapboxgl.Map, data: any) => {
    // Ha már létezik a forrás, csak frissítjük az adatot
    const source = mapInstance.getSource('route') as mapboxgl.GeoJSONSource
    
    if (source) {
      source.setData(data)
    } else {
      // Ha nem létezik, hozzáadjuk a forrást és a réteget
      mapInstance.addSource('route', {
        type: 'geojson',
        data: data
      })

      mapInstance.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#3b82f6',
          'line-width': 5,
          'line-opacity': 0.75
        }
      })
    }
  }

  // A konténer, amibe a Mapbox injektálja magát
  return <div ref={mapContainer} style={{ width: '100%', height: '100%', minHeight: '400px' }} />
}