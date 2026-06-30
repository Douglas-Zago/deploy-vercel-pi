import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import Reveal from '@/components/ui/Reveal'
import PasswordStrengthFeedback from '@/components/shared/PasswordStrengthFeedback'
import { isStrongPassword } from '@/utils/passwordStrength'
import { supabase } from '@/lib/supabaseClient'
import appConfig from '@/configs/app.config'
import { useSessionUser } from '@/store/authStore'

export default function AlterarSenha() {
    const navigate = useNavigate()
    const setUser = useSessionUser((state) => state.setUser)
    const [novaSenha, setNovaSenha] = useState('')
    const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('')
    const [loading, setLoading] = useState(false)
    const [erro, setErro] = useState('')

    const senhaForte = useMemo(() => isStrongPassword(novaSenha), [novaSenha])
    const senhasCoincidem = novaSenha.length > 0 && novaSenha === confirmarNovaSenha
    const isSenhaValida = senhaForte && senhasCoincidem

    const handleSalvarSenha = async (event: React.FormEvent) => {
        event.preventDefault()
        setErro('')

        if (!isSenhaValida) {
            setErro('Por favor, insira uma senha forte e confirme corretamente.')
            return
        }

        setLoading(true)

        try {
            const { data, error } = await supabase.auth.updateUser({
                password: novaSenha,
                data: { primeiro_acesso: false },
            })

            if (error) {
                throw new Error(error.message || 'Não foi possível atualizar sua senha.')
            }

            setUser({ primeiroAcesso: false })
            navigate(appConfig.authenticatedEntryPath)
        } catch (error) {
            setErro(
                error instanceof Error
                    ? error.message
                    : 'Ocorreu um erro ao atualizar sua senha. Tente novamente.',
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <Reveal direction="up" duration={0.5}>
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 mb-4 shadow-2xl shadow-indigo-500/20">
                            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Primeiro Acesso</h1>
                        <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                            Precisamos que você escolha uma nova senha antes de entrar no portal.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl rounded-3xl p-8 sm:p-10">
                        <form className="space-y-6" onSubmit={handleSalvarSenha}>
                            {erro && (
                                <div className="rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/25 p-4">
                                    <p className="text-sm text-red-700 dark:text-red-300">{erro}</p>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Nova Senha
                                </label>
                                <div className="mt-2">
                                    <input
                                        type="password"
                                        required
                                        value={novaSenha}
                                        onChange={(e) => setNovaSenha(e.target.value)}
                                        placeholder="Digite uma nova senha"
                                        className="block w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-4 text-gray-900 dark:text-white placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Confirme a Nova Senha
                                </label>
                                <div className="mt-2">
                                    <input
                                        type="password"
                                        required
                                        value={confirmarNovaSenha}
                                        onChange={(e) => setConfirmarNovaSenha(e.target.value)}
                                        placeholder="Repita a nova senha"
                                        className="block w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-4 text-gray-900 dark:text-white placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition"
                                    />
                                </div>
                                {confirmarNovaSenha.length > 0 && (
                                    <p className={`mt-2 text-sm font-medium ${senhasCoincidem ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                                        {senhasCoincidem ? 'As senhas coincidem' : 'As senhas não coincidem'}
                                    </p>
                                )}
                            </div>

                            {novaSenha.length > 0 && (
                                <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/50 p-4">
                                    <PasswordStrengthFeedback password={novaSenha} />
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading || !isSenhaValida}
                                className="w-full inline-flex justify-center items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                {loading ? 'Atualizando...' : 'Confirmar e Acessar'}
                            </button>
                        </form>
                    </div>
                </div>
            </Reveal>
        </div>
    )
}
