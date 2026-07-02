import { useState, useEffect, useCallback } from 'react'
import Button from '@/components/ui/Button'
import { apiForgotPassword } from '@/services/AuthService'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { ZodType } from 'zod'
import type { CommonProps } from '@/@types/common'

const COOLDOWN_SECONDS = 60

interface ForgotPasswordFormProps extends CommonProps {
    isSubmitted: boolean
    setIsSubmitted?: (submitted: boolean) => void
}

type ForgotPasswordFormSchema = {
    email: string
}

const validationSchema: ZodType<ForgotPasswordFormSchema> = z.object({
    email: z.string().email('Informe um e-mail válido.'),
})

const ForgotPasswordForm = (props: ForgotPasswordFormProps) => {
    const [isSubmitting, setSubmitting] = useState<boolean>(false)
    const [cooldown, setCooldown] = useState(0)

    const { className, setIsSubmitted, isSubmitted } = props

    const {
        handleSubmit,
        formState: { errors },
        control,
    } = useForm<ForgotPasswordFormSchema>({
        resolver: zodResolver(validationSchema),
    })

    useEffect(() => {
        if (cooldown <= 0) return
        const timer = window.setInterval(() => {
            setCooldown((prev) => (prev <= 1 ? 0 : prev - 1))
        }, 1000)
        return () => window.clearInterval(timer)
    }, [cooldown])

    const iniciarCooldown = useCallback(() => {
        setCooldown(COOLDOWN_SECONDS)
    }, [])

    const onForgotPassword = async (values: ForgotPasswordFormSchema) => {
        if (cooldown > 0) return

        setSubmitting(true)

        try {
            await apiForgotPassword<boolean>({ email: values.email })
        } catch {
            // Anti-enumeração: resposta idêntica independentemente do e-mail existir ou não.
        } finally {
            setIsSubmitted?.(true)
            iniciarCooldown()
            setSubmitting(false)
        }
    }

    const botaoDesabilitado = isSubmitting || cooldown > 0
    const textoBotao = isSubmitting
        ? 'Enviando...'
        : cooldown > 0
          ? `Reenviar em ${cooldown}s`
          : isSubmitted
            ? 'Reenviar link'
            : 'Enviar link de redefinição'

    return (
        <div className={className}>
            <form onSubmit={handleSubmit(onForgotPassword)} className="space-y-5">
                {errors.email && (
                    <div className="rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-600 dark:text-red-400">
                        {errors.email.message}
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        E-mail institucional
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

                        <Controller
                            name="email"
                            control={control}
                            render={({ field }) => (
                                <input
                                    type="email"
                                    autoComplete="email"
                                    placeholder="Digite seu e-mail institucional"
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-500 dark:text-white transition-all shadow-sm hover:shadow-md"
                                    {...field}
                                />
                            )}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={botaoDesabilitado}
                    className="w-full flex items-center justify-center gap-2.5 py-4 px-4 border border-transparent rounded-2xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                >
                    {isSubmitting ? (
                        <>
                            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                                <path
                                    className="opacity-90"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                />
                            </svg>
                            <span>Enviando...</span>
                        </>
                    ) : (
                        textoBotao
                    )}
                </button>
            </form>
        </div>
    )
}

export default ForgotPasswordForm
