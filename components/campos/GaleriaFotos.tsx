'use client'

import { useRef, useState } from 'react'
import { ImagePlus, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface Props {
  campoId: string
  fotos: string[]
  onChange: (fotos: string[]) => void
}

const MAX_FOTOS = 5

export default function GaleriaFotos({ campoId, fotos, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return

    const remaining = MAX_FOTOS - fotos.length
    if (remaining <= 0) {
      toast.error(`Máximo ${MAX_FOTOS} fotos permitidas.`)
      return
    }

    const toUpload = Array.from(files).slice(0, remaining)
    setUploading(true)

    const supabase = createClient()
    const newUrls: string[] = []

    await Promise.all(
      toUpload.map(async (file, i) => {
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
          toast.error(`${file.name}: solo JPG, PNG o WebP.`)
          return
        }
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name}: máximo 5MB por foto.`)
          return
        }

        const ext = file.name.split('.').pop()
        const path = `${campoId}/${Date.now()}-${i}.${ext}`

        const { error } = await supabase.storage
          .from('campo-fotos')
          .upload(path, file, { upsert: false })

        if (error) {
          toast.error(`Error al subir ${file.name}.`)
          return
        }

        const { data: { publicUrl } } = supabase.storage.from('campo-fotos').getPublicUrl(path)
        newUrls.push(publicUrl)
      })
    )

    onChange([...fotos, ...newUrls])
    setUploading(false)
  }

  async function handleDelete(url: string) {
    const supabase = createClient()
    const path = url.split('/campo-fotos/')[1]
    if (path) {
      await supabase.storage.from('campo-fotos').remove([path])
    }
    onChange(fotos.filter(f => f !== url))
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-5 gap-2">
        {fotos.map(url => (
          <div key={url} className="relative group aspect-square rounded-lg overflow-hidden border border-[#E2DFD6]">
            <img src={url} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => handleDelete(url)}
              className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <X className="h-3 w-3 text-white" />
            </button>
          </div>
        ))}
        {fotos.length < MAX_FOTOS && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="aspect-square rounded-lg border-2 border-dashed border-[#C49A3C]/40 flex flex-col items-center justify-center gap-1 hover:border-[#C49A3C] hover:bg-[#C49A3C]/5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <ImagePlus className="h-5 w-5 text-[#5C5B4F]" />
            <span className="text-[10px] text-[#5C5B4F]">{uploading ? 'Subiendo...' : 'Agregar'}</span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={e => handleFiles(e.target.files)}
      />
      <p className="text-xs text-[#5C5B4F]">Hasta {MAX_FOTOS} fotos · JPG, PNG o WebP · máx. 5MB c/u</p>
    </div>
  )
}
