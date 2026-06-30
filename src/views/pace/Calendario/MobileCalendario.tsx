import type { EventoCalendario, CategoriaInstitucional } from './index'

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'] as const

const GRID_7_COLUNAS = {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
} as const

type Celula = { dia: number | null; iso: string | null }

type Props = {
    labelMesAno: string
    celulasGrade: Celula[]
    eventosPorData: Map<string, EventoCalendario[]>
    hojeIso: string
    diaSelecionado: string | null
    listaVazia: boolean
    corDotEvento: Record<CategoriaInstitucional, string>
    configCategoria: Record<CategoriaInstitucional, { cor: string; icone: string }>
    formatarDataPt: (iso: string) => string
    onMesAnterior: () => void
    onMesProximo: () => void
    onSelecionarDia: (iso: string | null) => void
    onVerEvento: (ev: EventoCalendario) => void
}

export default function MobileCalendario({
    labelMesAno,
    celulasGrade,
    eventosPorData,
    hojeIso,
    diaSelecionado,
    listaVazia,
    corDotEvento,
    configCategoria,
    formatarDataPt,
    onMesAnterior,
    onMesProximo,
    onSelecionarDia,
    onVerEvento,
}: Props) {
    const eventosDoDia = diaSelecionado ? (eventosPorData.get(diaSelecionado) ?? []) : []

    return (
        <section
            aria-label="Calendário compacto"
            className="md:hidden w-full min-w-0 max-w-full flex flex-col gap-4"
        >
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden w-full">
                <div className="flex items-center justify-between gap-2 px-3 py-3 border-b border-gray-200 dark:border-gray-700">
                    <button
                        type="button"
                        onClick={onMesAnterior}
                        aria-label="Mês anterior"
                        className="min-h-9 min-w-9 rounded-lg border border-gray-200 dark:border-gray-600 text-sm font-bold"
                    >
                        ‹
                    </button>
                    <h2 className="text-sm font-extrabold text-gray-900 dark:text-gray-50 capitalize flex-1 text-center">
                        {labelMesAno}
                    </h2>
                    <button
                        type="button"
                        onClick={onMesProximo}
                        aria-label="Próximo mês"
                        className="min-h-9 min-w-9 rounded-lg border border-gray-200 dark:border-gray-600 text-sm font-bold"
                    >
                        ›
                    </button>
                </div>

                <div
                    className="w-full min-w-0 grid grid-cols-7 px-1 pt-2 pb-2"
                    style={GRID_7_COLUNAS}
                >
                    {DIAS_SEMANA.map((dia) => (
                        <div
                            key={`m-hdr-${dia}`}
                            className="text-center text-[10px] font-bold text-gray-400 dark:text-gray-500 pb-1 min-w-0"
                        >
                            {dia.charAt(0)}
                        </div>
                    ))}

                    {celulasGrade.map((celula, idx) => {
                        const vazio = celula.dia == null
                        const eventosNoDia = celula.iso
                            ? (eventosPorData.get(celula.iso) ?? [])
                            : []
                        const selecionado = celula.iso != null && celula.iso === diaSelecionado
                        const ehHoje = celula.iso === hojeIso
                        const categoriasDots = [
                            ...new Set(eventosNoDia.map((e) => e.categoria)),
                        ].slice(0, 3)

                        if (vazio) {
                            return <div key={`m-vazio-${idx}`} className="min-w-0 h-10" aria-hidden />
                        }

                        return (
                            <button
                                key={`m-${celula.iso}-${idx}`}
                                type="button"
                                onClick={() => onSelecionarDia(celula.iso)}
                                className={`min-w-0 h-10 flex flex-col items-center justify-center rounded-lg touch-manipulation transition ${
                                    selecionado
                                        ? 'bg-indigo-600 text-white shadow-md'
                                        : ehHoje
                                          ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-200'
                                          : 'text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                                }`}
                            >
                                <span className="text-xs font-bold leading-none">{celula.dia}</span>
                                {categoriasDots.length > 0 && (
                                    <span className="flex gap-0.5 mt-0.5">
                                        {categoriasDots.map((cat) => (
                                            <span
                                                key={cat}
                                                className={`w-1 h-1 rounded-full shrink-0 ${
                                                    selecionado ? 'bg-white/90' : corDotEvento[cat]
                                                }`}
                                                aria-hidden
                                            />
                                        ))}
                                    </span>
                                )}
                            </button>
                        )
                    })}
                </div>
            </div>

            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
                {diaSelecionado ? (
                    <>
                        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-900/50">
                            <p className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                Agenda do dia
                            </p>
                            <p className="text-sm font-extrabold text-gray-900 dark:text-gray-50 mt-0.5">
                                {formatarDataPt(diaSelecionado)}
                            </p>
                        </div>
                        {eventosDoDia.length === 0 ? (
                            <p className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                                Nenhum evento neste dia com os filtros atuais.
                            </p>
                        ) : (
                            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                                {eventosDoDia.map((ev) => {
                                    const cfg = configCategoria[ev.categoria]
                                    return (
                                        <li key={ev.id}>
                                            <button
                                                type="button"
                                                onClick={() => onVerEvento(ev)}
                                                className="w-full text-left px-4 py-3.5 flex gap-3 items-start hover:bg-gray-50 dark:hover:bg-gray-900/50 transition touch-manipulation"
                                            >
                                                <span
                                                    className={`w-1 self-stretch rounded-full shrink-0 ${corDotEvento[ev.categoria]}`}
                                                    aria-hidden
                                                />
                                                <span className="min-w-0 flex-1">
                                                    <span
                                                        className={`inline-block text-[10px] font-black uppercase px-2 py-0.5 rounded mb-1 ${cfg.cor}`}
                                                    >
                                                        {ev.categoria}
                                                    </span>
                                                    <span className="block font-bold text-gray-900 dark:text-gray-50 text-sm leading-snug break-words">
                                                        {ev.titulo}
                                                    </span>
                                                    <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                                                        {ev.descricao}
                                                    </span>
                                                </span>
                                                <span className="text-indigo-600 dark:text-indigo-400 text-xs font-bold shrink-0 pt-1">
                                                    →
                                                </span>
                                            </button>
                                        </li>
                                    )
                                })}
                            </ul>
                        )}
                    </>
                ) : (
                    <div className="px-4 py-10 text-center">
                        <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                            Toque em um dia para ver os eventos
                        </p>
                        {listaVazia && (
                            <p className="text-xs text-gray-500 mt-2">
                                Nenhum evento nos filtros atuais neste mês.
                            </p>
                        )}
                    </div>
                )}
            </div>
        </section>
    )
}
