// src/views/pace/Calendario/index.tsx
// Calendário institucional — grade mensal (desktop) + mini-calendário com agenda (mobile).

import React, { useMemo, useState } from 'react'
import { useAuth } from '@/auth'
import Reveal from '@/components/ui/Reveal'
import MobileCalendario from './MobileCalendario'
import {
    PUBLICO_ALVO_OPCOES,
    usuarioVeConteudoPorPublicoAlvo,
    rotuloBadgePublico,
    FILTRO_PUBLICO_TODOS,
    type PublicoAlvo,
    type FiltroPublicoAlvoCabecalho,
} from '@/constants/publicoAlvo'
import { isPerfilGestao } from '@/constants/roles.constant'

export type CategoriaInstitucional = 'Provas' | 'Feriados' | 'Eventos'

export interface EventoCalendario {
    id: number
    titulo: string
    descricao: string
    data: string // YYYY-MM-DD
    categoria: CategoriaInstitucional
    publicoAlvo: PublicoAlvo
}

const MAX_TITULO = 140
const MAX_DESCRICAO = 1000
const MAX_TERMO_BUSCA = 120

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'] as const
const MAX_EVENTOS_POR_CELULA = 3

/** Mock local — substituir por serviço/API quando disponível */
let MOCK_CALENDARIO: EventoCalendario[] = [
    {
        id: 1,
        titulo: 'Prova única — Matemática aplicada',
        descricao: 'Sala multimídia Bloco B. Comparecer com documento oficial com foto.',
        data: '2026-06-05',
        categoria: 'Provas',
        publicoAlvo: '9º Ano A',
    },
    {
        id: 2,
        titulo: 'Feriado municipal',
        descricao: 'Sem aulas nem expediente pedagógico.',
        data: '2026-06-09',
        categoria: 'Feriados',
        publicoAlvo: 'Colégio Todo',
    },
    {
        id: 3,
        titulo: 'Semana Cultural',
        descricao: 'Palestras, mostra de trabalhos e gincana inter-classes no pátio.',
        data: '2026-06-17',
        categoria: 'Eventos',
        publicoAlvo: 'Colégio Todo',
    },
    {
        id: 4,
        titulo: 'Planejamento pedagógico — Junho',
        descricao: 'Encontro exclusivo do corpo docente na sala dos professores.',
        data: '2026-06-12',
        categoria: 'Eventos',
        publicoAlvo: 'Professores',
    },
    {
        id: 5,
        titulo: 'Entrega de trabalho — História',
        descricao: 'Apenas turma específica; entrega na secretaria até 17h.',
        data: '2026-06-20',
        categoria: 'Provas',
        publicoAlvo: '3º Ano B',
    },
]

const configCategoria: Record<CategoriaInstitucional, { cor: string; icone: string }> = {
    Provas: {
        icone: '📝',
        cor: 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-200 dark:border-rose-800/50',
    },
    Feriados: {
        icone: '🎉',
        cor: 'bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/35 dark:text-emerald-100 dark:border-emerald-800/40',
    },
    Eventos: {
        icone: '🎯',
        cor: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-200 dark:border-blue-800/45',
    },
}

/** Chips na grade desktop e dots no mini-calendário mobile */
const corChipEvento: Record<CategoriaInstitucional, string> = {
    Provas: 'bg-red-500 text-white',
    Feriados: 'bg-emerald-500 text-white',
    Eventos: 'bg-blue-500 text-white',
}

const corDotEvento: Record<CategoriaInstitucional, string> = {
    Provas: 'bg-red-500',
    Feriados: 'bg-emerald-500',
    Eventos: 'bg-blue-500',
}

/** Garante 7 colunas mesmo se utilitário Tailwind falhar em algum contexto */
const GRID_7_COLUNAS = {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
} as const

const todasCategorias: CategoriaInstitucional[] = ['Provas', 'Feriados', 'Eventos']

