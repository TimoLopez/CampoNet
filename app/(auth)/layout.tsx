export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Grain texture overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
      />
      {/* Green blob — top right */}
      <div aria-hidden className="pointer-events-none absolute top-0 right-0 w-[500px] h-[500px] bg-[#2D5018]/8 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4" />
      {/* Gold blob — bottom left */}
      <div aria-hidden className="pointer-events-none absolute bottom-0 left-0 w-96 h-96 bg-[#C49A3C]/8 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
      {/* Gold blob — bottom right */}
      <div aria-hidden className="pointer-events-none absolute bottom-0 right-0 w-64 h-64 bg-[#C49A3C]/5 rounded-full blur-2xl translate-y-1/4 translate-x-1/4" />

      <div className="relative w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#1C3311] mb-4 shadow-lg">
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" aria-hidden>
              <path d="M12 3C8 3 5 7 5 11c0 2.5 1.5 4.5 3 6l4 4 4-4c1.5-1.5 3-3.5 3-6 0-4-3-8-7-8z" fill="#C49A3C" opacity="0.9"/>
              <path d="M12 8v6M9 11l3-3 3 3" stroke="#F7F5F0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1A1A12]">
            Campo<span className="text-[#2D5018]">Net</span>
          </h1>
          <p className="text-sm text-[#5C5B4F] mt-1.5">Panel de escritorios rurales · Uruguay</p>
        </div>

        {children}
      </div>
    </div>
  )
}
