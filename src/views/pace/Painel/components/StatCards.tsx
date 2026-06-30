import { isPerfilGestao } from '../utils'

export type StatCardItem = {
    label: string
    value: string
    icon: string
    accent: string
    iconBg: string
}

const CARDS_GESTAO: StatCardItem[] = [
    {
        label: 'Total de Alunos',
        value: '1.205',
        icon: '🎓',
        accent: 'border-blue-200 dark:border-blue-800/50',
        iconBg: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300',
    },
    {
        label: 'Avisos no Mural',
        value: '12',
        icon: '📢',
        accent: 'border-amber-200 dark:border-amber-800/50',
        iconBg: 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300',
    },
    {
        label: 'Chamados Pendentes',
        value: '5',
        icon: '🛠️',
        accent: 'border-orange-200 dark:border-orange-800/50',
        iconBg: 'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-300',
    },
    {
        label: 'Itens Perdidos',
        value: '8',
        icon: '🔍',
        accent: 'border-violet-200 dark:border-violet-800/50',
        iconBg: 'bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-300',
    },
]

const CARDS_ROTINA: StatCardItem[] = [
    {
        label: 'Aulas Hoje',
        value: '4',
        icon: '📅',
        accent: 'border-emerald-200 dark:border-emerald-800/50',
        iconBg: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300',
    },
    {
        label: 'Novos Materiais',
        value: '2',
        icon: '📚',
        accent: 'border-sky-200 dark:border-sky-800/50',
        iconBg: 'bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-300',
    },
    {
        label: 'Eventos Próximos',
        value: '1',
        icon: '⭐',
        accent: 'border-rose-200 dark:border-rose-800/50',
        iconBg: 'bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-300',
    },
]

type StatCardProps = {
    card: StatCardItem
}

const StatCard = ({ card }: StatCardProps) => (
    <div
        className={`rounded-2xl border bg-white dark:bg-gray-800/80 shadow-sm hover:shadow-md transition-shadow p-5 ${card.accent}`}
    >
        <div className="flex items-start justify-between gap-3">
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {card.label}
                </p>
                <p className="mt-2 text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {card.value}
                </p>
            </div>
            <span
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl ${card.iconBg}`}
                aria-hidden
            >
                {card.icon}
            </span>
        </div>
    </div>
)

type StatCardsProps = {
    authority?: string[]
}

const StatCards = ({ authority }: StatCardsProps) => {
    const cards = isPerfilGestao(authority) ? CARDS_GESTAO : CARDS_ROTINA
    const tituloSecao = isPerfilGestao(authority)
        ? 'Visão geral da gestão'
        : 'Sua rotina hoje'

    return (
        <section className="mb-10" aria-labelledby="painel-stats-heading">
            <h2
                id="painel-stats-heading"
                className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4"
            >
                {tituloSecao}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {cards.map((card) => (
                    <StatCard key={card.label} card={card} />
                ))}
            </div>
        </section>
    )
}

export default StatCards
