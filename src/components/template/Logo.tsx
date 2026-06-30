import React from 'react'
import classNames from 'classnames'
import { useThemeStore } from '@/store/themeStore'
import { MODE_LIGHT } from '@/constants/theme.constant'

const Logo = (props: any) => {
    const { gutter, className, imgClass, style, logoWidth } = props

    // Pega o tema atual do template (light ou dark)
    const mode = useThemeStore((state) => state.mode)

    // Define qual SVG profissional usar com base no tema do template
    const logoSrc = mode === MODE_LIGHT ? '/img/logo/logo-light-full.svg' : '/img/logo/logo-dark-full.svg'

    return (
        <div
            className={classNames('logo flex items-center', className, gutter)}
            style={{
                ...style,
                ...{ width: logoWidth },
            }}
        >
            {/* Trocamos a imagem ECME pelo SVG do PACE em alta qualidade */}
            <img
                className={classNames('select-none', imgClass)}
                style={{
                    height: 60, // Altura base segura para a caixa do Elstar
                    width: 'auto',
                    transform: 'scale(1.4)', // <-- O SEGREDO DE MESTRE: Aumenta visualmente em 40%
                    transformOrigin: 'left center', // Faz crescer para a direita sem cortar
                }}
                src={logoSrc}
                alt="Logo do Portal PACE"
            />
        </div>
    )
}

Logo.defaultProps = {
    mode: MODE_LIGHT,
}

export default Logo