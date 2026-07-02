import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useAuth } from '@/auth'
import Reveal from '@/components/ui/Reveal'
import { usePodeEditar } from '@/utils/hooks/usePodeEditar'
import { AgendaService, AgendaEvent, CategoriaAgenda, PrioridadeAgenda } from '@/services/AgendaService'

// ==========================================
// CONFIGURAÇÕES E UTILS (Puras)
// ==========================================
const configCategorias: Record<CategoriaAgenda, { cor: string; icone: string; bg: string }> = {
    'Provas/Trabalhos': {
        cor: 'text-red-600 dark:text-red-400',
        bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/40',
        icone: '🎯',
    },
    'Aulas/Estudos': {
        cor: 'text-blue-600 dark:text-blue-400',
        bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/40',
        icone: '📚',
    },
    'Reunião': {
        cor: 'text-purple-600 dark:text-purple-400',
        bg: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800/40',
        icone: '👥',
    },
    Pessoal: {
        cor: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/40',
        icone: '☕',
    },
}

const configPrioridades: Record<PrioridadeAgenda, { icone: string; glow: string }> = {
    Alta: {
        icone: '🔥 Alta',
        glow: 'shadow-[0_0_12px_rgba(239,68,68,0.3)] border-red-400 dark:border-red-600',
    },
    Média: { icone: '⚡ Média', glow: '' },
    Baixa: { icone: '🧊 Baixa', glow: '' },
}

const getLocalISODate = (date: Date = new Date()) => {
    const offset = date.getTimezoneOffset() * 60000
    return new Date(date.getTime() - offset).toISOString().split('T')[0]
}

const normalizeText = (str?: string) =>
    (str || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()

/** Limites de entrada (campos editáveis e busca) */
const MAX_TITULO = 140
const MAX_DESCRICAO = 700
const MAX_BUSCA = 140

/** Compara apenas a data ISO (yyyy-mm-dd). */
type ContextoTemporal = 'passado' | 'hoje' | 'futuro'

const getContextoTemporal = (dataEventoISO: string, hojeISO: string): ContextoTemporal => {
    if (dataEventoISO < hojeISO) return 'passado'
    if (dataEventoISO > hojeISO) return 'futuro'
    return 'hoje'
}

const formatarDMAComAno = (dataISO: string) =>
    new Date(`${dataISO}T12:00:00`).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    })

// ==========================================
// HOOKS CUSTOMIZADOS
// ==========================================

function useToasts() {
    const [toasts, setToasts] = useState<{ id: number; msg: string; tipo: 'sucesso' | 'erro' }[]>([])

    const addToast = useCallback((msg: string, tipo: 'sucesso' | 'erro' = 'sucesso') => {
        const id = Date.now()
        setToasts((prev) => [...prev, { id, msg, tipo }])
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id))
        }, 3000)
    }, [])

    return { toasts, addToast }
}

