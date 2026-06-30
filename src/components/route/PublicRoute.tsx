import { Navigate, Outlet } from 'react-router'
import appConfig from '@/configs/app.config'
import { useAuth } from '@/auth'

const { authenticatedEntryPath } = appConfig

const PublicRoute = () => {
    const { authenticated, user } = useAuth()

    if (!authenticated) {
        return <Outlet />
    }

    if (user.primeiroAcesso === true) {
        return <Navigate replace to="/alterar-senha" />
    }

    return <Navigate replace to={authenticatedEntryPath} />
}

export default PublicRoute
