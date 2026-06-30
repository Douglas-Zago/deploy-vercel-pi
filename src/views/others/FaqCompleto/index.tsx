import React, { useState, useEffect, useMemo } from 'react'
import NavigationBar from '../Landing/components/NavigationBar'
import LandingFooter from '../Landing/components/LandingFooter'
import { MODE_DARK, MODE_LIGHT } from '@/constants/theme.constant'
import useDarkMode from '@/utils/hooks/useDarkMode'
import Reveal from '@/components/ui/Reveal'
import {
    FaqAlertService,
    type FaqCategoriaBadge,
    type FaqItem,
} from '@/services/FaqAlertService'
import { TbArrowLeft } from 'react-icons/tb'

type FaqPergunta = {
    q: string
    a: string
    type: 'TEXTO' | 'VIDEO'
    videoUrl?: string
}

type FaqCategoria = {
    category: string
    icon: string
    badge: FaqCategoriaBadge
    questions: FaqPergunta[]
}

const BADGE_ESTILOS: Record<
    FaqCategoriaBadge,
    { chip: string; iconBox: string }
> = {
    indigo: {
        chip: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
        iconBox: 'bg-indigo-100 dark:bg-indigo-900/40 border-indigo-200 dark:border-indigo-800',
    },
    emerald: {
        chip: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        iconBox: 'bg-emerald-100 dark:bg-emerald-900/40 border-emerald-200 dark:border-emerald-800',
    },
    amber: {
        chip: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        iconBox: 'bg-amber-100 dark:bg-amber-900/40 border-amber-200 dark:border-amber-800',
    },
    sky: {
        chip: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300 border-sky-200 dark:border-sky-800',
        iconBox: 'bg-sky-100 dark:bg-sky-900/40 border-sky-200 dark:border-sky-800',
    },
    rose: {
        chip: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 border-rose-200 dark:border-rose-800',
        iconBox: 'bg-rose-100 dark:bg-rose-900/40 border-rose-200 dark:border-rose-800',
    },
    violet: {
        chip: 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300 border-violet-200 dark:border-violet-800',
        iconBox: 'bg-violet-100 dark:bg-violet-900/40 border-violet-200 dark:border-violet-800',
    },
}

/** Evita overflow horizontal em respostas longas (URLs, textos sem espaço, etc.) */
const FAQ_RESPOSTA_CLASSES =
    'text-gray-600 dark:text-gray-400 leading-relaxed text-sm sm:text-base break-words whitespace-normal text-pretty max-w-full'

function montarFaqDinamico(itens: FaqItem[]): FaqCategoria[] {
    if (itens.length === 0) return []

    const mapa = new Map<string, FaqCategoria>()

    for (const item of itens) {
        const nomeCategoria = item.categoria ?? 'Informações Gerais'
        const badge = item.badge ?? 'indigo'
        const icone = item.icone ?? '📋'

        if (!mapa.has(nomeCategoria)) {
            mapa.set(nomeCategoria, {
                category: nomeCategoria,
                icon: icone,
                badge,
                questions: [],
            })
        }

        const cat = mapa.get(nomeCategoria)!
        cat.questions.push({
            q: item.pergunta,
            a: item.resposta,
            type: 'TEXTO',
        })
    }

    return Array.from(mapa.values())
}

