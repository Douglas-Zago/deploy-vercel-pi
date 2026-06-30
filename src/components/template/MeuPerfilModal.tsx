import { useEffect, useState } from 'react'
import Dialog from '@/components/ui/Dialog'
import Avatar from '@/components/ui/Avatar'
import Reveal from '@/components/ui/Reveal'
import { PACE_AVATAR_OPTIONS } from '@/constants/avatarOptions'
import { updateMockUser } from '@/mock/data/authData'
import { useSessionUser } from '@/store/authStore'
import classNames from '@/utils/classNames'

const ROTULO_PAPEL: Record<string, string> = {
    direcao: 'Direção',
    coordenacao: 'Coordenação',
    professor: 'Professor',
    aluno: 'Aluno',
}

function formatPapel(authority?: string[] | null) {
    if (!authority?.length) return '—'
    return authority.map((p) => ROTULO_PAPEL[p] ?? p).join(', ')
}

type MeuPerfilModalProps = {
    isOpen: boolean
    onClose: () => void
}

const MeuPerfilModal = ({ isOpen, onClose }: MeuPerfilModalProps) => {
    const user = useSessionUser((state) => state.user)
    const setUser = useSessionUser((state) => state.setUser)

    const [selectedAvatar, setSelectedAvatar] = useState(
        user.avatar ?? PACE_AVATAR_OPTIONS[0].url,
    )

    useEffect(() => {
        if (isOpen) {
            setSelectedAvatar(user.avatar || PACE_AVATAR_OPTIONS[0].url)
        }
    }, [isOpen, user.avatar])

    const avatarAtualPersistido = user.avatar ?? ''
    const houveAlteracao = selectedAvatar !== avatarAtualPersistido

    const handleSalvar = () => {
        setUser({ avatar: selectedAvatar })
        if (user.userId) {
            updateMockUser(user.userId, { avatar: selectedAvatar })
        }
        onClose()
    }

    const campos = [
        { label: 'Nome completo', value: user.userName || '—' },
        { label: 'Matrícula / login', value: user.email || '—' },
        { label: 'Papel no sistema', value: formatPapel(user.authority) },
        {
            label: 'Turma',
            value: user.turma?.trim() ? user.turma : 'Todas / não aplicável',
        },
    ]

    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            onRequestClose={onClose}
            width={520}
            contentClassName="!p-0"
        >
            <Reveal direction="up" duration={0.3} className="w-full">
                <div className="flex flex-col max-h-[min(92vh,720px)] overflow-hidden rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xl">
                    <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/30 shrink-0">
                        <p className="text-[11px] uppercase tracking-[0.2em] font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                            Conta
                        </p>
                        <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">
                            Meu Perfil
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Consulte seus dados e personalize seu avatar no portal.
                        </p>
                    </div>

                    <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 sm:py-6 space-y-6">
                        <section>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                                Dados cadastrais
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {campos.map((campo) => (
                                    <div
                                        key={campo.label}
                                        className="rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/50 px-4 py-3"
                                    >
                                        <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1">
                                            {campo.label}
                                        </p>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 break-words">
                                            {campo.value}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                                Escolha seu avatar
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                                Selecione um personagem. A alteração aparece imediatamente no menu
                                superior após salvar.
                            </p>

                            <div className="grid grid-cols-4 gap-2 sm:gap-3">
                                {PACE_AVATAR_OPTIONS.map((opcao) => {
                                    const selecionado = selectedAvatar === opcao.url
                                    return (
                                        <button
                                            key={opcao.id}
                                            type="button"
                                            aria-label={`Avatar ${opcao.label}`}
                                            aria-pressed={selecionado}
                                            onClick={() => setSelectedAvatar(opcao.url)}
                                            className={classNames(
                                                'relative rounded-2xl p-1.5 sm:p-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
                                                selecionado
                                                    ? 'ring-4 ring-indigo-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-900 bg-indigo-50 dark:bg-indigo-950/50 scale-[1.02]'
                                                    : 'ring-1 ring-gray-200 dark:ring-gray-700 hover:ring-indigo-300 dark:hover:ring-indigo-700 hover:bg-gray-50 dark:hover:bg-gray-800/80',
                                            )}
                                        >
                                            <img
                                                src={opcao.url}
                                                alt={opcao.label}
                                                className="w-full aspect-square rounded-xl bg-white dark:bg-gray-800 object-cover"
                                                loading="lazy"
                                            />
                                        </button>
                                    )
                                })}
                            </div>

                            <div className="mt-4 flex items-center gap-3 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 px-4 py-3 bg-white dark:bg-gray-800/50">
                                <Avatar size={48} src={selectedAvatar} />
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                        Pré-visualização
                                    </p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                        {user.userName || 'Usuário PACE'}
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="shrink-0 px-5 sm:px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end bg-gray-50/80 dark:bg-gray-900/50">
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={handleSalvar}
                            disabled={!houveAlteracao}
                            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-[0.98]"
                        >
                            Salvar
                        </button>
                    </div>
                </div>
            </Reveal>
        </Dialog>
    )
}

export default MeuPerfilModal
