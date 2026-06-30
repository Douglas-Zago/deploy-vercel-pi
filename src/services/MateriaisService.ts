import ApiService from './ApiService'
import appConfig from '@/configs/app.config'
import type { Material, MaterialRequest } from '@/@types/portal'

export type { Material } from '@/@types/portal'

export let materiaisMock: Material[] = [
    {
        id: 1,
        titulo: 'Portal do Ministério da Educação (MEC)',
        descricao: null,
        tipo: 'Institucional',
        url: 'http://portal.mec.gov.br/',
        disciplina: null,
        turma: null,
        dataCriacao: '2026-01-10T12:00:00.000Z',
        acessos: 145,
        autorNome: 'Equipe Gestora',
        autorId: null,
        publicoAlvo: 'Colégio Todo',
        ativo: true,
    },
    {
        id: 2,
        titulo: 'Guia de Boas Práticas Digitais',
        descricao: null,
        tipo: 'Artigo',
        url: 'https://exemplo.com/guia-digital',
        disciplina: null,
        turma: null,
        dataCriacao: '2026-03-15T12:00:00.000Z',
        acessos: 32,
        autorNome: 'Equipe Gestora',
        autorId: null,
        publicoAlvo: 'Professores',
        ativo: true,
    },
    {
        id: 3,
        titulo: 'Regimento Interno PACE 2026',
        descricao: null,
        tipo: 'Documento',
        url: '/arquivos/regimento-2026.pdf',
        disciplina: null,
        turma: null,
        dataCriacao: '2026-02-01T12:00:00.000Z',
        acessos: 89,
        autorNome: 'Equipe Gestora',
        autorId: null,
        publicoAlvo: 'Colégio Todo',
        ativo: true,
    },
    {
        id: 4,
        titulo: 'Vídeo: Como estruturar seu TCC',
        descricao: null,
        tipo: 'Video',
        url: 'https://youtube.com/...',
        disciplina: null,
        turma: null,
        dataCriacao: new Date().toISOString(),
        acessos: 0,
        autorNome: 'Prof. Douglas',
        autorId: null,
        publicoAlvo: '9º Ano A',
        ativo: false,
    },
    {
        id: 5,
        titulo: 'Lista de exercícios — Física (interclasses)',
        descricao: null,
        tipo: 'Documento',
        url: 'https://exemplo.com/fisica-lista.pdf',
        disciplina: null,
        turma: null,
        dataCriacao: '2026-04-02T12:00:00.000Z',
        acessos: 12,
        autorNome: 'Prof. Ana',
        autorId: null,
        publicoAlvo: 'Turma Única',
        ativo: true,
    },
]

const USE_MOCK = appConfig.enableMock
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const MateriaisService = {
    getAll: async (): Promise<Material[]> => {
        if (USE_MOCK) {
            await delay(600)
            return [...materiaisMock]
        }
        return ApiService.fetchDataWithAxios<Material[]>({ url: '/materiais', method: 'get' })
    },

    create: async (
        novoMaterial: MaterialRequest & {
            autorNome?: string | null
            autorId?: number | null
            ativo?: boolean
            dataCriacao?: string
        },
    ): Promise<Material> => {
        if (USE_MOCK) {
            await delay(800)
            const materialCriado: Material = {
                id: Math.max(0, ...materiaisMock.map((m) => m.id)) + 1,
                titulo: novoMaterial.titulo,
                descricao: novoMaterial.descricao ?? null,
                tipo: novoMaterial.tipo,
                url: novoMaterial.url,
                disciplina: novoMaterial.disciplina ?? null,
                turma: novoMaterial.turma ?? null,
                autorId: novoMaterial.autorId ?? null,
                autorNome: novoMaterial.autorNome ?? null,
                publicoAlvo: novoMaterial.publicoAlvo,
                dataCriacao: novoMaterial.dataCriacao ?? new Date().toISOString(),
                acessos: 0,
                ativo: novoMaterial.ativo ?? true,
            }
            materiaisMock.unshift(materialCriado)
            return materialCriado
        }
        return ApiService.fetchDataWithAxios<Material>({ url: '/materiais', method: 'post', data: novoMaterial })
    },

    registrarAcesso: async (id: number): Promise<void> => {
        if (USE_MOCK) {
            const index = materiaisMock.findIndex((m) => m.id === id)
            if (index > -1) materiaisMock[index].acessos += 1
            return
        }
        await ApiService.fetchDataWithAxios({ url: `/materiais/${id}/acesso`, method: 'patch' })
    },

    aprovar: async (id: number): Promise<void> => {
        if (USE_MOCK) {
            await delay(400)
            const index = materiaisMock.findIndex((m) => m.id === id)
            if (index > -1) materiaisMock[index].ativo = true
            return
        }
        await ApiService.fetchDataWithAxios({
            url: `/materiais/${id}/aprovar`,
            method: 'patch',
        })
    },

    deletar: async (id: number): Promise<void> => {
        if (USE_MOCK) {
            await delay(400)
            materiaisMock = materiaisMock.filter((m) => m.id !== id)
            return
        }
        await ApiService.fetchDataWithAxios({ url: `/materiais/${id}`, method: 'delete' })
    },
}
