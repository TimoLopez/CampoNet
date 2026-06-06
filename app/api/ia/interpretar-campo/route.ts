import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const DEPARTAMENTOS = [
  'Artigas', 'Canelones', 'Cerro Largo', 'Colonia', 'Durazno',
  'Flores', 'Florida', 'Lavalleja', 'Maldonado', 'Montevideo',
  'Paysandú', 'Río Negro', 'Rivera', 'Rocha', 'Salto',
  'San José', 'Soriano', 'Tacuarembó', 'Treinta y Tres',
]

export async function POST(request: Request) {
  try {
    const { transcripcion } = await request.json()
    if (!transcripcion) return Response.json({ error: 'transcripcion required' }, { status: 400 })
    if (typeof transcripcion !== 'string' || transcripcion.length > 4000) {
      return Response.json({ error: 'transcripcion must be a string under 4000 characters' }, { status: 400 })
    }

    const completion = await openai.chat.completions.create(
      {
        model: 'gpt-4o-mini',
        temperature: 0,
        max_tokens: 300,
        messages: [
          {
            role: 'system',
            content: `Eres un asistente que extrae datos de campos rurales uruguayos a partir de descripciones orales.
Devuelve SOLO un JSON válido con los campos que puedas inferir con seguridad. Para los que no se mencionen o no estés seguro, usa null.

Campos posibles:
- titulo: string (nombre descriptivo del campo)
- departamento: uno de ${DEPARTAMENTOS.join(', ')}
- hectareas: number (solo el número)
- tipo: "ganadero" | "agricola" | "forestal" | "mixto"
- precio_usd: number (solo el número, sin símbolos)
- agua: boolean (true si menciona río, arroyo, laguna, pozo, agua)
- acceso_ruta: boolean (true si menciona ruta, acceso, camino asfaltado)

No inventes datos. Solo extrae lo que se diga explícitamente o se pueda inferir con certeza.`,
          },
          {
            role: 'user',
            content: transcripcion,
          },
        ],
        response_format: { type: 'json_object' },
      },
      { timeout: 15000 }
    )

    const raw = completion.choices[0].message.content ?? '{}'
    const campos = JSON.parse(raw)
    return Response.json(campos)
  } catch (err) {
    console.error('[interpretar-campo]', err)
    return Response.json({ error: 'Error interpreting transcription' }, { status: 500 })
  }
}
