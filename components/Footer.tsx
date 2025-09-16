import type React from "react"
import { InstagramIcon, TwitterIcon, FacebookIcon } from "./icons"

const AppLogo: React.FC<{ size?: string }> = ({ size = "w-12 h-12" }) => (
  <div
    className={`flex-shrink-0 ${size} bg-gradient-to-br from-purple-600 to-indigo-700 rounded-xl flex items-center justify-center`}
  >
    <div className="w-1/2 h-1/2 bg-white rounded-full flex items-center justify-center">
      <div className="w-1/3 h-1/3 bg-purple-600 rounded-sm transform rotate-45"></div>
    </div>
  </div>
)

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#1C1C2E] py-12">
      <div className="container mx-auto px-4 text-center text-slate-400">
        <div className="flex flex-col items-center gap-4 mb-6">
          <AppLogo size="w-16 h-16" />
          <h2 className="text-2xl font-bold text-white">LPP</h2>
          <p className="max-w-md">Sistema de gestión de torneos de tenis de mesa</p>
        </div>
        <div className="flex justify-center gap-6 mb-8">
          <a href="#" className="hover:text-white transition-colors">
            <InstagramIcon className="w-6 h-6" />
          </a>
          <a href="#" className="hover:text-white transition-colors">
            <TwitterIcon className="w-6 h-6" />
          </a>
          <a href="#" className="hover:text-white transition-colors">
            <FacebookIcon className="w-6 h-6" />
          </a>
        </div>
        <div className="border-t border-slate-700 pt-8">
          <p>© 2024 First Mobile. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
