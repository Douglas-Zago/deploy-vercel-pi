import React from 'react'
import useAuth from '@/auth/useAuth' 

const Sair = () => {
    const { signOut } = useAuth()

    const handleConfirmarSaida = () => {
        // 1. Limpa o usuário do sistema
        signOut() 
        
        // 2. Força o redirecionamento para a página inicial (FAQ)
        setTimeout(() => {
            window.location.href = '/' 
        }, 500)
    }

    return (
        <div className="flex items-center justify-center h-[80vh]">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 max-w-md w-full text-center transform transition-all">
                
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-6">
                    <svg className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                    Deseja voltar ao início?
                </h2>
                
                <p className="text-gray-500 dark:text-gray-400 mb-8 px-4">
                    Você será desconectado do painel administrativo e retornará para a área pública (FAQ).
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button 
                        // Trocamos para o comando nativo do navegador
                        onClick={() => window.history.back()} 
                        className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleConfirmarSaida}
                        className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-medium bg-red-600 text-white hover:bg-red-700 shadow-md shadow-red-500/30 transition-colors"
                    >
                        Sim, Sair Agora
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Sair