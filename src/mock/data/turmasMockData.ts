export type NivelEnsino = 'Ensino Fundamental' | 'Ensino Médio'
export type TurnoTurma = 'Matutino' | 'Vespertino' | 'Integral'

export interface TurmaMock {
    id: string
    nome: string
    nivel: NivelEnsino
    turno: TurnoTurma
    capacidade: number
}

/** Turmas pré-cadastradas para demonstração (sem tela de CRUD no MVP). */
export const TURMAS_MOCK: TurmaMock[] = [
    {
        id: '1',
        nome: '6º Ano A - Ensino Fundamental',
        nivel: 'Ensino Fundamental',
        turno: 'Matutino',
        capacidade: 35,
    },
    {
        id: '2',
        nome: '6º Ano B - Ensino Fundamental',
        nivel: 'Ensino Fundamental',
        turno: 'Vespertino',
        capacidade: 32,
    },
    {
        id: '3',
        nome: '7º Ano A - Ensino Fundamental',
        nivel: 'Ensino Fundamental',
        turno: 'Matutino',
        capacidade: 34,
    },
    {
        id: '4',
        nome: '8º Ano A - Ensino Fundamental',
        nivel: 'Ensino Fundamental',
        turno: 'Matutino',
        capacidade: 30,
    },
    {
        id: '5',
        nome: '9º Ano A - Ensino Fundamental',
        nivel: 'Ensino Fundamental',
        turno: 'Matutino',
        capacidade: 28,
    },
    {
        id: '6',
        nome: '9º Ano B - Ensino Fundamental',
        nivel: 'Ensino Fundamental',
        turno: 'Vespertino',
        capacidade: 27,
    },
    {
        id: '7',
        nome: '1º Ano A - Ensino Médio',
        nivel: 'Ensino Médio',
        turno: 'Matutino',
        capacidade: 40,
    },
    {
        id: '8',
        nome: '1º Ano B - Ensino Médio',
        nivel: 'Ensino Médio',
        turno: 'Vespertino',
        capacidade: 38,
    },
    {
        id: '9',
        nome: '2º Ano A - Ensino Médio',
        nivel: 'Ensino Médio',
        turno: 'Matutino',
        capacidade: 36,
    },
    {
        id: '10',
        nome: '3º Ano A - Ensino Médio',
        nivel: 'Ensino Médio',
        turno: 'Matutino',
        capacidade: 33,
    },
    {
        id: '11',
        nome: '3º Ano B - Ensino Médio',
        nivel: 'Ensino Médio',
        turno: 'Integral',
        capacidade: 30,
    },
    {
        id: '12',
        nome: 'Turma Única - Educação Especial',
        nivel: 'Ensino Fundamental',
        turno: 'Matutino',
        capacidade: 12,
    },
]

/** Nomes exibidos em selects e filtros de público-alvo. */
export const TURMAS_NOMES = TURMAS_MOCK.map((t) => t.nome)
