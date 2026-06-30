import { useCallback, useRef, useImperativeHandle, useState } from 'react'
import AuthContext from './AuthContext'
import appConfig from '@/configs/app.config'
import { useSessionUser, useToken } from '@/store/authStore'
import { apiSignIn, apiSignUp, apiSignOut } from '@/services/AuthService'
import { supabase } from '@/lib/supabaseClient'
import { REDIRECT_URL_KEY } from '@/constants/app.constant'
import { useNavigate } from 'react-router'
import type {
    SignInCredential,
    SignUpCredential,
    AuthResult,
    OauthSignInCallbackPayload,
    User,
    Token,
} from '@/@types/auth'
import type { ReactNode, Ref } from 'react'
import type { NavigateFunction } from 'react-router'

// ==========================================
// FEATURE TOGGLE: espelha app.config.enableMock (RC offline = true)
// ==========================================
const USE_MOCK = appConfig.enableMock

type AuthProviderProps = { children: ReactNode }

export type IsolatedNavigatorRef = {
    navigate: NavigateFunction
}

const IsolatedNavigator = ({ ref }: { ref: Ref<IsolatedNavigatorRef> }) => {
    const navigate = useNavigate()
    useImperativeHandle(ref, () => ({ navigate }), [navigate])
    return <></>
}

function AuthProvider({ children }: AuthProviderProps) {
    const signedIn = useSessionUser((state) => state.session.signedIn)
    const user = useSessionUser((state) => state.user)
    const setUser = useSessionUser((state) => state.setUser)
    const setSessionSignedIn = useSessionUser((state) => state.setSessionSignedIn)
    const { token, setToken } = useToken()
    const [tokenState, setTokenState] = useState(token)
    const authenticated = Boolean(tokenState && signedIn)
    const navigatorRef = useRef<IsolatedNavigatorRef>(null)

    const redirect = () => {
        const search = window.location.search
        const params = new URLSearchParams(search)
        const redirectUrl = params.get(REDIRECT_URL_KEY)
        navigatorRef.current?.navigate(
            redirectUrl ? redirectUrl : appConfig.authenticatedEntryPath,
        )
    }

    const redirectAfterSignIn = (primeiroAcesso?: boolean) => {
        if (primeiroAcesso) {
            navigatorRef.current?.navigate('/alterar-senha')
            return
        }
        redirect()
    }

    const handleSignIn = useCallback(
        (tokens: Token, sessionUser?: User) => {
            setToken(tokens.accessToken)
            setTokenState(tokens.accessToken)
            setSessionSignedIn(true)
            if (sessionUser) setUser(sessionUser)
        },
        [setToken, setSessionSignedIn, setUser],
    )

    const handleSignOut = useCallback(() => {
        setToken('')
        setTokenState('')
        setUser({})
        setSessionSignedIn(false)
    }, [setToken, setUser, setSessionSignedIn])

    const signIn = async (values: SignInCredential): AuthResult => {
        const email = values.email?.trim().toLowerCase()
        if (!email || !values.password) {
            return { status: 'failed', message: 'Preencha o e-mail e a senha.' }
        }

        const credentials: SignInCredential = {
            email,
            password: values.password,
        }

        if (USE_MOCK) {
            try {
                const resp = await apiSignIn(credentials)
                if (resp) {
                    handleSignIn({ accessToken: resp.token }, resp.user)
                    redirectAfterSignIn(resp.user?.primeiroAcesso)
                    return { status: 'success', message: '' }
                }
                return { status: 'failed', message: 'Unable to sign in' }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (errors: any) {
                return {
                    status: 'failed',
                    message: errors?.response?.data?.message || errors.toString(),
                }
            }
        }

        try {
            const resp = await apiSignIn(credentials)
            if (resp) {
                handleSignIn({ accessToken: resp.token }, resp.user)
                redirectAfterSignIn(resp.user?.primeiroAcesso)
                return { status: 'success', message: '' }
            }
            return { status: 'failed', message: 'Não foi possível iniciar a sessão.' }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (errors: any) {
            return {
                status: 'failed',
                message:
                    errors?.response?.data?.message ||
                    'Não foi possível entrar. Verifique suas credenciais.',
            }
        }
    }

    const signUp = async (values: SignUpCredential): AuthResult => {
        if (USE_MOCK) {
            try {
                const resp = await apiSignUp(values)
                if (resp) {
                    handleSignIn({ accessToken: resp.token }, resp.user)
                    redirect()
                    return { status: 'success', message: '' }
                }
                return { status: 'failed', message: 'Unable to sign up' }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (errors: any) {
                return {
                    status: 'failed',
                    message: errors?.response?.data?.message || errors.toString(),
                }
            }
        } else {
            try {
                const { data: supabaseData, error: supabaseError } =
                    await supabase.auth.signUp({
                        email: values.email,
                        password: values.password,
                        options: { data: { userName: values.userName } },
                    })
                if (supabaseError) {
                    return {
                        status: 'failed',
                        message: supabaseError.message.includes('already registered')
                            ? 'Este email já está cadastrado.'
                            : supabaseError.message,
                    }
                }
                const supabaseUserId = supabaseData.user?.id
                if (!supabaseUserId) {
                    return { status: 'failed', message: 'Não foi possível criar a conta no Supabase.' }
                }
                const resp = await apiSignUp({ ...values, supabaseUserId } as unknown as SignUpCredential)
                if (!resp) return { status: 'failed', message: 'Não foi possível criar o usuário local.' }
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: values.email,
                    password: values.password,
                })
                if (error) return { status: 'failed', message: error.message }
                if (data.session) {
                    handleSignIn(
                        { accessToken: data.session.access_token },
                        {
                            email: data.user?.email ?? '',
                            userName: data.user?.user_metadata?.userName ?? '',
                        },
                    )
                    redirect()
                    return { status: 'success', message: '' }
                }
                return { status: 'failed', message: 'Não foi possível iniciar a sessão após o cadastro.' }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (errors: any) {
                return {
                    status: 'failed',
                    message: errors?.response?.data?.message || errors.toString(),
                }
            }
        }
    }

    const signOut = async () => {
        if (USE_MOCK) {
            try {
                await apiSignOut()
            } finally {
                handleSignOut()
                navigatorRef.current?.navigate('/')
            }
        } else {
            try {
                await supabase.auth.signOut()
            } finally {
                handleSignOut()
                navigatorRef.current?.navigate('/')
            }
        }
    }

    const oAuthSignIn = (callback: (payload: OauthSignInCallbackPayload) => void) => {
        callback({ onSignIn: handleSignIn, redirect })
    }

    return (
        <AuthContext.Provider value={{ authenticated, user, signIn, signUp, signOut, oAuthSignIn }}>
            {children}
            <IsolatedNavigator ref={navigatorRef} />
        </AuthContext.Provider>
    )
}

export default AuthProvider
