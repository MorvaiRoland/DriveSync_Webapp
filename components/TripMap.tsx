// components/TripMap.tsx
'use client'

import { useEffect, useRef } from 'react'
import Map, { Marker, Source, Layer, MapRef } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import mapboxgl from 'mapbox-gl'

// Fontos: next.js alatt néha kell ez a fix a transzpiláláshoz
// Ha hibát dob a buildnél, tedd be a next.config.js-be a transpilePackages-t
// De általában működik így:

interface TripMapProps {
  startPos: [number, number] | null // [lat, lng] a te kódodban, de Mapbox [lng, lat]-ot kér!
  endPos: [number, number] | null
  routeGeoJson: any | null // A Directions API válasza (geometry)
}

export default function TripMap({ startPos, endPos, routeGeoJson }: TripMapProps) {
  const mapRef = useRef<MapRef>(null)

  // Automatikus zoom (fitBounds), ha változnak a pontok
  useEffect(() => {
    if (startPos && endPos && mapRef.current) {
      // Mapbox [lng, lat] sorrendet használ!
      const bounds = new mapboxgl.LngLatBounds()
        .extend([startPos[1], startPos[0]])
        .extend([endPos[1], endPos[0]])

      mapRef.current.fitBounds(bounds, { padding: 50, duration: 1000 })
    } else if (startPos && mapRef.current) {
      mapRef.current.flyTo({ center: [startPos[1], startPos[0]], zoom: 12 })
    }
  }, [startPos, endPos])

  // A vonal stílusa
  const layerStyle = {
    id: 'route',
    type: 'line',
    paint: {
      'line-color': '#3b82f6', // blue-500
      'line-width': 5,
      'line-opacity': 0.75,
    },
  } as const

  return (
    <Map
      ref={mapRef}
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
      initialViewState={{
        longitude: 19.0402, // Budapest alapértelmezett
        latitude: 47.4979,
        zoom: 6
      }}
      style={{ width: '100%', height: '100%' }}
      // Sötét/Világos mód támogatása URL cserével (opcionális, most sötétet használunk példának)
      mapStyle="mapbox://styles/mapbox/navigation-night-v1" 
      attributionControl={false}
    >
      {/* Indulás Marker (Zöld) */}
      {startPos && (
        <Marker longitude={startPos[1]} latitude={startPos[0]} anchor="bottom">
          <div className="w-6 h-6 bg-emerald-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-xs text-white font-bold">A</div>
        </Marker>
      )}

      {/* Érkezés Marker (Piros) */}
      {endPos && (
        <Marker longitude={endPos[1]} latitude={endPos[0]} anchor="bottom">
          <div className="w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-xs text-white font-bold">B</div>
        </Marker>
      )}

      {/* Útvonal vonal */}
      {routeGeoJson && (
        <Source id="route-source" type="geojson" data={routeGeoJson}>
          <Layer {...layerStyle} />
        </Source>
      )}
    </Map>
  )
}