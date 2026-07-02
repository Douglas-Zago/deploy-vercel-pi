// src/views/auth/SignIn/components/SignInForm.tsx

import React, { useState } from 'react'
import { z } from 'zod'
import { useAuth } from '@/auth'
import Reveal from '@/components/ui/Reveal'
import TermosDeUsoModal from '@/components/shared/TermosDeUsoModal'
import { TERMOS_VERSAO } from '@/constants/termosDeUso'

interface SignInFormProps {
    className?: string
    disableSubmit?: boolean
    setMessage?: (message: string) => void
    passwordHint?: React.ReactNode
}

const signInSchema = z.object({
    email: z
        .string()
        .min(1, 'Informe seu usuário ou e-mail.')
        .refine(
            (val) => !val.includes('@') || z.string().email().safeParse(val).success,
            { message: 'Informe um e-mail válido.' },
        ),
    password: z.string().min(1, 'A senha é obrigatória.'),
})

const SignInForm = ({ className, disableSubmit, setMessage, passwordHint }: SignInFormProps) => {
    const { signIn } = useAuth()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [termosAceitos, setTermosAceitos] = useState(false)

    const [isTermosOpen, setIsTermosOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [erroLocal, setErroLocal] = useState('')

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setErroLocal('')

        if (!termosAceitos) {
            setErroLocal('Você precisa aceitar os Termos de Uso para acessar o portal.')
            return
        }

        const parsed = signInSchema.safeParse({ email, password })
        if (!parsed.success) {
            setErroLocal(parsed.error.issues[0]?.message ?? 'Dados inválidos.')
            return
        }

        setLoading(true)

        const result = await signIn(parsed.data)

        if (result?.status === 'failed') {
            setErroLocal('Credenciais inválidas. Verifique seu e-mail e senha.')
            setMessage?.('Credenciais inválidas.')
        } else if (result?.status === 'success') {
            localStorage.setItem('pace_termos_aceitos', TERMOS_VERSAO)
        }

        setLoading(false)
    }

    return (
        <div className={className}>
            <Reveal direction="up" duration={0.4}>
                <form onSubmit={handleLogin} className="space-y-5">
                    {erroLocal && (
                        <div className="animate-[shake_0.35s_ease-in-out] rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 shadow-sm overflow-hidden">
                            <div className="flex items-start gap-3 p-4">
                                <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2.2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-red-700 dark:text-red-300">
                                        Não foi possível continuar
                                    </p>
                                    <p className="text-sm text-red-600 dark:text-red-400 mt-0.5">
                                        {erroLocal}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Usuário ou e-mail
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <svg
                                    className="w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                    />
                                </svg>
                            </div>

                            <input
                                type="text"
                                autoComplete="username"
                                required
                                disabled={disableSubmit || loading}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-500 dark:text-white transition-all shadow-sm hover:shadow-md"
                                placeholder="Ex.: direcao ou seu e-mail institucional"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Senha
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <svg
                                    className="w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 11c0 .552-.448 1-1 1s-1-.448-1-1 .448-1 1-1 1 .448 1 1zm6-3h-1V7a5 5 0 00-10 0v1H6a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2v-8a2 2 0 00-2-2zm-8-1a3 3 0 116 0v1h-6V7z"
                                    />
                                </svg>
                            </div>

                            <input
                                type="password"
                                required
                                disabled={disableSubmit || loading}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-500 dark:text-white transition-all shadow-sm hover:shadow-md"
                                placeholder="Digite sua senha"
                            />
                        </div>

                        <div className="flex justify-end w-full -mt-0.5">
                            {passwordHint}
                        </div>
                    </div>

                    {/* Aceite de Termos de Uso */}
                    <div className="flex items-start gap-3 pt-1">
                        <label htmlFor="termos" className="relative mt-0.5 cursor-pointer shrink-0">
                            <input
                                id="termos"
                                type="checkbox"
                                checked={termosAceitos}
                                disabled={disableSubmit || loading}
                                onChange={(e) => setTermosAceitos(e.target.checked)}
                                className="peer sr-only"
                            />
                            <div className="w-5 h-5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm transition-all peer-checked:bg-indigo-600 peer-checked:border-indigo-600 peer-focus:ring-4 peer-focus:ring-indigo-500/20"></div>
                            <svg
                                className="absolute inset-0 m-auto w-3.5 h-3.5 text-white opacity-0 scale-75 transition-all peer-checked:opacity-100 peer-checked:scale-100"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={3}
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        </label>

                        <label htmlFor="termos" className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer leading-relaxed">
                            Li e aceito os{' '}
                            <button
                                type="button"
                                className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline focus:outline-none"
                                onClick={(e) => {
                                    e.preventDefault()
                                    setIsTermosOpen(true)
                                }}
                            >
                                Termos de Uso e Política de Privacidade
                            </button>
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={disableSubmit || loading || !termosAceitos}
                        className="w-full flex items-center justify-center gap-2.5 py-4 px-4 mt-6 border border-transparent rounded-2xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                    >
                        {loading ? (
                            <>
                                <svg
                                    className="w-5 h-5 animate-spin"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-90"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                    ></path>
                                </svg>
                                <span>Acessando...</span>
                            </>
                        ) : (
                            <>
                                <span>Entrar no Portal</span>
                                <svg className="w-4 h-4 opacity-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2.2}
                                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                                    />
                                </svg>
                            </>
                        )}
                    </button>
                </form>
            </Reveal>

            <TermosDeUsoModal
                isOpen={isTermosOpen}
                onClose={() => setIsTermosOpen(false)}
                onAccept={() => {
                    setTermosAceitos(true)
                    setIsTermosOpen(false)
                }}
            />

            <style>{`
                @keyframes shake {
                    0% { transform: translateX(0); }
                    20% { transform: translateX(-5px); }
                    40% { transform: translateX(5px); }
                    60% { transform: translateX(-4px); }
                    80% { transform: translateX(4px); }
                    100% { transform: translateX(0); }
                }
            `}</style>
        </div>
    )
}

export default SignInForm