/** Papéis de acesso (authority) do portal PACE — valores em minúsculas para rotas e menu */
export const DIRECAO = 'direcao'
export const COORDENACAO = 'coordenacao'
export const PROFESSOR = 'professor'
export const ALUNO = 'aluno'

/** @deprecated Use {@link DIRECAO} — alias para compatibilidade com rotas do template */
export const ADMIN = DIRECAO

export const PAPEL_PAINEL_ACADEMICO = [DIRECAO, COORDENACAO, PROFESSOR, ALUNO] as const
export const PAPEL_TODOS_LOGADOS = [DIRECAO, COORDENACAO, PROFESSOR, ALUNO] as const
/** Operação escolar: Chamados e Laboratórios — Direção, Coordenação e Professor */
export const PAPEL_OPERACIONAL = [DIRECAO, COORDENACAO, PROFESSOR] as const
/** Operação escolar exclusiva de gestão — Direção e Coordenação */
export const PAPEL_GESTAO_ESCOLAR = [DIRECAO, COORDENACAO] as const
export const PAPEL_SOMENTE_DIRECAO = [DIRECAO] as const
export const PAPEL_GESTAO_DIRECAO_COORDENACAO = [DIRECAO, COORDENACAO] as const
export const PAPEL_COORDENACAO_ACHADOS = [DIRECAO, COORDENACAO, PROFESSOR, ALUNO] as const
export const PAPEL_UTILIDADES_GERAL = [DIRECAO, COORDENACAO, PROFESSOR, ALUNO] as const

export function isDirecaoAuthority(authority?: string[] | null): boolean {
    return authority?.includes(DIRECAO) ?? false
}

export function isPerfilGestao(authority?: string[] | null): boolean {
    if (!authority?.length) return false
    return authority.includes(DIRECAO) || authority.includes(COORDENACAO)
}
