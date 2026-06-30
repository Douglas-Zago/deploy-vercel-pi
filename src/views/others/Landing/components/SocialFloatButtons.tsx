import { FaWhatsapp, FaInstagram } from 'react-icons/fa'

const WHATSAPP_URL = 'https://wa.me/5511999999999'
const INSTAGRAM_URL = 'https://instagram.com'

const SocialFloatButtons = () => {
    return (
        <div
            className="fixed bottom-6 right-4 sm:right-6 z-50 flex flex-col gap-3"
            aria-label="Redes sociais da instituição"
        >
            <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Falar no WhatsApp"
                title="WhatsApp"
                className="group flex items-center gap-3 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 text-white pl-4 pr-5 py-3.5 shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 hover:scale-[1.03] active:scale-[0.98] transition-all border border-emerald-400/30"
            >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 group-hover:bg-white/25 transition-colors">
                    <FaWhatsapp className="h-5 w-5" />
                </span>
                <span className="hidden sm:inline text-sm font-bold tracking-wide">
                    WhatsApp
                </span>
            </a>

            <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Seguir no Instagram"
                title="Instagram"
                className="group flex items-center gap-3 rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 text-white pl-4 pr-5 py-3.5 shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 hover:scale-[1.03] active:scale-[0.98] transition-all border border-indigo-400/30"
            >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 group-hover:bg-white/25 transition-colors">
                    <FaInstagram className="h-5 w-5" />
                </span>
                <span className="hidden sm:inline text-sm font-bold tracking-wide">
                    Instagram
                </span>
            </a>
        </div>
    )
}

export default SocialFloatButtons
