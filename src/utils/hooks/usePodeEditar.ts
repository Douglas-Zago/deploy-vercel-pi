import { isPerfilGestao, PROFESSOR } from '@/constants/roles.constant'
import { useSessionUser } from '@/store/authStore'

/**
 * Permissões de edição da sessão atual.
 * Usuário de apresentação mantém visão de gestão (menus/rotas), mas não pode alterar dados.
 */
export function usePodeEditar() {
    const user = useSessionUser((state) => state.user)
    const authority = user.authority
    const somenteLeitura = user.somenteLeitura === true
    const podeEditar = !somenteLeitura
    const isGestao = isPerfilGestao(authority)
    const isProfessor = authority?.includes(PROFESSOR) ?? false

    return {
        somenteLeitura,
        podeEditar,
        /** Visão de gestão (menus, abas, painéis) — independente de edição */
        isGestao,
        /** Ações de gestão que alteram dados */
        isGestaoEditavel: isGestao && podeEditar,
        isProfessor,
        /** Professor ou gestão podem enviar conteúdo (exceto modo apresentação) */
        podeOperar: podeEditar && (isGestao || isProfessor),
    }
}
