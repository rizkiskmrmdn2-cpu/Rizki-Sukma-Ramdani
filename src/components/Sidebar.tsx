import { useId } from 'react';
import { 
  BarChart3, 
  Database, 
  ArrowLeftRight, 
  Map, 
  FileInput, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  FileCode,
  User,
  Compass,
  ShoppingBag,
  Coins
} from 'lucide-react';
import { AppConfig, ActiveSession } from '../types';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  config: AppConfig;
  session: ActiveSession | null;
  onLogout: () => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  config,
  session,
  onLogout,
  sidebarOpen,
  setSidebarOpen
}: Props) {
  const baseId = useId();
  
  // Custom permissions menu based on user role
  const isCrew = session?.role === 'Crew';
  const isTourLeader = session?.role === 'Tour Leader';

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, hide: false },
    { id: 'inventaris', label: 'Database Inventaris', icon: Database, hide: isCrew },
    { id: 'mutasi', label: 'Keluar - Masuk Barang', icon: ArrowLeftRight, hide: isCrew },
    { id: 'packing', label: 'Pemakaian Trip', icon: Map, hide: false },
    { id: 'perencanaan', label: 'Perencanaan Trip', icon: Compass, hide: false },
    { id: 'anggaran', label: 'Penganggaran Trip', icon: Coins, hide: false },
    { id: 'pengadaan', label: 'Pengadaan & Aset', icon: ShoppingBag, hide: isCrew },
    { id: 'laporan', label: 'Laporan', icon: FileInput, hide: isCrew },
    { id: 'config', label: 'Konfigurasi', icon: Settings, hide: isCrew || isTourLeader },
    { id: 'code', label: 'Script Integrasi Sheets', icon: FileCode, hide: isCrew || isTourLeader }
  ].filter(it => !it.hide);

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between bg-[#11512f] text-white px-4 py-3 fixed top-0 left-0 right-0 z-50 shadow-md">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-white rounded-full overflow-hidden flex items-center justify-center border border-emerald-400 p-0 shadow-xs shrink-0">
            <img 
              src={config.logoUrl || 'https://lh3.googleusercontent.com/d/1C-scCTu7H2eOa-ZtDhak1JcbRhTNCCIb'} 
              className="w-full h-full object-cover" 
              alt="Logo"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.src = 'https://lh3.googleusercontent.com/d/1C-scCTu7H2eOa-ZtDhak1JcbRhTNCCIb';
              }}
            />
          </div>
          <span className="font-bold tracking-tight text-sm text-emerald-100">BARENGIN TRIP OPERASIONAL</span>
        </div>
        <button
          id={`toggle-sidemenu-${baseId}`}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1 focus:outline-hidden hover:bg-emerald-800 rounded-md transition"
        >
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#0a311c] text-white shadow-xl transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col pt-16 md:pt-0`}
      >
        {/* Brand Header */}
        <div className="px-6 py-6 border-b border-emerald-950 flex flex-col items-center justify-center text-center">
          <div className="relative w-16 h-16 bg-white rounded-full mb-3 shadow-lg flex items-center justify-center overflow-hidden border border-emerald-850 p-0">
            <img 
              src={config.logoUrl || 'https://lh3.googleusercontent.com/d/1C-scCTu7H2eOa-ZtDhak1JcbRhTNCCIb'} 
              className="w-full h-full object-cover" 
              alt="PT. Barengin Trip Logo"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.src = 'https://lh3.googleusercontent.com/d/1C-scCTu7H2eOa-ZtDhak1JcbRhTNCCIb';
              }}
            />
          </div>
          <h2 className="text-sm font-bold tracking-wider text-emerald-100">Operasional BARENGIN TRIP</h2>
          <p className="text-[10px] text-emerald-400 font-medium tracking-widest mt-1 uppercase">Sistem Inventaris v1.0</p>
        </div>

        {/* User Session Info */}
        {session && (
          <div className="mx-4 my-3 px-4 py-2.5 bg-[#11512f]/40 border border-emerald-900 rounded-lg flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-emerald-600 flex items-center justify-center text-xs font-bold text-emerald-100">
              {session.name[0].toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-emerald-100 truncate">{session.name}</p>
              <p className="text-[10px] text-emerald-400 capitalize truncate">Operator {session.username}</p>
            </div>
          </div>
        )}

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-item-${item.id}-${baseId}`}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false); // Close on mobile navigation
                }}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-xs font-medium tracking-wide transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-[#11512f] text-[#ffffff] shadow-xs translate-x-1 border-l-4 border-emerald-400'
                    : 'text-emerald-300 hover:text-white hover:bg-emerald-900/30'
                }`}
              >
                <IconComponent className={`h-4 w-4 ${isActive ? 'text-emerald-300' : 'text-emerald-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer actions */}
        <div className="p-4 border-t border-emerald-950 mt-auto bg-emerald-950/40">
          <button
            id={`btn-logout-${baseId}`}
            onClick={() => {
              onLogout();
            }}
            className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-xs font-medium text-emerald-300 hover:text-rose-200 hover:bg-rose-950/20 transition cursor-pointer"
          >
            <LogOut className="h-4 w-4 text-emerald-400 hover:text-rose-300" />
            <span>Keluar Aplikasi</span>
          </button>
          
          <div className="mt-3 text-center text-[9px] text-emerald-600 font-mono">
            &copy; 2026 PT. Barengin Trip
          </div>
        </div>
      </aside>

      {/* Overlay behind sidebar on mobile */}
      {sidebarOpen && (
        <div
          id={`sidebar-overlay-${baseId}`}
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-30 md:hidden"
        />
      )}
    </>
  );
}
