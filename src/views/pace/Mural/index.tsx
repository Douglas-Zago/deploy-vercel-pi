// src/views/pace/Mural/index.tsx

import React, { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/auth' // <-- Mudança aqui: Usando o gancho oficial do seu template
import Reveal from '@/components/ui/Reveal'
import { ComunicadosService, Comunicado } from '@/services/ComunicadosService'
import {
    PUBLICO_ALVO_OPCOES,
    usuarioVeConteudoPorPublicoAlvo,
    rotuloBadgePublico,
    FILTRO_PUBLICO_TODOS,
    type PublicoAlvo,
    type FiltroPublicoAlvoCabecalho,
} from '@/constants/publicoAlvo'
import { isPerfilGestao } from '@/constants/roles.constant'

// --- CONSTANTES DE LIMITES (Padrão Profissional) ---
const MAX_TITULO = 140
const MAX_AUTOR = 100
const MAX_CONTEUDO = 1000
const MAX_TERMO_BUSCA = 120

const parseDataComunicadoMs = (dataStr: string): number => {
    const parsed = Date.parse(dataStr)
    if (!Number.isNaN(parsed)) return parsed
    const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(dataStr.trim())
    if (m) return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1])).getTime()
    return 0
}

const formatarDataHoraPublicacao = (dataStr: string): string => {
    const ms = parseDataComunicadoMs(dataStr)
    if (!ms) return dataStr
    return new Date(ms).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    })
}

