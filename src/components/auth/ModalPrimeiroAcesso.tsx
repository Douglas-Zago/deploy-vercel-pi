import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { useAuth } from '@/auth'
import { updateMockUser } from '@/mock/data/authData'
import { useSessionUser } from '@/store/authStore'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import PasswordStrengthFeedback from '@/components/shared/PasswordStrengthFeedback'
import {
    isStrongPassword,
    REGEX_CARACTERE_ESPECIAL_SENHA,
} from '@/utils/passwordStrength'

const MIN_SENHA = 8
const MAX_SENHA = 50

const MSG_ESPACOS = 'A senha não pode conter espaços'
const MSG_COMPLEXIDADE =
    'A senha deve conter letras maiúsculas, minúsculas, números e símbolos.'
const MSG_MINIMO = `A senha deve ter pelo menos ${MIN_SENHA} caracteres.`
const MSG_MAXIMO = `A senha pode ter no máximo ${MAX_SENHA} caracteres.`
const MSG_NAO_COINCIDEM = 'As senhas não coincidem.'

function sanitizarSenhaSemEspacos(valor: string): string {
    return valor.replace(/\s/g, '').slice(0, MAX_SENHA)
}

/** Valida senha forte com regex por regra: ≥8, maiúscula, minúscula, dígito, especial permitido; rejeita \\s */
function validarPoliticaSenha(valor: string): string | null {
    if (/\s/.test(valor)) {
        return MSG_ESPACOS
    }
    if (valor.length < MIN_SENHA) {
        return MSG_MINIMO
    }
    if (valor.length > MAX_SENHA) {
        return MSG_MAXIMO
    }
    if (!/[a-z]/.test(valor)) {
        return MSG_COMPLEXIDADE
    }
    if (!/[A-Z]/.test(valor)) {
        return MSG_COMPLEXIDADE
    }
    if (!/\d/.test(valor)) {
        return MSG_COMPLEXIDADE
    }
    if (!REGEX_CARACTERE_ESPECIAL_SENHA.test(valor)) {
        return MSG_COMPLEXIDADE
    }
    return null
}

/**
 * Troca de senha obrigatória no primeiro login (mock 100% front).
 * Não pode ser fechado pelo usuário (sem backdrop click / sem botão fechar).
 */
