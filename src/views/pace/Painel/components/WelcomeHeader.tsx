import { formatarDataHojeExtenso } from '../utils'

type WelcomeHeaderProps = {
    userName: string
}

const WelcomeHeader = ({ userName }: WelcomeHeaderProps) => {
    const nomeExibicao = userName?.trim() || 'usuário'

    return (
        <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                Olá, {nomeExibicao} 👋
            </h1>
            <p className="mt-2 text-base md:text-lg text-gray-500 dark:text-gray-400">
                {formatarDataHojeExtenso()}
            </p>
        </header>
    )
}

export default WelcomeHeader
