import { NAV_ITEM_TYPE_ITEM, NAV_ITEM_TYPE_TITLE } from '@/constants/navigation.constant'
import {
    PAPEL_COORDENACAO_ACHADOS,
    PAPEL_GESTAO_DIRECAO_COORDENACAO,
    PAPEL_OPERACIONAL,
    PAPEL_PAINEL_ACADEMICO,
    PAPEL_SOMENTE_DIRECAO,
    PAPEL_TODOS_LOGADOS,
    PAPEL_UTILIDADES_GERAL,
} from '@/constants/roles.constant'
import type { NavigationTree } from '@/@types/navigation'

const paceNavigationConfig: NavigationTree[] = [
    // 1 · PAINEL
    {
        key: 'pace.painel',
        path: '',
        title: 'PAINEL',
        translateKey: '',
        icon: '',
        type: NAV_ITEM_TYPE_TITLE,
        authority: [...PAPEL_PAINEL_ACADEMICO],
        subMenu: [
            {
                key: 'pace.inicio',
                path: '/painel',
                title: 'Início',
                translateKey: '',
                icon: 'dashboard',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [...PAPEL_PAINEL_ACADEMICO],
                subMenu: [],
            },
            {
                key: 'pace.mural',
                path: '/mural-comunicados',
                title: 'Mural de Avisos',
                translateKey: '',
                icon: 'dashboardMarketing',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [...PAPEL_PAINEL_ACADEMICO],
                subMenu: [],
            },
            {
                key: 'pace.agenda',
                path: '/agenda',
                title: 'Agenda Escolar',
                translateKey: '',
                icon: 'calendar',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [...PAPEL_PAINEL_ACADEMICO],
                subMenu: [],
            },
            {
                key: 'pace.calendario',
                path: '/calendario',
                title: 'Calendário Institucional',
                translateKey: '',
                icon: 'uiFormsDatepicker',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [...PAPEL_PAINEL_ACADEMICO],
                subMenu: [],
            },
        ],
    },

    // 2 · ACADÊMICO
    {
        key: 'pace.academico',
        path: '',
        title: 'ACADÊMICO',
        translateKey: '',
        icon: '',
        type: NAV_ITEM_TYPE_TITLE,
        authority: [...PAPEL_PAINEL_ACADEMICO],
        subMenu: [
            {
                key: 'pace.materiais',
                path: '/central-materiais',
                title: 'Links e Materiais',
                translateKey: '',
                icon: 'concepts',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [...PAPEL_PAINEL_ACADEMICO],
                subMenu: [],
            },
        ],
    },

    // 3 · UTILIDADES
    {
        key: 'pace.utilidades',
        path: '',
        title: 'UTILIDADES',
        translateKey: '',
        icon: '',
        type: NAV_ITEM_TYPE_TITLE,
        authority: [...PAPEL_TODOS_LOGADOS],
        subMenu: [
            {
                key: 'pace.achados',
                path: '/achados-e-perdidos',
                title: 'Achados e Perdidos',
                translateKey: '',
                icon: 'uiDataDisplayCard',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [...PAPEL_COORDENACAO_ACHADOS],
                subMenu: [],
            },
            {
                key: 'pace.institucional',
                path: '/institucional',
                title: 'Informações da Escola',
                translateKey: '',
                icon: 'documentation',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [...PAPEL_UTILIDADES_GERAL],
                subMenu: [],
            },
        ],
    },

    // 4 · OPERACIONAL
    {
        key: 'pace.operacional',
        path: '',
        title: 'OPERACIONAL',
        translateKey: '',
        icon: '',
        type: NAV_ITEM_TYPE_TITLE,
        authority: [...PAPEL_OPERACIONAL],
        subMenu: [
            {
                key: 'pace.chamados',
                path: '/chamados',
                title: 'Suporte Técnico',
                translateKey: '',
                icon: 'helpCeterSupportHub',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [...PAPEL_OPERACIONAL],
                subMenu: [],
            },
            {
                key: 'pace.laboratorios',
                path: '/laboratorios',
                title: 'Reserva de Espaços',
                translateKey: '',
                icon: 'uiDataDisplayTable',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [...PAPEL_OPERACIONAL],
                subMenu: [],
            },
        ],
    },

    // 5 · GESTÃO (Direção e Coordenação)
    {
        key: 'pace.gestao',
        path: '',
        title: 'GESTÃO',
        translateKey: '',
        icon: '',
        type: NAV_ITEM_TYPE_TITLE,
        authority: [...PAPEL_GESTAO_DIRECAO_COORDENACAO],
        subMenu: [
            {
                key: 'pace.faqAlertas',
                path: '/gestao-faq-alertas',
                title: 'FAQ e Alertas',
                translateKey: '',
                icon: 'helpCeterSupportHub',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [...PAPEL_GESTAO_DIRECAO_COORDENACAO],
                subMenu: [],
            },
        ],
    },

    // 6 · ADMINISTRAÇÃO (Direção)
    {
        key: 'pace.admin',
        path: '',
        title: 'ADMINISTRAÇÃO',
        translateKey: '',
        icon: '',
        type: NAV_ITEM_TYPE_TITLE,
        authority: [...PAPEL_SOMENTE_DIRECAO],
        subMenu: [
            {
                key: 'pace.usuarios',
                path: '/gestao-usuarios',
                title: 'Gestão de Usuários',
                translateKey: '',
                icon: 'customerList',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [...PAPEL_SOMENTE_DIRECAO],
                subMenu: [],
            },
        ],
    },

    // 7 · SISTEMA
    {
        key: 'pace.sistema',
        path: '',
        title: 'SISTEMA',
        translateKey: '',
        icon: '',
        type: NAV_ITEM_TYPE_TITLE,
        authority: [...PAPEL_TODOS_LOGADOS],
        subMenu: [
            {
                key: 'pace.sair',
                path: '/sair-do-sistema',
                title: 'Voltar ao Site (Sair)',
                translateKey: '',
                icon: 'landing',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [...PAPEL_TODOS_LOGADOS],
                subMenu: [],
            },
        ],
    },
]

export default paceNavigationConfig
