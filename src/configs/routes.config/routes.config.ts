import dashboardsRoute from './dashboardsRoute'
import authRoute from './authRoute'
import othersRoute from './othersRoute'
import paceRoute from './paceRoute'

import type { Routes } from '@/@types/routes'

export const publicRoutes: Routes = [...authRoute, ...othersRoute]

export const protectedRoutes: Routes = [
    ...dashboardsRoute,
    ...paceRoute,
]