const Mural = () => {
    // Pegando o usuário logado de forma segura sem quebrar o Contexto
    const { user } = useAuth()
    // O array de authorities pode vir opcional, então usamos a interrogação (?) para evitar quebras
    const isGestao = isPerfilGestao(user?.authority)

    // --- ESTADOS DO COMPONENTE ---
    const [comunicados, setComunicados] = useState<Comunicado[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [termoBusca, setTermoBusca] = useState('')
    const [filtroPublicoCabecalho, setFiltroPublicoCabecalho] =
        useState<FiltroPublicoAlvoCabecalho>(FILTRO_PUBLICO_TODOS)
    
    // Estados dos Modais
    const [comunicadoSelecionado, setComunicadoSelecionado] = useState<Comunicado | null>(null)
    const [isCriando, setIsCriando] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [erroFormulario, setErroFormulario] = useState('')
    const [novoAviso, setNovoAviso] = useState({
        titulo: '',
        autor: 'Direção Acadêmica',
        conteudo: '',
        publicoAlvo: 'Colégio Todo' as PublicoAlvo,
    })

    // --- CONSUMINDO A API / MOCK ---
    const fetchComunicados = async () => {
        try {
            setIsLoading(true)
            const comunicadosData = await ComunicadosService.getAll()
            setComunicados(comunicadosData)
        } catch (error) {
            console.error("Erro ao buscar comunicados:", error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchComunicados()
    }, [])

    // --- FUNÇÃO DE CRIAÇÃO ---
    const handleCriarComunicado = async (e: React.FormEvent) => {
        e.preventDefault()
        setErroFormulario('')

        const tituloTrim = novoAviso.titulo.trim()
        const conteudoTrim = novoAviso.conteudo.trim()
        const autorTrim = novoAviso.autor.trim()

        if (!tituloTrim || !conteudoTrim) {
            setErroFormulario('O título e a mensagem não podem ficar vazios ou conter apenas espaços em branco.')
            return
        }
        if (!autorTrim) {
            setErroFormulario('O autor não pode ficar vazio ou conter apenas espaços em branco.')
            return
        }

        try {
            setIsSubmitting(true)

            await ComunicadosService.create({
                titulo: tituloTrim,
                conteudo: conteudoTrim,
                autor: autorTrim,
                dataPublicacao: new Date().toISOString(),
                publicoAlvo: novoAviso.publicoAlvo,
            })

            await fetchComunicados()

            setIsCriando(false)
            setErroFormulario('')
            resetFormularioNovoComunicado()

        } catch (error) {
            console.error("Erro ao criar aviso:", error)
            alert("Erro ao criar o comunicado. Tente novamente.")
        } finally {
            setIsSubmitting(false)
        }
    }

    const resetFormularioNovoComunicado = () => {
        setNovoAviso({
            titulo: '',
            autor: 'Direção Acadêmica',
            conteudo: '',
            publicoAlvo: 'Colégio Todo',
        })
    }

    const isFormValido =
        novoAviso.titulo.trim().length > 0 &&
        novoAviso.autor.trim().length > 0 &&
        novoAviso.conteudo.trim().length > 0

    // --- LÓGICA DE FILTRAGEM ---
    const comunicadosFiltrados = useMemo(() => {
        const filtrados = comunicados.filter((aviso) => {
            if (!usuarioVeConteudoPorPublicoAlvo(user, aviso.publicoAlvo)) return false
            const conteudo = aviso.conteudo ?? ''
            const matchBusca =
                aviso.titulo.toLowerCase().includes(termoBusca.toLowerCase()) ||
                conteudo.toLowerCase().includes(termoBusca.toLowerCase())
            const matchPublicoCabecalho =
                filtroPublicoCabecalho === FILTRO_PUBLICO_TODOS ||
                aviso.publicoAlvo === filtroPublicoCabecalho

            return matchBusca && matchPublicoCabecalho
        })
        return [...filtrados].sort(
            (a, b) =>
                parseDataComunicadoMs(b.dataPublicacao) - parseDataComunicadoMs(a.dataPublicacao),
        )
    }, [termoBusca, filtroPublicoCabecalho, comunicados, user])

    return (
        <div className="flex flex-col gap-5 sm:gap-8 w-full max-w-6xl min-w-0 mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 overflow-x-hidden pb-[max(env(safe-area-inset-bottom,0px),1rem)]">
            
            {/* --- CABEÇALHO, BUSCA E FILTROS (mobile-first) --- */}
            <Reveal direction="down">   
                <div className="flex flex-col gap-5 md:gap-6 bg-white dark:bg-gray-800 p-4 sm:p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 w-full max-w-full min-w-0">
                    <div className="min-w-0 max-w-full">
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-100 leading-tight break-words hyphens-auto">
                            Mural de Avisos
                        </h2>
                        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1.5 leading-snug max-w-[65ch] break-words">
                            Fique por dentro dos avisos oficiais da instituição.
                        </p>
                    </div>

                    {/* Mobile: empilha; desktop (lg+): busca ocupa espaço livre · filtros alinhados sem estourar a largura */}
                    <div className="flex flex-col lg:flex-row lg:flex-nowrap lg:items-end gap-3 lg:gap-4 w-full min-w-0">
                        <div className="relative w-full lg:flex-1 lg:min-w-0 min-w-0">
                            <span
                                aria-hidden
                                className="absolute inset-y-0 left-0 flex w-11 min-w-[2.75rem] items-center justify-center text-gray-400 pointer-events-none text-base"
                            >
                                🔍
                            </span>
                            <input 
                                type="text" 
                                placeholder="Buscar por título ou palavra-chave..." 
                                maxLength={MAX_TERMO_BUSCA}
                                value={termoBusca}
                                onChange={(e) => setTermoBusca(e.target.value.slice(0, MAX_TERMO_BUSCA))}
                                className="w-full min-h-11 box-border pl-11 pr-3 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-[16px] sm:text-base placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none shadow-inner transition-all"
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 w-full lg:w-auto lg:shrink-0 lg:items-stretch lg:justify-end lg:gap-3 min-w-0 max-w-full">
                            <select
                                value={filtroPublicoCabecalho}
                                onChange={(e) =>
                                    setFiltroPublicoCabecalho(e.target.value as FiltroPublicoAlvoCabecalho)
                                }
                                aria-label="Filtrar por público-alvo"
                                className="w-full sm:flex-1 sm:min-w-[11rem] lg:w-52 xl:w-56 min-h-11 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none text-base touch-manipulation min-w-0"
                            >
                                <option value={FILTRO_PUBLICO_TODOS}>Todos os públicos</option>
                                {PUBLICO_ALVO_OPCOES.map((op) => (
                                    <option key={op} value={op}>
                                        Público: {op}
                                    </option>
                                ))}
                            </select>

                            {isGestao && (
                                <button 
                                    type="button"
                                    onClick={() => {
                                        setIsCriando(true)
                                        setErroFormulario('')
                                    }}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold min-h-11 px-5 py-3 rounded-xl transition-transform active:scale-[0.98] shadow-md inline-flex items-center justify-center gap-2 w-full sm:w-auto lg:w-auto shrink-0 whitespace-normal sm:whitespace-nowrap text-base touch-manipulation"
                                >
                                    <span aria-hidden className="text-xl leading-none">+</span>
                                    Novo comunicado
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </Reveal>

            {/* --- LISTA DE COMUNICADOS --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 w-full min-w-0 max-w-full">
                {isLoading ? (
                    [1, 2, 3, 4, 5, 6].slice(0, 6).map((i) => (
                        <div key={i} className="min-w-0 overflow-hidden bg-white dark:bg-gray-800 rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col gap-4 animate-pulse">
                            <div className="w-full space-y-3">
                                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                                <div className="h-4 bg-gray-100 dark:bg-gray-700/50 rounded w-full"></div>
                                <div className="h-4 bg-gray-100 dark:bg-gray-700/50 rounded w-[85%]"></div>
                                <div className="h-4 bg-gray-100 dark:bg-gray-700/50 rounded w-[60%]"></div>
                            </div>
                        </div>
                    ))
                ) : comunicadosFiltrados.length > 0 ? (
                    comunicadosFiltrados.map((aviso, index) => (
                        <Reveal
                            key={aviso.id}
                            direction="up"
                            delay={Math.min(index, 12) * 50}
                            className="min-w-0 h-full max-w-full"
                        >
                            <div className="min-w-0 max-w-full h-full overflow-hidden bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col hover:shadow-md transition-shadow group touch-manipulation">
                                <div className="flex-1 flex flex-col min-w-0 max-w-full overflow-hidden p-5 sm:p-6 md:p-5 lg:p-6 gap-4">
                                    <div className="flex flex-wrap items-start gap-x-2 gap-y-2 mb-0 min-w-0">
                                        <span className="text-[10px] sm:text-[11px] font-semibold text-gray-600 dark:text-gray-300 bg-gray-100/90 dark:bg-gray-700/60 px-2.5 py-1 rounded-full border border-gray-200/70 dark:border-gray-600/60 max-w-full break-words">
                                            {rotuloBadgePublico(aviso.publicoAlvo)}
                                        </span>
                                        <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-900 px-3 py-1.5 rounded-full inline-flex flex-wrap gap-1 items-baseline min-w-0 max-w-full break-all sm:break-words hyphens-auto">
                                            <span aria-hidden className="shrink-0">📅</span>
                                            <span className="min-w-0">{formatarDataHoraPublicacao(aviso.dataPublicacao)}</span>
                                        </span>
                                    </div>
                                    
                                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-3 sm:line-clamp-3 break-words hyphens-auto min-w-0 overflow-hidden">
                                        {aviso.titulo}
                                    </h3>
                                    
                                    <p className="text-gray-600 dark:text-gray-300 mb-auto line-clamp-3 sm:line-clamp-4 leading-relaxed text-sm sm:text-[15px] break-words hyphens-auto min-w-0 overflow-hidden flex-1">
                                        {aviso.conteudo}
                                    </p>
                                    
                                    <div className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 flex items-start gap-2 mt-4 min-w-0">
                                        <div className="w-10 h-10 shrink-0 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-lg leading-none" aria-hidden>👤</div>
                                        <span className="min-w-0 pt-2 leading-snug break-words">
                                            Enviado por:{' '}
                                            <span className="font-semibold text-gray-700 dark:text-gray-300 break-words">{aviso.autor}</span>
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="w-full shrink-0 pt-0 px-5 sm:px-6 md:px-5 lg:px-6 pb-5 sm:pb-6 md:pb-5 lg:pb-6">
                                    <button 
                                        type="button"
                                        onClick={() => setComunicadoSelecionado(aviso)}
                                        className="w-full text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm sm:text-base font-bold bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 min-h-[2.75rem] px-4 py-3 rounded-xl transition-colors inline-flex items-center justify-center gap-2 touch-manipulation"
                                    >
                                        Ler completo
                                        <span className="text-lg leading-none" aria-hidden>&rarr;</span>
                                    </button>
                                </div>
                            </div>
                        </Reveal>
                    ))
                ) : (
                    <Reveal direction="up" className="col-span-full w-full min-w-0 max-w-full">
                        <div className="text-center py-14 sm:py-16 px-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 w-full max-w-full min-w-0 overflow-hidden">
                            <div className="text-5xl mb-4 opacity-50 leading-none">📭</div>
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white break-words px-2">Nenhum comunicado encontrado</h3>
                        </div>
                    </Reveal>
                )}
            </div>

            {/* --- MODAL DE LEITURA COMPLETA --- */}
            {comunicadoSelecionado && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-gray-900/60 backdrop-blur-sm transition-opacity overflow-x-hidden overscroll-none">
                    <Reveal direction="up" duration={400} className="w-full max-w-full sm:max-w-2xl min-w-0 max-h-[100dvh] sm:max-h-none">
                        <div className="bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col max-h-[92dvh] sm:max-h-[90vh] min-w-0">
                            <div className="px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center gap-3 bg-gray-50 dark:bg-gray-900/50 min-w-0 flex-wrap">
                                <div className="flex flex-wrap items-center gap-2 min-w-0">
                                    <span className="text-[10px] sm:text-[11px] font-semibold text-gray-600 dark:text-gray-300 bg-white/80 dark:bg-gray-800/80 px-2.5 py-1 rounded-full border border-gray-200/80 dark:border-gray-600/60 break-words max-w-full">
                                        {rotuloBadgePublico(comunicadoSelecionado.publicoAlvo)}
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setComunicadoSelecionado(null)}
                                    className="shrink-0 min-h-10 min-w-10 px-3 inline-flex items-center justify-center text-gray-500 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:bg-red-900/25 rounded-xl transition-colors text-sm font-bold touch-manipulation"
                                >
                                    ✕ Fechar
                                </button>
                            </div>
                            
                            <div className="p-5 sm:p-8 overflow-y-auto overflow-x-hidden min-w-0">
                                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-4 leading-snug break-words hyphens-auto min-w-0">{comunicadoSelecionado.titulo}</h2>
                                <div className="flex flex-col sm:flex-row flex-wrap gap-3 text-sm font-medium text-gray-500 mb-8 pb-6 border-b border-gray-100 dark:border-gray-700 min-w-0">
                                    <span className="min-w-0 max-w-full break-all sm:break-words hyphens-auto inline-flex gap-2 items-baseline bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-xl">
                                        <span aria-hidden>📅</span>
                                        Publicado em: {formatarDataHoraPublicacao(comunicadoSelecionado.dataPublicacao)}
                                    </span>
                                    <span className="min-w-0 max-w-full break-words hyphens-auto inline-flex gap-2 items-baseline bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-xl">
                                        <span aria-hidden>👤</span>
                                        Autor: {comunicadoSelecionado.autor}
                                    </span>
                                </div>
                                <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed text-[15px] sm:text-lg break-words hyphens-auto min-w-0 overflow-hidden">
                                    <p className="whitespace-pre-wrap">{comunicadoSelecionado.conteudo}</p>
                                </div>
                            </div>
                            
                            <div className="px-4 sm:px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-stretch sm:justify-end pb-[max(env(safe-area-inset-bottom,0px),1rem)] sm:pb-4">
                                <button
                                    type="button"
                                    onClick={() => setComunicadoSelecionado(null)}
                                    className="w-full sm:w-auto min-h-11 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-bold px-6 py-3 rounded-xl transition-colors touch-manipulation"
                                >
                                    Ciente, fechar
                                </button>
                            </div>
                        </div>
                    </Reveal>
                </div>
            )}

            {/* --- MODAL DE CRIAÇÃO --- */}
            {isCriando && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-gray-900/60 backdrop-blur-sm transition-opacity overflow-x-hidden overscroll-none">
                    <Reveal direction="up" duration={400} className="w-full max-w-full sm:max-w-2xl min-w-0">
                        <div className="bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col max-h-[92dvh] sm:max-h-[90vh] min-w-0">
                            
                            <div className="px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center gap-3 bg-gray-50 dark:bg-gray-900/50 min-w-0">
                                <h3 className="font-bold text-gray-900 dark:text-white truncate min-w-0">Criar Novo Comunicado</h3>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsCriando(false)
                                        setErroFormulario('')
                                        resetFormularioNovoComunicado()
                                    }}
                                    className="shrink-0 min-h-10 min-w-10 inline-flex items-center justify-center rounded-xl text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/25 touch-manipulation"
                                    aria-label="Fechar"
                                >
                                    ✕
                                </button>
                            </div>
                            
                            <form onSubmit={handleCriarComunicado} className="flex flex-col overflow-hidden min-h-0 min-w-0">
                                <div className="p-5 sm:p-8 overflow-y-auto overflow-x-hidden flex flex-col gap-5 min-w-0">
                                    {erroFormulario ? (
                                        <p className="text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 rounded-xl">
                                            {erroFormulario}
                                        </p>
                                    ) : null}
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Título do Comunicado *
                                        </label>
                                        <input 
                                            required
                                            type="text" 
                                            maxLength={MAX_TITULO}
                                            value={novoAviso.titulo}
                                            onChange={(e) => {
                                                setErroFormulario('')
                                                setNovoAviso({
                                                    ...novoAviso,
                                                    titulo: e.target.value.slice(0, MAX_TITULO),
                                                })
                                            }}
                                            className="w-full min-w-0 min-h-11 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-[16px] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                            placeholder="Ex: Feriado Nacional..."
                                        />
                                        <p
                                            className={`text-xs font-mono mt-1 text-right tabular-nums ${novoAviso.titulo.length >= MAX_TITULO ? 'text-red-500 font-bold' : 'text-gray-400'}`}
                                        >
                                            {novoAviso.titulo.length}/{MAX_TITULO}
                                        </p>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <div className="flex-1 min-w-0">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Autor *
                                            </label>
                                            <input 
                                                required
                                                type="text" 
                                                maxLength={MAX_AUTOR}
                                                value={novoAviso.autor}
                                                onChange={(e) => {
                                                    setErroFormulario('')
                                                    setNovoAviso({
                                                        ...novoAviso,
                                                        autor: e.target.value.slice(0, MAX_AUTOR),
                                                    })
                                                }}
                                                className="w-full min-w-0 min-h-11 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-[16px] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                                placeholder="Ex: Direção Acadêmica"
                                            />
                                            <p
                                                className={`text-xs font-mono mt-1 text-right tabular-nums ${novoAviso.autor.length >= MAX_AUTOR ? 'text-red-500 font-bold' : 'text-gray-400'}`}
                                            >
                                                {novoAviso.autor.length}/{MAX_AUTOR}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Público-Alvo *
                                        </label>
                                        <select
                                            value={novoAviso.publicoAlvo}
                                            onChange={(e) =>
                                                setNovoAviso({
                                                    ...novoAviso,
                                                    publicoAlvo: e.target.value as PublicoAlvo,
                                                })
                                            }
                                            className="w-full min-w-0 min-h-11 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-[16px] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                        >
                                            {PUBLICO_ALVO_OPCOES.map((op) => (
                                                <option key={op} value={op}>
                                                    {op}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Mensagem do Comunicado *
                                        </label>
                                        <textarea 
                                            required
                                            rows={6}
                                            maxLength={MAX_CONTEUDO}
                                            value={novoAviso.conteudo}
                                            onChange={(e) => {
                                                setErroFormulario('')
                                                setNovoAviso({
                                                    ...novoAviso,
                                                    conteudo: e.target.value.slice(0, MAX_CONTEUDO),
                                                })
                                            }}
                                            className="w-full min-w-0 min-h-[8rem] px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-[16px] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none resize-none transition-all break-words"
                                            placeholder="Digite os detalhes do comunicado aqui..."
                                        />
                                        <p
                                            className={`text-xs font-mono mt-1 text-right tabular-nums ${novoAviso.conteudo.length >= MAX_CONTEUDO ? 'text-red-500 font-bold' : 'text-gray-400'}`}
                                        >
                                            {novoAviso.conteudo.length}/{MAX_CONTEUDO}
                                        </p>
                                    </div>

                                </div>
                                
                                <div className="px-4 sm:px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end pb-[max(env(safe-area-inset-bottom,0px),1rem)] sm:pb-4">
                                    <button 
                                        type="button" 
                                        onClick={() => {
                                            setIsCriando(false)
                                            setErroFormulario('')
                                            resetFormularioNovoComunicado()
                                        }} 
                                        className="w-full sm:w-auto min-h-11 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 font-bold py-3 px-6 rounded-xl transition-colors touch-manipulation"
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={isSubmitting || !isFormValido}
                                        className={`w-full sm:w-auto min-h-11 font-bold py-3 px-8 rounded-xl transition-all inline-flex items-center justify-center gap-2 touch-manipulation 
                                            ${(isSubmitting || !isFormValido) 
                                                ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed' 
                                                : 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-[0.98] shadow-md'
                                            }`}
                                    >
                                        {isSubmitting ? 'Salvando...' : 'Publicar Comunicado'}
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

export default Mural