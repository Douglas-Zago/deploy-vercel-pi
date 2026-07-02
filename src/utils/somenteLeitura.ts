import { MODO_APRESENTACAO_MSG } from '@/constants/apresentacao.constant'
import { useSessionUser } from '@/store/authStore'

export { MODO_APRESENTACAO_MSG }

export function isSomenteLeituraSessao(): boolean {
    return useSessionUser.getState().user.somenteLeitura === true
}

/** Bloqueia mutações quando a sessão é de apresentação (somente leitura). */
export function assertPodeEditar(): void {
    if (isSomenteLeituraSessao()) {
        throw new Error(MODO_APRESENTACAO_MSG)
    }
}
