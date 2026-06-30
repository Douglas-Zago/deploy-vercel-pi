import React, { useState, useEffect } from 'react'
import NavigationBar from './components/NavigationBar'
import LandingFooter from './components/LandingFooter'
import SocialFloatButtons from './components/SocialFloatButtons'
import useDarkMode from '@/utils/hooks/useDarkMode'
import { MODE_DARK, MODE_LIGHT } from '@/constants/theme.constant'
import Reveal from '@/components/ui/Reveal'
import { FaqAlertService, type FaqItem } from '@/services/FaqAlertService'

// --- 1. HERO COM PRÉVIA DA DASHBOARD E WIDGETS FLUTUANTES ---
const SchoolHero = () => {
    return (
        <section className="relative pt-28 sm:pt-32 lg:pt-36 pb-14 sm:pb-16 lg:pb-24 max-w-7xl mx-auto px-4 sm:px-6 z-10 overflow-hidden">
            <div className="absolute inset-x-0 top-0 -z-10 flex justify-center pointer-events-none">
                <div className="w-[28rem] h-[28rem] bg-indigo-500/15 dark:bg-indigo-500/10 blur-3xl rounded-full"></div>
            </div>

            <div className="text-center max-w-4xl mx-auto">
                <Reveal direction="up">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800/70 text-indigo-700 dark:text-indigo-300 text-xs sm:text-sm font-bold uppercase tracking-[0.16em] mb-5 sm:mb-6">
                        <span>●</span>
                        Portal Escolar PACE
                    </div>

                    <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-5 sm:mb-6 leading-[1.05]">
                        A experiência digital da sua{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 dark:from-indigo-400 dark:via-violet-400 dark:to-purple-400">
                            vida acadêmica
                        </span>
                    </h1>
                </Reveal>

                <Reveal direction="up" delay={200}>
                    <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 sm:mb-10 max-w-3xl mx-auto leading-relaxed">
                        O PACE reúne comunicados, materiais, suporte, rotinas escolares e serviços institucionais
                        em uma plataforma única, moderna e segura para alunos, professores e equipe gestora.
                    </p>
                </Reveal>

                <Reveal direction="up" delay={350}>
                    <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-8 sm:mb-10">
                        <a
                            href="/sign-in"
                            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3.5 px-7 sm:px-8 rounded-full transition-all duration-200 shadow-lg shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <span>Acessar o Portal</span>
                            <span>→</span>
                        </a>

                        <a
                            href="#how-it-works"
                            className="inline-flex items-center justify-center gap-2 bg-white/90 dark:bg-gray-900/80 backdrop-blur-sm hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-white font-semibold py-3.5 px-7 sm:px-8 rounded-full border border-gray-200 dark:border-gray-700 transition-all duration-200 shadow-sm hover:scale-[1.02] active:scale-[0.98]"
                        >
                            Entenda como funciona
                        </a>
                    </div>
                </Reveal>

                <Reveal direction="up" delay={450}>
                    <div className="flex flex-wrap justify-center items-center gap-x-5 gap-y-3 text-sm sm:text-base text-gray-500 dark:text-gray-400 font-medium mb-10 sm:mb-14">
                        <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            Acesso rápido
                        </span>
                        <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                            Comunicação centralizada
                        </span>
                        <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                            100% responsivo
                        </span>
                    </div>
                </Reveal>
            </div>

            <Reveal direction="up" delay={600}>
                <div className="relative mx-auto max-w-6xl rounded-[2rem] overflow-hidden shadow-[0_30px_80px_-30px_rgba(79,70,229,0.45)] border border-white/70 dark:border-gray-800/80 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
                    <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/80 to-transparent dark:from-gray-900/80 dark:to-transparent z-20 pointer-events-none"></div>

                    <div className="h-10 sm:h-12 bg-white/90 dark:bg-gray-900/90 border-b border-gray-200/80 dark:border-gray-800 flex items-center px-4 gap-2 z-20 relative">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                        <div className="ml-3 text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                            portal.pace.edu.br/dashboard
                        </div>
                    </div>

                    <div className="relative aspect-[4/5] sm:aspect-[16/10] lg:aspect-[21/10] bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950/30 overflow-hidden">
                        <img
                            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop"
                            alt="Prévia visual do ecossistema digital PACE"
                            loading="lazy"
                            className="absolute inset-0 w-full h-full object-cover opacity-20 dark:opacity-15 blur-[1px] pointer-events-none"
                        />

                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.12),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.12),transparent_35%)]"></div>

                        {/* Painel central */}
                        <div className="absolute inset-0 flex items-center justify-center px-4 sm:px-6">
                            <div className="relative w-full max-w-4xl rounded-[1.6rem] border border-white/80 dark:border-gray-800 bg-white/90 dark:bg-gray-900/85 backdrop-blur-xl shadow-2xl overflow-hidden">
                                <div className="grid lg:grid-cols-[1.1fr_0.9fr] min-h-[360px] sm:min-h-[420px]">
                                    <div className="p-5 sm:p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-gray-100 dark:border-gray-800">
                                        <div className="flex items-start justify-between gap-4 mb-6">
                                            <div>
                                                <p className="text-xs uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400 font-bold mb-2">
                                                    Área Pública e Institucional
                                                </p>
                                                <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900 dark:text-white leading-tight">
                                                    Escola conectada, organizada e acessível
                                                </h3>
                                            </div>
                                            <div className="hidden sm:flex w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white items-center justify-center shadow-lg shrink-0">
                                                ✦
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-5">
                                            {[
                                                { title: 'Comunicados', icon: '📢', value: 'Atualizados' },
                                                { title: 'Materiais', icon: '📚', value: 'Centralizados' },
                                                { title: 'Suporte', icon: '🛠️', value: 'Mais rápido' },
                                                { title: 'Agenda', icon: '🗓️', value: 'Integrada' },
                                            ].map((card, idx) => (
                                                <div
                                                    key={idx}
                                                    className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/90 dark:bg-gray-800/70 p-3.5 sm:p-4 shadow-sm"
                                                >
                                                    <div className="text-xl sm:text-2xl mb-2">{card.icon}</div>
                                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{card.title}</p>
                                                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{card.value}</p>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 sm:p-5 shadow-lg">
                                            <p className="text-xs uppercase tracking-[0.18em] font-bold text-white/75 mb-2">
                                                Infraestrutura da escola
                                            </p>
                                            <p className="text-sm sm:text-base leading-relaxed text-white/95">
                                                Laboratórios, biblioteca, materiais, comunicação e suporte institucional em
                                                uma única experiência digital.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="p-5 sm:p-6 lg:p-8 flex flex-col justify-center">
                                        <div className="space-y-4">
                                            {[
                                                {
                                                    icon: '🎓',
                                                    title: 'Para alunos',
                                                    desc: 'Consulta, comunicação e rotina acadêmica em um só lugar.',
                                                },
                                                {
                                                    icon: '👨‍🏫',
                                                    title: 'Para professores',
                                                    desc: 'Publicações, apoio operacional e organização do dia a dia.',
                                                },
                                                {
                                                    icon: '🏫',
                                                    title: 'Para a instituição',
                                                    desc: 'Uma presença pública forte, moderna e funcional.',
                                                },
                                            ].map((item, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-start gap-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/70 p-4 shadow-sm"
                                                >
                                                    <div className="w-11 h-11 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-xl shrink-0">
                                                        {item.icon}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-gray-900 dark:text-white">{item.title}</h4>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                                            {item.desc}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Widgets flutuantes */}
                        <div className="hidden md:block absolute left-8 bottom-8 z-30">
                            <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md px-5 py-4 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 flex items-center gap-3 transform -rotate-3 hover:rotate-0 transition-all duration-300">
                                <div className="w-11 h-11 bg-indigo-100 dark:bg-indigo-900 rounded-2xl flex items-center justify-center text-xl">
                                    📢
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-[0.14em] text-gray-400 font-bold">
                                        Destaque
                                    </p>
                                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                                        Comunicados importantes
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="hidden md:block absolute right-8 top-8 z-30">
                            <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md px-5 py-4 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 flex items-center gap-3 transform rotate-3 hover:rotate-0 transition-all duration-300">
                                <div className="w-11 h-11 bg-emerald-100 dark:bg-emerald-900 rounded-2xl flex items-center justify-center text-xl">
                                    🛠️
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-[0.14em] text-gray-400 font-bold">
                                        Suporte
                                    </p>
                                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                                        Chamados e atendimento
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent dark:from-gray-950/70 z-20 pointer-events-none"></div>
                    </div>
                </div>
            </Reveal>
        </section>
    )
}

// --- 2. CARROSSEL INFINITO ---
const MarqueePartners = () => {
    const items = [
        { icon: '🏛️', text: 'Campus Central' },
        { icon: '🏢', text: 'Polo Palhoça' },
        { icon: '🌐', text: 'EaD Integrado' },
        { icon: '🚀', text: 'Polo Tecnológico' },
        { icon: '🎓', text: '+15.000 Alunos Formados' },
        { icon: '💡', text: 'Centro de Inovação' },
        { icon: '🏆', text: 'Nota Máxima no MEC' },
        { icon: '🤝', text: 'Ecossistema Conectado' },
    ]

    const carouselItems = [...items, ...items, ...items]

    return (
        <Reveal direction="none" delay={200}>
            <section className="py-8 sm:py-10 lg:py-12 border-y border-gray-100 dark:border-gray-800 bg-gradient-to-r from-indigo-50/70 via-white to-purple-50/70 dark:from-gray-900/80 dark:via-gray-950 dark:to-gray-900/80 backdrop-blur-sm overflow-hidden relative">
                <style>
                    {`
                        @keyframes marquee-scroll {
                            0% { transform: translateX(0); }
                            100% { transform: translateX(-33.3333%); }
                        }
                        .animate-marquee-infinite {
                            display: flex;
                            width: max-content;
                            animation: marquee-scroll 34s linear infinite;
                        }
                        .animate-marquee-infinite:hover {
                            animation-play-state: paused;
                        }
                    `}
                </style>

                <div className="max-w-[100vw] mx-auto relative">
                    <div className="absolute left-0 top-0 bottom-0 w-14 sm:w-24 md:w-32 bg-gradient-to-r from-white dark:from-gray-950 via-white/90 dark:via-gray-950/90 to-transparent z-10 pointer-events-none"></div>
                    <div className="absolute right-0 top-0 bottom-0 w-14 sm:w-24 md:w-32 bg-gradient-to-l from-white dark:from-gray-950 via-white/90 dark:via-gray-950/90 to-transparent z-10 pointer-events-none"></div>

                    <div className="animate-marquee-infinite gap-4 sm:gap-5 items-center cursor-default px-4">
                        {carouselItems.map((item, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-3 bg-white/95 dark:bg-gray-800/95 px-4 sm:px-6 py-3 rounded-full shadow-sm border border-indigo-100/70 dark:border-gray-700 hover:shadow-md transition-all hover:-translate-y-0.5 shrink-0"
                            >
                                <span className="text-xl sm:text-2xl">{item.icon}</span>
                                <span className="text-sm sm:text-base lg:text-lg font-bold text-gray-700 dark:text-gray-300 tracking-wide whitespace-nowrap">
                                    {item.text}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </Reveal>
    )
}

// --- 3. INFRAESTRUTURA DE PONTA ---
const SchoolInfrastructure = () => {
    const facilities = [
        {
            title: 'Laboratórios de Tecnologia',
            desc: 'Ambientes climatizados equipados com estações de trabalho modernas, ideais para programação, design digital, modelagem e desenvolvimento de projetos tecnológicos.',
            img: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=800&auto=format&fit=crop',
        },
        {
            title: 'Laboratórios de Ciências e Biologia',
            desc: 'Espaços completos para práticas experimentais, com microscópios, bancadas seguras e estrutura adequada para aulas aplicadas e experiências orientadas.',
            img: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=800&auto=format&fit=crop',
        },
        {
            title: 'Salas de Aula Interativas',
            desc: 'Salas confortáveis, organizadas e com recursos multimídia para tornar a experiência de ensino mais dinâmica, colaborativa e eficiente.',
            img: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=800&auto=format&fit=crop',
        },
        {
            title: 'Biblioteca Central',
            desc: 'Um ambiente pensado para leitura, pesquisa e estudo, com acervo físico e apoio ao acesso digital de materiais e conteúdos acadêmicos.',
            img: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=800&auto=format&fit=crop',
        },
        {
            title: 'Refeitório e Área de Convivência',
            desc: 'Espaços de acolhimento e convivência que fortalecem a experiência no campus, com conforto, integração e apoio à rotina dos estudantes.',
            img: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800&auto=format&fit=crop',
        },
    ]

    return (
        <section id="features" className="py-16 sm:py-20 lg:py-24 bg-white dark:bg-gray-950 scroll-mt-20 overflow-hidden">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <Reveal direction="up">
                    <div className="text-center mb-14 sm:mb-16 lg:mb-20 max-w-3xl mx-auto">
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-[0.18em] text-xs sm:text-sm mb-3 block">
                            Estrutura de Nível Superior
                        </span>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-5 sm:mb-6 leading-tight">
                            Ambientes pensados para aprender, evoluir e construir o futuro
                        </h2>
                        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                            Nossa estrutura foi desenvolvida para unir acolhimento, inovação e suporte à rotina escolar,
                            com espaços funcionais para estudo, convivência e crescimento acadêmico.
                        </p>
                    </div>
                </Reveal>

                <div className="space-y-14 sm:space-y-16 lg:space-y-24">
                    {facilities.map((facility, index) => {
                        const isEven = index % 2 !== 0

                        return (
                            <div
                                key={index}
                                className={`flex flex-col md:flex-row gap-8 lg:gap-14 items-center ${
                                    isEven ? 'md:flex-row-reverse' : ''
                                }`}
                            >
                                <Reveal direction={isEven ? 'right' : 'left'} className="w-full md:w-1/2">
                                    <div className="relative rounded-[2rem] overflow-hidden shadow-[0_24px_60px_-30px_rgba(79,70,229,0.45)] aspect-[4/3] group border border-gray-100 dark:border-gray-800">
                                        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/15 via-transparent to-purple-600/10 dark:from-indigo-900/30 dark:to-purple-900/20 z-10"></div>
                                        <img
                                            src={facility.img}
                                            alt={facility.title}
                                            loading="lazy"
                                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                                        />
                                    </div>
                                </Reveal>

                                <Reveal direction={isEven ? 'left' : 'right'} delay={200} className="w-full md:w-1/2">
                                    <div className="max-w-xl">
                                        <div className="inline-flex px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-[0.16em] mb-4">
                                            Infraestrutura
                                        </div>
                                        <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                                            {facility.title}
                                        </h3>
                                        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                                            {facility.desc}
                                        </p>
                                        <div className="mt-7 w-14 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
                                    </div>
                                </Reveal>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}

// --- 4. COMO FUNCIONA ---
const HowItWorks = () => {
    return (
        <section
            id="how-it-works"
            className="py-16 sm:py-20 lg:py-24 bg-gray-50 dark:bg-gray-900/50 max-w-full px-4 scroll-mt-20 border-t border-gray-100 dark:border-gray-800"
        >
            <div className="max-w-6xl mx-auto">
                <Reveal direction="up">
                    <div className="text-center mb-12 sm:mb-14 lg:mb-16">
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-[0.18em] text-xs sm:text-sm mb-3 block">
                            Fluxo de acesso
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
                            Simples, rápido e direto
                        </h2>
                        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
                            Comece a usar o Portal PACE em poucos passos.
                        </p>
                    </div>
                </Reveal>

                <div className="grid md:grid-cols-3 gap-10 sm:gap-12 relative mb-12 sm:mb-16">
                    <div className="hidden md:block absolute top-12 left-[18%] right-[18%] h-0.5 bg-gradient-to-r from-indigo-200 via-indigo-500 to-purple-300 dark:from-indigo-900 dark:via-indigo-600 dark:to-purple-800 z-0"></div>

                    {[
                        {
                            step: '1',
                            title: 'Autenticação Segura',
                            desc: 'Faça login com as credenciais fornecidas oficialmente pela instituição.',
                        },
                        {
                            step: '2',
                            title: 'Acesse seu painel',
                            desc: 'Visualize comunicados, materiais, agenda e funcionalidades essenciais da rotina.',
                        },
                        {
                            step: '3',
                            title: 'Explore os recursos',
                            desc: 'Abra chamados, consulte conteúdos, acompanhe informações e use o suporte com agilidade.',
                        },
                    ].map((item, i) => (
                        <Reveal key={i} direction="up" delay={i * 200}>
                            <div className="relative z-10 flex flex-col items-center text-center">
                                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white dark:bg-gray-800 border-4 border-indigo-100 dark:border-indigo-900 flex items-center justify-center text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 shadow-xl mb-5 sm:mb-6">
                                    {item.step}
                                </div>
                                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">
                                    {item.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed max-w-sm">
                                    {item.desc}
                                </p>
                            </div>
                        </Reveal>
                    ))}
                </div>

                <Reveal direction="up">
                    <div className="text-center">
                        <a
                            href="/sign-in"
                            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-semibold text-base sm:text-lg hover:underline transition-all active:scale-95"
                        >
                            Pronto para começar? Acesse seu painel →
                        </a>
                    </div>
                </Reveal>
            </div>
        </section>
    )
}

// --- 5. PARA QUEM É O PORTAL? ---
const TargetAudience = () => {
    const audiences = [
        {
            icon: '🎓',
            title: 'Para Alunos',
            items: [
                'Acesso rápido a materiais e comunicados',
                'Mais clareza na rotina acadêmica',
                'Facilidade para localizar informações importantes',
            ],
        },
        {
            icon: '👨‍🏫',
            title: 'Para Professores',
            items: [
                'Publicação mais ágil de informações',
                'Melhor comunicação com turmas',
                'Registro e suporte operacional com mais eficiência',
            ],
        },
        {
            icon: '⚙️',
            title: 'Para a Gestão',
            items: [
                'Comunicação centralizada e organizada',
                'Mais visibilidade sobre demandas e suporte',
                'Presença digital pública mais profissional',
            ],
        },
    ]

    return (
        <section className="py-16 sm:py-20 lg:py-24 bg-indigo-50/70 dark:bg-gray-900/80 border-t border-indigo-100 dark:border-gray-800">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <Reveal direction="up">
                    <div className="text-center mb-12 sm:mb-16">
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-[0.18em] text-xs sm:text-sm mb-3 block">
                            Comunidade escolar
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
                            Feito para toda a comunidade da instituição
                        </h2>
                    </div>
                </Reveal>

                <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
                    {audiences.map((aud, idx) => (
                        <Reveal key={idx} direction="up" delay={idx * 200}>
                            <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm p-6 sm:p-8 rounded-3xl shadow-sm border border-indigo-100 dark:border-gray-700 hover:-translate-y-2 hover:shadow-xl transition-all duration-300 h-full">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/30 flex items-center justify-center text-3xl mb-5">
                                    {aud.icon}
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                    {aud.title}
                                </h3>
                                <ul className="space-y-3 text-gray-600 dark:text-gray-400 leading-relaxed">
                                    {aud.items.map((item, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <span className="text-indigo-600 dark:text-indigo-400 mt-0.5">✓</span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    )
}

// --- 6. DESTAQUES DO SISTEMA ---
const SchoolFeatures = () => {
    const features = [
        {
            icon: '📢',
            title: 'Mural de Alertas',
            desc: 'Receba comunicados e avisos institucionais em um ponto central, com mais visibilidade e organização.',
            color: 'text-indigo-600 dark:text-indigo-400',
            bg: 'bg-indigo-100 dark:bg-indigo-900/30',
        },
        {
            icon: '📚',
            title: 'Central de Materiais',
            desc: 'Acesse arquivos, conteúdos acadêmicos, documentos e recursos disponibilizados pela instituição.',
            color: 'text-emerald-600 dark:text-emerald-400',
            bg: 'bg-emerald-100 dark:bg-emerald-900/30',
        },
        {
            icon: '🛠️',
            title: 'Suporte Operacional',
            desc: 'Abra solicitações com agilidade para demandas de infraestrutura, laboratórios e apoio técnico.',
            color: 'text-orange-600 dark:text-orange-400',
            bg: 'bg-orange-100 dark:bg-orange-900/30',
        },
    ]

    return (
        <section className="py-16 sm:py-20 lg:py-24 max-w-6xl mx-auto px-4 sm:px-6">
            <Reveal direction="up">
                <div className="text-center mb-12 sm:mb-16 max-w-2xl mx-auto">
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-[0.18em] text-xs sm:text-sm mb-3 block">
                        Ecossistema PACE
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
                        Módulos essenciais para a rotina escolar
                    </h2>
                    <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                        A plataforma reúne os recursos mais importantes para facilitar a comunicação, o acesso à informação e o suporte no dia a dia.
                    </p>
                </div>
            </Reveal>

            <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
                {features.map((feat, idx) => (
                    <Reveal key={idx} direction="up" delay={idx * 200}>
                        <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-[1.75rem] shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 transition-all h-full">
                            <div
                                className={`w-14 h-14 ${feat.bg} ${feat.color} rounded-2xl flex items-center justify-center mb-6 text-3xl shadow-sm`}
                            >
                                {feat.icon}
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                                {feat.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{feat.desc}</p>
                        </div>
                    </Reveal>
                ))}
            </div>
        </section>
    )
}

// --- 7. BENEFÍCIOS DIRETOS & SEGURANÇA ---
const SecurityAndBenefits = () => {
    return (
        <section className="py-16 sm:py-20 lg:py-24 bg-gray-950 relative overflow-hidden">
            <div className="absolute -right-40 -top-40 w-96 h-96 bg-indigo-600 rounded-full blur-[120px] opacity-40 pointer-events-none"></div>
            <div className="absolute -left-24 bottom-0 w-72 h-72 bg-purple-600 rounded-full blur-[120px] opacity-20 pointer-events-none"></div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
                <Reveal direction="left">
                    <div>
                        <span className="text-indigo-400 font-bold uppercase tracking-[0.18em] text-xs sm:text-sm mb-3 block">
                            Confiabilidade
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold mb-6 text-white leading-tight">
                            Mais do que um portal, uma forma mais simples de viver a rotina acadêmica.
                        </h2>
                        <ul className="space-y-6">
                            <li className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 mt-1">
                                    ⏳
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold mb-1 text-white">Economia de tempo</h4>
                                    <p className="text-gray-400 leading-relaxed">
                                        Mais acesso às informações certas, com menos esforço e menos ruído na rotina.
                                    </p>
                                </div>
                            </li>

                            <li className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 mt-1">
                                    📱
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold mb-1 text-white">100% responsivo</h4>
                                    <p className="text-gray-400 leading-relaxed">
                                        O PACE funciona perfeitamente em smartphones, tablets e desktops, com foco em mobilidade real.
                                    </p>
                                </div>
                            </li>
                        </ul>
                    </div>
                </Reveal>

                <Reveal direction="right" delay={200}>
                    <div className="bg-white/[0.05] border border-white/10 p-6 sm:p-8 rounded-[2rem] shadow-2xl relative backdrop-blur-sm">
                        <div className="absolute -top-5 -right-5 w-16 h-16 sm:w-20 sm:h-20 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
                            <svg
                                className="w-8 h-8 sm:w-10 sm:h-10 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                ></path>
                            </svg>
                        </div>

                        <h3 className="text-2xl font-bold mb-4 text-white">Segurança e confiabilidade</h3>
                        <p className="text-gray-300 mb-6 leading-relaxed">
                            O ambiente foi pensado para oferecer estabilidade, segurança de acesso e respeito ao tratamento institucional de dados.
                        </p>

                        <ul className="space-y-3 text-sm text-gray-300 font-mono">
                            <li className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                                [AUTENTICAÇÃO] Camadas seguras de acesso
                            </li>
                            <li className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                                [DADOS] Diretrizes alinhadas à LGPD
                            </li>
                            <li className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                                [INFRAESTRUTURA] Continuidade e monitoramento operacional
                            </li>
                        </ul>
                    </div>
                </Reveal>
            </div>
        </section>
    )
}

// --- 8. DEPOIMENTOS ---
const Testimonials = () => {
    const tests = [
        {
            initials: 'VM',
            name: 'Viviane Marques',
            role: 'Professora Titular',
            quote: '"O PACE tornou a comunicação com as turmas muito mais prática. Hoje consigo organizar e publicar informações com muito mais clareza."',
            color: 'text-indigo-600 dark:text-indigo-400',
            bg: 'bg-indigo-100 dark:bg-indigo-900',
        },
        {
            initials: 'JZ',
            name: 'Jonas Zago',
            role: 'Aluno de TI',
            quote: '"Ter uma central única para materiais e suporte facilita bastante. No celular funciona muito bem e deixa tudo mais acessível."',
            color: 'text-emerald-600 dark:text-emerald-400',
            bg: 'bg-emerald-100 dark:bg-emerald-900',
        },
        {
            initials: 'MS',
            name: 'Marcos Silva',
            role: 'Aluno de Gestão',
            quote: '"A experiência ficou muito mais organizada. É o tipo de portal que realmente ajuda o aluno em vez de confundir."',
            color: 'text-orange-600 dark:text-orange-400',
            bg: 'bg-orange-100 dark:bg-orange-900',
        },
    ]

    return (
        <section className="py-16 sm:py-20 lg:py-24 bg-gray-50 dark:bg-gray-950">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <Reveal direction="up">
                    <div className="text-center mb-12 sm:mb-16">
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-[0.18em] text-xs sm:text-sm mb-3 block">
                            Depoimentos
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
                            Quem usa, aprova
                        </h2>
                    </div>
                </Reveal>

                <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
                    {tests.map((test, idx) => (
                        <Reveal key={idx} direction="up" delay={idx * 200}>
                            <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-[1.75rem] shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between h-full hover:shadow-xl hover:-translate-y-1 transition-all">
                                <div>
                                    <div className="text-yellow-400 text-xl mb-4">★★★★★</div>
                                    <p className="text-gray-600 dark:text-gray-300 italic mb-6 leading-relaxed">
                                        {test.quote}
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div
                                        className={`w-12 h-12 rounded-full ${test.bg} ${test.color} flex items-center justify-center font-bold text-lg shrink-0`}
                                    >
                                        {test.initials}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white leading-tight">
                                            {test.name}
                                        </h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{test.role}</p>
                                    </div>
                                </div>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    )
}

// --- 9. PREVIEW DO FAQ ---
const FaqAccordionItem = ({ question, answer }: { question: string; answer: string }) => {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden transition-all hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md min-w-0">
            <button
                type="button"
                aria-expanded={isOpen}
                className="w-full p-5 sm:p-6 flex justify-between items-start gap-4 text-left group min-w-0"
                onClick={() => setIsOpen(!isOpen)}
            >
                <h4 className="font-semibold text-gray-900 dark:text-white text-base sm:text-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex-1 min-w-0 break-words whitespace-normal text-pretty">
                    {question}
                </h4>
                <span
                    aria-hidden
                    className={`shrink-0 w-9 h-9 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-lg font-bold text-indigo-600 dark:text-indigo-400 transition-all duration-300 ${
                        isOpen
                            ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800'
                            : ''
                    }`}
                >
                    {isOpen ? '−' : '+'}
                </span>
            </button>

            <div
                className={`grid transition-all duration-300 ease-in-out ${
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
            >
                <div className="overflow-hidden min-w-0">
                    <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-0 border-t border-gray-100 dark:border-gray-700 min-w-0 break-words whitespace-normal text-pretty">
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm sm:text-base break-words whitespace-normal text-pretty max-w-full">
                            {answer}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

const FaqPreview = () => {
    const [faqItens, setFaqItens] = useState<FaqItem[]>([])

    useEffect(() => {
        const carregar = () => setFaqItens(FaqAlertService.getFaqItems())
        carregar()
        return FaqAlertService.subscribe(carregar)
    }, [])

    const itensExibidos = faqItens.slice(0, 3)

    return (
        <section id="faq" className="py-16 sm:py-20 lg:py-24 max-w-4xl mx-auto px-4 sm:px-6 text-center scroll-mt-20">
            <Reveal direction="up">
                <span className="text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-[0.18em] text-xs sm:text-sm mb-3 block">
                    FAQ
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
                    Dúvidas Frequentes
                </h2>
                <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-10 sm:mb-12 max-w-xl mx-auto">
                    Confira respostas rápidas sobre o funcionamento do portal.
                </p>
            </Reveal>

            <Reveal direction="up" delay={200}>
                <div className="text-left space-y-4 mb-10 min-w-0 overflow-x-hidden">
                    {itensExibidos.length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-400 text-center py-6">
                            Em breve novas perguntas frequentes.
                        </p>
                    ) : (
                        itensExibidos.map((item) => (
                            <FaqAccordionItem
                                key={item.id}
                                question={item.pergunta}
                                answer={item.resposta}
                            />
                        ))
                    )}
                </div>
            </Reveal>

            <Reveal direction="up" delay={400}>
                <button
                    onClick={() => (window.location.href = '/faq-completo')}
                    className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-bold text-base sm:text-lg inline-flex items-center gap-2 hover:underline active:scale-95 transition-transform"
                >
                    Ver todas as dúvidas no FAQ Completo <span>→</span>
                </button>
            </Reveal>
        </section>
    )
}

// --- 10. BOTTOM CTA ---
const BottomCTA = () => {
    return (
        <section className="py-16 sm:py-20 text-center px-4 sm:px-6 bg-gradient-to-b from-indigo-50 to-white dark:from-gray-900/70 dark:to-gray-950 border-t border-indigo-100/70 dark:border-gray-800">
            <Reveal direction="up">
                <div className="max-w-4xl mx-auto rounded-[2rem] border border-indigo-100 dark:border-gray-800 bg-white/80 dark:bg-white/[0.03] backdrop-blur-sm px-6 py-10 sm:px-10 sm:py-14 shadow-[0_20px_60px_-30px_rgba(79,70,229,0.35)]">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-5 leading-tight">
                        Pronto para transformar sua rotina?
                    </h2>
                    <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
                        Não perca tempo com informações dispersas. O PACE centraliza o que realmente importa para a sua experiência acadêmica.
                    </p>
                    <a
                        href="/sign-in"
                        className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 px-8 sm:px-10 rounded-full transition-transform duration-200 shadow-lg shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] text-base sm:text-lg"
                    >
                        Fazer Login no PACE
                    </a>
                </div>
            </Reveal>
        </section>
    )
}

// --- 11. COMPONENTE PRINCIPAL ---
const Landing = () => {
    const [isDark, setMode] = useDarkMode()
    const mode = isDark ? MODE_DARK : MODE_LIGHT

    const toggleMode = () => {
        setMode(mode === MODE_LIGHT ? MODE_DARK : MODE_LIGHT)
    }

    useEffect(() => {
        document.title = 'Portal Escolar PACE | Acesso Acadêmico'
        document.documentElement.style.scrollBehavior = 'smooth'

        let metaDescription = document.querySelector('meta[name="description"]')
        if (!metaDescription) {
            metaDescription = document.createElement('meta')
            metaDescription.setAttribute('name', 'description')
            document.head.appendChild(metaDescription)
        }
        metaDescription.setAttribute(
            'content',
            'Portal acadêmico completo para alunos, professores e gestão. Acesse materiais, comunicados e suporte em um só lugar.',
        )
    }, [])

    return (
        <main className="px-0 text-base flex flex-col min-h-screen bg-white dark:bg-gray-950 font-sans selection:bg-indigo-200 dark:selection:bg-indigo-900 scroll-smooth overflow-x-hidden">
            <NavigationBar toggleMode={toggleMode} mode={mode} />
            <SocialFloatButtons />

            <div className="relative flex-grow">
                <div
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='50' height='50' fill='none' stroke='${mode === MODE_LIGHT ? 'rgb(0 0 0 / 0.04)' : 'rgb(255 255 255 / 0.04)'}'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e")`,
                    }}
                    className="absolute inset-0 [mask-image:linear-gradient(to_bottom,white_10%,transparent_90%)] pointer-events-none select-none"
                ></div>

                <SchoolHero />
                <MarqueePartners />
                <SchoolInfrastructure />
                <HowItWorks />
                <TargetAudience />
                <SchoolFeatures />
                <SecurityAndBenefits />
                <Testimonials />
                <FaqPreview />
                <BottomCTA />
            </div>

            <div id="contato" className="scroll-mt-20">
                <LandingFooter mode={mode} />
            </div>
        </main>
    )
}

export default Landing