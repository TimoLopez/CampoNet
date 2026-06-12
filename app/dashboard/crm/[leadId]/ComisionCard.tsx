import { Banknote, Settings } from 'lucide-react'

interface Props {
  precioUsd: number | null
  comisionPct: number | null
  campoId: string | null
}

export default function ComisionCard({ precioUsd, comisionPct, campoId }: Props) {
  const tieneDatos = precioUsd != null && comisionPct != null

  return (
    <div className="bg-white rounded-2xl border border-[#E2DFD6] p-6 shadow-[var(--shadow-card)]">
      <h2 className="text-[13.5px] font-semibold text-[#1A1A12] mb-4 flex items-center gap-2">
        <span className="w-1 h-4 rounded-full bg-emerald-500 inline-block" />
        Comisión estimada
      </h2>

      {tieneDatos ? (
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0">
            <Banknote className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-[28px] font-bold text-[#1A1A12] tabular-nums leading-none">
              USD {(precioUsd! * (comisionPct! / 100)).toLocaleString('es-UY', { maximumFractionDigits: 0 })}
            </p>
            <p className="text-[12px] text-[#8B8A7E] mt-1">
              {comisionPct}% sobre USD {precioUsd!.toLocaleString('es-UY')}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#F2EFE8] flex items-center justify-center shrink-0">
            <Settings className="h-4 w-4 text-[#8B6914]" />
          </div>
          <div>
            <p className="text-[13px] text-[#5C5B4F] leading-relaxed">
              Faltan datos para estimar la comisión.
            </p>
            {campoId ? (
              <a
                href={`/dashboard/campos/${campoId}`}
                className="text-[12.5px] text-[#8B6914] hover:text-[#C49A3C] font-medium underline underline-offset-2 transition-colors"
              >
                Configurar precio y % de comisión en el campo
              </a>
            ) : (
              <p className="text-[12px] text-[#B0AD9E] mt-0.5">
                Este lead no tiene un campo asociado.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
