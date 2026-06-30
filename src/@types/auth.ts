// src/@types/auth.ts
// DTOs e respostas de autenticação — espelham com.pifaculdade.dto (AuthRequest, AuthResponse, RegisterRequest)

/** POST /auth/sign-in — com.pifaculdade.dto.AuthRequest */
export type SignInCredential = {
    email: string
    password: string
}

/** Usuário na resposta de login — com.pifaculdade.dto.AuthResponse.UserResponse */
export type AuthUserResponse = {
    userId: string
    userName: string
    email: string
    authority: string[]
    active: boolean
    primeiroAcesso: boolean
}

/** POST /auth/sign-in — com.pifaculdade.dto.AuthResponse */
export type SignInResponse = {
    token: string
    user: AuthUserResponse
}

export type SignUpResponse = SignInResponse

/** POST /auth/sign-up — com.pifaculdade.dto.RegisterRequest */
export type SignUpCredential = {
    userName: string
    email: string
    password: string
    supabaseUserId?: string
}

export type ForgotPassword = {
    email: string
}

export type ResetPassword = {
    password: string
}

export type AuthRequestStatus = 'success' | 'failed' | ''

export type AuthResult = Promise<{
    status: AuthRequestStatus
    message: string
}>

/**
 * Sessão do usuário autenticado no front.
 * Alinhado a AuthUserResponse; campos extras são apenas uso local do template (mock/UI).
 */
export type User = {
    userId?: string | null
    userName?: string | null
    email?: string | null
    authority?: string[]
    active?: boolean
    primeiroAcesso?: boolean
    avatar?: string | null
    turma?: string | null
}

export type Token = {
    accessToken: string
    refereshToken?: string
}

export type OauthSignInCallbackPayload = {
    onSignIn: (tokens: Token, user?: User) => void
    redirect: () => void
}
