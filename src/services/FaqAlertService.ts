import { assertPodeEditar } from '@/utils/somenteLeitura'

export type FaqCategoriaBadge = 'indigo' | 'emerald' | 'amber' | 'sky' | 'rose' | 'violet'

export interface FaqItem {
    id: string
    pergunta: string
    resposta: string
    categoria?: string
    icone?: string
    badge?: FaqCategoriaBadge
}

export interface AlertaGlobal {
    id: string
    titulo: string
    mensagem: string
    ativo: boolean
}

const STORAGE_FAQ = 'pace_faq_items_v2'
const STORAGE_ALERTA = 'pace_alerta_global'
const STORAGE_ALERTA_VISTO = 'pace_alerta_visto'

const FAQ_PADRAO: FaqItem[] = [
    {
        id: 'faq-1',
        categoria: 'Secretaria',
        icone: '🏫',
        badge: 'indigo',
        pergunta: 'Qual o horário de funcionamento da Secretaria?',
        resposta:
            'A Secretaria Acadêmica atende de segunda a sexta, das 7h30 às 18h, e aos sábados das 8h às 12h. Em períodos de recesso, consulte o calendário oficial no mural de avisos.',
    },
    {
        id: 'faq-2',
        categoria: 'Documentos',
        icone: '🪪',
        badge: 'emerald',
        pergunta: 'Como faço para solicitar a carteirinha escolar?',
        resposta:
            'Dirija-se à Secretaria com documento de identidade, comprovante de matrícula e uma foto 3x4 recente. O prazo médio de confecção é de 5 dias úteis. A segunda via exige o pagamento da taxa administrativa.',
    },
    {
        id: 'faq-3',
        categoria: 'Materiais',
        icone: '📚',
        badge: 'amber',
        pergunta: 'Onde posso consultar a lista de materiais obrigatórios?',
        resposta:
            'A lista por série e disciplina está disponível na Central de Materiais do portal (após login) e também em PDF no site institucional, na seção "Calendário e Materiais".',
    },
    {
        id: 'faq-4',
        categoria: 'Infraestrutura',
        icone: '🚗',
        badge: 'sky',
        pergunta: 'Como funciona o acesso ao estacionamento da escola?',
        resposta:
            'O estacionamento é destinado a responsáveis com credencial. Solicite o adesivo na portaria apresentando CNH, documento do veículo e comprovante de vínculo com o aluno. Vagas são limitadas e seguem ordem de chegada.',
    },
    {
        id: 'faq-5',
        categoria: 'Portal do Aluno',
        icone: '💻',
        badge: 'violet',
        pergunta: 'Como recupero minha senha de acesso ao portal?',
        resposta:
            'Na tela de login, clique em "Esqueceu a senha?" e informe seu e-mail institucional. Se o endereço estiver cadastrado, você receberá um link para redefinir a senha. Por segurança, o sistema não informa se o e-mail existe ou não. Para criação de novos acessos, procure a Secretaria.',
    },
    {
        id: 'faq-6',
        categoria: 'Biblioteca',
        icone: '📖',
        badge: 'rose',
        pergunta: 'Qual o prazo para devolução de livros da biblioteca?',
        resposta:
            'O empréstimo padrão é de 14 dias corridos, com possibilidade de uma renovação pelo portal ou presencialmente, se não houver reserva. Atrasos podem gerar bloqueio temporário de novos empréstimos.',
    },
]

function lerJson<T>(chave: string): T | null {
    try {
        const raw = localStorage.getItem(chave)
        if (!raw) return null
        return JSON.parse(raw) as T
    } catch {
        return null
    }
}

function salvarJson(chave: string, valor: unknown): void {
    localStorage.setItem(chave, JSON.stringify(valor))
}

function gerarId(prefixo: string): string {
    return `${prefixo}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function notificarMudanca(): void {
    window.dispatchEvent(new CustomEvent('pace-faq-alerta-atualizado'))
}

function inicializarFaqSeNecessario(): FaqItem[] {
    const existente = lerJson<FaqItem[]>(STORAGE_FAQ)
    if (existente && existente.length > 0) {
        return existente
    }
    salvarJson(STORAGE_FAQ, FAQ_PADRAO)
    return [...FAQ_PADRAO]
}

export const FaqAlertService = {
    // --- FAQ ---
    getFaqItems(): FaqItem[] {
        return inicializarFaqSeNecessario()
    },

    addFaqItem(pergunta: string, resposta: string): FaqItem {
        assertPodeEditar()
        const itens = inicializarFaqSeNecessario()
        const novo: FaqItem = {
            id: gerarId('faq'),
            pergunta: pergunta.trim(),
            resposta: resposta.trim(),
        }
        const atualizados = [...itens, novo]
        salvarJson(STORAGE_FAQ, atualizados)
        notificarMudanca()
        return novo
    },

    updateFaqItem(
        id: string,
        dados: Pick<FaqItem, 'pergunta' | 'resposta'>,
    ): FaqItem | null {
        assertPodeEditar()
        const itens = inicializarFaqSeNecessario()
        const idx = itens.findIndex((i) => i.id === id)
        if (idx === -1) return null

        const atualizado: FaqItem = {
            ...itens[idx],
            pergunta: dados.pergunta.trim(),
            resposta: dados.resposta.trim(),
        }
        const lista = [...itens]
        lista[idx] = atualizado
        salvarJson(STORAGE_FAQ, lista)
        notificarMudanca()
        return atualizado
    },

    deleteFaqItem(id: string): boolean {
        assertPodeEditar()
        const itens = inicializarFaqSeNecessario()
        const filtrados = itens.filter((i) => i.id !== id)
        if (filtrados.length === itens.length) return false
        salvarJson(STORAGE_FAQ, filtrados)
        notificarMudanca()
        return true
    },

    // --- ALERTA GLOBAL ---
    getAlertaGlobal(): AlertaGlobal | null {
        return lerJson<AlertaGlobal>(STORAGE_ALERTA)
    },

    getAlertaAtivo(): AlertaGlobal | null {
        const alerta = lerJson<AlertaGlobal>(STORAGE_ALERTA)
        return alerta?.ativo ? alerta : null
    },

    ativarAlerta(titulo: string, mensagem: string): AlertaGlobal {
        assertPodeEditar()
        const alerta: AlertaGlobal = {
            id: gerarId('alerta'),
            titulo: titulo.trim(),
            mensagem: mensagem.trim(),
            ativo: true,
        }
        salvarJson(STORAGE_ALERTA, alerta)
        notificarMudanca()
        return alerta
    },

    desativarAlerta(): void {
        assertPodeEditar()
        const atual = lerJson<AlertaGlobal>(STORAGE_ALERTA)
        if (!atual) return
        salvarJson(STORAGE_ALERTA, { ...atual, ativo: false })
        notificarMudanca()
    },

    // --- LEITURA DO USUÁRIO (pace_alerta_visto guarda o id do último alerta dispensado) ---
    usuarioLeuAlerta(alertaId: string): boolean {
        return localStorage.getItem(STORAGE_ALERTA_VISTO) === alertaId
    },

    marcarAlertaComoLido(alertaId: string): void {
        localStorage.setItem(STORAGE_ALERTA_VISTO, alertaId)
    },

    subscribe(callback: () => void): () => void {
        const handler = () => callback()
        window.addEventListener('pace-faq-alerta-atualizado', handler)
        window.addEventListener('storage', handler)
        return () => {
            window.removeEventListener('pace-faq-alerta-atualizado', handler)
            window.removeEventListener('storage', handler)
        }
    },
}