function useAgenda(userId: string, addToast: ReturnType<typeof useToasts>['addToast']) {
    const [eventos, setEventos] = useState<AgendaEvent[]>([])
    const [isGlobalLoading, setIsGlobalLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<Record<number, boolean>>({})

    const fetchAgenda = useCallback(async () => {
        setIsGlobalLoading(true)
        try {
            const data = await AgendaService.getByUser(userId)
            setEventos(data)
        } catch {
            addToast('Falha ao carregar agenda', 'erro')
        } finally {
            setIsGlobalLoading(false)
        }
    }, [userId, addToast])

    useEffect(() => {
        fetchAgenda()
    }, [fetchAgenda])

    const setItemLoading = (id: number, status: boolean) => {
        setActionLoading((prev) => ({ ...prev, [id]: status }))
    }

    const criarEvento = async (novo: Omit<AgendaEvent, 'id' | 'concluido' | 'userId'>) => {
        const payload = { ...novo, userId }
        const tempId = Date.now()
        const tempEv: AgendaEvent = { ...payload, id: tempId, concluido: false }

        setEventos((prev) => [...prev, tempEv])

        try {
            const realEv = await AgendaService.create(payload)
            setEventos((prev) => prev.map((e) => (e.id === tempId ? realEv : e)))
            addToast('Evento criado!')
        } catch {
            setEventos((prev) => prev.filter((e) => e.id !== tempId))
            addToast('Erro ao criar evento', 'erro')
        }
    }

    const editarEvento = async (id: number, atualizacao: Partial<AgendaEvent>) => {
        const estadoAnterior = eventos.find((e) => e.id === id)
        if (!estadoAnterior) return

        setEventos((prev) => prev.map((e) => (e.id === id ? { ...e, ...atualizacao } : e)))

        try {
            await AgendaService.update(id, atualizacao)
            addToast('Evento atualizado!')
        } catch {
            setEventos((prev) => prev.map((e) => (e.id === id ? estadoAnterior : e)))
            addToast('Erro ao atualizar', 'erro')
        }
    }

    const removerEvento = async (id: number) => {
        const estadoAnterior = eventos.find((e) => e.id === id)
        setEventos((prev) => prev.filter((e) => e.id !== id))

        try {
            await AgendaService.delete(id)
            addToast('Evento removido')
        } catch {
            if (estadoAnterior) {
                setEventos((prev) => [...prev, estadoAnterior])
            }
            addToast('Erro ao excluir', 'erro')
        }
    }

    const toggleStatus = async (id: number) => {
        const eventoAlvo = eventos.find((e) => e.id === id)
        if (!eventoAlvo) return

        const vaiConcluir = !eventoAlvo.concluido
        setEventos((prev) => prev.map((e) => (e.id === id ? { ...e, concluido: vaiConcluir } : e)))
        setItemLoading(id, true)

        try {
            await AgendaService.toggleStatus(id)
            addToast(vaiConcluir ? 'Marcado como concluído! 🎉' : 'Desmarcado como concluído')
        } catch {
            setEventos((prev) =>
                prev.map((e) => (e.id === id ? { ...e, concluido: eventoAlvo.concluido } : e)),
            )
            addToast('Erro de sincronização', 'erro')
        } finally {
            setItemLoading(id, false)
        }
    }

    const reagendarEvento = async (id: number, novaData: string) => {
        const evento = eventos.find((e) => e.id === id)
        if (evento && evento.data !== novaData) {
            await editarEvento(id, { data: novaData })
        }
    }

    return {
        eventos,
        isGlobalLoading,
        actionLoading,
        criarEvento,
        editarEvento,
        removerEvento,
        toggleStatus,
        reagendarEvento,
    }
}

// ==========================================
// COMPONENTES DA UI
// ==========================================

const ToastContainer = React.memo(({ toasts }: { toasts: { id: number; msg: string; tipo: 'sucesso' | 'erro' }[] }) => (
    <div className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 z-[99] flex max-w-[calc(100vw-1rem)] flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
            <div
                key={t.id}
                className={`px-4 sm:px-6 py-3 rounded-xl shadow-lg text-white font-bold text-sm sm:text-base animate-fade-in-up ${
                    t.tipo === 'sucesso' ? 'bg-emerald-600' : 'bg-red-600'
                }`}
            >
                {t.msg}
            </div>
        ))}
    </div>
))

const AgendaStats = React.memo(({ eventos, hojeStr }: { eventos: AgendaEvent[]; hojeStr: string }) => {
    const pendentesHoje = eventos.filter((e) => e.data === hojeStr && !e.concluido).length
    const atrasados = eventos.filter((e) => e.data < hojeStr && !e.concluido).length

    const proximos = eventos
        .filter((e) => !e.concluido && e.data >= hojeStr)
        .sort((a, b) => a.data.localeCompare(b.data) || a.horario.localeCompare(b.horario))
        .slice(0, 3)

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-6">
            <div className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 p-4 rounded-xl flex items-center justify-between gap-3">
                <span className="font-bold text-sm sm:text-base">Pendentes Hoje</span>
                <span className="text-2xl font-black shrink-0">{pendentesHoje}</span>
            </div>

            <div
                className={`p-4 rounded-xl flex items-center justify-between gap-3 ${
                    atrasados > 0
                        ? 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800/40'
                        : 'bg-gray-50 text-gray-500 dark:bg-gray-900/40 dark:text-gray-400'
                }`}
            >
                <span className="font-bold text-sm sm:text-base">Atrasados</span>
                <span className="text-2xl font-black shrink-0">{atrasados}</span>
            </div>

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-xl col-span-1 md:col-span-3 lg:col-span-1 flex flex-col">
                <span className="font-bold text-gray-700 dark:text-gray-300 mb-2 text-sm">Próximos 3 Eventos</span>
                <div className="flex flex-col gap-1">
                    {proximos.length > 0 ? (
                        proximos.map((p) => (
                            <div
                                key={p.id}
                                className="text-xs flex items-center justify-between gap-2 bg-gray-50 dark:bg-gray-700/70 px-2 py-1.5 rounded"
                            >
                                <span
                                    className="flex-1 min-w-0 font-semibold break-words line-clamp-2 text-left leading-snug"
                                    title={p.titulo}
                                >
                                    {p.titulo}
                                </span>
                                <span className="shrink-0 text-right text-indigo-600 dark:text-indigo-400 font-bold leading-tight max-w-[52%] sm:max-w-none">
                                    {p.data === hojeStr
                                        ? `Hoje · ${formatarDMAComAno(p.data)}`
                                        : formatarDMAComAno(p.data)}
                                </span>
                            </div>
                        ))
                    ) : (
                        <span className="text-xs text-gray-400">Nenhum evento próximo.</span>
                    )}
                </div>
            </div>
        </div>
    )
})

