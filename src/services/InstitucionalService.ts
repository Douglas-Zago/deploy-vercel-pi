import ApiService from './ApiService';
import appConfig from '@/configs/app.config';
import { assertPodeEditar } from '@/utils/somenteLeitura';

// --- INTERFACES ---
export interface Contato {
    id: number;
    setor: string;
    nome: string;
    email: string;
    telefone: string;
}

export interface Informacao {
    id: number;
    titulo: string;
    categoria: 'Horários' | 'Regras' | 'Localização' | 'Geral';
    descricao: string;
}

// --- MOCKS ---
export let contatosMock: Contato[] = [
    { id: 1, setor: 'Secretaria Acadêmica', nome: 'Maria Silva', email: 'secretaria@pace.edu.br', telefone: '(11) 99999-1111' },
    { id: 2, setor: 'Coordenação de TI', nome: 'Prof. Carlos', email: 'coordenacao.ti@pace.edu.br', telefone: '(11) 99999-2222' },
    { id: 3, setor: 'Suporte Técnico', nome: 'Help Desk', email: 'suporte@pace.edu.br', telefone: '(11) 99999-3333' },
];

export let informacoesMock: Informacao[] = [
    { id: 1, titulo: 'Horário de Funcionamento da Biblioteca', categoria: 'Horários', descricao: 'A biblioteca funciona de segunda a sexta, das 08h às 21h, e aos sábados das 08h às 12h.' },
    { id: 2, titulo: 'Regras de Uso dos Laboratórios', categoria: 'Regras', descricao: 'É proibido consumir alimentos e bebidas dentro dos laboratórios de informática. O uso de pen drives pessoais deve ser precedido por verificação de antivírus.' },
    { id: 3, titulo: 'Localização do Auditório Principal', categoria: 'Localização', descricao: 'O Auditório Principal fica no Bloco C, 2º andar, sala 205.' },
];

const USE_MOCK = appConfig.enableMock;
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- SERVICE ---
export const InstitucionalService = {
    // CONTATOS
    getContatos: async (): Promise<Contato[]> => {
        if (USE_MOCK) {
            await delay(400);
            return [...contatosMock];
        }
        return ApiService.fetchDataWithAxios<Contato[]>({ url: '/institucional/contatos', method: 'get' });
    },
    createContato: async (novo: Omit<Contato, 'id'>): Promise<Contato> => {
        assertPodeEditar();
        if (USE_MOCK) {
            await delay(600);
            const criado = { ...novo, id: Math.max(0, ...contatosMock.map(c => c.id)) + 1 };
            contatosMock.push(criado);
            return criado;
        }
        return ApiService.fetchDataWithAxios<Contato>({ url: '/institucional/contatos', method: 'post', data: novo });
    },
    deleteContato: async (id: number): Promise<void> => {
        assertPodeEditar();
        if (USE_MOCK) {
            await delay(400);
            contatosMock = contatosMock.filter(c => c.id !== id);
            return;
        }
        await ApiService.fetchDataWithAxios({ url: `/institucional/contatos/${id}`, method: 'delete' });
    },

    // INFORMAÇÕES
    getInformacoes: async (): Promise<Informacao[]> => {
        if (USE_MOCK) {
            await delay(400);
            return [...informacoesMock];
        }
        return ApiService.fetchDataWithAxios<Informacao[]>({ url: '/institucional/informacoes', method: 'get' });
    },
    createInformacao: async (novo: Omit<Informacao, 'id'>): Promise<Informacao> => {
        assertPodeEditar();
        if (USE_MOCK) {
            await delay(600);
            const criado = { ...novo, id: Math.max(0, ...informacoesMock.map(i => i.id)) + 1 };
            informacoesMock.push(criado);
            return criado;
        }
        return ApiService.fetchDataWithAxios<Informacao>({ url: '/institucional/informacoes', method: 'post', data: novo });
    },
    deleteInformacao: async (id: number): Promise<void> => {
        assertPodeEditar();
        if (USE_MOCK) {
            await delay(400);
            informacoesMock = informacoesMock.filter(i => i.id !== id);
            return;
        }
        await ApiService.fetchDataWithAxios({ url: `/institucional/informacoes/${id}`, method: 'delete' });
    }
};