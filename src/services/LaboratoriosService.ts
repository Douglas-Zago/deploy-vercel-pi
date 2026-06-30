import ApiService from './ApiService'
import appConfig from '@/configs/app.config'
import type { Laboratorio, LaboratorioRequest, ReservaLab, ReservaLabRequest } from '@/@types/portal'

export type { Laboratorio, ReservaLab } from '@/@types/portal'

const USE_MOCK = appConfig.enableMock

let mockLaboratorios: Laboratorio[] = [
    {
        id: 1,
        nome: 'Laboratório de Informática 01',
        descricao: null,
        capacidade: 30,
        localizacao: 'Bloco A — 2º andar',
        recursos: '30 PCs Desktop, 1 Lousa Digital, Ar Condicionado',
        dataCriacao: '2026-01-01T12:00:00.000Z',
        ativo: true,
    },
    {
        id: 2,
        nome: 'Laboratório de Informática 02',
        descricao: null,
        capacidade: 25,
        localizacao: 'Bloco A — 2º andar',
        recursos: '25 iMacs, Projetor 4K',
        dataCriacao: '2026-01-01T12:00:00.000Z',
        ativo: true,
    },
    {
        id: 3,
        nome: 'Laboratório Maker',
        descricao: null,
        capacidade: 15,
        localizacao: 'Bloco B — térreo',
        recursos: 'Impressora 3D, Kits Arduino, Ferramentas',
        dataCriacao: '2026-01-01T12:00:00.000Z',
        ativo: true,
    },
]

let mockReservas: ReservaLab[] = [
    {
        id: 1,
        laboratorioId: 1,
        laboratorioNome: 'Laboratório de Informática 01',
        solicitanteId: null,
        solicitanteNome: 'Prof. Silva',
        dataReserva: new Date().toISOString().split('T')[0],
        horaInicio: '08:00',
        horaFim: '09:40',
        motivo: 'Aula de Algoritmos',
        status: 'confirmado',
        observacao: null,
        dataCriacao: new Date().toISOString(),
        ativo: true,
    },
    {
        id: 2,
        laboratorioId: 1,
        laboratorioNome: 'Laboratório de Informática 01',
        solicitanteId: null,
        solicitanteNome: 'Equipe de TI',
        dataReserva: new Date().toISOString().split('T')[0],
        horaInicio: '10:00',
        horaFim: '12:00',
        motivo: 'Manutenção Preventiva',
        status: 'pendente',
        observacao: null,
        dataCriacao: new Date().toISOString(),
        ativo: true,
    },
]

const simulateDelay = () => new Promise((resolve) => setTimeout(resolve, 600))

const nextLabId = () => Math.max(0, ...mockLaboratorios.map((l) => l.id)) + 1
const nextReservaId = () => Math.max(0, ...mockReservas.map((r) => r.id)) + 1

export const LaboratoriosService = {
    getLaboratorios: async (): Promise<Laboratorio[]> => {
        if (USE_MOCK) {
            await simulateDelay()
            return [...mockLaboratorios]
        }
        return ApiService.fetchDataWithAxios<Laboratorio[]>({ url: '/laboratorios', method: 'get' })
    },

    salvarLaboratorio: async (lab: LaboratorioRequest & { id?: number }): Promise<void> => {
        if (USE_MOCK) {
            await simulateDelay()
            if (lab.id) {
                mockLaboratorios = mockLaboratorios.map((l) =>
                    l.id === lab.id
                        ? {
                              ...l,
                              nome: lab.nome,
                              descricao: lab.descricao ?? l.descricao,
                              capacidade: lab.capacidade ?? l.capacidade,
                              localizacao: lab.localizacao ?? l.localizacao,
                              recursos: lab.recursos ?? l.recursos,
                          }
                        : l,
                )
            } else {
                mockLaboratorios.push({
                    id: nextLabId(),
                    nome: lab.nome,
                    descricao: lab.descricao ?? null,
                    capacidade: lab.capacidade ?? null,
                    localizacao: lab.localizacao ?? null,
                    recursos: lab.recursos ?? null,
                    dataCriacao: new Date().toISOString(),
                    ativo: true,
                })
            }
            return
        }

        return lab.id
            ? ApiService.fetchDataWithAxios<void>({ url: `/laboratorios/${lab.id}`, method: 'put', data: lab })
            : ApiService.fetchDataWithAxios<void>({ url: '/laboratorios', method: 'post', data: lab })
    },

    deletarLaboratorio: async (id: number): Promise<void> => {
        if (USE_MOCK) {
            await simulateDelay()
            mockLaboratorios = mockLaboratorios.filter((l) => l.id !== id)
            mockReservas = mockReservas.filter((r) => r.laboratorioId !== id)
            return
        }
        return ApiService.fetchDataWithAxios<void>({ url: `/laboratorios/${id}`, method: 'delete' })
    },

    getReservas: async (): Promise<ReservaLab[]> => {
        if (USE_MOCK) {
            await simulateDelay()
            return [...mockReservas]
        }
        return ApiService.fetchDataWithAxios<ReservaLab[]>({ url: '/reservas', method: 'get' })
    },

    createReserva: async (
        novaReserva: ReservaLabRequest & {
            solicitanteNome?: string | null
            solicitanteId?: number | null
            status?: string | null
            laboratorioNome?: string | null
        },
    ): Promise<void> => {
        if (USE_MOCK) {
            await simulateDelay()
            mockReservas.push({
                id: nextReservaId(),
                laboratorioId: novaReserva.laboratorioId,
                laboratorioNome: novaReserva.laboratorioNome ?? null,
                solicitanteId: novaReserva.solicitanteId ?? null,
                solicitanteNome: novaReserva.solicitanteNome ?? null,
                dataReserva: novaReserva.dataReserva,
                horaInicio: novaReserva.horaInicio,
                horaFim: novaReserva.horaFim,
                motivo: novaReserva.motivo,
                status: novaReserva.status ?? 'pendente',
                observacao: null,
                dataCriacao: new Date().toISOString(),
                ativo: true,
            })
            return
        }
        return ApiService.fetchDataWithAxios<void>({ url: '/reservas', method: 'post', data: novaReserva })
    },

    aprovarReserva: async (id: number): Promise<void> => {
        if (USE_MOCK) {
            await simulateDelay()
            mockReservas = mockReservas.map((r) =>
                r.id === id ? { ...r, status: 'confirmado' } : r,
            )
            return
        }
        return ApiService.fetchDataWithAxios<void>({ url: `/reservas/${id}/aprovar`, method: 'patch' })
    },

    reverterReserva: async (id: number): Promise<void> => {
        if (USE_MOCK) {
            await simulateDelay()
            mockReservas = mockReservas.map((r) =>
                r.id === id ? { ...r, status: 'pendente' } : r,
            )
            return
        }
        return ApiService.fetchDataWithAxios<void>({ url: `/reservas/${id}/reverter`, method: 'patch' })
    },

    deletarReserva: async (id: number): Promise<void> => {
        if (USE_MOCK) {
            await simulateDelay()
            mockReservas = mockReservas.filter((r) => r.id !== id)
            return
        }
        return ApiService.fetchDataWithAxios<void>({ url: `/reservas/${id}`, method: 'delete' })
    },
}
