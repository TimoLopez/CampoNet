import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(request: Request) {
  try {
    const { titulo, hectareas, departamento, tipo, precio_usd, agua, acceso_ruta, transcripcion } = await request.json()

    const tipoText = tipo ?? 'campo'
    const aguaText = agua ? 'cuenta con fuentes de agua' : 'sin fuentes de agua verificadas'
    const accesText = acceso_ruta ? 'tiene acceso por ruta asfaltada' : 'acceso por camino rural'
    const precioText = precio_usd ? `Precio de referencia: USD ${precio_usd.toLocaleString('es-UY')}.` : ''
    const transcripcionText = transcripcion
      ? `\n\nEl propietario describió el campo con sus propias palabras:\n"${transcripcion}"\nUsá este contexto para enriquecer la descripción si aporta detalles relevantes.`
      : ''

    const prompt = `Redactá una descripción profesional y atractiva para un campo rural uruguayo con estas características:
- Nombre: ${titulo}
- Ubicación: ${departamento}
- Superficie: ${hectareas} hectáreas
- Tipo: ${tipoText}
- Agua: ${aguaText}
- Acceso: ${accesText}
${precioText}

La descripción debe tener 3-4 oraciones, tono profesional pero amigable, destacar los puntos fuertes, y estar en español rioplatense. No incluyas precio en la descripción ni menciones "CampoNet". Solo devolvé el texto, sin encabezados ni bullets.${transcripcionText}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300,
      temperature: 0.7,
    }, { timeout: 15000 })

    const descripcion = completion.choices[0].message.content?.trim() ?? ''
    return Response.json({ descripcion })
  } catch {
    return Response.json({ error: 'No se pudo generar la descripción' }, { status: 503 })
  }
}
