/**
 * Tipagens espelhando entidades e DTOs do backend Spring Boot (com.pifaculdade).
 *
 * Convenção JSON (Jackson padrão, sem PropertyNamingStrategy):
 * - camelCase nos nomes das propriedades (getters Java)
 * - boolean isAtivo() → "ativo", isActive() → "active", etc.
 * - java.time.Instant → string ISO 8601
 * - enums Java → string literal (union type)
 */

/** Valores serializados de java.time.Instant, LocalDateTime ou LocalDate */
export type IsoDateTimeString = string

// ---------------------------------------------------------------------------
// Enums (com.pifaculdade.model)
// ---------------------------------------------------------------------------

export type Role = 'ROLE_ALUNO' | 'ROLE_PROFESSOR' | 'ROLE_ADMIN'

// ---------------------------------------------------------------------------
// Entidades (com.pifaculdade.model) — respostas GET/POST/PUT
// ---------------------------------------------------------------------------

/** Entidade User — ex.: GET/POST/PUT /api/usuarios */
export type PortalUser = {
    id: number
    userName: string
    email: string
    matricula: string | null
    passwordHash: string
    cargo: Role
    authority: string[]
    active: boolean
    forcePasswordChange: boolean
    resetToken: string | null
    resetTokenExpires: IsoDateTimeString | null
    supabaseUserId: string | null
    createdAt: IsoDateTimeString
    updatedAt: IsoDateTimeString
}

/** Entidade Comunicado — ex.: GET/POST /comunicados */
export type Comunicado = {
    id: number
    titulo: string
    conteudo: string | null
    autor: string | null
    dataPublicacao: IsoDateTimeString
    publicoAlvo: string | null
    ativo: boolean
    autorId: number | null
}

/** Entidade Laboratorio — ex.: GET/POST /laboratorios */
export type Laboratorio = {
    id: number
    nome: string
    descricao: string | null
    capacidade: number | null
    localizacao: string | null
    recursos: string | null
    dataCriacao: IsoDateTimeString
    ativo: boolean
}

/** Entidade ReservaLab — ex.: GET/POST /reservas */
export type ReservaLab = {
    id: number
    laboratorioId: number | null
    laboratorioNome: string | null
    solicitanteId: number | null
    solicitanteNome: string | null
    dataReserva: string | null
    horaInicio: string | null
    horaFim: string | null
    motivo: string | null
    status: string | null
    observacao: string | null
    dataCriacao: IsoDateTimeString
    ativo: boolean
}

/** Entidade Achado — ex.: GET/POST /achados */
export type Achado = {
    id: number
    titulo: string
    descricao: string | null
    categoria: string | null
    status: string | null
    local: string | null
    dataOcorrencia: IsoDateTimeString | null
    imagemUrl: string | null
    autorId: number | null
    autorNome: string | null
    dataCriacao: IsoDateTimeString
    ativo: boolean
    devolvido: boolean
    entreguePara: string | null
}

/** Entidade Chamado — ex.: GET/POST /chamados */
export type Chamado = {
    id: number
    titulo: string
    descricao: string | null
    categoria: string | null
    status: string | null
    prioridade: string | null
    solicitanteId: number | null
    solicitanteNome: string | null
    resolvidoPor: string | null
    dataCriacao: IsoDateTimeString
    dataAtualizacao: IsoDateTimeString
    ativo: boolean
}

/** Entidade Material — ex.: GET/POST /materiais */
export type Material = {
    id: number
    titulo: string
    descricao: string | null
    tipo: string | null
    url: string | null
    disciplina: string | null
    turma: string | null
    autorId: number | null
    autorNome: string | null
    publicoAlvo: string | null
    acessos: number
    ativo: boolean
    dataCriacao: IsoDateTimeString
}

// ---------------------------------------------------------------------------
// DTOs de requisição (com.pifaculdade.dto) — corpos POST/PUT/PATCH
// ---------------------------------------------------------------------------

export type ComunicadoRequest = {
    titulo: string
    conteudo: string
    publicoAlvo?: string
}

export type LaboratorioRequest = {
    nome: string
    descricao?: string
    capacidade?: number
    localizacao?: string
    recursos?: string
}

export type ReservaLabRequest = {
    laboratorioId: number
    dataReserva: string
    horaInicio: string
    horaFim: string
    motivo: string
}

export type AchadoRequest = {
    titulo: string
    descricao: string
    categoria: string
    status?: string
    local: string
    imagemUrl?: string
}

export type ChamadoRequest = {
    titulo: string
    descricao: string
    categoria: string
    prioridade?: string
}

export type MaterialRequest = {
    titulo: string
    descricao?: string
    tipo: string
    url: string
    disciplina?: string
    turma?: string
    publicoAlvo: string
}

/** POST /api/usuarios — campo "nome" (não userName) */
export type UserCreateRequest = {
    nome?: string
    matricula?: string
    cargo?: Role
    ativo?: boolean
}

/** PUT /api/usuarios/{id} e PATCH /api/usuarios/{id}/status */
export type UpdateUserRequest = {
    nome?: string
    matricula?: string
    cargo?: Role
    ativo?: boolean
}
