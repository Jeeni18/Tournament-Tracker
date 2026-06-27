import worldCupImg from '../assets/World Cup.png'

export default function Footer() {
  return (
    <footer className="bg-[#071A3D] border-t border-white/[0.08] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center gap-3">
          <img src={worldCupImg} alt="World Cup" className="h-9 w-9 object-contain" />
          <div>
            <p className="font-bold text-white text-sm">World Cup Tournament Tracker</p>
            <p className="text-slate-400 text-xs mt-0.5">FIFA World Cup 2026</p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-slate-500 text-xs">Built with React · TypeScript · Supabase</p>
          <p className="text-slate-600 text-xs">FIFA World Cup 2026 · Jun 12 – Jul 20</p>
        </div>
      </div>
    </footer>
  )
}
