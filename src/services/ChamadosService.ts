import ApiService from './ApiService'
import appConfig from '@/configs/app.config'
import { assertPodeEditar } from '@/utils/somenteLeitura'
import type { Chamado, ChamadoRequest } from '@/@types/portal'

export type { Chamado } from '@/@types/portal'

const USE_MOCK = appConfig.enableMock

let mockChamados: Chamado[] = [
    {
        id: 101,
        titulo: 'Projetor sem sinal',
        categoria: 'Sala de Aula',
        descricao: 'O projetor da sala 302 não liga de jeito nenhum, a luz vermelha fica piscando.',
        solicitanteNome: 'João Professor',
        solicitanteId: null,
        status: 'Aberto',
        prioridade: null,
        resolvidoPor: null,
        dataCriacao: '2026-04-07T12:00:00.000Z',
        dataAtualizacao: '2026-04-07T12:00:00.000Z',
        ativo: true,
    },
    {
        id: 102,
        titulo: 'Internet caindo',
        categoria: 'Laboratório',
        descricao: 'Os PCs da fileira do fundo no Lab 01 estão sem conexão de rede desde ontem.',
        solicitanteNome: 'Prof. Silva',
        solicitanteId: null,
        status: 'Em Análise',
        prioridade: null,
        resolvidoPor: null,
        dataCriacao: '2026-04-06T12:00:00.000Z',
        dataAtualizacao: '2026-04-06T14:00:00.000Z',
        ativo: true,
    },
    {
        id: 103,
        titulo: 'Ar condicionado vazando',
        categoria: 'Área Comum',
        descricao: 'Pingando água em cima das mesas na biblioteca.',
        solicitanteNome: 'João Professor',
        solicitanteId: null,
        status: 'Resolvido',
        prioridade: null,
        resolvidoPor: 'Equipe de Manutenção',
        dataCriacao: '2026-04-02T12:00:00.000Z',
        dataAtualizacao: '2026-04-03T10:00:00.000Z',
        ativo: true,
    },
]

const simulateDelay = () => new Promise((resolve) => setTimeout(resolve, 600))

export const ChamadosService = {
    getAll: async (): Promise<Chamado[]> => {
        if (USE_MOCK) {
            await simulateDelay()
            return [...mockChamados].sort((a, b) => b.id - a.id)
        }
        return ApiService.fetchDataWithAxios<Chamado[]>({ url: '/chamados', method: 'get' })
    },

    create: async (
        novoChamado: ChamadoRequest & { solicitanteNome: string; solicitanteId?: number | null },
    ): Promise<void> => {
        assertPodeEditar()
        if (USE_MOCK) {
            await simulateDelay()
            const agora = new Date().toISOString()
            const novo: Chamado = {
                id: Math.floor(Math.random() * 10000),
                titulo: novoChamado.titulo,
                descricao: novoChamado.descricao,
                categoria: novoChamado.categoria,
                prioridade: novoChamado.prioridade ?? null,
                status: 'Aberto',
                solicitanteId: novoChamado.solicitanteId ?? null,
                solicitanteNome: novoChamado.solicitanteNome,
                resolvidoPor: null,
                dataCriacao: agora,
                dataAtualizacao: agora,
                ativo: true,
            }
            mockChamados.push(novo)
            return
        }
        return ApiService.fetchDataWithAxios<void>({ url: '/chamados', method: 'post', data: novoChamado })
    },

    updateStatus: async (id: number, novoStatus: string): Promise<void> => {
        assertPodeEditar()
        if (USE_MOCK) {
            await simulateDelay()
            mockChamados = mockChamados.map((c) =>
                c.id === id
                    ? { ...c, status: novoStatus, dataAtualizacao: new Date().toISOString() }
                    : c,
            )
            return
        }
        return ApiService.fetchDataWithAxios<void>({
            url: `/chamados/${id}/status`,
            method: 'patch',
            data: { status: novoStatus },
        })
    },
}
