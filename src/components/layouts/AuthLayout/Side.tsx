import { cloneElement } from 'react'
import type { CommonProps } from '@/@types/common'

type SideProps = CommonProps

const Side = ({ children, ...rest }: SideProps) => {
    return (
        <div className="flex min-h-[100dvh] items-stretch p-6 bg-white dark:bg-gray-800">
            <div className="flex flex-col justify-center items-center flex-1">
                <div className="w-full xl:max-w-[450px] px-8 max-w-[380px]">
                    {children
                        ? cloneElement(children as React.ReactElement, {
                              ...rest,
                          })
                        : null}
                </div>
            </div>
            <div className="py-6 px-10 lg:flex hidden flex-col flex-1 self-stretch relative max-w-[520px] 2xl:max-w-[720px]">
                <div
                    className="relative h-full w-full overflow-hidden shadow-2xl shadow-indigo-500/10 dark:shadow-black/30"
                    style={{
                        borderRadius: '4rem 1rem 4rem 1rem',
                        clipPath:
                            'polygon(0 4%, 100% 0, 100% 96%, 92% 100%, 0 100%)',
                    }}
                >
                    <img
                        src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1200&auto=format&fit=crop"
                        alt="Prédio universitário"
                        className="absolute inset-0 h-full w-full object-cover"
                    />
                    <div
                        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-600/10 via-transparent to-transparent"
                        aria-hidden="true"
                    />
                </div>
            </div>
        </div>
    )
}

export default Side