const pad2 = (n: number) => String(n).padStart(2, '0')
const isoHojeLocal = () => {
    const d = new Date()
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

const formatarDataPt = (dataISO: string) =>
    dataISO.includes('-')
        ? new Date(`${dataISO}T12:00:00`).toLocaleDateString('pt-BR', {
              weekday: 'short',
              day: '2-digit',
              month: 'short',
              year: 'numeric',
          })
        : dataISO

const formatarMesAnoPt = (ano: number, mes: number) =>
    new Date(ano, mes, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

type CelulaCalendario = { dia: number | null; iso: string | null }

function montarGradeMes(ano: number, mes: number): CelulaCalendario[] {
    const primeiroDia = new Date(ano, mes, 1).getDay()
    const diasNoMes = new Date(ano, mes + 1, 0).getDate()
    const celulas: CelulaCalendario[] = []

    for (let i = 0; i < primeiroDia; i++) {
        celulas.push({ dia: null, iso: null })
    }
    for (let d = 1; d <= diasNoMes; d++) {
        celulas.push({
            dia: d,
            iso: `${ano}-${pad2(mes + 1)}-${pad2(d)}`,
        })
    }

    const resto = celulas.length % 7
    if (resto !== 0) {
        for (let i = 0; i < 7 - resto; i++) {
            celulas.push({ dia: null, iso: null })
        }
    }

    return celulas
}

export default function CalendarioInstitucional() {
    const { user } = useAuth()
    const isGestao = isPerfilGestao(user?.authority)

    const hoje = useMemo(() => new Date(), [])
    const [mesVisivel, setMesVisivel] = useState(() => ({
        ano: hoje.getFullYear(),
        mes: hoje.getMonth(),
    }))

    const [itens, setItens] = useState<EventoCalendario[]>(() => [...MOCK_CALENDARIO])
    const [filtroCat, setFiltroCat] = useState<'todas' | CategoriaInstitucional>('todas')
    const [filtroPublicoCabecalho, setFiltroPublicoCabecalho] =
        useState<FiltroPublicoAlvoCabecalho>(FILTRO_PUBLICO_TODOS)
    const [termoBusca, setTermoBusca] = useState('')
    const [modalPub, setModalPub] = useState(false)
    const [visualizando, setVisualizando] = useState<EventoCalendario | null>(null)
    const [diaSelecionadoMobile, setDiaSelecionadoMobile] = useState<string | null>(null)
    const [form, setForm] = useState({
        titulo: '',
        descricao: '',
        data: isoHojeLocal(),
        categoria: 'Eventos' as CategoriaInstitucional,
        publicoAlvo: 'Colégio Todo' as PublicoAlvo,
    })

    const filtrados = useMemo(() => {
        let list = itens.filter((i) => usuarioVeConteudoPorPublicoAlvo(user, i.publicoAlvo))
        if (filtroCat !== 'todas') list = list.filter((i) => i.categoria === filtroCat)
        if (filtroPublicoCabecalho !== FILTRO_PUBLICO_TODOS) {
            list = list.filter((i) => i.publicoAlvo === filtroPublicoCabecalho)
        }
        const q = termoBusca.trim().toLowerCase()
        if (q) {
            list = list.filter(
                (i) =>
                    i.titulo.toLowerCase().includes(q) || i.descricao.toLowerCase().includes(q),
            )
        }
        return [...list].sort((a, b) => a.data.localeCompare(b.data) || a.titulo.localeCompare(b.titulo))
    }, [itens, filtroCat, filtroPublicoCabecalho, termoBusca, user])

    const eventosPorData = useMemo(() => {
        const mapa = new Map<string, EventoCalendario[]>()
        for (const ev of filtrados) {
            const lista = mapa.get(ev.data) ?? []
            lista.push(ev)
            mapa.set(ev.data, lista)
        }
        return mapa
    }, [filtrados])

    const celulasGrade = useMemo(
        () => montarGradeMes(mesVisivel.ano, mesVisivel.mes),
        [mesVisivel.ano, mesVisivel.mes],
    )

    const labelMesAno = formatarMesAnoPt(mesVisivel.ano, mesVisivel.mes)
    const hojeIso = isoHojeLocal()

    const mesAnterior = () => {
        setDiaSelecionadoMobile(null)
        setMesVisivel((prev) => {
            if (prev.mes === 0) return { ano: prev.ano - 1, mes: 11 }
            return { ...prev, mes: prev.mes - 1 }
        })
    }

    const mesProximo = () => {
        setDiaSelecionadoMobile(null)
        setMesVisivel((prev) => {
            if (prev.mes === 11) return { ano: prev.ano + 1, mes: 0 }
            return { ...prev, mes: prev.mes + 1 }
        })
    }

    const publicar = (e: React.FormEvent) => {
        e.preventDefault()
        const t = form.titulo.trim()
        const d = form.descricao.trim()
        if (!t || !d) {
            alert('Preencha título e descrição.')
            return
        }
        const novo: EventoCalendario = {
            id: Math.max(0, ...itens.map((x) => x.id)) + 1,
            titulo: t,
            descricao: d,
            data: form.data,
            categoria: form.categoria,
            publicoAlvo: form.publicoAlvo,
        }
        MOCK_CALENDARIO = [novo, ...MOCK_CALENDARIO]
        setItens((prev) => [novo, ...prev])
        setModalPub(false)
        setForm({
            titulo: '',
            descricao: '',
            data: isoHojeLocal(),
            categoria: form.categoria,
            publicoAlvo: 'Colégio Todo',
        })
    }

    const listaVazia = filtrados.length === 0

    return (
        <div className="flex flex-col gap-5 sm:gap-7 w-full max-w-5xl min-w-0 mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 overflow-x-hidden">
            <Reveal direction="down">
                <header className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 sm:p-5 md:p-6 shadow-sm w-full max-w-full min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="min-w-0">
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-50 leading-tight break-words">
                                Calendário Institucional
                            </h1>
                            <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-snug break-words">
                                Marcos de provas, feriados e eventos da instituição. Apenas gestores cadastram
                                novidades; demais perfis apenas consultam.
                            </p>
                        </div>
                        {isGestao && (
                            <button
                                type="button"
                                onClick={() => setModalPub(true)}
                                className="shrink-0 w-full sm:w-auto min-h-11 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md transition active:scale-[0.98] touch-manipulation"
                            >
                                + Publicar no calendário
                            </button>
                        )}
                    </div>

                    <div className="mt-5 flex flex-col gap-3 w-full min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-stretch gap-3 w-full min-w-0">
                            <div className="relative flex-1 min-w-0">
                                <span
                                    aria-hidden
                                    className="absolute inset-y-0 left-0 flex w-10 items-center justify-center text-gray-400 pointer-events-none text-sm"
                                >
                                    🔍
                                </span>
                                <input
                                    type="search"
                                    placeholder="Buscar por título ou descrição..."
                                    maxLength={MAX_TERMO_BUSCA}
                                    value={termoBusca}
                                    onChange={(e) =>
                                        setTermoBusca(e.target.value.slice(0, MAX_TERMO_BUSCA))
                                    }
                                    className="w-full min-h-11 min-w-0 box-border pl-10 pr-3 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-[16px] sm:text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                            <select
                                value={filtroPublicoCabecalho}
                                onChange={(e) =>
                                    setFiltroPublicoCabecalho(e.target.value as FiltroPublicoAlvoCabecalho)
                                }
                                aria-label="Filtrar por público-alvo"
                                className="w-full sm:w-[min(100%,14rem)] sm:shrink-0 min-h-11 min-w-0 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-bold text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                <option value={FILTRO_PUBLICO_TODOS}>Todos os públicos</option>
                                {PUBLICO_ALVO_OPCOES.map((op) => (
                                    <option key={op} value={op}>
                                        Público: {op}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center w-full max-w-full min-w-0">
                        <span className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 shrink-0">
                            Categoria:
                        </span>
                        <div className="flex flex-wrap gap-2 w-full sm:flex-1 min-w-0">
                            <button
                                type="button"
                                onClick={() => setFiltroCat('todas')}
                                className={`min-h-10 px-4 rounded-xl border text-sm font-bold transition touch-manipulation ${
                                    filtroCat === 'todas'
                                        ? 'border-indigo-500 bg-indigo-600 text-white'
                                        : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-200'
                                }`}
                            >
                                Todas
                            </button>
                            {todasCategorias.map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setFiltroCat(c)}
                                    className={`min-h-10 px-4 rounded-xl border text-sm font-bold transition touch-manipulation break-words ${
                                        filtroCat === c
                                            ? `${configCategoria[c].cor} ring-2 ring-indigo-500/40`
                                            : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100'
                                    }`}
                                >
                                    {configCategoria[c].icone} {c}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Legenda — visível apenas no desktop */}
                    <div className="hidden md:flex mt-4 flex-wrap gap-3 text-xs font-semibold text-gray-600 dark:text-gray-400">
                        <span className="inline-flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-sm bg-red-500" aria-hidden />
                            Provas
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-sm bg-blue-500" aria-hidden />
                            Eventos
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-sm bg-emerald-500" aria-hidden />
                            Feriados
                        </span>
                    </div>
                </header>
            </Reveal>

            {/* Desktop: grade clássica 7 colunas (sem Reveal — evita quebrar CSS Grid) */}
            <section
                aria-label="Calendário mensal"
                className="hidden md:block w-full min-w-0 max-w-full"
            >
                <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden w-full">
                    <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={mesAnterior}
                            className="min-h-10 px-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-sm font-bold text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                        >
                            &lt; Anterior
                        </button>
                        <h2 className="text-lg font-extrabold text-gray-900 dark:text-gray-50 capitalize text-center flex-1 min-w-[10rem]">
                            {labelMesAno}
                        </h2>
                        <button
                            type="button"
                            onClick={mesProximo}
                            className="min-h-10 px-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-sm font-bold text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                        >
                            Próximo &gt;
                        </button>
                    </div>

                    <div
                        className="w-full min-w-0 grid grid-cols-7"
                        style={GRID_7_COLUNAS}
                        role="grid"
                        aria-label={labelMesAno}
                    >
                        {DIAS_SEMANA.map((dia) => (
                            <div
                                key={`hdr-${dia}`}
                                role="columnheader"
                                className="py-2.5 text-center text-xs font-black uppercase tracking-wide text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/60 border-b border-r border-gray-200 dark:border-gray-700 min-w-0"
                            >
                                {dia}
                            </div>
                        ))}

                        {celulasGrade.map((celula, idx) => {
                            const eventosNoDia = celula.iso
                                ? (eventosPorData.get(celula.iso) ?? [])
                                : []
                            const ehHoje = celula.iso === hojeIso
                            const extras =
                                eventosNoDia.length > MAX_EVENTOS_POR_CELULA
                                    ? eventosNoDia.length - MAX_EVENTOS_POR_CELULA
                                    : 0
                            const visiveis = eventosNoDia.slice(0, MAX_EVENTOS_POR_CELULA)

                            return (
                                <div
                                    key={`${celula.iso ?? 'vazio'}-${idx}`}
                                    role="gridcell"
                                    className={`min-h-[120px] min-w-0 border-b border-r border-gray-200 dark:border-gray-700 p-1.5 flex flex-col ${
                                        celula.dia == null
                                            ? 'bg-gray-50/70 dark:bg-gray-900/40'
                                            : 'bg-white dark:bg-gray-800'
                                    } ${ehHoje ? 'ring-2 ring-inset ring-indigo-500/60 z-[1]' : ''}`}
                                >
                                    {celula.dia != null && (
                                        <>
                                            <span
                                                className={`self-end text-sm font-bold leading-none mb-1 px-1.5 py-0.5 rounded-md ${
                                                    ehHoje
                                                        ? 'bg-indigo-600 text-white'
                                                        : 'text-gray-800 dark:text-gray-100'
                                                }`}
                                            >
                                                {celula.dia}
                                            </span>
                                            <div className="flex flex-col gap-0.5 flex-1 min-h-0 overflow-hidden">
                                                {visiveis.map((ev) => (
                                                    <button
                                                        key={ev.id}
                                                        type="button"
                                                        title={ev.titulo}
                                                        onClick={() => setVisualizando(ev)}
                                                        className={`w-full min-w-0 text-left text-[10px] leading-tight font-semibold px-1.5 py-0.5 rounded truncate ${corChipEvento[ev.categoria]} hover:opacity-90 transition`}
                                                    >
                                                        {ev.titulo}
                                                    </button>
                                                ))}
                                                {extras > 0 && (
                                                    <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 px-0.5">
                                                        +{extras}
                                                    </span>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )
                        })}
                    </div>

                    {listaVazia && (
                        <p className="px-5 py-3 text-sm text-center text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
                            Nenhum evento com os filtros atuais neste período.
                        </p>
                    )}
                </div>
            </section>

            <MobileCalendario
                labelMesAno={labelMesAno}
                celulasGrade={celulasGrade}
                eventosPorData={eventosPorData}
                hojeIso={hojeIso}
                diaSelecionado={diaSelecionadoMobile}
                listaVazia={listaVazia}
                corDotEvento={corDotEvento}
                configCategoria={configCategoria}
                formatarDataPt={formatarDataPt}
                onMesAnterior={mesAnterior}
                onMesProximo={mesProximo}
                onSelecionarDia={setDiaSelecionadoMobile}
                onVerEvento={setVisualizando}
            />

            {visualizando && (
                <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center p-0 sm:p-4 bg-black/55 backdrop-blur-sm overflow-x-hidden">
                    <div
                        role="dialog"
                        aria-labelledby="titulo-cal-modal"
                        className="bg-white dark:bg-gray-900 w-full max-w-lg sm:rounded-3xl rounded-t-3xl border border-gray-200 dark:border-gray-700 shadow-2xl max-h-[92dvh] overflow-y-auto min-w-0"
                    >
                        <div className="flex justify-between items-start gap-2 p-4 border-b dark:border-gray-800 flex-wrap">
                            <div className="flex flex-wrap items-center gap-2 min-w-0 max-w-[85%]">
                                <span
                                    className={`text-[11px] font-black uppercase px-3 py-1 rounded-full border break-words max-w-full ${configCategoria[visualizando.categoria].cor}`}
                                >
                                    {configCategoria[visualizando.categoria].icone}{' '}
                                    {visualizando.categoria}
                                </span>
                                <span className="text-[10px] sm:text-[11px] font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full border border-gray-200 dark:border-gray-600 break-words max-w-full">
                                    {rotuloBadgePublico(visualizando.publicoAlvo)}
                                </span>
                            </div>
                            <button
                                type="button"
                                aria-label="Fechar"
                                onClick={() => setVisualizando(null)}
                                className="min-h-10 min-w-10 shrink-0 rounded-xl border border-transparent hover:bg-gray-100 dark:hover:bg-gray-800 font-bold text-gray-500"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-5 sm:p-6 min-w-0 overflow-hidden">
                            <p className="text-sm font-semibold text-gray-500 mb-3 break-all">
                                {formatarDataPt(visualizando.data)}
                            </p>
                            <h3
                                id="titulo-cal-modal"
                                className="text-xl font-extrabold text-gray-900 dark:text-gray-50 mb-4 break-words hyphens-auto"
                            >
                                {visualizando.titulo}
                            </h3>
                            <p className="text-[15px] leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                                {visualizando.descricao}
                            </p>
                        </div>
                        <div className="p-4 border-t dark:border-gray-800 pb-[max(env(safe-area-inset-bottom),1rem)]">
                            <button
                                type="button"
                                className="w-full min-h-11 rounded-xl bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 font-bold"
                                onClick={() => setVisualizando(null)}
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {modalPub && (
                <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/55 backdrop-blur-sm">
                    <form
                        onSubmit={publicar}
                        className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-t-3xl sm:rounded-3xl border border-gray-200 dark:border-gray-700 shadow-2xl max-h-[92dvh] overflow-y-auto flex flex-col min-w-0"
                    >
                        <div className="p-5 border-b dark:border-gray-800 flex justify-between items-center gap-2">
                            <h2 className="font-bold text-lg">Nova publicação</h2>
                            <button
                                type="button"
                                className="min-h-10 min-w-10 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
                                onClick={() => {
                                    setModalPub(false)
                                    setForm({
                                        titulo: '',
                                        descricao: '',
                                        data: isoHojeLocal(),
                                        categoria: form.categoria,
                                        publicoAlvo: 'Colégio Todo',
                                    })
                                }}
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-5 flex flex-col gap-4 overflow-x-hidden">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2">Título *</label>
                                <input
                                    required
                                    maxLength={MAX_TITULO}
                                    value={form.titulo}
                                    onChange={(e) =>
                                        setForm({ ...form, titulo: e.target.value.slice(0, MAX_TITULO) })
                                    }
                                    className="w-full min-h-11 min-w-0 px-4 py-3 rounded-xl border dark:border-gray-700 dark:bg-gray-800 text-[16px]"
                                />
                                <p
                                    className={`text-xs font-mono mt-1 text-right tabular-nums ${form.titulo.length >= MAX_TITULO ? 'text-red-500 font-bold' : 'text-gray-400'}`}
                                >
                                    {form.titulo.length}/{MAX_TITULO}
                                </p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-2">Data *</label>
                                    <input
                                        type="date"
                                        required
                                        value={form.data}
                                        onChange={(e) => setForm({ ...form, data: e.target.value })}
                                        className="w-full min-h-11 min-w-0 px-4 py-3 rounded-xl border dark:border-gray-700 dark:bg-gray-800"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-2">Categoria *</label>
                                    <select
                                        value={form.categoria}
                                        onChange={(e) =>
                                            setForm({ ...form, categoria: e.target.value as CategoriaInstitucional })
                                        }
                                        className="w-full min-h-11 min-w-0 px-4 py-3 rounded-xl border dark:border-gray-700 dark:bg-gray-800 font-bold"
                                    >
                                        <option value="Provas">Provas</option>
                                        <option value="Feriados">Feriados</option>
                                        <option value="Eventos">Eventos</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2">Público-Alvo *</label>
                                <select
                                    value={form.publicoAlvo}
                                    onChange={(e) =>
                                        setForm({ ...form, publicoAlvo: e.target.value as PublicoAlvo })
                                    }
                                    className="w-full min-h-11 min-w-0 px-4 py-3 rounded-xl border dark:border-gray-700 dark:bg-gray-800 font-bold"
                                >
                                    {PUBLICO_ALVO_OPCOES.map((op) => (
                                        <option key={op} value={op}>
                                            {op}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2">Descrição *</label>
                                <textarea
                                    required
                                    rows={5}
                                    maxLength={MAX_DESCRICAO}
                                    value={form.descricao}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            descricao: e.target.value.slice(0, MAX_DESCRICAO),
                                        })
                                    }
                                    className="w-full min-w-0 px-4 py-3 rounded-xl border dark:border-gray-700 dark:bg-gray-800 resize-none text-[16px] break-words"
                                />
                                <p
                                    className={`text-xs font-mono mt-1 text-right tabular-nums ${form.descricao.length >= MAX_DESCRICAO ? 'text-red-500 font-bold' : 'text-gray-400'}`}
                                >
                                    {form.descricao.length}/{MAX_DESCRICAO}
                                </p>
                            </div>
                        </div>
                        <div className="p-4 border-t dark:border-gray-800 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
                            <button
                                type="button"
                                className="w-full sm:w-auto min-h-11 px-6 rounded-xl border font-bold dark:border-gray-600"
                                onClick={() => {
                                    setModalPub(false)
                                    setForm({
                                        titulo: '',
                                        descricao: '',
                                        data: isoHojeLocal(),
                                        categoria: form.categoria,
                                        publicoAlvo: 'Colégio Todo',
                                    })
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="w-full sm:w-auto min-h-11 px-8 rounded-xl bg-indigo-600 text-white font-bold"
                            >
                                Publicar
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    )
}