const ModalVisualizarTarefa = React.memo(
    ({
        item,
        hojeStr,
        onClose,
        onEdit,
        podeEditar,
    }: {
        item: AgendaEvent
        hojeStr: string
        onClose: () => void
        onEdit: (e: AgendaEvent) => void
        podeEditar: boolean
    }) => {
        const cfg = configCategorias[item.categoria as CategoriaAgenda]
        const prio = configPrioridades[item.prioridade as PrioridadeAgenda]
        const ctx = getContextoTemporal(item.data, hojeStr)

        const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
            if (e.target === e.currentTarget) onClose()
        }

        return (
            <div
                role="presentation"
                onClick={handleBackdrop}
                className="fixed inset-0 z-[65] flex items-end justify-center sm:items-center p-0 sm:p-4 bg-gray-900/70 backdrop-blur-sm"
            >
                <Reveal direction="up" className="w-full max-w-lg min-w-0 max-h-[90dvh] sm:max-h-[85vh]">
                    <div
                        role="dialog"
                        aria-labelledby="titulo-vis-tarefa"
                        aria-modal="true"
                        className="flex flex-col min-w-0 max-h-[inherit] rounded-t-3xl sm:rounded-3xl bg-white dark:bg-gray-800 shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="shrink-0 px-4 py-4 sm:px-6 border-b border-gray-100 dark:border-gray-700 flex justify-between gap-3 items-start bg-gray-50 dark:bg-gray-900/50">
                            <div className="min-w-0 flex-1">
                                <span className="text-[11px] font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                    Visualizar tarefa
                                </span>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    <BadgeTemporalAgenda ctx={ctx} />
                                    <span className={`text-[11px] font-black uppercase px-2 py-0.5 rounded ${cfg.cor}`}>
                                        {cfg.icone} {item.categoria}
                                    </span>
                                    {item.concluido && (
                                        <span className="text-[11px] font-black uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800/45">
                                            Concluída
                                        </span>
                                    )}
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                className="min-h-[44px] min-w-[44px] shrink-0 flex items-center justify-center rounded-xl text-gray-500 hover:bg-gray-200 hover:text-gray-800 dark:hover:bg-gray-700 dark:text-gray-400"
                                aria-label="Fechar"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="overflow-y-auto flex-1 min-h-0 px-4 pt-4 pb-2 sm:px-6 sm:pb-4">
                            <div className="flex flex-wrap gap-2 mb-4 text-xs font-bold">
                                <span className="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-lg text-gray-700 dark:text-gray-200 break-all">
                                    📅 {formatarDMAComAno(item.data)}
                                </span>
                                <span className="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-lg text-gray-700 dark:text-gray-200 shrink-0">
                                    🕒 {item.horario}
                                </span>
                                <span className="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-lg text-gray-700 dark:text-gray-200 min-w-0 break-words">
                                    {prio.icone}
                                </span>
                            </div>

                            <h4
                                id="titulo-vis-tarefa"
                                className={`text-xl font-extrabold leading-snug break-words mb-4 ${
                                    item.concluido
                                        ? 'text-gray-500 line-through decoration-gray-400 dark:text-gray-400'
                                        : 'text-gray-900 dark:text-white'
                                }`}
                            >
                                {item.titulo}
                            </h4>

                            <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                                <p className="text-xs font-black uppercase tracking-wide text-gray-500 mb-2">Descrição</p>
                                {item.descricao?.trim() ? (
                                    <p
                                        className={`text-[15px] sm:text-base leading-relaxed whitespace-pre-wrap break-words hyphens-auto ${
                                            item.concluido
                                                ? 'text-gray-500 line-through decoration-gray-400 dark:text-gray-400'
                                                : 'text-gray-700 dark:text-gray-300'
                                        }`}
                                    >
                                        {item.descricao}
                                    </p>
                                ) : (
                                    <p className="text-sm text-gray-400 italic">
                                        Sem descrição adicional.
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="shrink-0 px-4 pb-[max(env(safe-area-inset-bottom,0px),1rem)] pt-4 sm:px-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40">
                            <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-between sm:items-center">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="w-full sm:w-auto min-h-[48px] px-5 rounded-xl border-2 border-gray-200 dark:border-gray-600 font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    Fechar
                                </button>
                                {podeEditar && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        onClose()
                                        onEdit(item)
                                    }}
                                    className="w-full sm:w-auto min-h-[48px] px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md"
                                >
                                    Editar tarefa
                                </button>
                                )}
                            </div>
                        </div>
                    </div>
                </Reveal>
            </div>
        )
    },
)