const ModalPrimeiroAcesso = () => {
    const { authenticated, user: authUser } = useAuth()
    const sessionUser = useSessionUser((s) => s.user)
    const setUser = useSessionUser((s) => s.setUser)

    const obrigatorio =
        authenticated &&
        (sessionUser.primeiroAcesso === true || authUser.primeiroAcesso === true)

    const [novaSenha, setNovaSenha] = useState('')
    const [confirmarSenha, setConfirmarSenha] = useState('')
    const [enviando, setEnviando] = useState(false)
    const [erroNovaSenha, setErroNovaSenha] = useState<string | null>(null)
    const [erroConfirmarSenha, setErroConfirmarSenha] = useState<string | null>(
        null,
    )

    useEffect(() => {
        if (!obrigatorio) return
        const prev = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => {
            document.body.style.overflow = prev
        }
    }, [obrigatorio])

    useEffect(() => {
        if (!obrigatorio) {
            setNovaSenha('')
            setConfirmarSenha('')
            setErroNovaSenha(null)
            setErroConfirmarSenha(null)
            setEnviando(false)
        }
    }, [obrigatorio])

    const onNovaSenhaChange = useCallback((raw: string) => {
        const cleaned = sanitizarSenhaSemEspacos(raw)
        setNovaSenha(cleaned)
        if (raw !== cleaned) {
            setErroNovaSenha(MSG_ESPACOS)
        } else {
            setErroNovaSenha(null)
        }
    }, [])

    const onConfirmarSenhaChange = useCallback((raw: string) => {
        const cleaned = sanitizarSenhaSemEspacos(raw)
        setConfirmarSenha(cleaned)
        if (raw !== cleaned) {
            setErroConfirmarSenha(MSG_ESPACOS)
        } else {
            setErroConfirmarSenha(null)
        }
    }, [])

    const handleSubmit = useCallback(
        (e: FormEvent) => {
            e.preventDefault()

            const errNova = validarPoliticaSenha(novaSenha)
            const errConf = validarPoliticaSenha(confirmarSenha)

            setErroNovaSenha(errNova)
            setErroConfirmarSenha(errConf)

            if (errNova || errConf) {
                return
            }

            if (novaSenha !== confirmarSenha) {
                setErroNovaSenha(MSG_NAO_COINCIDEM)
                setErroConfirmarSenha(MSG_NAO_COINCIDEM)
                return
            }

            setEnviando(true)
            const senhaDefinida = novaSenha
            const userId = sessionUser.userId ?? authUser.userId

            window.setTimeout(() => {
                setUser({ primeiroAcesso: false })

                if (userId) {
                    updateMockUser(userId, {
                        primeiroAcesso: false,
                        password: senhaDefinida,
                    })
                }

                setNovaSenha('')
                setConfirmarSenha('')
                setErroNovaSenha(null)
                setErroConfirmarSenha(null)
                setEnviando(false)
                toast.push(
                    <Notification type="success" title="Senha atualizada">
                        Sua senha foi definida com sucesso. Boas-vindas ao PACE!
                    </Notification>,
                    { placement: 'top-center' },
                )
            }, 180)
        },
        [
            authUser.userId,
            confirmarSenha,
            novaSenha,
            sessionUser.userId,
            setUser,
        ],
    )

    const senhaForte = useMemo(() => isStrongPassword(novaSenha), [novaSenha])
    const senhasCoincidem =
        novaSenha.length > 0 && novaSenha === confirmarSenha
    const podeConfirmar =
        senhaForte && senhasCoincidem && !enviando

    if (!obrigatorio) {
        return null
    }

    const inputErroClass =
        'border-red-400 focus:ring-red-500 focus:border-red-500 dark:border-red-600'

    return (
        <div
            className="fixed inset-0 z-[220] flex items-end justify-center sm:items-center p-0 sm:p-4 pointer-events-auto"
            aria-modal="true"
            role="dialog"
            aria-labelledby="modal-primeiro-acesso-titulo"
            aria-describedby="modal-primeiro-acesso-desc"
        >
            {/* Backdrop: sem onClick — usuário não fecha clicando fora */}
            <div
                className="absolute inset-0 bg-gray-900/70 backdrop-blur-[2px] dark:bg-black/80"
                aria-hidden
            />

            <div className="relative w-full max-w-lg max-h-[min(100vh,720px)] flex flex-col rounded-t-2xl sm:rounded-2xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-4 pt-5 pb-4 sm:px-6 sm:pt-6 border-b border-gray-100 dark:border-gray-800 shrink-0">
                    <h2
                        id="modal-primeiro-acesso-titulo"
                        className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-gray-50 break-words"
                    >
                        Defina sua nova senha
                    </h2>
                    <p
                        id="modal-primeiro-acesso-desc"
                        className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed"
                    >
                        Por segurança, este é o seu primeiro acesso. Use uma senha
                        forte (mínimo {MIN_SENHA} caracteres, com maiúsculas,
                        minúsculas, números e símbolos), sem espaços. Esta etapa é
                        obrigatória.
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6 sm:py-6 gap-5"
                >
                    <div className="flex flex-col gap-2 min-w-0">
                        <label
                            htmlFor="nova-senha-primeiro-acesso"
                            className="text-sm font-semibold text-gray-800 dark:text-gray-200"
                        >
                            Nova senha
                        </label>
                        <input
                            id="nova-senha-primeiro-acesso"
                            name="novaSenha"
                            type="password"
                            autoComplete="new-password"
                            maxLength={MAX_SENHA}
                            value={novaSenha}
                            onChange={(ev) => onNovaSenhaChange(ev.target.value)}
                            className={`w-full min-h-[44px] rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2.5 text-gray-900 dark:text-gray-100 text-base outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                                erroNovaSenha ? inputErroClass : ''
                            }`}
                            placeholder={`Mínimo ${MIN_SENHA} caracteres, senha forte`}
                            disabled={enviando}
                            required
                            aria-invalid={Boolean(erroNovaSenha)}
                            aria-describedby="nova-senha-feedback password-strength-primeiro-acesso"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {novaSenha.length}/{MAX_SENHA} caracteres · Sem espaços
                        </p>
                        {novaSenha.length > 0 && (
                            <PasswordStrengthFeedback
                                id="password-strength-primeiro-acesso"
                                password={novaSenha}
                            />
                        )}
                        {erroNovaSenha ? (
                            <p
                                id="nova-senha-feedback"
                                role="alert"
                                className="text-xs font-medium text-red-600 dark:text-red-400"
                            >
                                {erroNovaSenha}
                            </p>
                        ) : (
                            <span id="nova-senha-feedback" className="sr-only">
                                Nenhum erro neste campo.
                            </span>
                        )}
                    </div>

                    <div className="flex flex-col gap-2 min-w-0">
                        <label
                            htmlFor="confirmar-senha-primeiro-acesso"
                            className="text-sm font-semibold text-gray-800 dark:text-gray-200"
                        >
                            Confirmar nova senha
                        </label>
                        <input
                            id="confirmar-senha-primeiro-acesso"
                            name="confirmarSenha"
                            type="password"
                            autoComplete="new-password"
                            maxLength={MAX_SENHA}
                            value={confirmarSenha}
                            onChange={(ev) =>
                                onConfirmarSenhaChange(ev.target.value)
                            }
                            className={`w-full min-h-[44px] rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2.5 text-gray-900 dark:text-gray-100 text-base outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                                erroConfirmarSenha ? inputErroClass : ''
                            }`}
                            placeholder="Repita a nova senha (mesma política)"
                            disabled={enviando}
                            required
                            aria-invalid={Boolean(erroConfirmarSenha)}
                            aria-describedby="confirmar-senha-feedback"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {confirmarSenha.length}/{MAX_SENHA} caracteres
                        </p>
                        {confirmarSenha.length > 0 && (
                            <p
                                className={`text-xs font-medium ${
                                    senhasCoincidem
                                        ? 'text-green-600 dark:text-green-400'
                                        : 'text-red-500 dark:text-red-400'
                                }`}
                            >
                                {senhasCoincidem
                                    ? 'As senhas coincidem'
                                    : 'As senhas não coincidem'}
                            </p>
                        )}
                        {erroConfirmarSenha ? (
                            <p
                                id="confirmar-senha-feedback"
                                role="alert"
                                className="text-xs font-medium text-red-600 dark:text-red-400"
                            >
                                {erroConfirmarSenha}
                            </p>
                        ) : (
                            <span id="confirmar-senha-feedback" className="sr-only">
                                Nenhum erro neste campo.
                            </span>
                        )}
                    </div>

                    <div className="mt-auto pt-2 flex flex-col gap-3 sm:flex-row sm:justify-end">
                        <button
                            type="submit"
                            disabled={!podeConfirmar}
                            className="w-full sm:w-auto min-h-[44px] rounded-xl px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none transition-colors shadow-sm"
                        >
                            {enviando ? 'Salvando…' : 'Confirmar e entrar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default ModalPrimeiroAcesso
