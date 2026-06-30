import ApiService from './ApiService'
import appConfig from '@/configs/app.config'
import type { Achado, AchadoRequest } from '@/@types/portal'

export type { Achado } from '@/@types/portal'

export type CategoriaAchado = 'Vestuário' | 'Eletrônicos' | 'Material Escolar' | 'Documentos' | 'Outros'

const USE_MOCK = appConfig.enableMock

const simulateDelay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

let mockAchados: Achado[] = [
    {
        id: 101,
        titulo: 'Casaco de Frio Preto',
        categoria: 'Vestuário',
        descricao: 'Casaco de moletom preto, tamanho M, marca Nike. Sem nome na etiqueta.',
        local: 'Quadra Poliesportiva',
        dataOcorrencia: null,
        imagemUrl: null,
        status: 'Disponível',
        devolvido: false,
        autorId: 1,
        autorNome: 'Equipe Secretaria',
        dataCriacao: new Date().toISOString(),
        ativo: true,
        entreguePara: null,
    },
    {
        id: 102,
        titulo: 'Calculadora Científica Casio',
        categoria: 'Eletrônicos',
        descricao: 'Calculadora preta com tampa arranhada.',
        local: 'Laboratório de Ciências',
        dataOcorrencia: null,
        imagemUrl: null,
        status: 'Devolvido',
        devolvido: true,
        autorId: 1,
        autorNome: 'Equipe Secretaria',
        dataCriacao: new Date(Date.now() - 86400000).toISOString(),
        ativo: true,
        entreguePara: 'Maria Silva (ALN2024)',
    },
    {
        id: 103,
        titulo: 'Garrafa térmica azul',
        categoria: 'Outros',
        descricao: 'Garrafa térmica azul escura, sem adesivos.',
        local: 'Biblioteca',
        dataOcorrencia: null,
        imagemUrl: null,
        status: 'Disponível',
        devolvido: false,
        autorId: 2,
        autorNome: 'Equipe Secretaria',
        dataCriacao: new Date(Date.now() - 172800000).toISOString(),
        ativo: true,
        entreguePara: null,
    },
]

export const AchadosService = {
    getAll: async (): Promise<Achado[]> => {
        if (USE_MOCK) {
            await simulateDelay(600)
            return [...mockAchados]
        }
        return await ApiService.fetchDataWithAxios<Achado[]>({ url: '/achados', method: 'GET' })
    },

    create: async (
        data: AchadoRequest & { autorId?: number | null; autorNome?: string | null },
        file?: File | null,
    ): Promise<Achado> => {
        if (USE_MOCK) {
            await simulateDelay(800)
            let provisoryImageUrl: string | null = null
            if (file) {
                provisoryImageUrl = URL.createObjectURL(file)
            }

            const novoItem: Achado = {
                id: Math.max(0, ...mockAchados.map((a) => a.id)) + 1,
                titulo: data.titulo,
                descricao: data.descricao,
                categoria: data.categoria,
                local: data.local,
                dataOcorrencia: null,
                imagemUrl: provisoryImageUrl ?? data.imagemUrl ?? null,
                status: data.status ?? 'Disponível',
                devolvido: false,
                autorId: data.autorId ?? null,
                autorNome: data.autorNome ?? null,
                dataCriacao: new Date().toISOString(),
                ativo: true,
                entreguePara: null,
            }
            mockAchados = [novoItem, ...mockAchados]
            return novoItem
        }

        const formData = new FormData()
        formData.append('item', JSON.stringify(data))
        if (file) formData.append('file', file)

        return await ApiService.fetchDataWithAxios<Achado>({
            url: '/achados',
            method: 'POST',
            data: formData,
            headers: { 'Content-Type': 'multipart/form-data' },
        })
    },

    marcarComoDevolvido: async (id: number, entreguePara: string): Promise<void> => {
        if (USE_MOCK) {
            await simulateDelay(500)
            const index = mockAchados.findIndex((a) => a.id === id)
            if (index > -1) {
                mockAchados[index].status = 'Devolvido'
                mockAchados[index].devolvido = true
                mockAchados[index].entreguePara = entreguePara
            }
            return
        }
        await ApiService.fetchDataWithAxios<void>({
            url: `/achados/${id}/devolver`,
            method: 'PATCH',
            data: { entreguePara },
        })
    },

    deletar: async (id: number): Promise<void> => {
        if (USE_MOCK) {
            await simulateDelay(400)
            mockAchados = mockAchados.filter((a) => a.id !== id)
            return
        }
        await ApiService.fetchDataWithAxios<void>({ url: `/achados/${id}`, method: 'DELETE' })
    },
}
