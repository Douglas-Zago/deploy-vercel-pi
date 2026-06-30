import { Link } from 'react-router'
import {
    PAPEL_GESTAO_DIRECAO_COORDENACAO,
    PAPEL_OPERACIONAL,
    PAPEL_SOMENTE_DIRECAO,
    PAPEL_COORDENACAO_ACHADOS,
    PAPEL_UTILIDADES_GERAL,
} from '@/constants/roles.constant'
import { usuarioTemAcesso } from '../utils'

export type QuickAccessLink = {
    label: string
    description: string
    path: string
    icon: string
    authority?: readonly string[]
}

const QUICK_LINKS: QuickAccessLink[] = [
    {
        label: 'Ir para o Mural',
        description: 'Comunicados e avisos da escola',
        path: '/mural-comunicados',
        icon: '📢',
    },
    {
        label: 'Ver Calendário Institucional',
        description: 'Datas oficiais e feriados',
        path: '/calendario',
        icon: '📆',
    },
    {
        label: 'Central de Materiais',
        description: 'Links e conteúdos acadêmicos',
        path: '/central-materiais',
        icon: '📚',
    },
    {
        label: 'Agenda Escolar',
        description: 'Suas tarefas e compromissos',
        path: '/agenda',
        icon: '🗓️',
    },
    {
        label: 'Achados e Perdidos',
        description: 'Itens perdidos no colégio',
        path: '/achados-e-perdidos',
        icon: '🔍',
        authority: PAPEL_COORDENACAO_ACHADOS,
    },
    {
        label: 'Informações da Escola',
        description: 'Contatos e dados institucionais',
        path: '/institucional',
        icon: '🏫',
        authority: PAPEL_UTILIDADES_GERAL,
    },
    {
        label: 'Suporte Técnico',
        description: 'Abrir ou acompanhar chamados',
        path: '/chamados',
        icon: '🛠️',
        authority: PAPEL_OPERACIONAL,
    },
    {
        label: 'Reserva de Espaços',
        description: 'Laboratórios e salas',
        path: '/laboratorios',
        icon: '🖥️',
        authority: PAPEL_OPERACIONAL,
    },
    {
        label: 'FAQ e Alertas',
        description: 'Gestão de conteúdo público',
        path: '/gestao-faq-alertas',
        icon: '❓',
        authority: PAPEL_GESTAO_DIRECAO_COORDENACAO,
    },
    {
        label: 'Gestão de Usuários',
        description: 'Cadastro e permissões',
        path: '/gestao-usuarios',
        icon: '👥',
        authority: PAPEL_SOMENTE_DIRECAO,
    },
]

type QuickAccessProps = {
    authority?: string[]
}

const QuickAccess = ({ authority }: QuickAccessProps) => {
    const links = QUICK_LINKS.filter((link) =>
        usuarioTemAcesso(authority, link.authority ? [...link.authority] : undefined),
    )

    return (
        <section aria-labelledby="painel-quick-access-heading">
            <h2
                id="painel-quick-access-heading"
                className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4"
            >
                Acesso Rápido
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {links.map((link) => (
                    <Link
                        key={link.path}
                        to={link.path}
                        className="group flex items-start gap-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/80 p-5 shadow-sm hover:shadow-md hover:border-primary/40 dark:hover:border-primary/50 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                        <span
                            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-700/80 text-xl group-hover:scale-105 transition-transform"
                            aria-hidden
                        >
                            {link.icon}
                        </span>
                        <div className="min-w-0">
                            <p className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors">
                                {link.label}
                            </p>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                                {link.description}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    )
}

export default QuickAccess
