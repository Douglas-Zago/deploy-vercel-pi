import { usePodeEditar } from '@/utils/hooks/usePodeEditar'

const ModoApresentacaoBanner = () => {
    const { somenteLeitura } = usePodeEditar()

    if (!somenteLeitura) return null

    return (
        <div
            role="status"
            className="sticky top-0 z-40 flex items-center justify-center gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm font-medium text-amber-900 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-100"
        >
            <span aria-hidden className="text-base">
                👁️
            </span>
            <span>
                Modo apresentação — visualização completa. Alterações estão desativadas nesta
                conta.
            </span>
        </div>
    )
}

export default ModoApresentacaoBanner
