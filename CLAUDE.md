# CampoNet — Contexto para Claude Code

## Qué es el proyecto
Plataforma SaaS + marketplace para compraventa de terrenos rurales en Uruguay.
Dos productos: panel de gestión para escritorios rurales (CRM) + fichas públicas de campos.

## Stack
- Next.js 14 (App Router) + TypeScript
- Supabase (PostgreSQL + Auth + Storage)
- Tailwind CSS + shadcn/ui
- Mapbox (mapas)
- OpenAI GPT-4o Mini (generación de descripciones)
- Resend (emails transaccionales)
- Vercel (deploy)

## Estructura de carpetas
app/
  (auth)/login, registro
  (dashboard)/ → rutas protegidas, layout con sidebar
    page.tsx → dashboard home
    campos/ → listado, nuevo, [id]/editar
    crm/ → tabla de leads, [leadId]/detalle
  campo/[id]/page.tsx → ficha pública (sin login)
  api/ → campos, leads, visitas, ia/generar-descripcion

## Convenciones
- Componentes en PascalCase, archivos en kebab-case
- Usar Server Components por defecto, Client Components solo cuando necesario ('use client')
- Supabase server client para SSR, browser client para interacciones client-side
- Validación de forms con react-hook-form + zod
- No usar state managers globales (Zustand, Redux)
- Sin tests por ahora — MVP rápido primero

## Base de datos (Supabase / PostgreSQL)
Tablas principales: escritorios, campos, leads, visitas
Ver schema completo en: docs/superpowers/specs/2026-06-05-camponet-mvp-design.md

## Variables de entorno necesarias
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_MAPBOX_TOKEN=
OPENAI_API_KEY=
RESEND_API_KEY=
