import { mock } from '../MockAdapter'
import {
    appendMockUser,
    findMockUserByLogin,
    getSignInUserData,
    initialPasswordFromCpf,
    type MockSignInUser,
} from '../data/authData'
import type { AuthUserResponse } from '@/@types/auth'
import { ALUNO } from '@/constants/roles.constant'

const toAuthUserResponse = (
    user: MockSignInUser,
): AuthUserResponse & { avatar?: string; turma?: string | null } => ({
    userId: user.userId,
    userName: user.userName,
    email: user.email,
    authority: user.authority,
    active: user.active,
    primeiroAcesso: user.primeiroAcesso,
    somenteLeitura: user.somenteLeitura,
    avatar: user.avatar,
    turma: user.turma,
})

mock.onPost(`/sign-in`).reply((config) => {
    const data = JSON.parse(config.data as string) as {
        email: string
        password: string
    }

    const email = data.email?.trim().toLowerCase()
    const { password } = data

    if (!email || !password) {
        return [400, { message: 'Preencha o usuário/e-mail e a senha.' }]
    }

    const user = findMockUserByLogin(email)

    if (user && user.password === password) {
        return new Promise(function (resolve) {
            setTimeout(function () {
                resolve([
                    201,
                    {
                        user: toAuthUserResponse(user),
                        token: 'wVYrxaeNa9OxdnULvde1Au5m5w63',
                    },
                ])
            }, 800)
        })
    }

    return [401, { message: 'Credenciais inválidas. Verifique seu e-mail e senha.' }]
})

mock.onPost(`/sign-up`).reply((config) => {
    const data = JSON.parse(config.data as string) as {
        email: string
        password: string
        userName: string
        cpf?: string
    }

    const email = data.email.trim().toLowerCase()
    const users = getSignInUserData()
    const emailUsed = users.some((user) => user.email.toLowerCase() === email)

    const cpf = data.cpf?.replace(/\D/g, '') ?? ''
    const senhaInicial = cpf ? initialPasswordFromCpf(cpf) : data.password

    const newUser: MockSignInUser = {
        userId: String(Date.now()),
        userName: data.userName,
        email,
        matricula: email.split('@')[0].toUpperCase(),
        cpf: cpf || '00000000000',
        password: senhaInicial,
        authority: [ALUNO],
        active: true,
        primeiroAcesso: true,
        avatar: '',
        turma: null,
    }

    return new Promise(function (resolve) {
        setTimeout(function () {
            if (emailUsed) {
                resolve([400, { message: 'User already exist!' }])
                return
            }

            appendMockUser(newUser)

            resolve([
                201,
                {
                    user: toAuthUserResponse(newUser),
                    token: 'wVYrxaeNa9OxdnULvde1Au5m5w63',
                },
            ])
        }, 800)
    })
})

mock.onPost(`/reset-password`).reply(() => {
    return [200, true]
})

mock.onPost(`/forgot-password`).reply(() => {
    return [200, true]
})

mock.onPost(`/auth/esqueci-senha`).reply((config) => {
    const data = JSON.parse(config.data as string) as { email: string }
    const email = data.email?.trim().toLowerCase()

    if (!email) {
        return [400, { message: 'Informe seu e-mail.' }]
    }

    const userExists = Boolean(findMockUserByLogin(email))

    return new Promise(function (resolve) {
        setTimeout(function () {
            if (userExists) {
                // Em produção: enviaria e-mail com link de redefinição.
                // Mock: apenas simula o envio silenciosamente.
            }

            // Anti-enumeração: mesma resposta para e-mail existente ou inexistente.
            resolve([200, true])
        }, 800)
    })
})

mock.onPost(`/auth/redefinir-senha-obrigatoria`).reply(() => {
    return [200, true]
})

mock.onPost(`/sign-out`).reply(() => {
    return [200, true]
})
