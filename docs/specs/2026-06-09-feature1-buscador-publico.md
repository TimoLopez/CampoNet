# Feature 1 — Buscador público de campos (`/campos`)

**Goal:** Página pública `/campos` con listado de todos los campos publicados y filtros básicos, cerrando el loop visual del marketplace.

**Architecture:** Server Component en `app/campos/page.tsx`. Filtros via `searchParams` (sin JS para el filtrado inicial). Layout público propio compartido con `app/campo/[id]` (navbar + fondo beige). Nueva función DAL `getCamposPublicos(filters)` en `lib/dal/campos.ts`. Card pública nueva (`app/campos/CampoCard.tsx`) — sin badges de estado ni links de edición.

**Tech Stack:** Next.js 14 App Router, TypeScript, Supabase (admin client via DAL), Tailwind CSS.

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `lib/dal/campos.ts` | Modify | Add `getCamposPublicos(filters)` |
| `app/campos/page.tsx` | Create | Server Component — fetches campos, renders grid + filters |
| `app/campos/CampoCard.tsx` | Create | Client Component — card pública con foto, título, departamento, precio, hectáreas |
| `app/campos/CamposFilters.tsx` | Create | Client Component — filtros de búsqueda (departamento, tipo, precio, hectáreas) |
| `app/campos/loading.tsx` | Create | Skeleton de carga |

---

## Design Details

### DAL — `getCamposPublicos(filters)`

```typescript
export type CamposPublicosFilters = {
  departamento?: string
  tipo?: string
  precioMin?: number
  precioMax?: number
  hectareasMin?: number
  hectareasMax?: number
}

export type CampoPublicoCard = {
  id: string
  titulo: string
  departamento: string
  hectareas: number | null
  precio_usd: number | null
  tipo: string | null
  fotos: string[]
  escritorio_nombre: string
}
```

Query: `supabaseAdmin.from('campos').select('id, titulo, departamento, hectareas, precio_usd, tipo, fotos, escritorios(nombre)').eq('estado', 'publicado').order('created_at', { ascending: false })` con filtros opcionales aplicados dinámicamente.

### Filtros disponibles

| Filtro | Tipo | Campo DB |
|--------|------|----------|
| Departamento | Select (departamentos de Uruguay) | `departamento` |
| Tipo | Select (ganadero, agrícola, forestal, mixto) | `tipo` |
| Precio mínimo (USD) | Input numérico | `precio_usd >= precioMin` |
| Precio máximo (USD) | Input numérico | `precio_usd <= precioMax` |
| Hectáreas mínimas | Input numérico | `hectareas >= hectareasMin` |

Filtros aplicados server-side via `searchParams`. `CamposFilters` es un componente cliente que hace `router.push` con los nuevos params al cambiar filtros.

### URL Structure

```
/campos                                   — sin filtros
/campos?departamento=Tacuarembó           — por departamento
/campos?tipo=ganadero&precioMax=500000    — tipo + precio máx
```

### Layout

- Navbar igual al de `app/campo/[id]` (glassmorphism, logo CampoNet, fondo beige `#F4F2EB`)
- Header: título "Campos disponibles" + conteo de resultados
- Sidebar izquierda (desktop) o collapsible (mobile): filtros
- Grid derecha: cards 1 col (mobile) / 2 col (tablet) / 3 col (desktop)
- Empty state si no hay resultados con el filtro aplicado

### CampoCard pública

- Foto de portada (primera foto del array, o placeholder)
- Badge tipo (color del `TIPO_ACCENT` ya definido en `app/campo/[id]/page.tsx`)
- Departamento con ícono MapPin
- Hectáreas y precio en USD
- Nombre del escritorio (escritorio_nombre)
- Link `href="/campo/{id}"` — lleva a la ficha completa
- Hover: `translateY(-4px)` + sombra (patrón `cn-card` ya existente)

### Loading skeleton

`app/campos/loading.tsx` muestra grid de 6 cards con skeleton de igual estructura.

---

## Departamentos de Uruguay (para el select)

Artigas, Canelones, Cerro Largo, Colonia, Durazno, Flores, Florida, Lavalleja, Maldonado, Montevideo, Paysandú, Río Negro, Rivera, Rocha, Salto, San José, Soriano, Tacuarembó, Treinta y Tres

---

## Constraints

- No requiere autenticación — `supabaseAdmin` bypasa RLS
- Los filtros numéricos aceptan cadena vacía (no filtrar) o número
- Si `fotos` está vacío, mostrar placeholder neutro (div con ícono MapPin)
- `precio_usd` puede ser null — mostrar "Consultar" si es null
- `hectareas` puede ser null — omitir si null
