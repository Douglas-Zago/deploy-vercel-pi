// src/services/AuthService.ts

import ApiService from './ApiService'
import endpointConfig from '@/configs/endpoint.config'
import type {
    SignInCredential,
    SignUpCredential,
    ForgotPassword,
    ResetPassword,
    SignInResponse,
    SignUpResponse,
} from '@/@types/auth'

export async function apiSignIn(data: SignInCredential) {
    return ApiService.fetchDataWithAxios<SignInResponse>({
        url: endpointConfig.signIn,
        method: 'post',
        data: {
            email: data.email.trim().toLowerCase(),
            password: data.password,
        },
    })
}

// RESTAURADO PARA O APP NÃO QUEBRAR A TELA BRANCA
export async function apiSignUp(data: SignUpCredential) {
    return ApiService.fetchDataWithAxios<SignUpResponse>({
        url: endpointConfig.signUp,
        method: 'post',
        data,
    })
}

export async function apiSignOut() {
    return ApiService.fetchDataWithAxios({
        url: endpointConfig.signOut,
        method: 'post',
    })
}

export async function apiForgotPassword<T>(data: ForgotPassword) {
    return ApiService.fetchDataWithAxios<T>({
        url: endpointConfig.forgotPassword,
        method: 'post',
        data: {
            email: data.email.trim().toLowerCase(),
        },
    })
}

export async function apiResetPassword<T>(data: ResetPassword) {
    return ApiService.fetchDataWithAxios<T>({
        url: endpointConfig.resetPassword,
        method: 'post',
        data,
    })
}

// NOSSA NOVA FUNÇÃO DE FORÇAR TROCA DE SENHA
export async function apiAtualizarSenhaObrigatoria(novaSenha: string) {
    return ApiService.fetchDataWithAxios<void, { senhaNova: string }>({
        url: '/auth/redefinir-senha-obrigatoria', 
        method: 'post',
        data: { senhaNova: novaSenha },
    })
}