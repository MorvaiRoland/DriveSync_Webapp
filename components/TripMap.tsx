'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css' // Hivatalos CSS import

// Token beállítása
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

interface TripMapProps {
  startPos?: [number, number] | null
  endPos?: [number, number] | null
  routeGeoJson?: any
}

export default function TripMap({ startPos, endPos, routeGeoJson }: TripMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)

  useEffect(() => {
    if (!mapContainer.current) return
    if (map.current) return // Ha már létezik, ne hozza létre újra

    try {
        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            // Stabil stílus, ami v2 és v3 verzióval is működik
            style: 'mapbox://styles/mapbox/streets-v12', 
            center: [19.0402, 47.4979], // Budapest
            zoom: 10,
            attributionControl: false,
            cooperativeGestures: true // Mobilon jobb görgetés
        })

        map.current.addControl(new mapboxgl.NavigationControl(), 'bottom-right')

        // Biztonsági átméretezés 1 másodperc után (segít, ha mobilon "összecsuklik")
        setTimeout(() => {
            map.current?.resize()
        }, 1000)

    } catch (e) {
        console.error('Mapbox init error:', e)
    }

    return () => {
        map.current?.remove()
        map.current = null
    }
  }, [])

  // Markerek és útvonal frissítése (Változatlan logika)
  useEffect(() => {
    if (!map.current) return
    const currentMap = map.current

    // Várjuk meg, amíg a stílus betöltődik, mielőtt rajzolunk
    if (!currentMap.isStyleLoaded()) {
        currentMap.once('style.load', () => { /* Újra triggereljük a frissítést */ })
        return
    }

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

    if (currentMap.getSource('route')) {
        (currentMap.getSource('route') as mapboxgl.GeoJSONSource).setData(
            routeGeoJson || { type: 'FeatureCollection', features: [] }
        )
    } else if (routeGeoJson) {
        currentMap.addSource('route', { type: 'geojson', data: routeGeoJson })
        currentMap.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: { 'line-color': '#3b82f6', 'line-width': 5, 'line-opacity': 0.75 }
        })
    }

    if (hasPoints) {
        // Kis késleltetés a fitBounds-nak, hogy biztosan legyen mérete a térképnek
        setTimeout(() => {
            currentMap.fitBounds(bounds, { padding: 50, maxZoom: 15, animate: true })
        }, 200)
    }
  }, [startPos, endPos, routeGeoJson])

  return (
    <div className="relative w-full h-full min-h-[300px] bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden">
        {/* Térkép konténer */}
        <div ref={mapContainer} className="absolute inset-0" />
    </div>
  )
}