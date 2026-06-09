# Feature 3 — Analytics por campo (gráfico de visitas)

**Goal:** En la página de edición de cada campo, mostrar un gráfico de barras con visitas por día (últimos 30 días).

**Architecture:** Nueva función DAL `getVisitasByDayForCampo(campoId, days)` en `lib/dal/visitas.ts`. Componente client `components/campos/VisitasChart.tsx` que usa `recharts`. Se agrega en `app/dashboard/campos/[id]/page.tsx` recibiendo datos del servidor.

**Tech Stack:** Next.js 14 App Router, TypeScript, Recharts (a instalar), Tailwind CSS.

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `lib/dal/visitas.ts` | Modify | Add `getVisitasByDayForCampo(campoId, days)` |
| `components/campos/VisitasChart.tsx` | Create | Client Component — gráfico de barras con recharts |
| `app/dashboard/campos/[id]/page.tsx` | Modify | Fetch visitas data, pass to chart |

---

## Design Details

### DAL — `getVisitasByDayForCampo(campoId, days = 30)`

```typescript
export type VisitasDiaData = {
  fecha: string  // 'DD/MM'
  visitas: number
}

export async function getVisitasByDayForCampo(
  campoId: string,
  days = 30
): Promise<VisitasDiaData[]>
```

Query: `supabaseAdmin.from('visitas').select('created_at').eq('campo_id', campoId).gte('created_at', since.toISOString())`

Procesamiento en JS (no en DB):
1. Generar array de los últimos `days` días con count = 0
2. Agrupar visitas por fecha (`created_at` truncado a día)
3. Rellenar el array con los counts reales
4. Retornar array de `{ fecha: 'DD/MM', visitas: number }` con los últimos 30 días en orden cronológico

Usar `supabaseAdmin` porque se llama desde un Server Component autenticado (la página ya verificó auth antes de llegar aquí).

### VisitasChart Component

`'use client'` — recharts requiere el browser.

Props:
```typescript
{
  data: VisitasDiaData[]
  totalVisitas: number
}
```

Rendering:
- Título: "Visitas últimos 30 días" + total como badge
- `<ResponsiveContainer width="100%" height={160}>`
- `<BarChart>` con `<Bar dataKey="visitas" fill="#1C3311" radius={[3,3,0,0]}`
- `<XAxis dataKey="fecha">` — mostrar solo cada 5 días para no saturar
- `<Tooltip>` simple con label de fecha y count
- Sin `<YAxis>` visible — mantener limpieza visual
- Si todos los valores son 0: mostrar empty state "Sin visitas en este período" en lugar del gráfico

Estilo visual: card con `bg-white rounded-2xl border border-[#E2DFD6] p-6 shadow-[var(--shadow-card)]` — igual al resto del dashboard.

### Placement en campo edit page

En `app/dashboard/campos/[id]/page.tsx`, agregar `getVisitasByDayForCampo(id)` al `Promise.all` existente:

```typescript
const [campo, leadsCount, visitasData] = await Promise.all([
  getCampoById(id, user!.id),
  getLeadCountForCampo(id),
  getVisitasByDayForCampo(id),
])
```

Renderizar `<VisitasChart>` entre `CampoEstadoActions` y `CampoForm`.

---

## Constraints

- Instalar recharts: `npm install recharts`
- El componente es `'use client'` — los datos se pasan como props desde el Server Component
- Si `campo.estado !== 'publicado'`, aún mostrar el gráfico (puede haber visitas de cuando estaba publicado)
- Agrupar por día en UTC para consistencia
- `totalVisitas` = suma de todos los valores en el array (se computa en la página antes de pasar al componente)