const BadgeTemporalAgenda = React.memo(({ ctx }: { ctx: ContextoTemporal }) => {
    if (ctx === 'passado') {
        return (
            <span className="text-[10px] font-black uppercase tracking-wide bg-gray-200/95 text-gray-700 px-2 py-0.5 rounded-md border border-gray-300 dark:bg-gray-700/90 dark:text-gray-200 dark:border-gray-600">
                Encerrado
            </span>
        )
    }
    if (ctx === 'hoje') {
        return (
            <span className="text-[10px] font-black uppercase tracking-wide bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-200 dark:bg-indigo-900/35 dark:text-indigo-300 dark:border-indigo-700/60">
                Hoje
            </span>
        )
    }
    return (
        <span className="text-[10px] font-black uppercase tracking-wide bg-sky-100 text-sky-800 px-2 py-0.5 rounded-md border border-sky-200 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-800/40">
            Próximo
        </span>
    )
})

const AgendaItem = React.memo(
    ({
        item,
        hojeStr,
        isLoading,
        onToggle,
        onEdit,
        onDelete,
        onView,
        podeEditar,
    }: {
        item: AgendaEvent
        hojeStr: string
        isLoading?: boolean
        onToggle: (id: number) => void
        onEdit: (evento: AgendaEvent) => void
        onDelete: (id: number) => void
        onView: (evento: AgendaEvent) => void
        podeEditar: boolean
    }) => {
        const config = configCategorias[item.categoria as CategoriaAgenda]
        const prioConfig = configPrioridades[item.prioridade as PrioridadeAgenda]
        const ctxTemporal = getContextoTemporal(item.data, hojeStr)
        const pendenteEAtrasado = item.data < hojeStr && !item.concluido

        const opacidadeContexto =
            item.concluido ? 'opacity-100' : ctxTemporal === 'passado' ? 'opacity-60' : 'opacity-100'

        const destaqueHoje =
            ctxTemporal === 'hoje'
                ? 'ring-2 ring-indigo-500/85 ring-offset-2 ring-offset-white dark:ring-offset-gray-800 sm:dark:ring-offset-gray-900 border-indigo-400 dark:border-indigo-500/70 shadow-md'
                : ''

        const cardSkin = item.concluido
            ? 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/85'
            : pendenteEAtrasado
              ? 'border-red-300 dark:border-red-700 bg-red-50/40 dark:bg-red-900/12'
              : config.bg

        return (
            <div
                draggable={podeEditar}
                onDragStart={(e) => {
                    if (!podeEditar) {
                        e.preventDefault()
                        return
                    }
                    const t = e.target as HTMLElement | null
                    if (t && t.closest('[data-agenda-no-drag]')) {
                        e.preventDefault()
                        return
                    }
                    e.dataTransfer.setData('eventId', item.id.toString())
                    e.dataTransfer.effectAllowed = 'move'
                }}
                role="presentation"
                className={`group relative w-full max-w-full min-w-0 flex flex-row items-start gap-3 rounded-2xl border p-4 sm:p-5 transition-all hover:shadow-md ${cardSkin} ${opacidadeContexto} ${destaqueHoje} ${
                    !item.concluido && item.prioridade === 'Alta' ? prioConfig.glow : ''
                } touch-manipulation`}
            >
                <div
                    className={`absolute -left-1 top-7 sm:left-0 sm:-left-[6px] sm:top-6 z-[1] w-3 h-3 sm:w-4 sm:h-4 shrink-0 rounded-full border-[3px] sm:border-[4px] border-white dark:border-gray-950 ${
                        item.concluido
                            ? 'bg-emerald-500'
                            : pendenteEAtrasado
                              ? 'bg-red-500'
                              : ctxTemporal === 'hoje'
                                ? 'bg-indigo-500 shadow-[0_0_0_2px_rgba(99,102,241,0.35)]'
                                : 'bg-indigo-400 shadow-sm'
                    }`}
                />

                <div className="flex flex-row items-start gap-3 w-full min-w-0 max-w-full">
                    {podeEditar && (
                    <button
                        type="button"
                        data-agenda-no-drag
                        draggable={false}
                        onDragStart={(e) => e.stopPropagation()}
                        onClick={(e) => {
                            e.stopPropagation()
                            onToggle(item.id)
                        }}
                        disabled={isLoading}
                        className={`relative z-[2] shrink-0 min-h-[48px] min-w-[48px] sm:min-h-10 sm:min-w-10 rounded-full border-[3px] flex items-center justify-center transition-colors ${
                            isLoading ? 'opacity-50 cursor-wait' : 'active:scale-95'
                        } ${
                            item.concluido
                                ? 'bg-green-500 border-green-500 text-white'
                                : 'border-gray-300 bg-white dark:bg-gray-800 hover:border-indigo-500 text-transparent'
                        }`}
                        aria-label={item.concluido ? 'Marcar pendente novamente' : 'Marcar como concluída'}
                        title={item.concluido ? 'Marcar pendente' : 'Concluir'}
                    >
                        {isLoading ? '⏳' : '✓'}
                    </button>
                    )}

                    <div className="flex-1 flex flex-col min-w-0 max-w-full overflow-hidden gap-3">
                        <div className="min-w-0 max-w-full">
                            <div className="flex flex-wrap items-start gap-x-2 gap-y-2 mb-1.5 min-w-0 max-w-full">
                                <BadgeTemporalAgenda ctx={ctxTemporal} />

                                {pendenteEAtrasado && (
                                    <span className="text-[10px] font-black uppercase bg-red-100 text-red-700 px-2 py-0.5 rounded border border-red-200 dark:bg-red-900/25 dark:text-red-300 dark:border-red-800/45 whitespace-normal text-left max-w-full break-words">
                                        Em atraso
                                    </span>
                                )}

                                <span
                                    className={`text-[11px] sm:text-xs font-black uppercase tracking-wider max-w-full break-words ${
                                        item.concluido ? 'text-gray-500 dark:text-gray-400' : config.cor
                                    }`}
                                >
                                    {config.icone} {item.categoria}
                                </span>

                                <span className="inline-flex flex-wrap gap-1 items-center max-w-full min-w-0 text-[11px] sm:text-xs font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-md">
                                    📅{' '}
                                    <span className="break-all min-w-0">{formatarDMAComAno(item.data)}</span>
                                </span>

                                <span className="inline-flex shrink-0 text-[11px] sm:text-xs font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-md">
                                    🕒 {item.horario}
                                </span>

                                <span
                                    className={`inline-flex max-w-full min-w-0 break-words text-[11px] sm:text-xs font-bold ${
                                        item.concluido ? 'text-gray-500 dark:text-gray-400' : 'text-gray-700 dark:text-gray-300'
                                    }`}
                                >
                                    {prioConfig.icone}
                                </span>
                            </div>

                            <button
                                type="button"
                                data-agenda-no-drag
                                draggable={false}
                                onDragStart={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                }}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onView(item)
                                }}
                                className="w-full min-w-0 text-left rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 touch-manipulation active:bg-black/[0.03] dark:active:bg-white/[0.04] -mx-1 px-1"
                            >
                                <h4
                                    className={`text-base sm:text-lg font-bold leading-snug break-words hyphens-auto line-clamp-3 sm:line-clamp-3 ${
                                        item.concluido
                                            ? 'text-gray-500 dark:text-gray-400 line-through decoration-gray-400 dark:decoration-gray-500'
                                            : 'text-gray-900 dark:text-white underline-offset-4 decoration-transparent group-hover:decoration-current/25'
                                    }`}
                                >
                                    {item.titulo}
                                </h4>

                                {item.descricao?.trim() ? (
                                    <p
                                        className={`mt-2 text-sm leading-relaxed break-words hyphens-auto line-clamp-4 sm:line-clamp-3 ${
                                            item.concluido
                                                ? 'text-gray-500 dark:text-gray-400 line-through decoration-gray-400 dark:decoration-gray-500'
                                                : 'text-gray-600 dark:text-gray-400'
                                        }`}
                                    >
                                        {item.descricao}
                                    </p>
                                ) : null}
                            </button>
                        </div>

                        <div
                            data-agenda-no-drag
                            className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end w-full max-w-full min-w-0 pt-3 border-t border-gray-200/70 dark:border-gray-700/80"
                        >
                            <button
                                type="button"
                                draggable={false}
                                onDragStart={(e) => e.stopPropagation()}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onView(item)
                                }}
                                className="w-full sm:w-auto sm:min-w-[9rem] min-h-[48px] shrink-0 px-4 rounded-xl border-2 border-indigo-400/70 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-800 dark:text-indigo-100 font-bold text-sm inline-flex items-center justify-center gap-2 active:scale-[0.98] touch-manipulation"
                            >
                                <span aria-hidden>👁️</span> Ver detalhes
                            </button>
                            {podeEditar && (
                            <>
                            <button
                                type="button"
                                draggable={false}
                                onDragStart={(e) => e.stopPropagation()}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onEdit(item)
                                }}
                                className="flex-1 min-w-0 sm:flex-none sm:min-h-[44px] min-h-[48px] px-4 rounded-xl border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-100 font-bold text-sm inline-flex items-center justify-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700/80 touch-manipulation"
                            >
                                <span aria-hidden>✏️</span> Editar
                            </button>
                            <button
                                type="button"
                                draggable={false}
                                onDragStart={(e) => e.stopPropagation()}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    window.confirm('Excluir esta tarefa?') && onDelete(item.id)
                                }}
                                className="flex-1 min-w-0 sm:flex-none sm:min-h-[44px] min-h-[48px] px-4 rounded-xl border-2 border-red-200 dark:border-red-900/70 text-red-700 dark:text-red-300 font-bold text-sm inline-flex items-center justify-center gap-2 hover:bg-red-50 dark:hover:bg-red-950/30 touch-manipulation"
                            >
                                <span aria-hidden>🗑️</span> Excluir
                            </button>
                            </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )
    },
)

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

