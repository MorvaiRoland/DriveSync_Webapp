'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'

// FONTOS: Nem importáljuk a CSS-t 'import ...' módon, 
// hanem lentebb a JSX-ben linkeljük be, így biztosan betöltődik mobilon is.

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

interface TripMapProps {
  startPos?: [number, number] | null
  endPos?: [number, number] | null
  routeGeoJson?: any
}

export default function TripMap({ startPos, endPos, routeGeoJson }: TripMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [isMapLoaded, setIsMapLoaded] = useState(false)

  useEffect(() => {
    if (!mapContainer.current) return
    if (map.current) return

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        // A v11 stílus stabilabb és gyorsabb mobilon
        style: 'mapbox://styles/mapbox/streets-v11', 
        center: [19.0402, 47.4979], // Budapest
        zoom: 10,
        attributionControl: false, // Mobil nézet tisztítása
        cooperativeGestures: true, // Kétujjas görgetés mobilon (jobb UX)
      })

      // Navigációs gombok
      map.current.addControl(new mapboxgl.NavigationControl(), 'bottom-right')

      map.current.on('load', () => {
        setIsMapLoaded(true)
        // Azonnali átméretezés, ha a CSS késve töltődne be
        map.current?.resize()
      })

      // Ha hiba történik (pl. AdBlocker blokkol), csak logoljuk, de ne omoljon össze
      map.current.on('error', (e) => {
        // Hagyjuk figyelmen kívül a "BLOCKED_BY_CLIENT" hibákat, azok nem kritikusak
        if (e.error && e.error.message !== 'Failed to fetch') {
             console.warn('Mapbox warning:', e)
        }
      })

    } catch (e) {
      console.error('Mapbox init error:', e)
    }

    return () => {
      map.current?.remove()
      map.current = null
    }
  }, [])

  // --- MARKEREK ÉS ÚTVONAL FRISSÍTÉSE ---
  useEffect(() => {
    if (!map.current || !isMapLoaded) return
    const currentMap = map.current

    // Régi elemek törlése
    const markers = document.getElementsByClassName('mapboxgl-marker')
    while(markers.length > 0) markers[0].remove()

    const bounds = new mapboxgl.LngLatBounds()
    let hasPoints = false

    // Start pont (Zöld)
    if (startPos) {
      new mapboxgl.Marker({ color: '#22c55e' })
        .setLngLat([startPos[1], startPos[0]])
        .addTo(currentMap)
      bounds.extend([startPos[1], startPos[0]])
      hasPoints = true
    }

    // Cél pont (Piros)
    if (endPos) {
      new mapboxgl.Marker({ color: '#ef4444' })
        .setLngLat([endPos[1], endPos[0]])
        .addTo(currentMap)
      bounds.extend([endPos[1], endPos[0]])
      hasPoints = true
    }

    // Útvonal rajzolása
    const routeSourceId = 'route-source'
    const routeLayerId = 'route-layer'

    if (currentMap.getSource(routeSourceId)) {
        // Ha már létezik, frissítjük az adatot
        (currentMap.getSource(routeSourceId) as mapboxgl.GeoJSONSource).setData(
            routeGeoJson || { type: 'FeatureCollection', features: [] }
        )
    } else if (routeGeoJson) {
        // Ha még nincs, hozzáadjuk
        currentMap.addSource(routeSourceId, { type: 'geojson', data: routeGeoJson })
        currentMap.addLayer({
            id: routeLayerId,
            type: 'line',
            source: routeSourceId,
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: { 'line-color': '#3b82f6', 'line-width': 5, 'line-opacity': 0.75 }
        })
    }

    // Zoomolás, hogy minden látsszon
    if (hasPoints) {
      // Kis késleltetés a biztonság kedvéért mobilon
      setTimeout(() => {
          currentMap.fitBounds(bounds, { padding: 50, maxZoom: 15, animate: true })
      }, 200)
    }

  }, [startPos, endPos, routeGeoJson, isMapLoaded])

  return (
    <>
      {/* KÖZVETLEN CSS LINK - Ez a kulcs a "meg nem jelenő" térképhez!
        Így nem függünk a Next.js CSS importálásától, ami mobilon néha elhasal.
      */}
      <link href="https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css" rel="stylesheet" />
      
      <div className="relative w-full h-full min-h-[300px] bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden">
        <div ref={mapContainer} className="absolute inset-0 w-full h-full" />
        
        {/* Töltésjelző, amíg be nem töltődik a térkép */}
        {!isMapLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-900 z-10">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs text-slate-500">Térkép indítása...</span>
                </div>
            </div>
        )}
      </div>
    </>
  )
}