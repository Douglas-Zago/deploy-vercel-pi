import React, { useEffect, useRef, useState } from 'react'

interface RevealProps {
    children: React.ReactNode
    // 1. ADICIONADO O 'down' AQUI NA LISTA VIP DO TYPESCRIPT
    direction?: 'up' | 'down' | 'left' | 'right' | 'none'
    delay?: number
    duration?: number
    className?: string
}

const Reveal = ({
    children,
    direction = 'up',
    delay = 0,
    duration = 800, 
    className = '',
}: RevealProps) => {
    const [isVisible, setIsVisible] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true)
                    if (ref.current) observer.unobserve(ref.current)
                }
            },
            {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px',
            }
        )

        if (ref.current) {
            observer.observe(ref.current)
        }

        return () => {
            if (ref.current) observer.unobserve(ref.current)
        }
    }, [])

    const getDirectionClasses = () => {
        if (direction === 'up') return 'translate-y-12'
        // 2. ADICIONADO O COMPORTAMENTO DO 'down' AQUI (começa em cima, negativo)
        if (direction === 'down') return '-translate-y-12' 
        if (direction === 'left') return '-translate-x-12'
        if (direction === 'right') return 'translate-x-12'
        return ''
    }

    return (
        <div
            ref={ref}
            style={{
                transitionDuration: `${duration}ms`,
                transitionDelay: `${delay}ms`,
                transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)', 
            }}
            className={`transition-all ${
                isVisible ? 'opacity-100 translate-y-0 translate-x-0' : `opacity-0 ${getDirectionClasses()}`
            } ${className}`}
        >
            {children}
        </div>
    )
}

export default Reveal