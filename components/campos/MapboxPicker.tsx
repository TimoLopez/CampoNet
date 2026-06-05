'use client'

import { useEffect, useRef } from 'react'

interface Props {
  lat?: number | null
  lng?: number | null
  onLocationChange: (lat: number, lng: number) => void
}

export default function MapboxPicker({ lat, lng, onLocationChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const markerRef = useRef<any>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    if (!token) return

    let map: any

    import('mapbox-gl').then(({ default: mapboxgl }) => {
      import('mapbox-gl/dist/mapbox-gl.css')

      mapboxgl.accessToken = token

      map = new mapboxgl.Map({
        container: containerRef.current!,
        style: 'mapbox://styles/mapbox/satellite-streets-v12',
        center: [lng ?? -56.1645, lat ?? -32.5228],
        zoom: lat && lng ? 12 : 6,
      })

      map.addControl(new mapboxgl.NavigationControl(), 'top-right')

      if (lat && lng) {
        const m = new mapboxgl.Marker({ color: '#C49A3C', draggable: true })
          .setLngLat([lng, lat])
          .addTo(map)
        m.on('dragend', () => {
          const pos = m.getLngLat()
          onLocationChange(pos.lat, pos.lng)
        })
        markerRef.current = m
      }

      map.on('click', (e: any) => {
        const { lat: clickLat, lng: clickLng } = e.lngLat
        if (markerRef.current) {
          markerRef.current.setLngLat([clickLng, clickLat])
        } else {
          const m = new mapboxgl.Marker({ color: '#C49A3C', draggable: true })
            .setLngLat([clickLng, clickLat])
            .addTo(map)
          m.on('dragend', () => {
            const pos = m.getLngLat()
            onLocationChange(pos.lat, pos.lng)
          })
          markerRef.current = m
        }
        onLocationChange(clickLat, clickLng)
      })

      mapRef.current = map
    })

    return () => {
      map?.remove()
      mapRef.current = null
      markerRef.current = null
    }
  }, [])

  return (
    <div className="space-y-2">
      <p className="text-xs text-[#5C5B4F]">
        Hacé clic en el mapa para marcar la ubicación del campo. Podés arrastrar el marcador para ajustar.
      </p>
      <div ref={containerRef} className="h-72 rounded-xl overflow-hidden border border-[#E2DFD6]" />
      {lat && lng && (
        <p className="text-xs text-[#5C5B4F]">
          Coordenadas: {lat.toFixed(6)}, {lng.toFixed(6)}
        </p>
      )}
    </div>
  )
}
