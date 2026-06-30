import Tooltip from '@/components/ui/Tooltip'
import Menu from '@/components/ui/Menu'
import AuthorityCheck from '@/components/shared/AuthorityCheck'
import VerticalMenuIcon from './VerticalMenuIcon'
import { Link } from 'react-router'
import Dropdown from '@/components/ui/Dropdown'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import { useState } from 'react'
import { useAuth } from '@/auth'
import { useNavigate } from 'react-router'
import type { CommonProps } from '@/@types/common'
import type { Direction } from '@/@types/theme'
import type { NavigationTree } from '@/@types/navigation'

const { MenuItem } = Menu

interface CollapsedItemProps extends CommonProps {
    nav: NavigationTree
    direction?: Direction
    onLinkClick?: (link: { key: string; title: string; path: string }) => void
    t: (
        key: string,
        fallback?: string | Record<string, string | number>,
    ) => string
    renderAsIcon?: boolean
    userAuthority: string[]
    currentKey?: string
    parentKeys?: string[]
}

interface DefaultItemProps {
    nav: NavigationTree
    onLinkClick?: (link: { key: string; title: string; path: string }) => void
    sideCollapsed?: boolean
    t: (
        key: string,
        fallback?: string | Record<string, string | number>,
    ) => string
    indent?: boolean
    userAuthority: string[]
    showIcon?: boolean
    showTitle?: boolean
}

interface VerticalMenuItemProps extends CollapsedItemProps, DefaultItemProps {}

const ConfirmDialog = ({
    isOpen,
    onClose,
    onConfirm,
}: {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
}) => {
    return (
        <Dialog isOpen={isOpen} onClose={onClose} onRequestClose={onClose} width={400}>
            <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                    Acessar FAQ Público
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                    Para acessar o FAQ Público, você será deslogado de sua
                    conta. Deseja continuar?
                </p>
                <div className="flex gap-3 justify-end">
                    <Button variant="plain" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button variant="solid" onClick={onConfirm}>
                        Sim, deslogar e continuar
                    </Button>
                </div>
            </div>
        </Dialog>
    )
}

const CollapsedItem = ({
    nav,
    children,
    direction,
    renderAsIcon,
    onLinkClick,
    userAuthority,
    t,
    currentKey,
}: CollapsedItemProps) => {
    const [showConfirmDialog, setShowConfirmDialog] = useState(false)
    const { signOut } = useAuth()
    const navigate = useNavigate()

    const isPublicFaq = nav.key === 'publicFaq'

    const handlePublicFaqClick = () => {
        setShowConfirmDialog(true)
    }

    const handleConfirmLogout = () => {
        setShowConfirmDialog(false)
        signOut()
        navigate('/')
    }

    return (
        <>
            <AuthorityCheck userAuthority={userAuthority} authority={nav.authority}>
                {renderAsIcon ? (
                    <Tooltip
                        title={t(nav.translateKey, nav.title)}
                        placement={direction === 'rtl' ? 'left' : 'right'}
                    >
                        {children}
                    </Tooltip>
                ) : (
                    <Dropdown.Item active={currentKey === nav.key}>
                        {isPublicFaq ? (
                            <button
                                onClick={handlePublicFaqClick}
                                className="h-full w-full text-left hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                type="button"
                            >
                                <span>{t(nav.translateKey, nav.title)}</span>
                            </button>
                        ) : nav.path ? (
                            <Link
                                className="h-full w-full flex items-center outline-hidden"
                                to={nav.path}
                                target={nav.isExternalLink ? '_blank' : ''}
                                onClick={() =>
                                    onLinkClick?.({
                                        key: nav.key,
                                        title: nav.title,
                                        path: nav.path,
                                    })
                                }
                            >
                                <span>{t(nav.translateKey, nav.title)}</span>
                            </Link>
                        ) : (
                            <span>{t(nav.translateKey, nav.title)}</span>
                        )}
                    </Dropdown.Item>
                )}
            </AuthorityCheck>

            <ConfirmDialog
                isOpen={showConfirmDialog}
                onClose={() => setShowConfirmDialog(false)}
                onConfirm={handleConfirmLogout}
            />
        </>
    )
}

const DefaultItem = (props: DefaultItemProps) => {
    const {
        nav,
        onLinkClick,
        showTitle,
        indent,
        showIcon = true,
        userAuthority,
        t,
    } = props

    const [showConfirmDialog, setShowConfirmDialog] = useState(false)
    const { signOut } = useAuth()
    const navigate = useNavigate()

    const handlePublicFaqClick = () => {
        setShowConfirmDialog(true)
    }

    const handleConfirmLogout = () => {
        setShowConfirmDialog(false)
        signOut()
        navigate('/')
    }

    const isPublicFaq = nav.key === 'publicFaq'

    return (
        <>
            <AuthorityCheck userAuthority={userAuthority} authority={nav.authority}>
                <MenuItem key={nav.key} eventKey={nav.key} dotIndent={indent}>
                    {isPublicFaq ? (
                        <button
                            onClick={handlePublicFaqClick}
                            className="flex items-center gap-2 h-full w-full text-left hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            type="button"
                        >
                            {showIcon && <VerticalMenuIcon icon={nav.icon} />}
                            {showTitle && (
                                <span>{t(nav.translateKey, nav.title)}</span>
                            )}
                        </button>
                    ) : (
                        <Link
                            to={nav.path}
                            className="flex items-center gap-2 h-full w-full"
                            target={nav.isExternalLink ? '_blank' : ''}
                            onClick={() =>
                                onLinkClick?.({
                                    key: nav.key,
                                    title: nav.title,
                                    path: nav.path,
                                })
                            }
                        >
                            {showIcon && <VerticalMenuIcon icon={nav.icon} />}
                            {showTitle && (
                                <span>{t(nav.translateKey, nav.title)}</span>
                            )}
                        </Link>
                    )}
                </MenuItem>
            </AuthorityCheck>

            <ConfirmDialog
                isOpen={showConfirmDialog}
                onClose={() => setShowConfirmDialog(false)}
                onConfirm={handleConfirmLogout}
            />
        </>
    )
}

const VerticalSingleMenuItem = ({
    nav,
    onLinkClick,
    sideCollapsed,
    direction,
    indent,
    renderAsIcon,
    userAuthority,
    showIcon,
    showTitle,
    t,
    currentKey,
    parentKeys,
}: Omit<VerticalMenuItemProps, 'title' | 'translateKey'>) => {
    return (
        <>
            {sideCollapsed ? (
                <CollapsedItem
                    currentKey={currentKey}
                    parentKeys={parentKeys}
                    nav={nav}
                    direction={direction}
                    renderAsIcon={renderAsIcon}
                    userAuthority={userAuthority}
                    t={t}
                    onLinkClick={onLinkClick}
                >
                    <DefaultItem
                        nav={nav}
                        sideCollapsed={sideCollapsed}
                        userAuthority={userAuthority}
                        showIcon={showIcon}
                        showTitle={showTitle}
                        t={t}
                        onLinkClick={onLinkClick}
                    />
                </CollapsedItem>
            ) : (
                <DefaultItem
                    nav={nav}
                    sideCollapsed={sideCollapsed}
                    userAuthority={userAuthority}
                    showIcon={showIcon}
                    showTitle={showTitle}
                    indent={indent}
                    t={t}
                    onLinkClick={onLinkClick}
                />
            )}
        </>
    )
}

export default VerticalSingleMenuItem
