import { mock } from './MockAdapter'
import './fakeApi/authFakeApi'
import './fakeApi/commonFakeApi'
import './fakeApi/dashboardFakeApi'

type MockServerOptions = {
    environment?: string
}

export function mockServer(_options: MockServerOptions = {}) {
    // Requisições sem handler específico seguem para a API real.
    mock.onAny().passThrough()
    return mock
}
