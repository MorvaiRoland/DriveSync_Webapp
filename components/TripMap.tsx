'use client'

import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-defaulticon-compatibility'
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css'
import { useEffect } from 'react'
import L from 'leaflet'

// Segédkomponens: automatikusan középre igazítja a térképet a pontok alapján
function MapUpdater({ start, end }: { start: [number, number] | null, end: [number, number] | null }) {
  const map = useMap()
  
  useEffect(() => {
    if (start && end) {
      // Ha van kezdő és végpont, illessze be mindkettőt
      const bounds = L.latLngBounds([start, end])
      map.fitBounds(bounds, { padding: [50, 50] })
    } else if (start) {
      // Ha csak kezdőpont van, ugorjon oda
      map.flyTo(start, 13)
    } else if (end) {
      // Ha csak végpont van, ugorjon oda
      map.flyTo(end, 13)
    }
  }, [start, end, map])
  
  return null
}

type TripMapProps = {
  startPos?: [number, number] | null
  endPos?: [number, number] | null
}

export default function TripMap({ startPos, endPos }: TripMapProps) {
  // Alapértelmezett középpont (Budapest)
  const defaultCenter: [number, number] = [47.4979, 19.0402]

  return (
    <MapContainer 
        center={defaultCenter} 
        zoom={7} 
        scrollWheelZoom={false} 
        className="w-full h-full rounded-xl z-0" // A szülő div méretét veszi fel
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      
      {startPos && (
        <Marker position={startPos}>
          <Popup>Indulás 🏁</Popup>
        </Marker>
      )}

      {endPos && (
        <Marker position={endPos}>
          <Popup>Érkezés 🏁</Popup>
        </Marker>
      )}

      {/* Vonal rajzolása */}
      {startPos && endPos && (
        <Polyline positions={[startPos, endPos]} color="#3b82f6" weight={4} opacity={0.7} dashArray="10, 10" />
      )}

      <MapUpdater start={startPos || null} end={endPos || null} />
    </MapContainer>
  )
}