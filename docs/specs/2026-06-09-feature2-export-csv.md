# Feature 2 — Exportar leads a CSV

**Goal:** Botón en el CRM que descarga los leads (con los filtros activos) como archivo `.csv`.

**Architecture:** Nueva ruta API `app/api/leads/export/route.ts` (GET, autenticada). Reutiliza `getLeadsByEscritorio` del DAL. Devuelve `Content-Type: text/csv`. Botón client en `app/dashboard/crm/page.tsx` que construye la URL con los filtros activos y la navega.

**Tech Stack:** Next.js 14 App Router, TypeScript, Supabase (server client para auth).

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `app/api/leads/export/route.ts` | Create | GET handler — auth, llama DAL, genera CSV, devuelve response |
| `app/dashboard/crm/ExportButton.tsx` | Create | Client Component — botón con estado loading, construye URL con filtros |
| `app/dashboard/crm/page.tsx` | Modify | Agregar `<ExportButton>` en el header |

---

## Design Details

### API Route `GET /api/leads/export`

Query params: `estado` (opcional), `campo` (opcional) — mismos que los filtros del CRM.

Flow:
1. Verificar auth via `createServerClient().auth.getUser()` → 401 si no autenticado
2. Llamar `getLeadsByEscritorio(user.id, { estado, campo })` del DAL
3. Generar CSV string con cabecera y filas
4. Retornar `new Response(csvString, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="leads.csv"' } })`

### Columnas del CSV

```
ID, Nombre, Email, Teléfono, Estado, Campo, Mensaje, Notas, Fecha consulta
```

Mapeo:
- `ID` → `lead.id`
- `Nombre` → `lead.nombre`
- `Email` → `lead.email ?? ''`
- `Teléfono` → `lead.telefono ?? ''`
- `Estado` → `lead.estado`
- `Campo` → `lead.campo_titulo ?? lead.campo_titulo_snapshot ?? ''`
- `Mensaje` → `lead.mensaje ?? ''` (escapar comillas dobles)
- `Notas` → `lead.notas ?? ''` (escapar comillas dobles)
- `Fecha consulta` → `lead.created_at` en formato `DD/MM/YYYY`

Escaping CSV: los campos con comas o saltos de línea se envuelven en comillas dobles; las comillas dobles internas se duplican (`""`).

### ExportButton Component

Client Component. Props: `estado?: string`, `campo?: string`.

Comportamiento:
- Click → construye URL `/api/leads/export?estado=...&campo=...` con los filtros activos
- Navega con `window.location.href = url` (el browser dispara la descarga)
- No estado loading necesario — la descarga es instantánea para el browser

Estilo: igual al botón "Nuevo campo" del dashboard — variante secundaria (borde, fondo blanco).

### Placement en CRM

En el header, junto a `<CrmFilters>`:

```tsx
<div className="flex items-center gap-2">
  <Suspense><CrmFilters campos={campos} /></Suspense>
  <ExportButton estado={estado} campo={campo} />
</div>
```

---

## Constraints

- Solo exporta los leads del escritorio autenticado (RLS implícito via `getLeadsByEscritorio`)
- Si no hay leads, genera CSV con solo la cabecera
- El archivo siempre se llama `leads.csv` (sin fecha, simple)
- No usar librerías CSV externas — generación manual simple
