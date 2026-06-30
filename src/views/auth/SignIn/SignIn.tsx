import { useState } from 'react'
import Logo from '@/components/template/Logo'
import Alert from '@/components/ui/Alert'
import SignInForm from './components/SignInForm'
import ActionLink from '@/components/shared/ActionLink'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'
import { useThemeStore } from '@/store/themeStore'
import Reveal from '@/components/ui/Reveal'

type SignInProps = {
    disableSubmit?: boolean
}

export const SignInBase = ({ disableSubmit }: SignInProps) => {
    const [message, setMessage] = useTimeOutMessage()
    const mode = useThemeStore((state) => state.mode)
    
    // Estado para controlar o aviso de "Esqueceu a senha"
    const [isForgotModalOpen, setIsForgotModalOpen] = useState(false)

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
                    <h2 className="mb-2 text-3xl font-extrabold text-gray-900 dark:text-white">Bem-vindo(a)!</h2>
                    <p className="font-semibold text-gray-600 dark:text-gray-400">
                        Insira suas credenciais para acessar.
                    </p>
                </div>
                
                <ActionLink
                    to="/"
                    className="text-sm text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 whitespace-nowrap ml-4 flex items-center gap-2 font-bold px-4 py-2 rounded-full bg-gray-50 hover:bg-indigo-50 dark:bg-gray-800/50 dark:hover:bg-indigo-900/30 transition-all border border-gray-100 hover:border-indigo-200 dark:border-gray-700 dark:hover:border-indigo-800 shadow-sm"
                    themeColor={false}
                    title="Voltar para a Página Inicial"
                >
                    <span className="text-xl leading-none">&larr;</span> Início
                </ActionLink>
            </div>

            {message && (
                <Alert showIcon className="mb-4" type="danger">
                    <span className="break-all">{message}</span>
                </Alert>
            )}

            <SignInForm
                disableSubmit={disableSubmit}
                setMessage={setMessage}
                passwordHint={
                    <div className="mt-2">
                        <button
                            type="button"
                            onClick={() => setIsForgotModalOpen(true)}
                            className="font-semibold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 underline focus:outline-none bg-transparent border-none p-0 cursor-pointer text-sm"
                        >
                            Esqueceu a senha?
                        </button>
                    </div>
                }
            />

            <div>
                <div className="mt-8 text-center text-gray-600 dark:text-gray-400">
                    <span>Ainda não tem acesso? </span>
                    <button
                        type="button"
                        onClick={() => setIsForgotModalOpen(true)}
                        className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 font-bold ml-1 focus:outline-none bg-transparent border-none p-0 cursor-pointer"
                    >
                        Procure a Secretaria
                    </button>
                </div>
            </div>

            {/* MODAL DE ESQUECEU A SENHA / SUPORTE */}
            {isForgotModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <Reveal direction="down" duration={0.3}>
                        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-sm p-6 border border-gray-100 dark:border-gray-800 text-center relative overflow-hidden">
                            {/* Ícone ilustrativo */}
                            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                Precisa de Ajuda?
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                Por questões de segurança, a redefinição de senhas e a criação de novos acessos são realizadas exclusivamente pela coordenação. <br/><br/>
                                <strong>Por favor, dirija-se à Secretaria da escola ou contate um Administrador do sistema.</strong>
                            </p>
                            
                            <button 
                                onClick={() => setIsForgotModalOpen(false)} 
                                className="w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors shadow-sm"
                            >
                                Entendi
                            </button>
                        </div>
                    </Reveal>
                </div>
            )}
        </>
    )
}

const SignIn = () => {
    return <SignInBase />
}

export default SignIn