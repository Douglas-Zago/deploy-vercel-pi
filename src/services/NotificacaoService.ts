import ApiService from './ApiService';

export type TipoNotificacao = 'AVISO' | 'MATERIAL' | 'CHAMADO' | 'SISTEMA';

export interface Notificacao {
    id: string;
    titulo: string;
    mensagem: string;
    dataHora: string;
    tipo: TipoNotificacao;
    lida: boolean;
    destinatario: 'TODOS' | 'DIRECAO' | 'PROFESSOR' | 'ALUNO' | string; // string para email específico (ex: resposta de um chamado)
    linkAcao?: string;
}

// Helper de formatação de tempo (ex: "há 2h", "hoje")
const getHoraFormatada = (minutosAtras: number) => {
    const data = new Date();
    data.setMinutes(data.getMinutes() - minutosAtras);
    return data.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

// Mock Inteligente Inicial
let notificacoesMock: Notificacao[] = [
    {
        id: 'n1',
        titulo: 'Novo Comunicado da Direção',
        mensagem: 'O calendário escolar de 2026 foi atualizado. Confira as novas datas no mural.',
        dataHora: getHoraFormatada(15),
        tipo: 'AVISO',
        lida: false,
        destinatario: 'TODOS',
        linkAcao: '/mural-comunicados'
    },
    {
        id: 'n2',
        titulo: 'Material Pendente',
        mensagem: 'O Prof. Douglas enviou um novo PDF que precisa da sua aprovação.',
        dataHora: getHoraFormatada(120),
        tipo: 'MATERIAL',
        lida: false,
        destinatario: 'DIRECAO',
        linkAcao: '/central-materiais'
    },
    {
        id: 'n3',
        titulo: 'Atualização do Sistema',
        mensagem: 'O PACE passou por uma atualização na madrugada de hoje.',
        dataHora: getHoraFormatada(1440), // 24h atrás
        tipo: 'SISTEMA',
        lida: true,
        destinatario: 'TODOS'
    }
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const NotificacaoService = {
    // Busca notificações filtradas pelo papel (authority) do usuário
    getMinhasNotificacoes: async (userAuthorities: string[], userEmail: string): Promise<Notificacao[]> => {
        await delay(500); // Simulando rede
        
        return notificacoesMock.filter(n => {
            if (n.destinatario === 'TODOS') return true;
            if (n.destinatario === userEmail) return true; // Direto para ele
            
            // Filtro por papéis (authority) — Direção e Coordenação recebem alertas de gestão
            if ((userAuthorities.includes('direcao') || userAuthorities.includes('coordenacao')) && n.destinatario === 'DIRECAO') return true;
            if (userAuthorities.includes('professor') && n.destinatario === 'PROFESSOR') return true;
            if (userAuthorities.includes('aluno') && n.destinatario === 'ALUNO') return true;
            
            return false;
        }).sort((a, b) => new Date(b.dataHora.split(' ')[0].split('/').reverse().join('-') + 'T' + b.dataHora.split(' ')[1]).getTime() - 
                          new Date(a.dataHora.split(' ')[0].split('/').reverse().join('-') + 'T' + a.dataHora.split(' ')[1]).getTime());
    },

    marcarComoLida: async (id: string): Promise<void> => {
        await delay(200);
        const index = notificacoesMock.findIndex(n => n.id === id);
        if (index > -1) notificacoesMock[index].lida = true;
    },

    marcarTodasComoLidas: async (userAuthorities: string[], userEmail: string): Promise<void> => {
        await delay(300);
        notificacoesMock = notificacoesMock.map(n => {
            const pertence = n.destinatario === 'TODOS' || 
                             n.destinatario === userEmail ||
                             ((userAuthorities.includes('direcao') || userAuthorities.includes('coordenacao')) && n.destinatario === 'DIRECAO') ||
                             (userAuthorities.includes('professor') && n.destinatario === 'PROFESSOR') ||
                             (userAuthorities.includes('aluno') && n.destinatario === 'ALUNO');
            
            if (pertence) {
                return { ...n, lida: true };
            }
            return n;
        });
    }
};