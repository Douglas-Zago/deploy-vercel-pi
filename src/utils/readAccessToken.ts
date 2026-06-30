import appConfig from '@/configs/app.config'
import { TOKEN_NAME_IN_STORAGE } from '@/constants/api.constant'
import cookiesStorage from '@/utils/cookiesStorage'

export function readAccessToken(): string {
    const strategy = appConfig.accessTokenPersistStrategy

    if (strategy === 'localStorage') {
        return localStorage.getItem(TOKEN_NAME_IN_STORAGE) || ''
    }

    if (strategy === 'sessionStorage') {
        return sessionStorage.getItem(TOKEN_NAME_IN_STORAGE) || ''
    }

    return cookiesStorage.getItem(TOKEN_NAME_IN_STORAGE) || ''
}
