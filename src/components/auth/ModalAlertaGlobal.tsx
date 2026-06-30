import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/auth'
import {
    FaqAlertService,
    type AlertaGlobal,
} from '@/services/FaqAlertService'

/**
 * Modal obrigatório de alerta urgente institucional.
 * Não fecha ao clicar fora — apenas com "Estou Ciente".
 */
const ModalAlertaGlobal = () => {
    const { authenticated } = useAuth()
    const [alerta, setAlerta] = useState<AlertaGlobal | null>(null)
    const [visivel, setVisivel] = useState(false)

    const avaliarAlerta = useCallback(() => {
        if (!authenticated) {
            setVisivel(false)
            setAlerta(null)
            return
        }

        const ativo = FaqAlertService.getAlertaAtivo()
        if (!ativo || FaqAlertService.usuarioLeuAlerta(ativo.id)) {
            setVisivel(false)
            setAlerta(null)
            return
        }

        setAlerta(ativo)
        setVisivel(true)
    }, [authenticated])

    useEffect(() => {
        avaliarAlerta()
        return FaqAlertService.subscribe(avaliarAlerta)
    }, [avaliarAlerta])

    useEffect(() => {
        if (!visivel) return
        const prev = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => {
            document.body.style.overflow = prev
        }
    }, [visivel])

    const handleCiente = () => {
        if (!alerta) return
        FaqAlertService.marcarAlertaComoLido(alerta.id)
        setVisivel(false)
        setAlerta(null)
    }

    if (!visivel || !alerta) {
        return null
    }

    return (
        <div
            className="fixed inset-0 z-[250] flex items-center justify-center p-4 sm:p-6"
            aria-modal="true"
            role="alertdialog"
            aria-labelledby="modal-alerta-global-titulo"
            aria-describedby="modal-alerta-global-mensagem"
        >
            <div
                className="absolute inset-0 bg-gray-900/65 backdrop-blur-[3px] dark:bg-black/75"
                aria-hidden
            />

            <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700 p-6 sm:p-8 flex flex-col gap-5 max-h-[min(90vh,560px)] overflow-y-auto">
                <div className="flex items-start gap-3 shrink-0">
                    <span
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/40 text-xl"
                        aria-hidden
                    >
                        ⚠️
                    </span>
                    <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">
                            Alerta urgente
                        </p>
                        <h2
                            id="modal-alerta-global-titulo"
                            className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white break-words leading-snug"
                        >
                            {alerta.titulo}
                        </h2>
                    </div>
                </div>

                <p
                    id="modal-alerta-global-mensagem"
                    className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap break-words"
                >
                    {alerta.mensagem}
                </p>

                <button
                    type="button"
                    onClick={handleCiente}
                    className="w-full min-h-[48px] rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold text-base shadow-lg shadow-indigo-500/30 transition-colors cursor-pointer shrink-0"
                >
                    Estou Ciente
                </button>
            </div>
        </div>
    )
}

export default ModalAlertaGlobal
