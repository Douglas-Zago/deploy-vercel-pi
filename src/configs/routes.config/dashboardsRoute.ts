import { lazy } from 'react'
import { DASHBOARDS_PREFIX_PATH } from '@/constants/route.constant'
import { ADMIN, ALUNO } from '@/constants/roles.constant'
import type { Routes } from '@/@types/routes'

const dashboardsRoute: Routes = [
    {
        key: 'dashboard.analytic',
        path: `${DASHBOARDS_PREFIX_PATH}/analytic`,
        component: lazy(() => import('@/views/dashboards/AnalyticDashboard')),
        authority: [ADMIN, ALUNO],
        meta: {
            pageContainerType: 'contained',
            pageBackgroundType: 'plain',
        },
    },
]

export default dashboardsRoute
