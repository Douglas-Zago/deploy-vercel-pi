import { lazy } from 'react'
import { ADMIN, PROFESSOR, ALUNO } from '@/constants/roles.constant'
import type { Routes } from '@/@types/routes'

const othersRoute: Routes = [
    {
        key: 'landing',
        path: `/`,
        component: lazy(() => import('@/views/others/Landing')),
        authority: [],
        meta: {
            layout: 'blank',
            footer: false,
            pageContainerType: 'gutterless',
            pageBackgroundType: 'plain',
        },
    },
    
    // --- Nova rota: FAQ Completo e Público ---
    {
        key: 'others.faqCompleto',
        path: `/faq-completo`,
        component: lazy(() => import('@/views/others/FaqCompleto')),
        authority: [], // Array vazio garante que visitantes sem login possam acessar
        meta: {
            layout: 'blank', // Tira a barra lateral do admin
            footer: false,
            pageContainerType: 'gutterless',
            pageBackgroundType: 'plain',
        },
    },
    // ----------------------------------------

    {
        key: 'accessDenied',
        path: `/access-denied`,
        component: lazy(() => import('@/views/others/AccessDenied')),
        authority: [ADMIN, PROFESSOR, ALUNO],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
]

export default othersRoute