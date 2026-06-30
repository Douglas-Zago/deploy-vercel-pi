export type AppConfig = {
    apiPrefix: string
    authenticatedEntryPath: string
    unAuthenticatedEntryPath: string
    locale: string
    accessTokenPersistStrategy: 'localStorage' | 'sessionStorage' | 'cookies'
    enableMock: boolean
    activeNavTranslation: boolean
}

const appConfig: AppConfig = {
    apiPrefix: '/api',
    authenticatedEntryPath: '/painel',
    unAuthenticatedEntryPath: '/sign-in',
    locale: 'pt',
    accessTokenPersistStrategy: 'localStorage',
    enableMock: false,
    activeNavTranslation: true,
}

export default appConfig
