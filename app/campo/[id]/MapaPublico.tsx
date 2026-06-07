'use client'

import { useEffect, useRef } from 'react'

interface Props {
  lat: number
  lng: number
  titulo: string
}

export default function MapaPublico({ lat, lng, titulo }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)

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
        center: [lng, lat],
        zoom: 11,
        interactive: true,
        scrollZoom: false,
      })

      map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right')

      const el = document.createElement('div')
      el.style.cssText = `
        width: 36px; height: 36px;
        background: #C49A3C;
        border: 3px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 3px 10px rgba(0,0,0,0.35);
        cursor: default;
      `

      new mapboxgl.Marker({ element: el })
        .setLngLat([lng, lat])
        .setPopup(new mapboxgl.Popup({ offset: 18, closeButton: false })
          .setText(titulo))
        .addTo(map)

      mapRef.current = map
    })

    return () => {
      map?.remove()
      mapRef.current = null
    }
  }, [lat, lng, titulo])

  return (
    <div
      ref={containerRef}
      className="h-64 md:h-80 rounded-xl overflow-hidden border border-[#E2DFD6]"
    />
  )
}
