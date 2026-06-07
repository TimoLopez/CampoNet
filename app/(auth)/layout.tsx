export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F2EFE8] flex overflow-hidden">

      {/* ── Left panel: brand story ── */}
      <div className="hidden lg:flex lg:w-[520px] xl:w-[580px] shrink-0 relative flex-col justify-between p-12 bg-[#1C3311] overflow-hidden">

        {/* Background texture */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Radial glow spots */}
        <div aria-hidden className="pointer-events-none absolute top-[-80px] right-[-80px] w-[400px] h-[400px] rounded-full bg-[#C49A3C]/10 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute bottom-[-60px] left-[-60px] w-[300px] h-[300px] rounded-full bg-[#3D6B22]/30 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#2D5018]/20 blur-[80px]" />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#C49A3C]/15 ring-1 ring-[#C49A3C]/25 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" aria-hidden>
                <path d="M12 3C8 3 5 7 5 11c0 2.5 1.5 4.5 3 6l4 4 4-4c1.5-1.5 3-3.5 3-6 0-4-3-8-7-8z" fill="#C49A3C" opacity="0.9"/>
                <path d="M12 8v6M9 11l3-3 3 3" stroke="#F7F5F0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <span className="text-[17px] font-semibold text-white tracking-wide">
                Campo<span className="text-[#C49A3C]">Net</span>
              </span>
              <p className="text-[11px] text-white/30 leading-none mt-0.5 tracking-wider uppercase">Uruguay</p>
            </div>
          </div>
        </div>

        {/* Center content */}
        <div className="relative z-10 space-y-8">
          <div>
            <p className="text-xs font-semibold text-[#C49A3C]/70 uppercase tracking-[0.15em] mb-4">
              Plataforma de gestión
            </p>
            <h2 className="text-4xl xl:text-5xl font-bold text-white leading-[1.1] tracking-tight">
              El panel que tu<br />
              escritorio rural<br />
              <span className="text-[#C49A3C]">necesitaba.</span>
            </h2>
            <p className="text-white/45 mt-5 text-[15px] leading-relaxed max-w-sm">
              Publicá campos, gestioná leads y hacé seguimiento de compradores — todo desde un solo lugar.
            </p>
          </div>

          {/* Feature list */}
          <ul className="space-y-3.5">
            {[
              'Fichas públicas con fotos, mapa y video',
              'CRM de leads con historial de visitas',
              'Descripciones generadas con IA',
            ].map((feat) => (
              <li key={feat} className="flex items-center gap-3 text-sm text-white/60">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#C49A3C]/15 ring-1 ring-[#C49A3C]/25 flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-[#C49A3C]" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                {feat}
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-white/20 text-xs">© 2026 CampoNet · Uruguay</p>
        </div>
      </div>

      {/* ── Right panel: auth form ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative overflow-hidden">
        {/* Subtle background blobs */}
        <div aria-hidden className="pointer-events-none absolute top-0 right-0 w-[300px] h-[300px] bg-[#2D5018]/5 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4" />
        <div aria-hidden className="pointer-events-none absolute bottom-0 left-0 w-[250px] h-[250px] bg-[#C49A3C]/6 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />

        <div className="relative w-full max-w-[400px] animate-fade-up">
          {/* Mobile brand (lg+ hides) */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#1C3311] mb-4 shadow-[var(--shadow-lg)]">
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" aria-hidden>
                <path d="M12 3C8 3 5 7 5 11c0 2.5 1.5 4.5 3 6l4 4 4-4c1.5-1.5 3-3.5 3-6 0-4-3-8-7-8z" fill="#C49A3C" opacity="0.9"/>
                <path d="M12 8v6M9 11l3-3 3 3" stroke="#F7F5F0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#1A1A12]">
              Campo<span className="text-[#2D5018]">Net</span>
            </h1>
            <p className="text-sm text-[#5C5B4F] mt-1">Panel de escritorios rurales · Uruguay</p>
          </div>

          {children}
        </div>
      </div>
    </div>
  )
}
