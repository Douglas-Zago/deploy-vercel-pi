import { useState } from 'react'
import { useNavigate } from 'react-router'
import Logo from '@/components/template/Logo'
import Alert from '@/components/ui/Alert'
import ActionLink from '@/components/shared/ActionLink'
import ForgotPasswordForm from './components/ForgotPasswordForm'
import Button from '@/components/ui/Button'
import Reveal from '@/components/ui/Reveal'
import { useThemeStore } from '@/store/themeStore'

type ForgotPasswordProps = {
    signInUrl?: string
}

export const ForgotPasswordBase = ({
    signInUrl = '/sign-in',
}: ForgotPasswordProps) => {
    const [isSubmitted, setIsSubmitted] = useState(false)
    const mode = useThemeStore((state) => state.mode)
    const navigate = useNavigate()

    return (
        <>
            <div className="mb-14 mt-6 flex justify-center">
                <Logo
                    type="streamline"
                    mode={mode}
                    imgClass="mx-auto"
                    logoWidth={100}
                    style={{ transform: 'scale(2.2)' }}
                />
            </div>

            <div className="mb-8 flex justify-between items-start">
                <div>
                    <h2 className="mb-2 text-3xl font-extrabold text-gray-900 dark:text-white">
                        Esqueceu a senha?
                    </h2>
                    <p className="font-semibold text-gray-600 dark:text-gray-400">
                        Informe seu e-mail institucional para solicitar a redefinição.
                    </p>
                </div>

                <ActionLink
                    to={signInUrl}
                    className="text-sm text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 whitespace-nowrap ml-4 flex items-center gap-2 font-bold px-4 py-2 rounded-full bg-gray-50 hover:bg-indigo-50 dark:bg-gray-800/50 dark:hover:bg-indigo-900/30 transition-all border border-gray-100 hover:border-indigo-200 dark:border-gray-700 dark:hover:border-indigo-800 shadow-sm"
                    themeColor={false}
                    title="Voltar para o login"
                >
                    <span className="text-xl leading-none">&larr;</span> Login
                </ActionLink>
            </div>

            {isSubmitted && (
                <Reveal direction="up" duration={0.3}>
                    <Alert showIcon className="mb-4 text-sm" type="success">
                        Se o e-mail estiver cadastrado, enviaremos um link de redefinição.
                    </Alert>
                </Reveal>
            )}

            <Reveal direction="up" duration={0.4}>
                <ForgotPasswordForm
                    isSubmitted={isSubmitted}
                    setIsSubmitted={setIsSubmitted}
                />
            </Reveal>

            <Button
                block
                variant="plain"
                type="button"
                className="mt-4"
                onClick={() => navigate(signInUrl)}
            >
                Voltar ao login
            </Button>
        </>
    )
}

const ForgotPassword = () => {
    return <ForgotPasswordBase />
}

export default ForgotPassword
