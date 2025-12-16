'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

// Mapbox token beállítása
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

interface TripMapProps {
  startPos?: [number, number] | null
  endPos?: [number, number] | null
  routeGeoJson?: any
}

export default function TripMap({ startPos, endPos, routeGeoJson }: TripMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Ellenőrizzük a WebGL támogatást
  useEffect(() => {
    if (!mapboxgl.supported()) {
      setError('A böngésződ nem támogatja a WebGL-t, így a térkép nem jeleníthető meg.')
    }
  }, [])

  useEffect(() => {
    if (error || !mapContainer.current) return

    // Térkép inicializálása
    try {
        if (map.current) return // Ha már létezik, ne hozza létre újra

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/streets-v12', // Vagy a te saját stílusod
            center: [19.0402, 47.4979], // Budapest alapértelmezett
            zoom: 10,
            attributionControl: false, // Mobil nézet tisztítása
        })

        // Navigációs gombok hozzáadása (jobb alsó sarok)
        map.current.addControl(new mapboxgl.NavigationControl(), 'bottom-right')

        // Hiba kezelés (pl. ha blokkolva van a hálózat)
        map.current.on('error', (e) => {
            console.warn('Mapbox error:', e)
            // Nem állítunk be fatal errort, hagyjuk futni a térképet, hátha csak egy tile nem töltött be
        })

    } catch (e) {
        console.error('Térkép inicializálási hiba:', e)
        setError('Hiba történt a térkép betöltésekor.')
    }

    return () => {
        // Cleanup: térkép törlése komponens levételkor
        map.current?.remove()
        map.current = null
    }
  }, [error])

  // Markerek és Útvonal frissítése
  useEffect(() => {
    if (!map.current) return

    const currentMap = map.current

    // Segédfüggvény markerek kezelésére
    const updateMarkers = () => {
        // Töröljük a régi markereket (ez egy egyszerűsített megoldás, 
        // profibb lenne tárolni a markereket ref-ben, de így biztosan tiszta)
        const markers = document.getElementsByClassName('mapboxgl-marker')
        while(markers.length > 0){
            markers[0].remove();
        }

        const bounds = new mapboxgl.LngLatBounds()

        if (startPos) {
            new mapboxgl.Marker({ color: '#22c55e' }) // Zöld
                .setLngLat([startPos[1], startPos[0]])
                .addTo(currentMap)
            bounds.extend([startPos[1], startPos[0]])
        }

        if (endPos) {
            new mapboxgl.Marker({ color: '#ef4444' }) // Piros
                .setLngLat([endPos[1], endPos[0]])
                .addTo(currentMap)
            bounds.extend([endPos[1], endPos[0]])
        }

        // Zoomolás, hogy minden beleférjen
        if (startPos || endPos) {
            currentMap.fitBounds(bounds, { padding: 50, maxZoom: 15 })
        }
    }

    // Útvonal kirajzolása
    const updateRoute = () => {
        if (!currentMap.getSource('route')) {
             // Ha még nincs hozzáadva a forrás
             if (currentMap.isStyleLoaded()) {
                 addRouteLayer()
             } else {
                 currentMap.once('load', addRouteLayer)
             }
        } else {
            // Ha már van, csak frissítjük az adatot
            (currentMap.getSource('route') as mapboxgl.GeoJSONSource).setData(
                routeGeoJson || { type: 'FeatureCollection', features: [] }
            )
        }
    }

    const addRouteLayer = () => {
        if (!currentMap.getSource('route')) {
            currentMap.addSource('route', {
                type: 'geojson',
                data: routeGeoJson || { type: 'FeatureCollection', features: [] },
            })

            currentMap.addLayer({
                id: 'route',
                type: 'line',
                source: 'route',
                layout: {
                    'line-join': 'round',
                    'line-cap': 'round',
                },
                paint: {
                    'line-color': '#3b82f6', // Kék
                    'line-width': 5,
                    'line-opacity': 0.75
                },
            })
        }
    }

    updateMarkers()
    if (routeGeoJson) updateRoute()

  }, [startPos, endPos, routeGeoJson])

  if (error) {
    return (
        <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-500 text-sm text-center p-4">
            {error}
        </div>
    )
  }

  return <div ref={mapContainer} className="w-full h-full" />
}