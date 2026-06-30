import { mock } from '../MockAdapter'
import { analyticsData } from '../data/dashboardData'

mock.onGet(`/api/dashboard/analytic`).reply(() => {
    return [200, { ...analyticsData }]
})
