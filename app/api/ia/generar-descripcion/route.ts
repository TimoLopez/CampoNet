import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(request: Request) {
  try {
    const {
      titulo, hectareas, departamento, tipo, precio_usd,
      agua, acceso_ruta, coneat, caracteristicas, transcripcion,
    } = await request.json()

    const tipoLabel: Record<string, string> = {
      ganadero: 'ganadero', agricola: 'agrícola', forestal: 'forestal',
      mixto: 'mixto', turistica: 'turístico / recreativo',
    }
    const tipoText = tipo ? tipoLabel[tipo] ?? tipo : 'campo rural'

    const aguaText = agua ? 'cuenta con fuentes de agua naturales' : 'sin fuentes de agua declaradas'
    const accesText = acceso_ruta ? 'acceso por ruta asfaltada' : 'acceso por camino rural'

    const coneatLine = coneat != null
      ? `- Índice CONEAT ${coneat} — indica la productividad relativa del suelo (base 100; valores más altos = mayor fertilidad)\n`
      : ''

    const caracteristicasLine = Array.isArray(caracteristicas) && caracteristicas.length > 0
      ? `- Infraestructura y características: ${caracteristicas.join(', ')}\n`
      : ''

    const precioHaLine = precio_usd && hectareas
      ? `- Precio referencial: USD ${Number(precio_usd).toLocaleString('es-UY')} (USD ${Math.round(precio_usd / hectareas).toLocaleString('es-UY')}/ha)\n`
      : ''

    const transcripcionBlock = transcripcion
      ? `\nEl propietario describió el campo con sus propias palabras:\n"${transcripcion}"\nUsá este contexto para enriquecer y personalizar la descripción con detalles que no aparecen en los datos estructurados.\n`
      : ''

    const prompt = `Sos un escritor especializado en propiedades rurales uruguayas, con décadas de experiencia redactando fichas técnicas para escritorios inmobiliarios de primer nivel. Tu texto aparecerá en la ficha pública del campo — tiene que convencer a un comprador serio.

Redactá una descripción comercial para el siguiente campo:

DATOS DEL CAMPO:
- Título: ${titulo}
- Ubicación: ${departamento}, Uruguay
- Superficie: ${hectareas} hectáreas
- Aptitud productiva: ${tipoText}
- Agua: ${aguaText}
- Acceso: ${accesText}
${coneatLine}${caracteristicasLine}${precioHaLine}${transcripcionBlock}
INSTRUCCIONES:
- 2 a 3 párrafos fluidos. Sin listas, sin bullets, sin títulos.
- Primer párrafo: presentá el campo destacando su escala, aptitud productiva y ubicación.
- Segundo párrafo: desarrollá las condiciones físicas, infraestructura, acceso y ventajas operativas.
- Tercer párrafo (opcional, si hay datos suficientes): cerrá con una frase que transmita la oportunidad que representa sin sonar genérico.
- Tono profesional y directo, como habla un corredor rural experimentado. Español rioplatense natural.
- Prohibido: frases genéricas como "excelente oportunidad", "no te lo pierdas", "campo de ensueño". Tampoco menciones precios ni "CampoNet".
- Devolvé solo el texto, sin encabezados ni formateo especial.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
      temperature: 0.65,
    }, { timeout: 20000 })

    const descripcion = completion.choices[0].message.content?.trim() ?? ''
    return Response.json({ descripcion })
  } catch {
    return Response.json({ error: 'No se pudo generar la descripción' }, { status: 503 })
  }
}
