import { createElement } from 'react'
import { useSessionUser, useToken } from '@/store/authStore'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import type { AxiosError } from 'axios'

const unauthorizedCode = [401, 419, 440]

export type ApiValidationError = {
    isApiError: true
    kind: 'validation'
    status: number
    errors: Record<string, string>
    response?: AxiosError['response']
}

export type ApiMessageError = {
    isApiError: true
    kind: 'message'
    status: number
    message: string
    response?: AxiosError['response']
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function normalizeFieldErrors(errors: Record<string, unknown>): Record<string, string> {
    const normalized: Record<string, string> = {}
    for (const [field, value] of Object.entries(errors)) {
        if (typeof value === 'string') {
            normalized[field] = value
        } else if (Array.isArray(value) && typeof value[0] === 'string') {
            normalized[field] = value[0]
        }
    }
    return normalized
}

const AxiosResponseIntrceptorErrorCallback = (error: AxiosError) => {
    const { response } = error
    const { setToken } = useToken()

    if (response && unauthorizedCode.includes(response.status)) {
        setToken('')
        useSessionUser.getState().setUser({})
        useSessionUser.getState().setSessionSignedIn(false)
    }

    const data = response?.data

    if (isRecord(data) && isRecord(data.errors)) {
        const fieldErrors = normalizeFieldErrors(data.errors)
        if (Object.keys(fieldErrors).length > 0) {
            const validationError: ApiValidationError = {
                isApiError: true,
                kind: 'validation',
                status: response?.status ?? 400,
                errors: fieldErrors,
                response,
            }
            return Promise.reject(validationError)
        }
    }

    const message =
        isRecord(data) && typeof data.message === 'string' ? data.message : undefined

    if (message) {
        toast.push(
            createElement(Notification, { type: 'danger', title: 'Erro' }, message),
            { placement: 'top-center' },
        )

        const messageError: ApiMessageError = {
            isApiError: true,
            kind: 'message',
            status: response?.status ?? 500,
            message,
            response,
        }
        return Promise.reject(messageError)
    }

    return Promise.reject(error)
}

export default AxiosResponseIntrceptorErrorCallback
