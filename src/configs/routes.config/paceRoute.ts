import { lazy } from 'react'
import {
    PAPEL_COORDENACAO_ACHADOS,
    PAPEL_GESTAO_DIRECAO_COORDENACAO,
    PAPEL_OPERACIONAL,
    PAPEL_PAINEL_ACADEMICO,
    PAPEL_SOMENTE_DIRECAO,
    PAPEL_TODOS_LOGADOS,
    PAPEL_UTILIDADES_GERAL,
} from '@/constants/roles.constant'
import type { Routes } from '@/@types/routes'

const paceRoute: Routes = [
    // --- PAINEL ---
    {
        key: 'pace.inicio',
        path: '/painel',
        component: lazy(() => import('@/views/pace/Painel')),
        authority: [...PAPEL_PAINEL_ACADEMICO],
    },
    {
        key: 'pace.mural',
        path: '/mural-comunicados',
        component: lazy(() => import('@/views/pace/Mural')),
        authority: [...PAPEL_PAINEL_ACADEMICO],
    },
    {
        key: 'pace.agenda',
        path: '/agenda',
        component: lazy(() => import('@/views/pace/Agenda')),
        authority: [...PAPEL_PAINEL_ACADEMICO],
    },
    {
        key: 'pace.calendario',
        path: '/calendario',
        component: lazy(() => import('@/views/pace/Calendario')),
        authority: [...PAPEL_PAINEL_ACADEMICO],
    },

    // --- ACADÊMICO ---
    {
        key: 'pace.materiais',
        path: '/central-materiais',
        component: lazy(() => import('@/views/pace/Materiais')),
        authority: [...PAPEL_PAINEL_ACADEMICO],
    },

    // --- UTILIDADES ---
    {
        key: 'pace.achados',
        path: '/achados-e-perdidos',
        component: lazy(() => import('@/views/pace/AchadosEPerdidos')),
        authority: [...PAPEL_COORDENACAO_ACHADOS],
    },
    {
        key: 'pace.institucional',
        path: '/institucional',
        component: lazy(() => import('@/views/pace/Institucional')),
        authority: [...PAPEL_UTILIDADES_GERAL],
    },

    // --- OPERACIONAL ---
    {
        key: 'pace.chamados',
        path: '/chamados',
        component: lazy(() => import('@/views/pace/Chamados')),
        authority: [...PAPEL_OPERACIONAL],
    },
    {
        key: 'pace.laboratorios',
        path: '/laboratorios',
        component: lazy(() => import('@/views/pace/Laboratorios')),
        authority: [...PAPEL_OPERACIONAL],
    },

    // --- GESTÃO (Direção e Coordenação) ---
    {
        key: 'pace.faqAlertas',
        path: '/gestao-faq-alertas',
        component: lazy(() => import('@/views/pace/FaqAlertas')),
        authority: [...PAPEL_GESTAO_DIRECAO_COORDENACAO],
    },

    // --- ADMINISTRAÇÃO (Direção) ---
    {
        key: 'pace.usuarios',
        path: '/gestao-usuarios',
        component: lazy(() => import('@/views/pace/Usuarios')),
        authority: [...PAPEL_SOMENTE_DIRECAO],
    },

    // --- SISTEMA ---
    {
        key: 'pace.sair',
        path: '/sair-do-sistema',
        component: lazy(() => import('@/views/pace/Sair')),
        authority: [...PAPEL_TODOS_LOGADOS],
    },
    {
        key: 'pace.alterar-senha',
        path: '/alterar-senha',
        component: lazy(() => import('@/views/auth/AlterarSenha')),
        authority: [...PAPEL_TODOS_LOGADOS],
        meta: {
            layout: 'blank',
            pageContainerType: 'gutterless',
        },
    },
]

export default paceRoute
