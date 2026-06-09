# Feature 5 — Botón compartir campo (WhatsApp + copiar link)

**Goal:** Botón "Compartir" en la ficha pública del campo y en la página de edición del dashboard, con dos acciones: copiar link al clipboard y abrir WhatsApp con el link prellenado.

**Architecture:** Componente client `components/ShareCampoButton.tsx`. Se agrega en dos páginas: `app/campo/[id]/page.tsx` (ficha pública) y `app/dashboard/campos/[id]/page.tsx` (dashboard edit).

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS, Lucide icons. Web API nativa (`navigator.clipboard`, `window.open`).

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `components/ShareCampoButton.tsx` | Create | Client Component — dropdown/popover con dos opciones de compartir |
| `app/campo/[id]/page.tsx` | Modify | Agregar ShareCampoButton en el navbar |
| `app/dashboard/campos/[id]/page.tsx` | Modify | Agregar ShareCampoButton en el header |

---

## Design Details

### ShareCampoButton Component

`'use client'`

Props:
```typescript
{
  campoId: string
  titulo: string
  variant?: 'public' | 'dashboard'  // controla el estilo
}
```

La URL a compartir: `${process.env.NEXT_PUBLIC_APP_URL}/campo/${campoId}` (con fallback a `window.location.origin`).

**Comportamiento:** Botón con ícono `Share2` de Lucide. Al hacer click, muestra un pequeño dropdown con dos opciones:

1. **Copiar link** — `Copy` icon + "Copiar link"
   - `navigator.clipboard.writeText(url)`
   - Feedback: el ícono cambia a `Check` y el texto a "Copiado" por 2 segundos
   - Si clipboard API no disponible (HTTP no seguro): fallback a `document.execCommand('copy')`

2. **Compartir por WhatsApp** — ícono WhatsApp SVG + "Enviar por WhatsApp"
   - `window.open(`https://wa.me/?text=${encodeURIComponent(`Mirá este campo en CampoNet: ${url}`)}`, '_blank')`

**Estado:** `useState` para `copied: boolean` y `open: boolean` (dropdown visible).

**Cerrar dropdown:** click fuera del componente → `useEffect` con `document.addEventListener('mousedown', handler)`.

### Variantes de estilo

`variant="public"` (en la ficha pública):
- Botón ghost: `bg-white/70 border border-[#E4E0D6] text-[#5C5B4F] hover:bg-white`
- Se ubica en el navbar de la ficha, junto al badge de departamento

`variant="dashboard"` (en el dashboard):
- Botón outline: `border border-[#E2DFD6] bg-white text-[#2A2A1E] hover:bg-[#F7F5F0]`
- Se ubica en el header de la página de edición, junto a `<CampoEstadoActions>`
- Solo mostrar si `campo.estado === 'publicado'` (no tiene sentido compartir un borrador)

### Dropdown styles

```
bg-white border border-[#E2DFD6] rounded-xl shadow-[var(--shadow-md)] p-1 w-48
```

Cada opción:
```
flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-[#2A2A1E]
hover:bg-[#F7F5F0] cursor-pointer transition-colors
```

---

## Ícono WhatsApp

SVG inline simple:
```tsx
<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-[#25D366]">
  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.526 5.845L.057 23.428a.5.5 0 00.609.61l5.652-1.48A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.9a9.896 9.896 0 01-5.031-1.372l-.36-.214-3.733.978.997-3.645-.235-.374A9.862 9.862 0 012.1 12c0-5.463 4.437-9.9 9.9-9.9 5.463 0 9.9 4.437 9.9 9.9 0 5.463-4.437 9.9-9.9 9.9z"/>
</svg>
```

---

## Constraints

- `NEXT_PUBLIC_APP_URL` ya está configurado en Vercel. En desarrollo usar `window.location.origin`.
- El dropdown se posiciona con `absolute` relativo al botón — no usar un componente Popover de shadcn para mantener la dependencia mínima.
- En mobile el dropdown debe ser táctil (touch-target ≥ 44px por opción).
- El botón de dashboard solo aparece cuando `estado === 'publicado'` — no tiene sentido compartir borradores.
