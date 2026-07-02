import Reveal from '@/components/ui/Reveal'
import {
    TERMOS_DE_USO_SECOES,
    TERMOS_DATA_ATUALIZACAO,
    TERMOS_SUBTITULO,
    TERMOS_TITULO,
    TERMOS_VERSAO,
    getTermosParagrafosRenderizados,
} from '@/constants/termosDeUso'

type TermosDeUsoModalProps = {
    isOpen: boolean
    onClose: () => void
    onAccept?: () => void
}

const TermosDeUsoModal = ({ isOpen, onClose, onAccept }: TermosDeUsoModalProps) => {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/55 backdrop-blur-sm">
            <Reveal direction="down" duration={0.3} className="w-full max-w-3xl">
                <div className="bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-gray-100 dark:border-gray-800">
                    <div className="px-5 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-start sm:items-center gap-4 bg-gray-50/70 dark:bg-gray-800/50">
                        <div className="min-w-0">
                            <p className="text-[11px] uppercase tracking-[0.22em] font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                                {TERMOS_SUBTITULO}
                            </p>
                            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white leading-tight">
                                {TERMOS_TITULO}
                            </h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Versão {TERMOS_VERSAO} · Atualizado em {TERMOS_DATA_ATUALIZACAO}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
                            aria-label="Fechar termos de uso"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="p-5 sm:p-6 overflow-y-auto text-sm text-gray-600 dark:text-gray-400 leading-7 space-y-6 [scrollbar-width:thin] [scrollbar-color:rgba(99,102,241,0.45)_transparent]">
                        {TERMOS_DE_USO_SECOES.map((secao) => (
                            <section key={secao.titulo} className="space-y-2">
                                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                    {secao.titulo}
                                </h3>
                                {getTermosParagrafosRenderizados(secao).map((paragrafo) => (
                                    <p key={paragrafo.slice(0, 48)}>{paragrafo}</p>
                                ))}
                            </section>
                        ))}
                    </div>

                    <div className="px-5 sm:px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex flex-col-reverse sm:flex-row justify-end gap-3 bg-gray-50/60 dark:bg-gray-800/50">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 text-gray-600 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            Fechar
                        </button>
                        {onAccept && (
                            <button
                                type="button"
                                onClick={onAccept}
                                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all shadow-sm active:scale-[0.98]"
                            >
                                Li e Aceito
                            </button>
                        )}
                    </div>
                </div>
            </Reveal>
        </div>
    )
}

export default TermosDeUsoModal
