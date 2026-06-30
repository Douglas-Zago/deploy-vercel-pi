import ApiService from './ApiService'
import type { PublicoAlvo } from '@/constants/publicoAlvo'

export type CategoriaInstitucional = 'Provas' | 'Feriados' | 'Eventos'

export interface EventoCalendario {
    id: number
    titulo: string
    descricao: string
    data: string
    categoria: CategoriaInstitucional
    publicoAlvo: PublicoAlvo
}

export type EventoCalendarioRequest = Omit<EventoCalendario, 'id'>

function mapEvento(raw: Record<string, unknown>): EventoCalendario {
    return {
        id: Number(raw.id ?? 0),
        titulo: String(raw.titulo ?? ''),
        descricao: String(raw.descricao ?? ''),
        data: String(raw.data ?? ''),
        categoria: (raw.categoria as CategoriaInstitucional) ?? 'Eventos',
        publicoAlvo: (raw.publicoAlvo as PublicoAlvo) ?? 'Colégio Todo',
    }
}

export const CalendarioService = {
    getAll: async (): Promise<EventoCalendario[]> => {
        const data = await ApiService.fetchDataWithAxios<Record<string, unknown>[]>({
            url: '/calendario',
            method: 'get',
        })
        return data.map(mapEvento)
    },

    create: async (evento: EventoCalendarioRequest): Promise<EventoCalendario> => {
        const criado = await ApiService.fetchDataWithAxios<Record<string, unknown>>({
            url: '/calendario',
            method: 'post',
            data: evento,
        })
        return mapEvento(criado)
    },
}
