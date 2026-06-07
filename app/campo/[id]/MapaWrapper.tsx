'use client'

import dynamic from 'next/dynamic'

const MapaPublico = dynamic(() => import('./MapaPublico'), { ssr: false })

export default function MapaWrapper(props: { lat: number; lng: number; titulo: string }) {
  return <MapaPublico {...props} />
}