export default function Agenda() {
    const { user } = useAuth()
    const { podeEditar } = usePodeEditar()
    const userId = user?.email || 'direcao'
    const hojeStr = getLocalISODate()

    const { toasts, addToast } = useToasts()
    const {
        eventos,
        isGlobalLoading,
        actionLoading,
        criarEvento,
        editarEvento,
        removerEvento,
        toggleStatus,
        reagendarEvento,
    } = useAgenda(userId, addToast)

    const [filtros, setFiltros] = useState({
        busca: '',
        categoria: 'Todas',
        status: 'Todos',
    })

    const [dragOverDate, setDragOverDate] = useState<string | null>(null)

    const [modal, setModal] = useState({
        aberto: false,
        editandoId: null as number | null,
    })

    const [visualizando, setVisualizando] = useState<AgendaEvent | null>(null)

    const [form, setForm] = useState({
        titulo: '',
        descricao: '',
        data: hojeStr,
        horario: '12:00',
        categoria: 'Aulas/Estudos' as CategoriaAgenda,
        prioridade: 'Média' as PrioridadeAgenda,
    })

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (
                !podeEditar ||
                e.key.toLowerCase() !== 'n' ||
                modal.aberto ||
                document.activeElement?.tagName === 'INPUT' ||
                document.activeElement?.tagName === 'TEXTAREA'
            ) {
                return
            }
            e.preventDefault()
            abrirModalNovo()
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [modal.aberto, podeEditar])

    const abrirModalNovo = () => {
        if (!podeEditar) return
        setForm({
            titulo: '',
            descricao: '',
            data: hojeStr,
            horario: '12:00',
            categoria: 'Aulas/Estudos',
            prioridade: 'Média',
        })
        setModal({ aberto: true, editandoId: null })
    }

    const abrirModalEdit = useCallback((evento: AgendaEvent) => {
        if (!podeEditar) return
        setForm({
            titulo: evento.titulo,
            descricao: evento.descricao,
            data: evento.data,
            horario: evento.horario,
            categoria: evento.categoria,
            prioridade: evento.prioridade,
        })
        setModal({ aberto: true, editandoId: evento.id })
    }, [podeEditar])

    const handleSalvar = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!podeEditar) return

        if (modal.editandoId) {
            await editarEvento(modal.editandoId, form)
        } else {
            await criarEvento(form)
        }

        setModal({ aberto: false, editandoId: null })
    }

    const agendaAgrupada = useMemo(() => {
        const query = normalizeText(filtros.busca)

        let filtrados = eventos.filter(
            (e) =>
                normalizeText(e.titulo).includes(query) ||
                normalizeText(e.descricao).includes(query) ||
                normalizeText(e.categoria).includes(query),
        )

        if (filtros.categoria !== 'Todas') {
            filtrados = filtrados.filter((e) => e.categoria === filtros.categoria)
        }

        if (filtros.status === 'Pendentes') {
            filtrados = filtrados.filter((e) => !e.concluido)
        }

        if (filtros.status === 'Concluidos') {
            filtrados = filtrados.filter((e) => e.concluido)
        }

        const grupos: Record<string, AgendaEvent[]> = {}
        filtrados.forEach((e) => {
            if (!grupos[e.data]) grupos[e.data] = []
            grupos[e.data].push(e)
        })

        const pesosPrio = { Alta: 1, Média: 2, Baixa: 3 }
        Object.keys(grupos).forEach((data) => {
            grupos[data].sort((a, b) => {
                if (a.concluido !== b.concluido) return a.concluido ? 1 : -1
                if (a.horario !== b.horario) return a.horario.localeCompare(b.horario)
                return pesosPrio[a.prioridade] - pesosPrio[b.prioridade]
            })
        })

        return {
            grupos,
            datasOrdenadas: Object.keys(grupos).sort(),
        }
    }, [eventos, filtros])

    const formatarRotuloDiaTimeline = (dataISO: string) => {
        if (dataISO === hojeStr) return 'Hoje'

        const amanha = new Date()
        amanha.setDate(amanha.getDate() + 1)
        if (dataISO === getLocalISODate(amanha)) return 'Amanhã'

        return new Date(`${dataISO}T12:00:00`).toLocaleDateString('pt-BR', { weekday: 'long' })
    }

    const handleDragOver = (e: React.DragEvent, data: string) => {
        e.preventDefault()
        setDragOverDate(data)
    }

    const handleDragLeave = () => setDragOverDate(null)

    const handleDrop = (e: React.DragEvent, novaData: string) => {
        e.preventDefault()
        setDragOverDate(null)
        if (!podeEditar) return

        const idStr = e.dataTransfer.getData('eventId')
        if (idStr) {
            reagendarEvento(parseInt(idStr), novaData)
        }
    }

    return (
        <div className="flex flex-col gap-4 sm:gap-6 w-full max-w-5xl min-w-0 mx-auto px-4 overflow-x-hidden pb-[calc(7rem+env(safe-area-inset-bottom,0px))] sm:pb-20">
            <ToastContainer toasts={toasts} />

            <Reveal direction="down">
                <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 justify-between items-stretch">
                    <div className="flex-1 bg-white dark:bg-gray-800 p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start">
                            <div className="min-w-0">
                                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-100 leading-tight">
                                    Agenda Escolar
                                </h2>
                                <p className="text-sm sm:text-base text-gray-500 mt-1">
                                    Dica: Arraste cards entre datas para reagendar.
                                </p>
                            </div>

                            {podeEditar && (
                            <button
                                onClick={abrirModalNovo}
                                className="hidden md:flex shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-transform active:scale-95 items-center gap-2"
                            >
                                <span>+</span> Novo (N)
                            </button>
                            )}
                        </div>

                        <AgendaStats eventos={eventos} hojeStr={hojeStr} />
                    </div>
                </div>
            </Reveal>

            <Reveal direction="up" delay={50}>
                <div className="flex flex-col md:flex-row gap-3 sm:gap-4 bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 items-stretch md:items-center justify-between">
                    <div className="relative w-full md:w-80">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">🔍</span>
                        <input
                            type="text"
                            placeholder="Buscar título, tag ou desc..."
                            maxLength={MAX_BUSCA}
                            value={filtros.busca}
                            onChange={(e) =>
                                setFiltros({
                                    ...filtros,
                                    busca: e.target.value.slice(0, MAX_BUSCA),
                                })
                            }
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:border-indigo-500 focus:ring-1 text-sm sm:text-base min-w-0"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full md:w-auto">
                        <select
                            value={filtros.status}
                            onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
                            className="w-full min-w-0 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 font-bold text-sm outline-none"
                        >
                            <option value="Todos">Status: Todos</option>
                            <option value="Pendentes">Só Pendentes</option>
                            <option value="Concluidos">Só Concluídos</option>
                        </select>

                        <select
                            value={filtros.categoria}
                            onChange={(e) => setFiltros({ ...filtros, categoria: e.target.value })}
                            className="w-full min-w-0 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 font-bold text-sm outline-none"
                        >
                            <option value="Todas">Cat: Todas</option>
                            {Object.keys(configCategorias).map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </Reveal>

            <div className="flex flex-col gap-6 sm:gap-8 mt-2 sm:mt-4">
                {isGlobalLoading ? (
                    <div className="text-center py-10 opacity-50 font-bold animate-pulse">
                        Sincronizando agenda...
                    </div>
                ) : agendaAgrupada.datasOrdenadas.length > 0 ? (
                    agendaAgrupada.datasOrdenadas.map((dataISO, index) => (
                        <Reveal key={dataISO} direction="up" delay={index * 50}>
                            <div
                                onDragOver={(e) => handleDragOver(e, dataISO)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, dataISO)}
                                className={`relative w-full max-w-full min-w-0 rounded-2xl transition-all border px-0 py-2 sm:py-3 sm:px-1 ${
                                    dragOverDate === dataISO
                                        ? 'border-dashed border-indigo-400 bg-indigo-50/70 dark:bg-indigo-900/10'
                                        : 'border-transparent'
                                }`}
                            >
                                <div className="mb-3 sm:mb-5 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 px-0 min-w-0 max-w-full">
                                    <div className="min-w-0 flex-1 flex gap-2 sm:gap-3">
                                        <span className="mt-1 shrink-0 bg-indigo-600 w-1.5 sm:w-2 h-6 sm:h-8 rounded-full inline-block" />
                                        <div className="min-w-0">
                                            <h3 className="text-lg sm:text-xl md:text-2xl font-black text-gray-900 dark:text-white capitalize leading-tight break-words">
                                                {formatarRotuloDiaTimeline(dataISO)}
                                            </h3>
                                            <p className="mt-0.5 text-sm sm:text-base font-bold text-gray-500 dark:text-gray-400 tracking-tight">
                                                {formatarDMAComAno(dataISO)}
                                            </p>
                                        </div>
                                    </div>

                                    {dataISO < hojeStr &&
                                        agendaAgrupada.grupos[dataISO].some((e) => !e.concluido) && (
                                            <span className="self-start sm:self-auto text-[10px] sm:text-xs bg-red-100 text-red-600 border border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800/40 px-2 py-1 rounded-md">
                                                Possui Atrasos
                                            </span>
                                        )}
                                </div>

                                <div className="relative flex flex-col gap-4 sm:gap-4 max-w-full min-w-0 pl-3 sm:pl-5 before:absolute before:left-2 sm:before:left-3 before:top-0 before:bottom-2 before:w-px before:bg-gray-200 dark:before:bg-gray-700">
                                    {agendaAgrupada.grupos[dataISO].map((item) => (
                                        <AgendaItem
                                            key={item.id}
                                            item={item}
                                            hojeStr={hojeStr}
                                            isLoading={actionLoading[item.id]}
                                            onToggle={toggleStatus}
                                            onEdit={abrirModalEdit}
                                            onDelete={removerEvento}
                                            onView={setVisualizando}
                                            podeEditar={podeEditar}
                                        />
                                    ))}
                                </div>
                            </div>
                        </Reveal>
                    ))
                ) : (
                    <div className="text-center py-16 sm:py-20 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col items-center px-4">
                        <span className="text-5xl sm:text-6xl mb-4">🙌</span>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                            Tudo limpo por aqui!
                        </h3>
                        <p className="text-sm sm:text-base text-gray-500 mb-6">
                            Nenhum evento encontrado para os filtros atuais.
                        </p>
                        {podeEditar && (
                        <button
                            onClick={abrirModalNovo}
                            className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300 font-bold py-2.5 px-6 rounded-xl hover:bg-indigo-200 dark:hover:bg-indigo-900/30"
                        >
                            Criar Novo Evento
                        </button>
                        )}
                    </div>
                )}
            </div>

            {podeEditar && (
            <button
                onClick={abrirModalNovo}
                className="md:hidden fixed bottom-5 right-4 z-40 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg rounded-full w-14 h-14 text-2xl font-bold flex items-center justify-center active:scale-95"
                aria-label="Novo evento"
            >
                +
            </button>
            )}

            {visualizando && (
                <ModalVisualizarTarefa
                    item={visualizando}
                    hojeStr={hojeStr}
                    podeEditar={podeEditar}
                    onClose={() => setVisualizando(null)}
                    onEdit={(ev) => {
                        setVisualizando(null)
                        abrirModalEdit(ev)
                    }}
                />
            )}

            {modal.aberto && (
                <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-gray-900/70 backdrop-blur-sm">
                    <Reveal direction="up" className="w-full max-w-lg">
                        <div className="bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto">
                            <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
                                <h3 className="font-extrabold text-lg sm:text-xl text-gray-900 dark:text-gray-100">
                                    {modal.editandoId ? 'Editar Evento' : 'Agendar Compromisso'}
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setModal({ aberto: false, editandoId: null })}
                                    className="text-gray-400 hover:text-red-500 font-bold"
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleSalvar} className="p-4 sm:p-6 flex flex-col gap-4 sm:gap-5">
                                <div>
                                    <div className="flex justify-between items-end gap-2 mb-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase block">
                                            Título *
                                        </label>
                                        <span className="text-[11px] text-gray-400 font-mono shrink-0 tabular-nums">
                                            {form.titulo.length}/{MAX_TITULO}
                                        </span>
                                    </div>
                                    <input
                                        required
                                        autoFocus
                                        type="text"
                                        maxLength={MAX_TITULO}
                                        value={form.titulo}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                titulo: e.target.value.slice(0, MAX_TITULO),
                                            })
                                        }
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 outline-none focus:border-indigo-500 font-bold text-base sm:text-lg min-w-0"
                                        placeholder="O que você precisa fazer?"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">
                                            Categoria *
                                        </label>
                                        <select
                                            value={form.categoria}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    categoria: e.target.value as CategoriaAgenda,
                                                })
                                            }
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 font-bold"
                                        >
                                            {Object.keys(configCategorias).map((c) => (
                                                <option key={c} value={c}>
                                                    {c}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">
                                            Prioridade *
                                        </label>
                                        <select
                                            value={form.prioridade}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    prioridade: e.target.value as PrioridadeAgenda,
                                                })
                                            }
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 font-bold"
                                        >
                                            {Object.keys(configPrioridades).map((p) => (
                                                <option key={p} value={p}>
                                                    {p}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">
                                            Data *
                                        </label>
                                        <input
                                            required
                                            type="date"
                                            value={form.data}
                                            onChange={(e) => setForm({ ...form, data: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">
                                            Horário *
                                        </label>
                                        <input
                                            required
                                            type="time"
                                            value={form.horario}
                                            onChange={(e) => setForm({ ...form, horario: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between items-end gap-2 mb-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase block">
                                            Detalhes
                                        </label>
                                        <span className="text-[11px] text-gray-400 font-mono shrink-0 tabular-nums">
                                            {form.descricao.length}/{MAX_DESCRICAO}
                                        </span>
                                    </div>
                                    <textarea
                                        rows={3}
                                        maxLength={MAX_DESCRICAO}
                                        value={form.descricao}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                descricao: e.target.value.slice(0, MAX_DESCRICAO),
                                            })
                                        }
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 resize-none min-w-0 break-words"
                                        placeholder="Observações opcionais..."
                                    />
                                </div>

                                <div className="mt-2 flex flex-col-reverse sm:flex-row justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setModal({ aberto: false, editandoId: null })}
                                        className="w-full sm:w-auto text-gray-600 dark:text-gray-300 font-bold py-3 px-6 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl shadow-md transition-transform active:scale-95"
                                    >
                                        Salvar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </Reveal>
                </div>
            )}
        </div>
    )
}