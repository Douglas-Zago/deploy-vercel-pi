import Reveal from '@/components/ui/Reveal'
import { useSessionUser } from '@/store/authStore'
import WelcomeHeader from './components/WelcomeHeader'
import StatCards from './components/StatCards'
import QuickAccess from './components/QuickAccess'

const PainelInicial = () => {
    const user = useSessionUser((state) => state.user)

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
            <Reveal>
                <WelcomeHeader userName={user.userName ?? ''} />
            </Reveal>

            <Reveal delay={0.05}>
                <StatCards authority={user.authority} />
            </Reveal>

            <Reveal delay={0.1}>
                <QuickAccess authority={user.authority} />
            </Reveal>
        </div>
    )
}

export default PainelInicial
