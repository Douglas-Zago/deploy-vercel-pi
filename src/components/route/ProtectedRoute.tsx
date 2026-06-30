import appConfig from '@/configs/app.config'
import { REDIRECT_URL_KEY } from '@/constants/app.constant'
import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '@/auth'

const { unAuthenticatedEntryPath, authenticatedEntryPath } = appConfig

const ProtectedRoute = () => {
    const { authenticated, user } = useAuth()
    const location = useLocation()
    const pathName = location.pathname

    const getPathName =
        pathName === '/' ? '' : `?${REDIRECT_URL_KEY}=${pathName}`

    if (!authenticated) {
        return (
            <Navigate
                replace
                to={`${unAuthenticatedEntryPath}${getPathName}`}
            />
        )
    }

    if (user.primeiroAcesso === true && pathName !== '/alterar-senha') {
        return <Navigate replace to="/alterar-senha" />
    }

    if (user.primeiroAcesso !== true && pathName === '/alterar-senha') {
        return <Navigate replace to={authenticatedEntryPath} />
    }

    return <Outlet />
}

export default ProtectedRoute
