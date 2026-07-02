import type { AuthUserResponse } from '@/@types/auth'
import { APRESENTACAO_LOGIN_ALIASES } from '@/constants/apresentacao.constant'
import { ALUNO, COORDENACAO, DIRECAO, PROFESSOR } from '@/constants/roles.constant'

export const MOCK_PACE_USERS_KEY = 'mock_pace_users'

/** Usuários mock — campos extras (password, matricula, cpf) só para validação local */
export type MockSignInUser = AuthUserResponse & {
    matricula: string
    cpf: string
    password: string
    avatar?: string
    turma?: string | null
    somenteLeitura?: boolean
}

/** Gera senha padrão: Pace@ + 3 primeiros dígitos numéricos do CPF */
export function initialPasswordFromCpf(cpf: string): string {
    const digits = cpf.replace(/\D/g, '')
    return `Pace@${digits.slice(0, 3)}`
}

/**
 * Credenciais de demonstração (RC offline):
 * login por e-mail + senha (Pace@ + 3 primeiros dígitos do CPF)
 */
const DEFAULT_SIGN_IN_USERS: MockSignInUser[] = [
    {
        userId: '99',
        avatar: '',
        userName: 'Direção (Apresentação)',
        email: 'apresentacao@pace.edu.br',
        matricula: 'APRESERVED001',
        cpf: '00000000001',
        authority: [DIRECAO],
        turma: 'Todas',
        password: '123',
        active: true,
        primeiroAcesso: false,
        somenteLeitura: true,
    },
    {
        userId: '1',
        avatar: '',
        userName: 'Douglas Direção',
        email: 'douglas.direcao@pace.edu.br',
        matricula: 'DIR001',
        cpf: '12345678900',
        authority: [DIRECAO],
        turma: 'Todas',
        password: 'Pace@123',
        active: true,
        primeiroAcesso: false,
    },
    {
        userId: '6',
        avatar: '',
        userName: 'Carla Coordenação',
        email: 'carla.coord@pace.edu.br',
        matricula: 'COO001',
        cpf: '45678901234',
        authority: [COORDENACAO],
        turma: 'Todas',
        password: 'Pace@456',
        active: true,
        primeiroAcesso: false,
    },
    {
        userId: '2',
        avatar: '',
        userName: 'João Professor',
        email: 'joao.professor@pace.edu.br',
        matricula: 'PRF001',
        cpf: '78901234567',
        authority: [PROFESSOR],
        turma: 'Todas',
        password: 'Pace@789',
        active: true,
        primeiroAcesso: false,
    },
    {
        userId: '3',
        avatar: '',
        userName: 'Maria Aluna',
        email: 'maria.aluna@pace.edu.br',
        matricula: 'ALN2024',
        cpf: '11122233344',
        authority: [ALUNO],
        turma: '9º Ano A - Ensino Fundamental',
        password: 'Pace@111',
        active: true,
        primeiroAcesso: true,
    },
]

function readStoredUsers(): MockSignInUser[] | null {
    try {
        const raw = localStorage.getItem(MOCK_PACE_USERS_KEY)
        if (!raw) return null
        const parsed = JSON.parse(raw) as MockSignInUser[]
        return Array.isArray(parsed) ? parsed : null
    } catch {
        return null
    }
}

function writeStoredUsers(users: MockSignInUser[]): void {
    localStorage.setItem(MOCK_PACE_USERS_KEY, JSON.stringify(users))
}

/** Mescla defaults do código com dados persistidos (avatar, primeiroAcesso, etc.) */
function mergeWithDefaults(stored: MockSignInUser[]): MockSignInUser[] {
    const extras = stored.filter(
        (u) => !DEFAULT_SIGN_IN_USERS.some((d) => d.userId === u.userId || d.email === u.email),
    )

    const merged = DEFAULT_SIGN_IN_USERS.map((defaultUser) => {
        const saved = stored.find(
            (u) => u.userId === defaultUser.userId || u.email === defaultUser.email,
        )
        if (!saved) return { ...defaultUser }
        return {
            ...defaultUser,
            ...saved,
            password: saved.password || defaultUser.password,
            cpf: saved.cpf || defaultUser.cpf,
            somenteLeitura: defaultUser.somenteLeitura ?? saved.somenteLeitura,
        }
    })

    return [...merged, ...extras]
}

/** Carrega usuários mock do localStorage (ou semeia com os defaults) */
export function getSignInUserData(): MockSignInUser[] {
    const stored = readStoredUsers()
    if (!stored) {
        writeStoredUsers(DEFAULT_SIGN_IN_USERS)
        return [...DEFAULT_SIGN_IN_USERS]
    }

    const merged = mergeWithDefaults(stored)
    writeStoredUsers(merged)
    return merged
}

export function saveSignInUserData(users: MockSignInUser[]): void {
    writeStoredUsers(users)
}

export function updateMockUser(
    userId: string,
    patch: Partial<Omit<MockSignInUser, 'userId'>>,
): void {
    const users = getSignInUserData()
    const idx = users.findIndex((u) => u.userId === userId)
    if (idx === -1) return
    users[idx] = { ...users[idx], ...patch }
    saveSignInUserData(users)
}

export function appendMockUser(user: MockSignInUser): void {
    const users = getSignInUserData()
    users.push(user)
    saveSignInUserData(users)
}

export function findMockUserByEmail(email: string): MockSignInUser | undefined {
    const normalized = email.trim().toLowerCase()
    return getSignInUserData().find((u) => u.email.toLowerCase() === normalized)
}

/** Resolve login por e-mail ou alias simplificado (ex.: "direcao" para apresentação). */
export function findMockUserByLogin(login: string): MockSignInUser | undefined {
    const normalized = login.trim().toLowerCase()
    const byEmail = findMockUserByEmail(normalized)
    if (byEmail) return byEmail

    if ((APRESENTACAO_LOGIN_ALIASES as readonly string[]).includes(normalized)) {
        return getSignInUserData().find((u) => u.somenteLeitura === true)
    }

    return undefined
}
