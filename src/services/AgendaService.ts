import ApiService from './ApiService';
import appConfig from '@/configs/app.config';

export type CategoriaAgenda = 'Provas/Trabalhos' | 'Aulas/Estudos' | 'Reunião' | 'Pessoal';
export type PrioridadeAgenda = 'Alta' | 'Média' | 'Baixa';

export interface AgendaEvent {
    id: number;
    titulo: string;
    descricao: string;
    data: string; // YYYY-MM-DD local
    horario: string; // HH:mm
    categoria: CategoriaAgenda;
    prioridade: PrioridadeAgenda;
    concluido: boolean;
    userId: string;
}

// Data local segura contra bugs de Timezone (UTC shift)
const getLocalISODate = (date: Date) => {
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().split('T')[0];
};

const hoje = new Date();
const amanha = new Date(); amanha.setDate(amanha.getDate() + 1);

export let agendaMock: AgendaEvent[] = [
    {
        id: 1,
        titulo: 'Entrega do Projeto de PI',
        descricao: 'Submeter o documento final em PDF no portal.',
        data: getLocalISODate(hoje),
        horario: '23:59',
        categoria: 'Provas/Trabalhos',
        prioridade: 'Alta',
        concluido: false,
        userId: 'maria.aluna@pace.edu.br',
    },
    {
        id: 2,
        titulo: 'Reunião com Orientador',
        descricao: 'Apresentar as telas desenvolvidas na Fase 3.',
        data: getLocalISODate(amanha),
        horario: '14:30',
        categoria: 'Reunião',
        prioridade: 'Média',
        concluido: false,
        userId: 'joao.professor@pace.edu.br',
    },
    {
        id: 3,
        titulo: 'Planejamento bimestral',
        descricao: 'Alinhar calendário de provas e eventos institucionais.',
        data: '2026-04-01',
        horario: '10:00',
        categoria: 'Reunião',
        prioridade: 'Alta',
        concluido: false,
        userId: 'douglas.direcao@pace.edu.br',
    },
];

const USE_MOCK = appConfig.enableMock;
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const AgendaService = {
    getByUser: async (userId: string): Promise<AgendaEvent[]> => {
        if (USE_MOCK) {
            await delay(500);
            return agendaMock.filter(event => event.userId === userId);
        }
        return ApiService.fetchDataWithAxios<AgendaEvent[]>({ url: `/agenda/${userId}`, method: 'get' });
    },

    create: async (novoEvento: Omit<AgendaEvent, 'id' | 'concluido'>): Promise<AgendaEvent> => {
        if (USE_MOCK) {
            await delay(600); // Simulando delay de rede
            const criado: AgendaEvent = { ...novoEvento, id: Date.now(), concluido: false };
            agendaMock.push(criado);
            return criado;
        }
        return ApiService.fetchDataWithAxios<AgendaEvent>({ url: '/agenda', method: 'post', data: novoEvento });
    },

    update: async (id: number, dadosAtualizados: Partial<AgendaEvent>): Promise<AgendaEvent> => {
        if (USE_MOCK) {
            await delay(400);
            const index = agendaMock.findIndex(e => e.id === id);
            if (index === -1) throw new Error("Não encontrado");
            agendaMock[index] = { ...agendaMock[index], ...dadosAtualizados };
            return agendaMock[index];
        }
        return ApiService.fetchDataWithAxios({ url: `/agenda/${id}`, method: 'put', data: dadosAtualizados });
    },

    toggleStatus: async (id: number): Promise<void> => {
        if (USE_MOCK) {
            await delay(300);
            const index = agendaMock.findIndex(e => e.id === id);
            if (index > -1) agendaMock[index].concluido = !agendaMock[index].concluido;
            return;
        }
        await ApiService.fetchDataWithAxios({ url: `/agenda/${id}/toggle`, method: 'patch' });
    },

    delete: async (id: number): Promise<void> => {
        if (USE_MOCK) {
            await delay(400);
            agendaMock = agendaMock.filter(e => e.id !== id);
            return;
        }
        await ApiService.fetchDataWithAxios({ url: `/agenda/${id}`, method: 'delete' });
    }
};