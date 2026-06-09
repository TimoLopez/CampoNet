# Feature 4 — Timeline completo del lead

**Goal:** En el detalle del lead, una línea de tiempo vertical que muestra cronológicamente todos los eventos: consulta original, visitas al campo, y notas agregadas.

**Architecture:** Nuevo componente client `app/dashboard/crm/[leadId]/LeadTimeline.tsx`. Sin nuevas queries ni tablas — combina datos ya disponibles en la página (`lead`, `visitas`). Se integra en `app/dashboard/crm/[leadId]/page.tsx`.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS, Lucide icons.

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `app/dashboard/crm/[leadId]/LeadTimeline.tsx` | Create | Client Component — timeline vertical de eventos |
| `app/dashboard/crm/[leadId]/page.tsx` | Modify | Pasar datos al timeline, integrar en layout |

---

## Design Details

### Tipos de eventos

```typescript
type TimelineEvent =
  | { type: 'consulta';  date: string; nombre: string }
  | { type: 'visita';    date: string }
  | { type: 'nota';      date: string; texto: string }
```

### Construcción del timeline

En `page.tsx`, antes del `return`:

```typescript
// Las notas tienen formato "[DD/MM/YYYY] texto" para las notas agregadas por seguimiento
// La nota original (mensaje del lead) no tiene timestamp prefix
const notaEvents = (lead.notas ?? '')
  .split(/\n\n(?=\[)/)
  .filter(chunk => /^\[\d{2}\/\d{2}\/\d{4}\]/.test(chunk))
  .map(chunk => {
    const match = chunk.match(/^\[(\d{2})\/(\d{2})\/(\d{4})\]\s*(.*)$/s)
    if (!match) return null
    const [, dd, mm, yyyy, texto] = match
    return { type: 'nota' as const, date: `${yyyy}-${mm}-${dd}T00:00:00.000Z`, texto: texto.trim() }
  })
  .filter(Boolean)

const events: TimelineEvent[] = [
  { type: 'consulta', date: lead.created_at, nombre: lead.nombre },
  ...visitas.map(v => ({ type: 'visita' as const, date: v.created_at })),
  ...notaEvents,
].sort((a, b) => new Date(a!.date).getTime() - new Date(b!.date).getTime())
```

### LeadTimeline Component

Props:
```typescript
{
  events: TimelineEvent[]
  campoTitulo: string | null
}
```

Rendering — timeline vertical con línea conectora:

```
● [ícono]  Texto del evento          Fecha/hora
│
● [ícono]  Texto del evento          Fecha/hora
│
● [ícono]  ...
```

Ícono y color por tipo:
- `consulta` → `MessageSquare` verde oscuro `#1C3311` sobre fondo `#1C3311/10`
- `visita` → `Eye` dorado `#8B6914` sobre fondo `#C49A3C/10`
- `nota` → `FileText` slate sobre fondo gris `#F2EFE8`

Texto por tipo:
- `consulta`: "Envió una consulta sobre [campoTitulo]"
- `visita`: "Visitó la ficha del campo"
- `nota`: texto de la nota (truncado a 3 líneas con `line-clamp-3`)

Fecha: formato relativo para eventos recientes (`hace 2 días`) y absoluto para más antiguos (`12 jun 2026`). Usar la función `formatDate` que ya existe en la página.

Card wrapper: `bg-white rounded-2xl border border-[#E2DFD6] p-6 shadow-[var(--shadow-card)]`.

Título de sección: "Actividad" con ícono Clock.

Si `events.length <= 1`: mostrar solo el evento de consulta sin línea conectora (no es un "timeline" si hay un solo evento).

### Placement

En `page.tsx`, agregar `<LeadTimeline>` debajo de la card de información del lead y encima de `<NotasLead>`.

---

## Constraints

- El parsing de notas solo captura las notas con formato `[DD/MM/YYYY]` (las generadas por `upsertLead`). El mensaje original del lead no aparece en el timeline (ya está en la card de información).
- `visitas` ya se fetcha en la página para calcular `esCaliente` — no se necesita nueva query.
- Si `events` está vacío (sin visitas, sin notas con timestamp), solo se muestra la consulta original.
- Ordenar siempre cronológico ascendente (más viejo primero, más reciente al final).
