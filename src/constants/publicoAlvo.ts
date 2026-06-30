import type { User } from '@/@types/auth'
import { isPerfilGestao } from '@/constants/roles.constant'

/** Opções de segmentação de conteúdo (Mural, Calendário, etc.) */
export const PUBLICO_ALVO_OPCOES = [
    'Colégio Todo',
    '9º Ano A',
    '3º Ano B',
    'Turma Única',
    'Professores',
] as const

export type PublicoAlvo = (typeof PUBLICO_ALVO_OPCOES)[number]

/** Valor do select de filtro no cabeçalho: todas as turmas ou uma opção específica */
export const FILTRO_PUBLICO_TODOS = 'todos' as const
export type FiltroPublicoAlvoCabecalho = typeof FILTRO_PUBLICO_TODOS | PublicoAlvo

/** Texto curto para badge nos cards */
export function rotuloBadgePublico(publicoAlvo: PublicoAlvo): string {
    return `Para: ${publicoAlvo}`
}

/**
 * Direção e Coordenação vêem tudo.
 * Professor com turma "Todas" (ou vazia) vê tudo.
 * Demais casos: vê "Colégio Todo", conteúdo da própria turma (quando definida) e, se for professor, conteúdo "Professores".
 */
export function usuarioVeConteudoPorPublicoAlvo(
    user: User | undefined | null,
    publicoAlvo: PublicoAlvo | undefined,
): boolean {
    const alvo = publicoAlvo ?? 'Colégio Todo'
    const authority = user?.authority ?? []
    const turma = user?.turma?.trim() ?? ''

    if (isPerfilGestao(authority)) return true

    const isProfessor = authority.includes('professor')
    if (isProfessor && (turma === 'Todas' || turma === '')) return true

    if (alvo === 'Colégio Todo') return true

    if (isProfessor && alvo === 'Professores') return true

    if (turma && turma !== 'Todas' && alvo === turma) return true

    return false
}
