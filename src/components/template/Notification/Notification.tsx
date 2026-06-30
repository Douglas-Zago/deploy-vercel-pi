import { useEffect, useState, useRef } from 'react'
import classNames from 'classnames'
import withHeaderItem from '@/utils/hoc/withHeaderItem'
import Dropdown from '@/components/ui/Dropdown'
import ScrollBar from '@/components/ui/ScrollBar'
import Spinner from '@/components/ui/Spinner'
import Button from '@/components/ui/Button'
import NotificationToggle from './NotificationToggle'
import { HiOutlineMailOpen } from 'react-icons/hi'
import { useAuth } from '@/auth'
import { NotificacaoService, Notificacao } from '@/services/NotificacaoService'
import useResponsive from '@/utils/hooks/useResponsive'
import { useNavigate } from 'react-router'
import type { DropdownRef } from '@/components/ui/Dropdown'

const notificationHeight = 'h-[320px]'

const _Notification = ({ className }: { className?: string }) => {
    const { user } = useAuth()
    const navigate = useNavigate()
    const { larger } = useResponsive()
    const notificationDropdownRef = useRef<DropdownRef>(null)

    const [notificationList, setNotificationList] = useState<Notificacao[]>([])
    const [loading, setLoading] = useState(false)
    const [hasUnread, setHasUnread] = useState(false)

    // Helper: Se o usuário tem o "admin", ele entra no array de roles. Se não tem nada, cai no aluno.
    const userRoles = user?.authority || ['aluno']
    const userEmail = user?.email || 'convidado@pace.edu.br'

    const fetchNotificacoes = async () => {
        setLoading(true)
        try {
            const dados = await NotificacaoService.getMinhasNotificacoes(userRoles, userEmail)
            setNotificationList(dados)
            setHasUnread(dados.some(n => !n.lida))
        } catch (error) {
            console.error("Erro ao buscar notificações", error)
        } finally {
            setLoading(false)
        }
    }

    // Carrega a contagem inicial (só o check do pontinho vermelho)
    useEffect(() => {
        fetchNotificacoes()
    }, [user])

    const onNotificationOpen = () => {
        // Ao abrir a gaveta, busca as mais recentes de novo
        fetchNotificacoes()
    }

    const onMarkAllAsRead = async () => {
        await NotificacaoService.marcarTodasComoLidas(userRoles, userEmail)
        const listaAtualizada = notificationList.map(n => ({ ...n, lida: true }))
        setNotificationList(listaAtualizada)
        setHasUnread(false)
    }

    const onNotificationClick = async (notificacao: Notificacao) => {
        // Se estiver não lida, marca como lida
        if (!notificacao.lida) {
            await NotificacaoService.marcarComoLida(notificacao.id)
            const listaAtualizada = notificationList.map(n => n.id === notificacao.id ? { ...n, lida: true } : n)
            setNotificationList(listaAtualizada)
            setHasUnread(listaAtualizada.some(n => !n.lida))
        }

        // Navegação inteligente
        if (notificacao.linkAcao) {
            if (notificationDropdownRef.current) notificationDropdownRef.current.handleDropdownClose()
            navigate(notificacao.linkAcao)
        }
    }

    // Helper Visual
    const getNotificacaoIcon = (tipo: string) => {
        switch(tipo) {
            case 'AVISO': return <span className="text-2xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 p-2 rounded-full">📢</span>
            case 'MATERIAL': return <span className="text-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 p-2 rounded-full">📄</span>
            case 'CHAMADO': return <span className="text-2xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 p-2 rounded-full">🛠️</span>
            case 'SISTEMA': return <span className="text-2xl bg-gray-100 dark:bg-gray-800 text-gray-600 p-2 rounded-full">⚙️</span>
            default: return <span className="text-2xl bg-indigo-100 text-indigo-600 p-2 rounded-full">🔔</span>
        }
    }

    return (
        <Dropdown
            ref={notificationDropdownRef}
            renderTitle={<NotificationToggle dot={hasUnread} className={className} />}
            menuClass="min-w-[300px] md:min-w-[360px] p-0" // Removendo padding padrão para colar nas bordas
            placement={larger.md ? 'bottom-end' : 'bottom'}
            onOpen={onNotificationOpen}
        >
            {/* CABEÇALHO DA DROPDOWN */}
            <Dropdown.Item variant="header" className="p-0 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-t-lg">
                <div className="px-4 py-3 flex items-center justify-between">
                    <h6 className="font-extrabold text-gray-900 dark:text-gray-100 text-lg">Notificações</h6>
                    {hasUnread && (
                        <Button
                            variant="plain"
                            shape="circle"
                            size="sm"
                            className="text-indigo-600 hover:text-indigo-800 dark:hover:bg-gray-700"
                            icon={<HiOutlineMailOpen className="text-xl" />}
                            title="Marcar todas como lidas"
                            onClick={onMarkAllAsRead}
                        />
                    )}
                </div>
            </Dropdown.Item>
            
            {/* CORPO DA DROPDOWN (LISTA) */}
            <ScrollBar className={classNames('overflow-y-auto relative', notificationHeight)}>
                {loading ? (
                    <div className={classNames('flex items-center justify-center h-full absolute inset-0 bg-white/50 dark:bg-gray-800/50 z-10 backdrop-blur-sm')}>
                        <Spinner size={30} />
                    </div>
                ) : null}

                {notificationList.length > 0 ? (
                    <div className="flex flex-col">
                        {notificationList.map((item) => (
                            <div 
                                key={item.id}
                                className={`group flex gap-4 px-4 py-4 cursor-pointer transition-colors border-b border-gray-50 dark:border-gray-700 last:border-0 ${item.lida ? 'bg-transparent hover:bg-gray-50 dark:hover:bg-gray-700/50' : 'bg-indigo-50/50 dark:bg-indigo-900/10 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'}`}
                                onClick={() => onNotificationClick(item)}
                            >
                                <div className="shrink-0 mt-1">
                                    {getNotificacaoIcon(item.tipo)}
                                </div>
                                <div className="flex-1 min-w-0 pr-2">
                                    <div className="flex justify-between items-start mb-1 gap-2">
                                        <span className={`text-sm font-bold truncate ${item.lida ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white'}`}>
                                            {item.titulo}
                                        </span>
                                        {!item.lida && <span className="shrink-0 w-2.5 h-2.5 rounded-full bg-indigo-600 mt-1"></span>}
                                    </div>
                                    <p className={`text-xs leading-relaxed line-clamp-2 ${item.lida ? 'text-gray-500' : 'text-gray-600 dark:text-gray-300 font-medium'}`}>
                                        {item.mensagem}
                                    </p>
                                    <span className="block text-[10px] text-gray-400 mt-2 font-medium">
                                        {item.dataHora}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={classNames('flex flex-col items-center justify-center text-center px-4', notificationHeight)}>
                        <span className="text-5xl mb-3 opacity-30">📭</span>
                        <h6 className="font-bold text-gray-900 dark:text-gray-200">Caixa Vazia!</h6>
                        <p className="mt-1 text-sm text-gray-500 max-w-[200px]">Você está em dia com todos os avisos do sistema.</p>
                    </div>
                )}
            </ScrollBar>

            {/* RODAPÉ DA DROPDOWN (OPCIONAL: IR PARA MURAL SE FOR O CASO) */}
            <Dropdown.Item variant="header" className="p-0 border-t border-gray-100 dark:border-gray-700">
                <div className="p-2">
                    <Button
                        block
                        variant="plain"
                        size="sm"
                        className="text-indigo-600 font-bold hover:bg-indigo-50 dark:hover:bg-gray-700 rounded-lg"
                        onClick={() => {
                            if (notificationDropdownRef.current) notificationDropdownRef.current.handleDropdownClose()
                            navigate('/mural-comunicados')
                        }}
                    >
                        Ver Mural Completo
                    </Button>
                </div>
            </Dropdown.Item>
        </Dropdown>
    )
}

const Notification = withHeaderItem(_Notification)

export default Notification