import { mock } from './MockAdapter'
import './fakeApi/authFakeApi'
import './fakeApi/commonFakeApi'
import './fakeApi/dashboardFakeApi'

mock.onAny().passThrough()
