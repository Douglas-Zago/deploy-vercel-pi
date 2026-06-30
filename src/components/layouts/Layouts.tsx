import { Fragment, Suspense } from 'react'
import Loading from '@/components/shared/Loading'
import type { CommonProps } from '@/@types/common'
import { useAuth } from '@/auth'
import { useThemeStore } from '@/store/themeStore'
import ModalAlertaGlobal from '@/components/auth/ModalAlertaGlobal'
import ModalPrimeiroAcesso from '@/components/auth/ModalPrimeiroAcesso'
import PostLoginLayout from './PostLoginLayout'
import PreLoginLayout from './PreLoginLayout'

const Layout = ({ children }: CommonProps) => {
    const layoutType = useThemeStore((state) => state.layout.type)

    const { authenticated } = useAuth()

    return (
        <Suspense
            fallback={
                <div className="flex flex-auto flex-col h-[100vh]">
                    <Loading loading={true} />
                </div>
            }
        >
            {authenticated ? (
                <PostLoginLayout layoutType={layoutType}>
                    <Fragment>
                        {children}
                        <ModalPrimeiroAcesso />
                        <ModalAlertaGlobal />
                    </Fragment>
                </PostLoginLayout>
            ) : (
                <PreLoginLayout>{children}</PreLoginLayout>
            )}
        </Suspense>
    )
}

export default Layout
