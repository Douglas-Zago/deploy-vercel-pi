import { useState } from 'react'
import Drawer from '@/components/ui/Drawer'
import classNames from '@/utils/classNames'
import useScrollTop from '@/utils/hooks/useScrollTop'
import { MODE_LIGHT } from '@/constants/theme.constant'
import { TbMenu2 } from 'react-icons/tb'
import type { Mode } from '@/@types/theme'

type NavigationVariant = 'landing' | 'minimal'

type NavigationProps = {
    toggleMode: () => void
    mode: Mode
    /** Na página FAQ: apenas logo e tema */
    variant?: NavigationVariant
}

const LANDING_SECTIONS = [
    { id: 'features', label: 'Sobre a Escola' },
    { id: 'faq', label: 'Dúvidas (FAQ)' },
    { id: 'contato', label: 'Contato' },
] as const

const NavigationBar = ({
    toggleMode,
    mode,
    variant = 'landing',
}: NavigationProps) => {
    const { isSticky } = useScrollTop()
    const [isOpen, setIsOpen] = useState(false)
    const isMinimal = variant === 'minimal'

    const handleNavClick = (sectionId: string) => {
        setIsOpen(false)
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
    }

    return (
        <div
            style={{ transition: 'all 0.2s ease-in-out' }}
            className={classNames(
                'w-full fixed inset-x-0 z-40',
                isSticky ? 'top-4' : 'top-0',
            )}
        >
            <div
                className={classNames(
                    'flex flex-row items-center justify-between py-3 max-w-7xl mx-auto px-4 rounded-xl relative z-40 w-full transition duration-200',
                    isSticky
                        ? 'bg-white dark:bg-gray-800 shadow-lg'
                        : 'bg-transparent dark:bg-transparent',
                )}
            >
                <div className="flex items-center gap-3 min-w-0">
                    {!isMinimal && (
                        <button
                            type="button"
                            className="flex lg:hidden items-center shrink-0"
                            onClick={() => setIsOpen(true)}
                            aria-label="Abrir menu de navegação"
                        >
                            <TbMenu2 size={24} />
                        </button>
                    )}

                    <a href="/" className="flex items-center overflow-visible pl-1 sm:pl-2">
                        <img
                            src={
                                mode === MODE_LIGHT
                                    ? '/img/logo/logo-light-full.svg'
                                    : '/img/logo/logo-dark-full.svg'
                            }
                            width={160}
                            height={55}
                            style={{ transform: 'scale(1.8)', transformOrigin: 'left center' }}
                            alt="Logo PACE"
                        />
                    </a>
                </div>

                {!isMinimal && (
                    <Drawer
                        title=""
                        isOpen={isOpen}
                        width={250}
                        placement="left"
                        onClose={() => setIsOpen(false)}
                        onRequestClose={() => setIsOpen(false)}
                    >
                        <div className="flex flex-col gap-4 mt-4">
                            {LANDING_SECTIONS.map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => handleNavClick(item.id)}
                                    className="text-left py-2 px-4 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg transition-all text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                                >
                                    {item.label}
                                </button>
                            ))}
                            <div className="pt-4 border-t border-gray-100 dark:border-gray-700 mt-2">
                                <a
                                    href="/sign-in"
                                    className="block text-center py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                                >
                                    Acessar o Portal
                                </a>
                            </div>
                        </div>
                    </Drawer>
                )}

                {!isMinimal && (
                    <div className="lg:flex flex-row flex-1 absolute inset-0 hidden items-center justify-center gap-8 text-sm font-medium pointer-events-none">
                        {LANDING_SECTIONS.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => handleNavClick(item.id)}
                                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 px-4 py-2 rounded-full transition-all font-medium pointer-events-auto"
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                )}

                <div className="flex items-center gap-2 sm:gap-4 relative z-10 shrink-0 ml-auto">
                    <button
                        type="button"
                        className="relative flex items-center justify-center rounded-xl p-2 text-neutral-500 dark:text-neutral-400"
                        onClick={toggleMode}
                        aria-label="Alternar tema"
                    >
                        <svg
                            className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
                            fill="none"
                            height="16"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            width="16"
                            aria-hidden
                        >
                            <circle cx="12" cy="12" r="4" />
                            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                        </svg>
                        <svg
                            className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
                            fill="none"
                            height="16"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            width="16"
                            aria-hidden
                        >
                            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                        </svg>
                    </button>

                    {!isMinimal && (
                        <a
                            href="/sign-in"
                            className="hidden sm:block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm"
                        >
                            Acessar o Portal
                        </a>
                    )}
                </div>
            </div>
        </div>
    )
}

export default NavigationBar
