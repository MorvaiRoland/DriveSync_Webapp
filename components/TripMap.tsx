'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'

// CSS importálása HELYETT dinamikusan injektáljuk, vagy Link taget használunk
// Ez megoldja a build és betöltési hibákat mobilon

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

interface TripMapProps {
  startPos?: [number, number] | null
  endPos?: [number, number] | null
  routeGeoJson?: any
}

export default function TripMap({ startPos, endPos, routeGeoJson }: TripMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  // Alapból true, amíg be nem tölt
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!mapContainer.current) return

    try {
        if (map.current) return

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/streets-v11', // v11 stabilabb mobilon mint a v12
            center: [19.0402, 47.4979],
            zoom: 10,
            cooperativeGestures: true, // Mobilon segít a görgetésben
            attributionControl: false
        })

        map.current.addControl(new mapboxgl.NavigationControl(), 'bottom-right')

        map.current.on('load', () => {
            setLoading(false)
            // Átméretezés kényszerítése betöltéskor
            map.current?.resize()
        })

    } catch (e) {
        console.error('Mapbox init error:', e)
    }

    return () => {
        map.current?.remove()
        map.current = null
    }
  }, [])

  // Markerek és útvonal frissítése
  useEffect(() => {
    if (!map.current || loading) return
    const currentMap = map.current

    // Markerek törlése és újrarajzolása
    const markers = document.getElementsByClassName('mapboxgl-marker')
    while(markers.length > 0) markers[0].remove()

    const bounds = new mapboxgl.LngLatBounds()
    let hasPoints = false

    if (startPos) {
        new mapboxgl.Marker({ color: '#22c55e' }).setLngLat([startPos[1], startPos[0]]).addTo(currentMap)
        bounds.extend([startPos[1], startPos[0]])
        hasPoints = true
    }
    if (endPos) {
        new mapboxgl.Marker({ color: '#ef4444' }).setLngLat([endPos[1], endPos[0]]).addTo(currentMap)
        bounds.extend([endPos[1], endPos[0]])
        hasPoints = true
    }

    // Útvonal
    if (currentMap.getSource('route')) {
        (currentMap.getSource('route') as mapboxgl.GeoJSONSource).setData(routeGeoJson || { type: 'FeatureCollection', features: [] })
    } else if (routeGeoJson) {
        currentMap.addLayer({
            id: 'route',
            type: 'line',
            source: {
                type: 'geojson',
                data: routeGeoJson
            },
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: { 'line-color': '#3b82f6', 'line-width': 5, 'line-opacity': 0.75 }
        })
    }

    if (hasPoints) {
        currentMap.fitBounds(bounds, { padding: 50, maxZoom: 15, animate: false })
    }
  }, [startPos, endPos, routeGeoJson, loading])

  return (
    <>
      {/* CSS betöltése közvetlenül a komponensben */}
      <link href="https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css" rel="stylesheet" />
      
      <div className="relative w-full h-full min-h-[300px]">
        <div ref={mapContainer} className="absolute inset-0 rounded-xl" />
        {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-900 z-10">
                <span className="text-xs text-slate-500 animate-pulse">Térkép betöltése...</span>
            </div>
        )}
      </div>
    </>
  )
}