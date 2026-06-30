import ModeSwitcher from './ModeSwitcher'
import ThemeSwitcher from './ThemeSwitcher'

export type ThemeConfiguratorProps = {
    callBackClose?: () => void
}

const ThemeConfigurator = ({ callBackClose }: ThemeConfiguratorProps) => {
    return (
        <div className="flex flex-col gap-y-8 p-1">
            <div className="flex flex-col gap-y-8">
                
                {/* --- MODO ESCURO --- */}
                <div className="flex items-center justify-between">
                    <div>
                        <h6 className="font-extrabold text-gray-900 dark:text-white">Modo Escuro</h6>
                        <span className="text-sm text-gray-500 font-medium">Alternar para o tema noturno</span>
                    </div>
                    <ModeSwitcher />
                </div>
                
                {/* --- COR DE DESTAQUE --- */}
                <div>
                    <h6 className="mb-3 font-extrabold text-gray-900 dark:text-white">Cor de Destaque</h6>
                    <span className="text-sm text-gray-500 font-medium block mb-4">Escolha a cor principal do sistema</span>
                    <ThemeSwitcher />
                </div>

            </div>
        </div>
    )
}

export default ThemeConfigurator