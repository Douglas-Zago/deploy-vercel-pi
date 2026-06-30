import React from 'react'
import { FaWhatsapp, FaInstagram } from 'react-icons/fa'

const WHATSAPP_URL = 'https://wa.me/5511999999999'
const INSTAGRAM_URL = 'https://instagram.com'

interface LandingFooterProps {
    mode?: string
}

const LandingFooter = ({ mode }: LandingFooterProps) => {
    const anoAtual = new Date().getFullYear()

    return (
        <footer className="relative overflow-hidden border-t border-gray-200/80 dark:border-gray-800 bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-950 transition-colors duration-300">
            {/* Glow decorativo sutil */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent dark:via-indigo-500/30" />
            <div className="pointer-events-none absolute -top-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-500/10" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-14 lg:pt-16 pb-8">
                {/* BLOCO SUPERIOR */}
                <div className="mb-10 sm:mb-12 lg:mb-16 rounded-3xl border border-gray-200/80 dark:border-gray-800 bg-white/70 dark:bg-white/[0.02] backdrop-blur-sm shadow-[0_10px_40px_-20px_rgba(79,70,229,0.35)] dark:shadow-[0_10px_40px_-20px_rgba(99,102,241,0.18)]">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-12 p-6 sm:p-8 lg:p-10">
                        {/* COLUNA 1: BRANDING */}
                        <div className="lg:col-span-1">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="relative">
                                    <div className="absolute inset-0 rounded-2xl bg-indigo-500/25 blur-lg" />
                                    <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-500/30">
                                        P
                                    </div>
                                </div>

                                <div className="min-w-0">
                                    <span className="block text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 tracking-tight">
                                        PACE
                                    </span>
                                    <span className="block text-[11px] uppercase tracking-[0.24em] text-gray-400 dark:text-gray-500 font-bold -mt-0.5">
                                        Portal Escolar
                                    </span>
                                </div>
                            </div>

                            <p className="text-gray-600 dark:text-gray-400 text-sm leading-7 mb-6 pr-0 sm:pr-4">
                                Portal de Apoio e Comunicação Escolar. Um ecossistema digital pensado para conectar
                                alunos, professores e a gestão com mais clareza, organização e segurança.
                            </p>

                            <div className="flex items-center gap-3">
                                <a
                                    href={WHATSAPP_URL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="WhatsApp"
                                    className="w-11 h-11 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 hover:border-emerald-300 dark:hover:border-emerald-700 hover:-translate-y-0.5 transition-all flex items-center justify-center shadow-sm"
                                >
                                    <FaWhatsapp className="w-5 h-5" aria-hidden="true" />
                                </a>

                                <a
                                    href={INSTAGRAM_URL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Instagram"
                                    className="w-11 h-11 rounded-2xl border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:border-indigo-300 dark:hover:border-indigo-700 hover:-translate-y-0.5 transition-all flex items-center justify-center shadow-sm"
                                >
                                    <FaInstagram className="w-5 h-5" aria-hidden="true" />
                                </a>
                            </div>
                        </div>

                        {/* COLUNA 2: ACESSO RÁPIDO */}
                        <div>
                            <h4 className="text-gray-900 dark:text-white font-bold text-lg mb-5 tracking-tight">
                                Acesso Rápido
                            </h4>
                            <ul className="space-y-3.5">
                                <li>
                                    <a
                                        href="/sign-in"
                                        className="group inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium"
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-700 group-hover:bg-indigo-500 transition-colors"></span>
                                        Acessar o Portal
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="/mural-comunicados"
                                        className="group inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium"
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-700 group-hover:bg-indigo-500 transition-colors"></span>
                                        Mural de Avisos
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="/central-materiais"
                                        className="group inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium"
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-700 group-hover:bg-indigo-500 transition-colors"></span>
                                        Links e Materiais
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="/agenda"
                                        className="group inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium"
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-700 group-hover:bg-indigo-500 transition-colors"></span>
                                        Agenda Escolar
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* COLUNA 3: SUPORTE */}
                        <div>
                            <h4 className="text-gray-900 dark:text-white font-bold text-lg mb-5 tracking-tight">
                                Suporte
                            </h4>
                            <ul className="space-y-3.5">
                                <li>
                                    <a
                                        href="/faq"
                                        className="group inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium"
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-700 group-hover:bg-indigo-500 transition-colors"></span>
                                        Central de Ajuda (FAQ)
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="/chamados"
                                        className="group inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium"
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-700 group-hover:bg-indigo-500 transition-colors"></span>
                                        Abertura de Chamados
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="/calendario"
                                        className="group inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium"
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-700 group-hover:bg-indigo-500 transition-colors"></span>
                                        Calendário Institucional
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* COLUNA 4: CONTATO */}
                        <div>
                            <h4 className="text-gray-900 dark:text-white font-bold text-lg mb-5 tracking-tight">
                                Contato
                            </h4>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3 text-gray-600 dark:text-gray-400">
                                    <span className="mt-1 text-base">📍</span>
                                    <span className="font-medium leading-6">
                                        Av. da Educação, 1234
                                        <br />
                                        Centro, Cidade - UF
                                    </span>
                                </li>

                                <li className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                                    <span className="text-base">📧</span>
                                    <a
                                        href="mailto:contato@pace.edu.br"
                                        className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium break-all"
                                    >
                                        contato@pace.edu.br
                                    </a>
                                </li>

                                <li className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                                    <span className="text-base">📞</span>
                                    <span className="font-medium">(00) 4000-0000</span>
                                </li>
                            </ul>

                            <div className="mt-6 rounded-2xl border border-indigo-100 dark:border-indigo-900/60 bg-indigo-50/80 dark:bg-indigo-950/30 p-4">
                                <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300 mb-1">
                                    Atendimento institucional
                                </p>
                                <p className="text-sm text-indigo-600/90 dark:text-indigo-400/90 leading-6">
                                    Suporte pedagógico, operacional e administrativo em um só lugar.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* BLOCO INFERIOR */}
                <div className="pt-6 border-t border-gray-200/80 dark:border-gray-800 flex flex-col lg:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-500 dark:text-gray-500 font-medium text-center lg:text-left">
                        &copy; {anoAtual} <span className="text-gray-800 dark:text-gray-300 font-bold">PACE</span>. Todos os direitos reservados.
                    </p>

                    <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
                        <a
                            href="/sign-in"
                            className="text-gray-500 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium"
                        >
                            Termos de Uso
                        </a>
                        <a
                            href="/sign-in"
                            className="text-gray-500 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium"
                        >
                            Política de Privacidade (LGPD)
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default LandingFooter