const FaqCompleto = () => {
    const [isDark, setMode] = useDarkMode()
    const mode = isDark ? MODE_DARK : MODE_LIGHT
    const [termoBusca, setTermoBusca] = useState('')
    const [openItems, setOpenItems] = useState<Record<string, boolean>>({})
    const [faqData, setFaqData] = useState<FaqCategoria[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const toggleMode = () => setMode(mode === MODE_LIGHT ? MODE_DARK : MODE_LIGHT)

    // Efeito para SEO, Scroll e simular requisição à API
    useEffect(() => {
        document.title = 'Central de Ajuda | PACE'
        document.documentElement.style.scrollBehavior = 'smooth'

        let metaDesc = document.querySelector('meta[name="description"]')
        if (!metaDesc) {
            metaDesc = document.createElement('meta')
            metaDesc.setAttribute('name', 'description')
            document.head.appendChild(metaDesc)
        }
        metaDesc.setAttribute(
            'content',
            'Central de Ajuda PACE. Encontre respostas rápidas sobre acesso, materiais, notas e abertura de chamados.',
        )

        let metaKeys = document.querySelector('meta[name="keywords"]')
        if (!metaKeys) {
            metaKeys = document.createElement('meta')
            metaKeys.setAttribute('name', 'keywords')
            document.head.appendChild(metaKeys)
        }
        metaKeys.setAttribute('content', 'FAQ, Ajuda, Portal do Aluno, Suporte, PACE')
    }, [])

    useEffect(() => {
        const carregar = () => {
            setIsLoading(true)
            const itens = FaqAlertService.getFaqItems()
            setFaqData(montarFaqDinamico(itens))
            setIsLoading(false)
        }
        carregar()
        return FaqAlertService.subscribe(carregar)
    }, [])

    const sugestoesFaq = faqData[0]?.questions.slice(0, 3).map((p) => ({ q: p.q })) ?? []

    // A MÁGICA DA PERFORMANCE: useMemo com busca inteligente multi-palavras
    const faqFiltrado = useMemo(() => {
        const termoLimpo = termoBusca.trim().toLowerCase()
        if (!termoLimpo) return faqData

        const palavrasBusca = termoLimpo.split(/\s+/)

        return faqData
            .map((categoria) => {
                const perguntasFiltradas = categoria.questions.filter((item) => {
                    const qLower = item.q.toLowerCase()
                    const aLower = item.a.toLowerCase()
                    return palavrasBusca.every(
                        (palavra) => qLower.includes(palavra) || aLower.includes(palavra),
                    )
                })
                return { ...categoria, questions: perguntasFiltradas }
            })
            .filter((categoria) => categoria.questions.length > 0)
    }, [termoBusca, faqData])

    // UX: ao buscar, expande automaticamente os itens filtrados
    useEffect(() => {
        if (!termoBusca.trim()) {
            setOpenItems({})
            return
        }
        const expandidos: Record<string, boolean> = {}
        faqFiltrado.forEach((categoria, catIndex) => {
            categoria.questions.forEach((item, qIndex) => {
                expandidos[`${catIndex}-${qIndex}-${item.q}`] = true
            })
        })
        setOpenItems(expandidos)
    }, [termoBusca, faqFiltrado])

    // UX: Clicou na sugestão, preenche e rola pro topo
    const handleSugestaoClick = (pergunta: string) => {
        setTermoBusca(pergunta)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const togglePergunta = (key: string) => {
        setOpenItems((prev) => ({
            ...prev,
            [key]: !prev[key],
        }))
    }

    // COMPONENTE: SKELETON LOADING
    const SkeletonLoading = () => (
        <div className="space-y-8 sm:space-y-12 animate-pulse">
            {[1, 2].map((i) => (
                <div
                    key={i}
                    className="bg-gray-50 dark:bg-gray-900 p-5 sm:p-8 rounded-3xl border border-transparent dark:border-gray-800"
                >
                    <div className="flex items-center gap-4 mb-6 sm:mb-8">
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
                        <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                        {[1, 2, 3, 4].map((j) => (
                            <div
                                key={j}
                                className="bg-white dark:bg-gray-800 p-5 sm:p-6 rounded-2xl border border-gray-100 dark:border-gray-700"
                            >
                                <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                                <div className="h-4 w-full bg-gray-100 dark:bg-gray-700/50 rounded mb-2"></div>
                                <div className="h-4 w-5/6 bg-gray-100 dark:bg-gray-700/50 rounded"></div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )

    return (
        <main className="w-full px-4 lg:px-0 text-base bg-white dark:bg-gray-950 font-sans selection:bg-indigo-200 dark:selection:bg-indigo-900">
            <NavigationBar toggleMode={toggleMode} mode={mode} variant="minimal" />

            <div className="relative pt-28 sm:pt-32 pb-20 sm:pb-28">
                <div
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='50' height='50' fill='none' stroke='${mode === MODE_LIGHT ? 'rgb(0 0 0 / 0.04)' : 'rgb(255 255 255 / 0.04)'}'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e")`,
                    }}
                    className="absolute inset-0 [mask-image:linear-gradient(to_bottom,white_10%,transparent_90%)] pointer-events-none select-none z-0"
                ></div>

                <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10 min-w-0">
                    <Reveal direction="down">
                        <a
                            href="/"
                            className="inline-flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 mb-10 sm:mb-12 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 shadow-sm hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:shadow-md transition-all active:scale-[0.98]"
                            aria-label="Voltar para o site"
                            title="Voltar para o site"
                        >
                            <TbArrowLeft className="text-xl sm:text-2xl shrink-0" />
                        </a>
                    </Reveal>

                    <header className="text-center mb-14 sm:mb-20">
                        <Reveal direction="down">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800/70 text-indigo-700 dark:text-indigo-300 text-sm font-bold mb-6 sm:mb-8">
                                <span aria-hidden>✨</span>
                                Central de Ajuda PACE
                            </div>
                            <h1 className="text-3xl sm:text-4xl md:text-[2.75rem] font-extrabold text-gray-900 dark:text-white mb-5 sm:mb-7 tracking-tight leading-tight">
                                Encontre respostas com mais rapidez
                            </h1>
                            <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto leading-relaxed">
                                Pesquise dúvidas frequentes sobre acesso, materiais, notas e processos do sistema.
                            </p>
                        </Reveal>

                        <Reveal direction="up" delay={150}>
                            <div className="mt-12 sm:mt-16 max-w-2xl mx-auto space-y-8 sm:space-y-10">
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                        <svg
                                            className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                        />
                                    </svg>
                                </div>

                                    <input
                                        type="text"
                                        inputMode="search"
                                        autoComplete="off"
                                        aria-label="Campo de busca de dúvidas"
                                        placeholder="Buscar por palavra-chave..."
                                        value={termoBusca}
                                        onChange={(e) => setTermoBusca(e.target.value)}
                                        className="w-full pl-12 pr-12 py-4 text-base rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25 outline-none transition-all shadow-sm"
                                    />

                                    {termoBusca.trim() !== '' && (
                                        <button
                                            type="button"
                                            onClick={() => setTermoBusca('')}
                                            aria-label="Limpar busca"
                                            className="absolute inset-y-0 right-0 pr-4 flex items-center"
                                        >
                                            <span className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 flex items-center justify-center hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/30 transition-colors text-sm">
                                                ✕
                                            </span>
                                        </button>
                                    )}
                                </div>

                                {sugestoesFaq.length > 0 && (
                                    <div className="space-y-3">
                                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 text-center">
                                            Sugestões rápidas
                                        </p>
                                        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
                                            {sugestoesFaq.map((sug, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => handleSugestaoClick(sug.q)}
                                                    className="px-4 py-2 rounded-full text-sm font-medium bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-300 transition-all"
                                                >
                                                    {sug.q}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Reveal>
                    </header>

                    {/* LÓGICA DE RENDERIZAÇÃO: LOADING -> RESULTADOS -> VAZIO */}
                    {isLoading ? (
                        <SkeletonLoading />
                    ) : faqFiltrado.length > 0 ? (
                        <div className="mt-4 sm:mt-6 space-y-5 min-w-0">
                            {faqFiltrado.map((category, catIndex) => (
                                <Reveal key={catIndex} direction="up" delay={catIndex * 100}>
                                    <section aria-labelledby={`faq-cat-${catIndex}`}>
                                        <div
                                            id={`faq-cat-${catIndex}`}
                                            className="flex items-center gap-3 mb-5 px-1"
                                        >
                                            <span
                                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-lg ${BADGE_ESTILOS[category.badge].iconBox}`}
                                                aria-hidden
                                            >
                                                {category.icon}
                                            </span>
                                            <span
                                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${BADGE_ESTILOS[category.badge].chip}`}
                                            >
                                                {category.category}
                                            </span>
                                        </div>

                                        <div className="space-y-4">
                                            {category.questions.map((item, qIndex) => {
                                                const itemKey = `${catIndex}-${qIndex}-${item.q}`
                                                const isOpen = !!openItems[itemKey]

                                                return (
                                                    <div
                                                        key={qIndex}
                                                        className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 shadow-sm transition-shadow hover:shadow-md min-w-0"
                                                    >
                                                        <button
                                                            type="button"
                                                            onClick={() => togglePergunta(itemKey)}
                                                            aria-expanded={isOpen}
                                                            className="w-full px-6 py-5 sm:px-7 sm:py-6 text-left flex items-start gap-4 min-w-0"
                                                        >
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="font-bold text-gray-900 dark:text-white text-base sm:text-lg leading-snug break-words whitespace-normal text-pretty">
                                                                    {item.q}
                                                                </h4>
                                                            </div>

                                                            <span
                                                                aria-hidden
                                                                className={`shrink-0 mt-0.5 w-9 h-9 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-lg font-bold text-indigo-600 dark:text-indigo-400 transition-all duration-300 ${
                                                                    isOpen
                                                                        ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800'
                                                                        : ''
                                                                }`}
                                                            >
                                                                {isOpen ? '−' : '+'}
                                                            </span>
                                                        </button>

                                                        {isOpen && (
                                                            <div className="px-6 pb-6 sm:px-7 sm:pb-7 pt-1 border-t border-gray-100 dark:border-gray-800 min-w-0 break-words whitespace-normal text-pretty">
                                                                {item.type === 'VIDEO' && item.videoUrl ? (
                                                                    <div className="space-y-4 min-w-0 max-w-full">
                                                                        <p className={FAQ_RESPOSTA_CLASSES}>
                                                                            {item.a}
                                                                        </p>
                                                                        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm max-w-full">
                                                                            <div className="aspect-video bg-black rounded-2xl overflow-hidden">
                                                                                <iframe
                                                                                    src={item.videoUrl}
                                                                                    title={item.q}
                                                                                    className="w-full h-full max-w-full"
                                                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                                                    allowFullScreen
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <p className={FAQ_RESPOSTA_CLASSES}>
                                                                        {item.a}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </section>
                                </Reveal>
                            ))}
                        </div>
                    ) : (
                        /* TELA DE "NENHUM RESULTADO" */
                        <div className="max-w-4xl mx-auto">
                            <Reveal direction="up">
                                <div className="text-center py-12 sm:py-16 bg-red-50 dark:bg-gray-900 rounded-3xl border-2 border-dashed border-red-200 dark:border-gray-800 mb-8 sm:mb-12 px-4">
                                    <div className="text-5xl sm:text-6xl mb-4 animate-bounce">🔍</div>
                                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                                        Ops! Nada encontrado para "{termoBusca}"
                                    </h3>
                                    <p className="text-gray-500 mt-2 px-2 sm:px-6">
                                        Tente usar palavras-chave mais simples.
                                    </p>
                                    <button
                                        onClick={() => setTermoBusca('')}
                                        aria-label="Limpar campo de pesquisa"
                                        className="mt-6 px-6 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-white rounded-xl font-medium shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-transform active:scale-95"
                                    >
                                        Limpar Pesquisa
                                    </button>
                                </div>
                            </Reveal>

                            <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
                                <Reveal direction="left" delay={200}>
                                    <div className="bg-white dark:bg-gray-900 p-5 sm:p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col">
                                        <h4 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                            <span className="text-yellow-500">⭐</span> Sugestões Frequentes
                                        </h4>
                                        <div className="space-y-4">
                                            {sugestoesFaq.map((sug, idx) => (
                                                <div
                                                    key={idx}
                                                    onClick={() => handleSugestaoClick(sug.q)}
                                                    role="button"
                                                    tabIndex={0}
                                                    aria-label={`Buscar por: ${sug.q}`}
                                                    className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all cursor-pointer transform hover:scale-[1.02] active:scale-[0.98]"
                                                >
                                                    <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
                                                        {sug.q}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </Reveal>

                                <Reveal direction="right" delay={200}>
                                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 dark:from-indigo-700 dark:to-purple-900 p-5 sm:p-8 rounded-3xl text-white shadow-xl flex flex-col justify-center border border-white/10">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-bold uppercase tracking-[0.18em] w-fit mb-5">
                                            Atendimento
                                        </div>
                                        <h4 className="text-xl sm:text-2xl font-bold mb-3">
                                            Ainda precisa de ajuda?
                                        </h4>
                                        <p className="text-indigo-100 mb-8 leading-relaxed text-sm sm:text-base">
                                            Nossa equipe está pronta para te atender com mais rapidez e direcionar você ao suporte ideal.
                                        </p>
                                        <div className="space-y-3">
                                            <button
                                                onClick={() =>
                                                    window.open('https://wa.me/5500000000000', '_blank')
                                                }
                                                aria-label="Entrar em contato via WhatsApp"
                                                className="w-full py-3.5 bg-white text-indigo-700 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-indigo-50 transition-transform hover:scale-[1.02] active:scale-95 shadow-lg"
                                            >
                                                <span>💬</span> Falar no WhatsApp
                                            </button>
                                        </div>
                                    </div>
                                </Reveal>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div id="contato" className="w-full">
                <LandingFooter mode={mode} />
            </div>
        </main>
    )
}

export default FaqCompleto