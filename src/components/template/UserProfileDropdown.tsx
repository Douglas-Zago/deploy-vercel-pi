import { useState } from 'react'
import Avatar from '@/components/ui/Avatar'
import Dropdown from '@/components/ui/Dropdown'
import Dialog from '@/components/ui/Dialog' // Importando o componente de Modal do template
import withHeaderItem from '@/utils/hoc/withHeaderItem'
import { useSessionUser } from '@/store/authStore'
import { PiUserDuotone, PiSignOutDuotone, PiUserCircleDuotone } from 'react-icons/pi'
import { useAuth } from '@/auth'
import Reveal from '@/components/ui/Reveal'
import MeuPerfilModal from '@/components/template/MeuPerfilModal'

const _UserDropdown = () => {
    // Pega os dados do usuário salvos no estado global
    const { avatar, userName, email } = useSessionUser((state) => state.user)
    const { signOut } = useAuth()

    const [isProfileOpen, setIsProfileOpen] = useState(false)
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)

    const handleOpenProfile = () => {
        setIsProfileOpen(true)
    }

    // Função que abre o modal ao invés de deslogar direto
    const handleSignOutClick = () => {
        setIsConfirmDialogOpen(true)
    }

    // Função que fecha o modal
    const handleCloseDialog = () => {
        setIsConfirmDialogOpen(false)
    }

    // Função que efetivamente realiza o logout
    const handleConfirmSignOut = () => {
        setIsConfirmDialogOpen(false) // Fecha o modal
        signOut() // Desloga
    }

    const avatarProps = {
        ...(avatar ? { src: avatar } : { icon: <PiUserDuotone /> }),
    }

    return (
        <>
            <Dropdown
                className="flex"
                toggleClassName="flex items-center"
                renderTitle={
                    <div className="cursor-pointer flex items-center hover:opacity-80 transition-opacity">
                        <Avatar size={32} {...avatarProps} />
                    </div>
                }
                placement="bottom-end"
            >
                {/* Cabeçalho Limpo: Apenas Nome e Matrícula/E-mail */}
                <Dropdown.Item variant="header">
                    <div className="py-3 px-4 flex items-center gap-3">
                        <Avatar size={40} {...avatarProps} />
                        <div className="flex flex-col">
                            <span className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                                {userName || 'Usuário PACE'}
                            </span>
                            {/* email é usado no mock para matrícula/login */}
                            <span className="text-xs text-gray-500 mt-0.5 font-medium">
                                {email || 'Acesso Restrito'}
                            </span>
                        </div>
                    </div>
                </Dropdown.Item>
                
                <Dropdown.Item variant="divider" />

                <Dropdown.Item
                    eventKey="Meu Perfil"
                    className="gap-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 py-2.5 cursor-pointer"
                    onClick={handleOpenProfile}
                >
                    <span className="text-xl">
                        <PiUserCircleDuotone />
                    </span>
                    <span className="font-bold">Meu Perfil</span>
                </Dropdown.Item>

                <Dropdown.Item variant="divider" />
                
                <Dropdown.Item
                    eventKey="Sair do Sistema"
                    className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 py-2.5 cursor-pointer"
                    onClick={handleSignOutClick} // Abre o modal
                >
                    <span className="text-xl">
                        <PiSignOutDuotone />
                    </span>
                    <span className="font-bold">Sair do Sistema</span>
                </Dropdown.Item>
            </Dropdown>

            {/* ================================================================= */}
            {/* MODAL DE CONFIRMAÇÃO DE SAÍDA PROFISSIONAL (Estilo PACE)          */}
            {/* ================================================================= */}
            <Dialog
                isOpen={isConfirmDialogOpen}
                onClose={handleCloseDialog}
                onRequestClose={handleCloseDialog}
                contentClassName="!p-0" // Remove padding padrão para controle total
                width={400} // Largura fixa e elegante para confirmação
                closable={false} // Remove o 'X' para forçar o uso dos botões de ação
            >
                {/* Reveal para animação de entrada suave */}
                <Reveal direction="up" duration={0.3} className="w-full">
                    <div className="flex flex-col items-center justify-center text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
                        
                        {/* Ícone de aviso em destaque (Vermelho para atenção) */}
                        <div className="text-6xl mb-6 p-4 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 shadow-inner">
                            <PiSignOutDuotone />
                        </div>

                        <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">
                            Deseja realmente sair?
                        </h3>
                        
                        <p className="text-gray-600 dark:text-gray-400 font-medium mb-8 max-w-xs">
                            Qualquer processo não salvo poderá ser perdido. Confirma o encerramento da sua sessão no sistema PACE?
                        </p>

                        {/* Área de Botões de Ação Profissionais (Tailwind puro para garantir consistência) */}
                        <div className="flex gap-4 w-full justify-center">
                            <button 
                                type="button" 
                                onClick={handleCloseDialog}
                                className="flex-1 py-3 px-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold transition-colors shadow-sm"
                            >
                                Cancelar
                            </button>
                            <button 
                                type="button" 
                                onClick={handleConfirmSignOut}
                                className="flex-1 py-3 px-6 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-colors shadow-sm active:scale-95 shadow-red-200 dark:shadow-red-950/30"
                            >
                                Confirmar Saída
                            </button>
                        </div>
                    </div>
                </Reveal>
            </Dialog>

            <MeuPerfilModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
        </>
    )
}

const UserDropdown = withHeaderItem(_UserDropdown)

export default UserDropdown