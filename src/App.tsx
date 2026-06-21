import { 
  Folder, 
  Globe, 
  MessageSquare, 
  FileText, 
  Image as ImageIcon, 
  Terminal as TerminalIcon,
  Video,
  Mail,
  Calendar,
  Battery,
  Wifi,
  Volume2,
  Search,
  Maximize2,
  Minimize2,
  X,
  ChevronRight,
  Send,
  User,
  Bot,
  Settings as SettingsIcon,
  Cloud,
  CloudRain
} from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import { cn } from './lib/utils';

// --- Types ---

type AppId = 'files' | 'browser' | 'ai' | 'notes' | 'magic-edit' | 'terminal' | 'camera' | 'mail' | 'calendar' | 'settings';

interface WindowState {
  id: AppId;
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  isMinimized: boolean;
  zIndex: number;
}

interface UserProfile {
  name: string;
  avatar: string;
  role: string;
}

// --- Components ---

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPointer, setIsPointer] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      const target = e.target as HTMLElement;
      setIsPointer(window.getComputedStyle(target).cursor === 'pointer');
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 pointer-events-none z-[9999] drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)]"
      style={{ 
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: `translate(-2px, -2px) scale(${isPointer ? 1.1 : 1})`,
        transition: 'transform 0.1s ease-out'
      }}
    >
      <svg 
        width="32" 
        height="32" 
        viewBox="0 0 32 32" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          d="M6 4V27.5L12.5 21L16.5 29L20 27.5L16 19.5H25L6 4Z" 
          fill="black" 
          stroke="white" 
          strokeWidth="2.5" 
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

const BIOS = ({ onComplete }: { onComplete: () => void }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  const bootLogs = [
    "ATOMOS BIOS v4.2.0 (C) 2026 NEBULABS",
    "CPU: Nebula Core i9 @ 5.2GHz",
    "RAM: 64GB LPDDR6X @ 8400MHz",
    "Checking Storage Devices... OK",
    "Initializing Kernel... OK",
    "Loading Atomos OS v1.0.0...",
    "Starting System Services...",
    "Network Interface: eth0 UP",
    "Mounting Root Filesystem... OK",
    "Starting Desktop Environment..."
  ];

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < bootLogs.length) {
        setLogs(prev => [...prev, bootLogs[i]]);
        setProgress(((i + 1) / bootLogs.length) * 100);
        i++;
      } else {
        clearInterval(interval);
        setTimeout(onComplete, 1000);
      }
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-black z-[10000] font-mono text-sm p-12 flex flex-col gap-8">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 border-2 border-blue-500 rounded-lg flex items-center justify-center">
          <div className="w-8 h-8 border border-blue-500 rotate-45" />
        </div>
        <h1 className="text-2xl font-bold tracking-tighter text-blue-500">ATOMOS BIOS</h1>
      </div>
      <div className="flex-1 space-y-1 text-white/60">
        {logs.map((log, i) => (
          <div key={i} className="flex gap-4">
            <span className="text-blue-500/50">[{format(new Date(), 'HH:mm:ss')}]</span>
            <span>{log}</span>
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold text-white/30">
          <span>Booting Atomos OS</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
            animate={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

const Login = ({ onLogin, users }: { onLogin: (user: UserProfile) => void, users: UserProfile[] }) => {
  const [selectedUser, setSelectedUser] = useState(users[0]);
  const [password, setPassword] = useState('');

  return (
    <div className="fixed inset-0 bg-[#050505] z-[9000] flex items-center justify-center font-sans">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30 blur-xl"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')` }}
      />
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-[320px] flex flex-col items-center gap-8"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 p-1 shadow-2xl">
            <div className="w-full h-full rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-3xl font-bold text-white">
              {selectedUser.name[0]}
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-black tracking-tight text-white">{selectedUser.name}</h2>
            <p className="text-xs font-bold uppercase tracking-widest text-white/30">{selectedUser.role}</p>
          </div>
        </div>

        <div className="w-full space-y-4">
          <input 
            type="password" 
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onLogin(selectedUser)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-6 text-white text-center outline-none focus:border-blue-500/50 transition-all backdrop-blur-xl"
          />
          <button 
            onClick={() => onLogin(selectedUser)}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-2xl transition-all shadow-xl active:scale-95"
          >
            Sign In
          </button>
        </div>

        <div className="flex gap-4">
          {users.map(user => (
            <button 
              key={user.name}
              onClick={() => setSelectedUser(user)}
              className={cn(
                "w-10 h-10 rounded-full border-2 transition-all overflow-hidden",
                selectedUser.name === user.name ? "border-blue-500 scale-110" : "border-transparent opacity-50 hover:opacity-100"
              )}
            >
              <div className="w-full h-full bg-white/10 flex items-center justify-center text-xs font-bold text-white">
                {user.name[0]}
              </div>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

const Settings = ({ 
  user, 
  onUpdateUser,
  onFactoryReset,
  onResetToNebulaOSLink
}: { 
  user: UserProfile, 
  onUpdateUser: (u: UserProfile) => void,
  onFactoryReset?: () => void,
  onResetToNebulaOSLink?: () => void
}) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [showWipeConfirm, setShowWipeConfirm] = useState(false);

  return (
    <div className="flex h-full text-white font-sans">
      <div className="w-64 bg-white/5 border-r border-white/10 p-6 space-y-2">
        <div className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-black mb-6">Settings</div>
        {[
          { id: 'profile', label: 'Profile', icon: <User size={16} /> },
          { id: 'appearance', label: 'Appearance', icon: <ImageIcon size={16} /> },
          { id: 'network', label: 'Network', icon: <Wifi size={16} /> },
          { id: 'system', label: 'System', icon: <TerminalIcon size={16} /> },
          { id: 'about', label: 'About', icon: <Bot size={16} /> },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-xl transition-all text-sm font-bold",
              activeTab === item.id ? "bg-blue-600 text-white shadow-lg" : "text-white/50 hover:bg-white/5"
            )}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </div>
      <div className="flex-1 p-10 overflow-y-auto scrollbar-hide">
        {activeTab === 'profile' && (
          <div className="max-w-md space-y-8">
            <div>
              <h2 className="text-3xl font-black tracking-tight mb-2">Profile</h2>
              <p className="text-white/30 text-sm">Manage your account and personal information.</p>
            </div>
            <div className="flex items-center gap-6 p-6 bg-white/5 rounded-3xl border border-white/10">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-2xl font-bold">
                {user.name[0]}
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold">{user.name}</h3>
                <p className="text-white/30 text-xs uppercase tracking-widest font-black">{user.role}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-black text-white/30 ml-1">Display Name</label>
                <input 
                  type="text" 
                  value={user.name}
                  onChange={(e) => onUpdateUser({ ...user, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 outline-none focus:border-blue-500/50 transition-all font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-black text-white/30 ml-1">Role</label>
                <input 
                  type="text" 
                  value={user.role}
                  onChange={(e) => onUpdateUser({ ...user, role: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 outline-none focus:border-blue-500/50 transition-all font-bold"
                />
              </div>
            </div>
          </div>
        )}
        {activeTab === 'about' && (
          <div className="max-w-md space-y-6">
            <div>
              <h2 className="text-3xl font-black tracking-tight mb-2">About</h2>
              <p className="text-white/30 text-sm">System information and version details.</p>
            </div>
            <div className="p-8 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-[3rem] border border-white/10 flex flex-col items-center text-center gap-6">
              <AtomosLogo className="w-24 h-24" />
              <div>
                <h3 className="text-2xl font-black tracking-tight">Atomos OS</h3>
                <p className="text-white/30 font-bold uppercase tracking-widest text-[10px] mt-1">Version 1.0.0 Stable</p>
              </div>
              <p className="text-white/60 text-sm leading-relaxed">
                A next-generation web-based operating system built by Nebulabs. Designed for performance, security, and beauty.
              </p>
              <div className="flex gap-4">
                <button className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest transition-all">Check for Updates</button>
              </div>
            </div>

            <div className="p-6 bg-white/5 border border-white/10 rounded-[2rem] space-y-4">
              <div className="text-left">
                <h4 className="text-xs font-black text-white uppercase tracking-widest">System Recovery</h4>
                <p className="text-white/30 text-[10px] uppercase font-bold tracking-wider mt-0.5">Wipe system configurations or sync remote nodes</p>
              </div>

              <div className="space-y-2.5">
                <button
                  onClick={onResetToNebulaOSLink}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md cursor-pointer text-center"
                >
                  Factory Reset to nebulaoslink
                </button>

                {!showWipeConfirm ? (
                  <button
                    onClick={() => setShowWipeConfirm(true)}
                    className="w-full py-3 bg-red-600/10 hover:bg-red-600 hover:text-white border border-red-500/20 rounded-xl text-xs font-black uppercase tracking-wider text-red-500 transition-all cursor-pointer text-center"
                  >
                    Just Reset (Wipes Data)
                  </button>
                ) : (
                  <div className="bg-red-950/20 border border-red-500/30 rounded-2xl p-4 flex flex-col gap-3">
                    <p className="text-[10px] text-red-400 font-bold uppercase tracking-wider text-center">Are you absolutely sure? All files, mail, and local data will be deleted instantly.</p>
                    <div className="flex gap-2.5">
                      <button
                        onClick={() => setShowWipeConfirm(false)}
                        className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold transition-all text-white/80 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          setShowWipeConfirm(false);
                          if (onFactoryReset) onFactoryReset();
                        }}
                        className="flex-1 py-2 bg-red-600 hover:bg-red-500 rounded-xl text-xs font-black uppercase tracking-wider text-white transition-all cursor-pointer"
                      >
                        Confirm Wipe
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StartMenu = ({ isOpen, onOpenApp }: { isOpen: boolean, onOpenApp: (id: AppId) => void }) => {
  if (!isOpen) return null;

  const pinnedApps = [
    { id: 'browser', icon: <Globe size={24} />, label: 'Browser', color: 'bg-blue-500' },
    { id: 'ai', icon: <MessageSquare size={24} />, label: 'Nebula AI', color: 'bg-purple-500' },
    { id: 'files', icon: <Folder size={24} />, label: 'Files', color: 'bg-indigo-500' },
    { id: 'notes', icon: <FileText size={24} />, label: 'Notes', color: 'bg-amber-500' },
    { id: 'magic-edit', icon: <ImageIcon size={24} />, label: 'Paint', color: 'bg-blue-400' },
    { id: 'terminal', icon: <TerminalIcon size={24} />, label: 'Terminal', color: 'bg-gray-800' },
    { id: 'mail', icon: <Mail size={24} />, label: 'Mail', color: 'bg-pink-500' },
    { id: 'calendar', icon: <Calendar size={24} />, label: 'Calendar', color: 'bg-amber-600' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="absolute bottom-16 left-6 w-[400px] bg-white/80 backdrop-blur-3xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden flex flex-col z-[1000]"
    >
      <div className="p-6 space-y-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30" size={16} />
          <input 
            type="text" 
            placeholder="Search apps, settings, and files"
            className="w-full bg-black/5 border border-black/5 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500/30 transition-all"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-4 px-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-black/30">Pinned Apps</span>
            <button className="text-[10px] font-bold text-blue-600 hover:underline">All Apps</button>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {pinnedApps.map(app => (
              <button 
                key={app.id}
                onClick={() => onOpenApp(app.id as AppId)}
                className="flex flex-col items-center gap-2 group"
              >
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md transition-transform group-hover:scale-110", app.color)}>
                  {app.icon}
                </div>
                <span className="text-[10px] font-bold text-black/60 group-hover:text-black">{app.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-black/30 mb-4 block px-1">Recommended</span>
          <div className="space-y-1">
            {[
              { name: 'Project Nebula.pdf', icon: <FileText size={14} />, time: '2h ago' },
              { name: 'System Config', icon: <TerminalIcon size={14} />, time: '5h ago' },
            ].map(item => (
              <div key={item.name} className="flex items-center justify-between p-2 hover:bg-black/5 rounded-xl cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-black/5 flex items-center justify-center text-black/40">{item.icon}</div>
                  <span className="text-xs font-bold text-black/70">{item.name}</span>
                </div>
                <span className="text-[10px] text-black/30 font-bold uppercase">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-auto p-4 bg-black/5 border-t border-black/5 flex items-center justify-between">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-md">A</div>
          <span className="text-xs font-bold text-black/70">Atomos User</span>
        </div>
        <button className="p-2 hover:bg-black/5 rounded-xl transition-colors text-black/40">
          <X size={16} />
        </button>
      </div>
    </motion.div>
  );
};

const QuickSettings = ({ 
  isOpen,
  showWidgets,
  setShowWidgets
}: { 
  isOpen: boolean,
  showWidgets: { clock: boolean, weather: boolean, stats: boolean },
  setShowWidgets: React.Dispatch<React.SetStateAction<{ clock: boolean, weather: boolean, stats: boolean }>>
}) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="absolute bottom-16 right-6 w-[320px] bg-white/80 backdrop-blur-3xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden flex flex-col z-[1000]"
    >
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: <Wifi size={18} />, label: 'Wi-Fi', active: true },
            { icon: <Volume2 size={18} />, label: 'Sound', active: true },
            { icon: <Battery size={18} />, label: 'Battery', active: false },
            { icon: <Globe size={18} />, label: 'Airplane', active: false },
            { icon: <Bot size={18} />, label: 'Nebula', active: true },
            { icon: <Calendar size={18} />, label: 'Focus', active: false },
          ].map((item, i) => (
            <button 
              key={i}
              className="flex flex-col items-center gap-2 group"
            >
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-sm",
                item.active ? "bg-blue-600 text-white" : "bg-black/5 text-black/40 hover:bg-black/10"
              )}>
                {item.icon}
              </div>
              <span className="text-[9px] font-bold uppercase tracking-widest text-black/40 group-hover:text-black/60">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-black/30">
              <span>Brightness</span>
              <span>85%</span>
            </div>
            <div className="h-1.5 w-full bg-black/5 rounded-full overflow-hidden">
              <div className="h-full w-[85%] bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-black/30">
              <span>Volume</span>
              <span>60%</span>
            </div>
            <div className="h-1.5 w-full bg-black/5 rounded-full overflow-hidden">
              <div className="h-full w-[60%] bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]" />
            </div>
          </div>
        </div>

        <div className="border-t border-black/5 pt-4 space-y-3">
          <div className="text-[10px] font-black uppercase tracking-widest text-black/30 px-1 text-left">
            Desktop Widgets
          </div>
          <div className="flex gap-2">
            {[
              { id: 'clock', label: 'Clock' },
              { id: 'weather', label: 'Weather' },
              { id: 'stats', label: 'Stats' }
            ].map(w => (
              <button
                key={w.id}
                onClick={() => setShowWidgets(prev => ({ ...prev, [w.id]: !prev[w.id as keyof typeof prev] }))}
                className={cn(
                  "flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer",
                  showWidgets[w.id as keyof typeof showWidgets] 
                    ? "bg-blue-600/10 text-blue-600 border border-blue-500/20" 
                    : "bg-black/5 text-black/40 border border-transparent hover:bg-black/10"
                )}
              >
                {w.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-auto p-4 bg-black/5 border-t border-black/5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-black/30">
          <Battery size={14} className="text-green-600" />
          <span>8h 45m remaining</span>
        </div>
        <button className="p-2 hover:bg-black/5 rounded-xl transition-colors text-black/40">
          <ChevronRight size={16} />
        </button>
      </div>
    </motion.div>
  );
};

const AtomosLogo = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 100 100" 
    className={cn("w-full h-full p-1", className)}
    fill="none" 
    stroke="currentColor" 
    strokeWidth="6" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <rect x="10" y="10" width="80" height="80" rx="12" stroke="#4b5563" strokeWidth="3" />
    <path d="M25 70 L50 25 L75 70 Z" stroke="#3b82f6" />
    <path d="M40 70 L50 52 L60 70 Z" stroke="#3b82f6" />
  </svg>
);

const Window = ({ 
  window, 
  onClose, 
  onMinimize, 
  onFocus, 
  children 
}: { 
  window: WindowState; 
  onClose: () => void; 
  onMinimize: () => void; 
  onFocus: () => void;
  children: React.ReactNode;
}) => {
  if (!window.isOpen || window.isMinimized) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      drag
      dragMomentum={false}
      onPointerDown={onFocus}
      style={{ zIndex: window.zIndex }}
      className="absolute top-20 left-1/4 w-[900px] h-[600px] bg-[#1a1a1a]/80 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
    >
      {/* Title Bar */}
      <div className="h-12 bg-white/5 flex items-center justify-between px-4 cursor-move select-none">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 flex items-center justify-center text-white/70">{window.icon}</div>
          <span className="text-xs font-bold uppercase tracking-widest text-white/90">{window.title}</span>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={(e) => { e.stopPropagation(); onMinimize(); }}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <Minimize2 size={16} className="text-white/70" />
          </button>
          <button 
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <Maximize2 size={16} className="text-white/70" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="p-2 hover:bg-red-500/80 rounded-full transition-colors"
          >
            <X size={16} className="text-white" />
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-auto bg-black/20">
        {children}
      </div>
    </motion.div>
  );
};

// --- App Contents ---

const AIAssistant = () => {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: userMsg,
      });
      setMessages(prev => [...prev, { role: 'assistant', content: response.text || "I'm sorry, I couldn't generate a response." }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Error connecting to AI service." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full text-white">
      <div className="h-14 bg-white/5 border-b border-white/10 flex items-center px-6 gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
          <Bot size={18} />
        </div>
        <div>
          <h3 className="text-sm font-black tracking-tight">Nebula AI</h3>
          <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Powered by Gemini</p>
        </div>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-50 space-y-4">
            <Bot size={48} />
            <p className="text-lg font-medium">How can I help you today?</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={cn("flex gap-3", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}>
            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", msg.role === 'user' ? "bg-blue-600" : "bg-purple-600")}>
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className={cn("max-w-[80%] p-3 rounded-2xl text-sm", msg.role === 'user' ? "bg-blue-600/20 rounded-tr-none" : "bg-white/10 rounded-tl-none")}>
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>
                  {msg.content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3 animate-pulse">
            <div className="w-8 h-8 rounded-full bg-purple-600/50 flex items-center justify-center">
              <Bot size={16} />
            </div>
            <div className="bg-white/5 p-3 rounded-2xl rounded-tl-none text-sm">
              Thinking...
            </div>
          </div>
        )}
      </div>
      <div className="p-4 bg-white/5 border-t border-white/10 flex gap-2">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask me anything..."
          className="flex-1 bg-white/10 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
        />
        <button 
          onClick={handleSend}
          disabled={isLoading}
          className="p-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors disabled:opacity-50"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

const Browser = ({ 
  onFactoryReset, 
  url: externalUrl, 
  onUrlChange 
}: { 
  onFactoryReset?: () => void, 
  url?: string, 
  onUrlChange?: (url: string) => void 
}) => {
  const [localUrl, setLocalUrl] = useState('https://nebulabs.os');
  const url = externalUrl !== undefined ? externalUrl : localUrl;
  const [inputValue, setInputValue] = useState(url);
  const [isWiping, setIsWiping] = useState(false);
  const [wipeProgress, setWipeProgress] = useState(0);
  const [showWipeModal, setShowWipeModal] = useState(false);
  const [wipeStatusText, setWipeStatusText] = useState('');

  useEffect(() => {
    setInputValue(url);
  }, [url]);

  const navigateTo = (newUrl: string) => {
    let formatted = newUrl.trim();
    if (!formatted.startsWith('http://') && !formatted.startsWith('https://')) {
      formatted = 'https://' + formatted;
    }
    if (onUrlChange) {
      onUrlChange(formatted);
    } else {
      setLocalUrl(formatted);
    }
    setInputValue(formatted);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      navigateTo(inputValue);
    }
  };

  const cleanUrl = url.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '');

  const isOSLinkPage = cleanUrl.startsWith('nebula-os-link.vercel.app');
  const isDefaultPage = cleanUrl.startsWith('nebulabs.os') || cleanUrl === '';

  const triggerFactoryReset = () => {
    setShowWipeModal(true);
  };

  const confirmFactoryReset = () => {
    setShowWipeModal(false);
    setIsWiping(true);
    setWipeProgress(0);
    
    const statuses = [
      "Initializing secure remote wipe protocols...",
      "Dismounting active storage file systems...",
      "Erasing persistent database partitions...",
      "Clearing kernel cache and temporary logs...",
      "Writing zeros to virtual sectors...",
      "Rebuilding factory standard bootloader...",
      "Rebooting dev host into Atomos BIOS loader..."
    ];

    let currentStatusIndex = 0;
    setWipeStatusText(statuses[0]);

    const interval = setInterval(() => {
      setWipeProgress(prev => {
        const next = prev + 4;
        
        // Update status texts based on completion percentage
        const textIdx = Math.min(
          Math.floor((next / 100) * statuses.length),
          statuses.length - 1
        );
        setWipeStatusText(statuses[textIdx]);

        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsWiping(false);
            if (onFactoryReset) {
              onFactoryReset();
            }
          }, 800);
          return 100;
        }
        return next;
      });
    }, 150);
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0c] text-white font-sans overflow-hidden">
      {/* Browser Controls */}
      <div className="h-14 bg-black/40 border-b border-white/10 flex items-center px-6 gap-4 backdrop-blur-md shrink-0">
        <div className="flex gap-2">
          <button 
            onClick={() => navigateTo('https://nebulabs.os')} 
            className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors cursor-pointer" 
            title="Home"
          />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        
        {/* Navigation Buttons */}
        <div className="flex items-center gap-1.5 text-white/40">
          <button 
            onClick={() => navigateTo('https://nebulabs.os')} 
            className="p-1 hover:bg-white/5 rounded-lg hover:text-white transition-all cursor-pointer"
            title="Back to Home"
          >
            <ChevronRight className="rotate-180" size={16} />
          </button>
        </div>

        {/* URL Address Bar */}
        <div className="flex-1 max-w-2xl mx-auto bg-white/5 border border-white/10 rounded-xl px-4 py-1.5 text-sm flex items-center gap-3 focus-within:border-blue-500/40 transition-all backdrop-blur-md">
          <Globe size={14} className="text-white/40" />
          <input 
            type="text" 
            value={inputValue} 
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none text-white/80 text-xs font-medium"
            placeholder="Search or enter web address..."
          />
          {inputValue !== url && (
            <button 
              onClick={() => navigateTo(inputValue)}
              className="px-2 py-0.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
            >
              Go
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest font-black text-white/30 hidden sm:inline">Secure Node</span>
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        </div>
      </div>

      {/* Bookmarks Bar */}
      <div className="h-9 bg-black/20 border-b border-white/5 flex items-center px-6 gap-4 text-xs font-bold text-white/50 shrink-0 select-none">
        <span className="text-[9px] uppercase tracking-[0.2em] text-white/20 font-black mr-2">Bookmarks:</span>
        <button 
          onClick={() => navigateTo('https://nebulabs.os')} 
          className={cn(
            "flex items-center gap-1.5 px-2 py-1 rounded-md transition-all cursor-pointer", 
            isDefaultPage ? "bg-white/5 text-white" : "hover:text-white hover:bg-white/5"
          )}
        >
          <Folder size={12} className="text-blue-400" />
          <span>Nebulabs Home</span>
        </button>
        <button 
          onClick={() => navigateTo('https://nebula-os-link.vercel.app')} 
          className={cn(
            "flex items-center gap-1.5 px-2 py-1 rounded-md transition-all cursor-pointer", 
            isOSLinkPage ? "bg-blue-600/10 text-blue-400 border border-blue-500/20" : "hover:text-white hover:bg-white/5"
          )}
        >
          <SettingsIcon size={12} className="text-purple-400" />
          <span className="text-blue-400">Nebula OS Link</span>
        </button>
      </div>

      {/* Browser Body Area */}
      <div className="flex-1 overflow-y-auto relative bg-[#0b0c10]">
        
        {/* WIPING SCREEN OVERLAY */}
        {isWiping && (
          <div className="absolute inset-0 bg-[#040406]/98 z-[100] flex flex-col items-center justify-center p-12 select-none">
            <div className="w-16 h-16 rounded-full border-4 border-t-red-500 border-r-transparent border-b-red-500 border-l-transparent animate-spin mb-8 shadow-[0_0_15px_rgba(239,68,68,0.3)]" />
            
            <h2 className="text-2xl font-black text-red-500 uppercase tracking-widest mb-2 animate-pulse">Wiping Memory Space</h2>
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest text-center max-w-md h-8 mb-6">{wipeStatusText}</p>
            
            <div className="w-80 max-w-full space-y-2">
              <div className="flex justify-between text-[10px] uppercase tracking-widest font-black text-white/30">
                <span>Total Partition Progress</span>
                <span className="text-red-400">{wipeProgress}%</span>
              </div>
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-gradient-to-r from-red-600 to-orange-500 shadow-[0_0_8px_rgba(239,68,68,0.5)] transition-all duration-150"
                  style={{ width: `${wipeProgress}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* FACTORY RESET CONFIRMATION MODAL */}
        {showWipeModal && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-[99] flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-[440px] bg-[#141418] border border-red-500/30 rounded-[2rem] p-8 shadow-[0_15px_50px_rgba(0,0,0,0.8)] flex flex-col items-center text-center gap-6"
            >
              <div className="w-16 h-16 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                <X size={32} className="rotate-45" />
              </div>

              <div>
                <h3 className="text-2xl font-black text-white tracking-tight">Perform OS Factory Reset?</h3>
                <p className="text-white/40 font-bold uppercase tracking-widest text-[9px] mt-1">Remote Link Wipe Confirmation</p>
              </div>

              <p className="text-white/60 text-xs leading-relaxed max-w-xs">
                This will wipe the Atomos OS local files, profile configs, reset your workspace, and completely reboot back to the boot bios loader.
              </p>

              <div className="flex gap-3 w-full mt-2">
                <button 
                  onClick={() => setShowWipeModal(false)}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold transition-all border border-white/5"
                >
                  Cancel Link
                </button>
                <button 
                  onClick={confirmFactoryReset}
                  className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-xl shadow-red-950/20 active:scale-95 border border-red-500/20"
                >
                  Confirm Reset
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* 1. NEBULA OS LINK RENDER */}
        {isOSLinkPage && (
          <div className="min-h-full p-8 sm:p-12 relative flex flex-col justify-between max-w-4xl mx-auto space-y-12">
            
            {/* Background design elements */}
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#3b82f6]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#3b82f6]/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header section */}
            <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-white/10 pb-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center shadow-lg shadow-blue-950/20 p-1">
                  <div className="w-full h-full bg-[#050505] rounded-xl flex items-center justify-center">
                    <SettingsIcon size={24} className="text-blue-400" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-black tracking-tight text-white">Nebula OS Link</h1>
                    <span className="text-[9px] font-black uppercase bg-blue-500/10 text-blue-400 tracking-wider px-2 py-0.5 rounded-full border border-blue-500/20">Active v1.02</span>
                  </div>
                  <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest mt-0.5">Cloud Device Coordinator & Remote Manager</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2.5 rounded-2xl text-xs backdrop-blur-md">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-white/60 font-medium">Link Service Sync Active</span>
              </div>
            </div>

            {/* Main content grid */}
            <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Linked Devices */}
              <div className="md:col-span-2 space-y-4">
                <h3 className="text-xs uppercase tracking-widest text-white/30 font-black px-1">Active Sync node</h3>
                
                <div className="p-6 bg-white/5 border border-white/10 rounded-[2rem] flex items-center justify-between backdrop-blur-md hover:border-blue-500/30 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                      <TerminalIcon size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white group-hover:text-blue-300 transition-colors">Atomos OS Terminal</span>
                        <span className="text-[8px] uppercase tracking-widest font-black text-green-400 bg-green-400/10 border border-green-500/20 px-1.5 py-0.5 rounded">This Node</span>
                      </div>
                      <p className="text-[10px] text-white/40 font-mono mt-0.5">UUID: neb-2a65a-068d-4cbd</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <span className="text-xs text-green-400 font-bold font-mono">ONLINE</span>
                    <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest mt-0.5 font-mono">Port 3000</p>
                  </div>
                </div>

                {/* Second device mockup */}
                <div className="p-6 bg-white/[0.02] border border-white/5 rounded-[2rem] flex items-center justify-between opacity-50 select-none">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/30">
                      <Globe size={20} />
                    </div>
                    <div>
                      <span className="font-bold text-sm text-white/60">Nebula Phone Sync</span>
                      <p className="text-[10px] text-white/30 font-mono mt-0.5">UUID: neb-90b14-83ef-1110</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <span className="text-xs text-white/30 font-bold block">OFFLINE</span>
                    <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest mt-0.5 font-mono">Last 3d ago</p>
                  </div>
                </div>
              </div>

              {/* Status and Diagnostics */}
              <div className="space-y-4">
                <h3 className="text-xs uppercase tracking-widest text-white/30 font-black px-1">Node Diagnostics</h3>
                
                <div className="p-6 bg-white/5 border border-white/10 rounded-[2rem] space-y-4 backdrop-blur-md">
                  <div className="space-y-1">
                    <span className="text-[8px] uppercase tracking-widest font-black text-white/30">Operating Version</span>
                    <p className="text-xs font-bold text-white/80">Atomos OS v1.0.0 Stable</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[8px] uppercase tracking-widest font-black text-white/30">MAC ADD:RESS</span>
                    <p className="font-mono text-xs text-white/60">E4:C0:A4:1F:B1:05</p>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[8px] uppercase tracking-widest font-black text-white/30">
                      <span>Device Disk Space</span>
                      <span>64%</span>
                    </div>
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <div className="h-full w-[64%] bg-gradient-to-r from-blue-500 to-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.3)]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Danger Zone panel for Factory Reset */}
            <div className="relative p-8 bg-gradient-to-br from-red-500/5 to-[#1a0508] border border-red-500/20 rounded-[2.5rem] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                  <h3 className="text-lg font-black text-white uppercase tracking-tight">Cloud Device Recovery</h3>
                </div>
                <p className="text-white/50 text-xs leading-relaxed max-w-xl">
                  Enforce a full deep device wipe. Triggering this factory reset will wipe all system cache, reset directories, notes history, user accounts and reboot into bios boot mode immediately.
                </p>
              </div>

              <button 
                onClick={triggerFactoryReset}
                className="w-full md:w-auto shrink-0 px-6 py-3.5 bg-red-600/10 hover:bg-gradient-to-r hover:from-red-600 hover:to-red-500 text-red-500 hover:text-white border border-red-500/20 hover:border-red-600 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 cursor-pointer"
              >
                Factory Reset Device
              </button>
            </div>

            {/* Footer */}
            <div className="text-center text-[10px] text-white/20 uppercase tracking-[0.2em] font-black border-t border-white/5 pt-8">
              &copy; 2026 Nebulabs OS Cloud Systems Inc. All Rights Reserved.
            </div>

          </div>
        )}

        {/* 2. NEBULABS HOME PAGE RENDER */}
        {isDefaultPage && (
          <div className="flex flex-col items-center justify-center bg-gradient-to-b from-[#0b0c10] to-[#14151c] p-12 text-center min-h-full relative select-none">
            <div className="absolute top-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative w-28 h-28 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-2xl transform hover:rotate-6 transition-transform group border border-white/10">
              <Globe size={56} className="text-white group-hover:scale-110 transition-transform" />
            </div>
            
            <h1 className="text-4xl font-extrabold mb-3 tracking-tight text-white uppercase">Nebulabs OS</h1>
            <p className="text-white/40 max-w-lg text-sm leading-relaxed mb-12">
              The next generation of web-based computing. Fast, secure, and beautiful by design.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl">
              {[
                { name: 'Documentation', description: 'System setup and commands API', icon: <FileText size={18} /> },
                { name: 'Community Hub', description: 'Join active developers discussion', icon: <MessageSquare size={18} /> },
                { name: 'GitHub Repo', description: 'Explore open source kernel modules', icon: <TerminalIcon size={18} /> },
                { name: 'Nebula OS Link', description: 'Link accounts & Factory Reset tool', icon: <SettingsIcon size={18} />, target: 'https://nebula-os-link.vercel.app', isSpecial: true }
              ].map(item => (
                <div 
                  key={item.name} 
                  onClick={() => navigateTo(item.target || 'https://nebulabs.os')}
                  className={cn(
                    "group p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all cursor-pointer flex items-center gap-4 text-left select-none",
                    item.isSpecial && "border-blue-500/30 bg-blue-950/5 hover:border-blue-500/50 hover:bg-blue-950/10"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 group-hover:bg-blue-500/10 group-hover:text-blue-400 transition-colors",
                    item.isSpecial && "group-hover:text-blue-400 group-hover:bg-blue-500/15 text-blue-400"
                  )}>
                    {item.icon}
                  </div>
                  <div>
                    <span className={cn("font-bold text-xs block text-white/90 group-hover:text-white transition-colors", item.isSpecial && "text-blue-400")}>{item.name}</span>
                    <span className="text-[10px] text-white/30 block mt-0.5">{item.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. REAL IFRAME RENDER */}
        {!isOSLinkPage && !isDefaultPage && (
          <div className="w-full h-full bg-white relative">
            <iframe 
              src={url} 
              className="w-full h-full bg-white border-none" 
              title="Web Frame Container"
              referrerPolicy="no-referrer"
            />
            {/* Elegant warning overlay at the bottom of the external iframe in case of X-Frame blocking */}
            <div className="absolute bottom-4 left-4 right-4 bg-black/80 hover:bg-black/95 backdrop-blur border border-white/10 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-white z-10 transition-all shadow-2xl select-none text-left">
              <div className="text-[10px]">
                <span className="font-extrabold text-blue-400 uppercase tracking-widest mr-2">Secure Iframe Frame:</span>
                <span className="text-white/60">If this site remains blank, its server may restrict iframe embedding (X-Frame-Options/CSP).</span>
              </div>
              <a 
                href={url} 
                target="_blank" 
                rel="noreferrer"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-[10px] rounded-xl font-black uppercase tracking-wider whitespace-nowrap transition-all active:scale-95 shadow-md flex items-center gap-1 cursor-pointer"
              >
                Launch in New Tab &rarr;
              </a>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

const Files = () => {
  const folders = [
    { name: 'Documents', color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { name: 'Downloads', color: 'text-green-400', bg: 'bg-green-500/10' },
    { name: 'Pictures', color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { name: 'Music', color: 'text-pink-400', bg: 'bg-pink-500/10' },
    { name: 'Videos', color: 'text-red-400', bg: 'bg-red-500/10' },
    { name: 'System', color: 'text-gray-400', bg: 'bg-gray-500/10' }
  ];
  return (
    <div className="flex h-full text-white font-sans">
      <div className="w-56 bg-white/5 border-r border-white/10 p-6 space-y-6">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-black mb-4">Favorites</div>
          <div className="space-y-1">
            {folders.map(f => (
              <div key={f.name} className="flex items-center gap-3 p-2.5 hover:bg-white/10 rounded-xl cursor-pointer transition-all text-sm group">
                <Folder size={16} className={cn("transition-transform group-hover:scale-110", f.color)} />
                <span className="text-white/70 group-hover:text-white">{f.name}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-black mb-4">Storage</div>
          <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
            <div className="flex justify-between text-[10px] mb-2 font-bold">
              <span className="text-white/40 uppercase">Atomos HD</span>
              <span className="text-blue-400">64%</span>
            </div>
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
              <div className="h-full w-[64%] bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 p-8 overflow-y-auto scrollbar-hide">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-black tracking-tight">Home</h2>
            <p className="text-white/30 text-xs font-bold uppercase tracking-widest mt-1">/users/atomos/home</p>
          </div>
          <div className="flex gap-3">
            <div className="p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"><Search size={18} /></div>
          </div>
        </div>
        <div className="grid grid-cols-3 xl:grid-cols-4 gap-8">
          {folders.map(f => (
            <div key={f.name} className="group flex flex-col items-center gap-4 p-6 hover:bg-white/5 rounded-3xl cursor-pointer transition-all border border-transparent hover:border-white/10">
              <div className={cn("w-20 h-20 rounded-[2rem] flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl", f.bg)}>
                <Folder size={40} className={f.color} />
              </div>
              <span className="text-sm font-bold tracking-wide text-white/80 group-hover:text-white">{f.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Terminal = () => {
  const [history, setHistory] = useState<string[]>(['Welcome to Atomos OS v1.0.0', 'Type "help" for a list of commands.']);
  const [input, setInput] = useState('');

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const cmd = input.toLowerCase().trim();
    let response = '';

    switch(cmd) {
      case 'help':
        response = 'Available commands: help, clear, whoami, ls, date, neofetch';
        break;
      case 'clear':
        setHistory([]);
        setInput('');
        return;
      case 'whoami':
        response = 'user@atomos-os';
        break;
      case 'ls':
        response = 'Documents  Downloads  Pictures  Music  Videos';
        break;
      case 'date':
        response = new Date().toString();
        break;
      case 'neofetch':
        response = `
   /\\        Atomos OS
  /  \\       OS: Atomos OS 1.0.0
 /____\\      Kernel: WebKit 6.0
             Uptime: 2 hours
             Shell: atomos-sh
             Theme: Nebularite Dark
        `;
        break;
      default:
        response = `Command not found: ${cmd}`;
    }

    setHistory(prev => [...prev, `> ${input}`, response]);
    setInput('');
  };

  return (
    <div className="h-full bg-black/80 p-4 font-mono text-sm text-green-400 overflow-y-auto">
      {history.map((line, i) => (
        <div key={i} className="whitespace-pre-wrap mb-1">{line}</div>
      ))}
      <form onSubmit={handleCommand} className="flex">
        <span className="mr-2 text-blue-400">user@atomos:~$</span>
        <input 
          autoFocus
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-transparent outline-none border-none p-0"
        />
      </form>
    </div>
  );
};

const Notes = () => {
  const [text, setText] = useState('# Welcome to Atomos Notes\n\nThis is your personal workspace for ideas, drafts, and quick thoughts.\n\n- [ ] Task 1\n- [ ] Task 2\n- [ ] Task 3\n\nFeel free to edit this note!');
  return (
    <div className="h-full flex flex-col bg-[#1a1a1a]">
      <div className="h-10 bg-white/5 border-b border-white/10 flex items-center px-4 gap-4">
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-white/20" />
          <div className="w-2 h-2 rounded-full bg-white/20" />
          <div className="w-2 h-2 rounded-full bg-white/20" />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Untitled Note</span>
      </div>
      <textarea 
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="flex-1 bg-transparent p-8 outline-none resize-none font-mono text-sm text-white/80 leading-relaxed"
        placeholder="Start typing..."
      />
    </div>
  );
};

// --- Camera App Component ---
const Camera = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [hasCamera, setHasCamera] = useState<boolean | null>(null);
  const [filter, setFilter] = useState<'none' | 'nightvision' | 'cyberpunk' | 'thermal'>('none');

  useEffect(() => {
    let activeStream: MediaStream | null = null;
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      .then(s => {
        setStream(s);
        setHasCamera(true);
        activeStream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
      })
      .catch(err => {
        console.error("Camera access error or iframe sandbox block:", err);
        setHasCamera(false);
      });

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="flex flex-col h-full bg-black text-white font-sans overflow-hidden">
      <div className="h-12 bg-white/5 border-b border-white/10 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs font-black uppercase tracking-widest text-white/80">Atomos Camera Module</span>
        </div>
        <div className="flex gap-1 bg-white/5 p-1 rounded-lg border border-white/10">
          {(['none', 'nightvision', 'cyberpunk', 'thermal'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer",
                filter === f ? "bg-blue-600 text-white shadow" : "text-white/40 hover:text-white"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 relative flex items-center justify-center bg-zinc-950 overflow-hidden">
        {hasCamera === true ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={cn(
              "w-full h-full object-cover transition-all",
              filter === 'nightvision' && "brightness-125 contrast-150 saturate-[0.1] sepia hue-rotate-[60deg]",
              filter === 'cyberpunk' && "brightness-110 contrast-125 saturate-200 sepia hover:sepia-0 hue-rotate-[270deg] invert-[0.1]",
              filter === 'thermal' && "contrast-150 saturate-200 hue-rotate-[180deg] invert"
            )}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-zinc-950 to-black select-none text-center">
            <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,6px_100%]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-blue-500/10 rounded-full animate-[ping_3s_infinite_linear]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 border border-purple-500/20 rounded-full animate-[pulse_2s_infinite]" />
            
            <Globe size={48} className="text-blue-500/30 animate-[spin_20s_linear_infinite] mb-6" />

            <div className="space-y-2 z-10">
              <h4 className="text-sm font-black text-white uppercase tracking-widest">CAMERA SIMULATOR ACTIVE</h4>
              <p className="text-[11px] text-white/40 max-w-xs mx-auto leading-relaxed font-sans font-normal">
                Device camera blocked or running in an iframe sandbox. Virtual simulator feed online.
              </p>
            </div>

            <div className="absolute bottom-6 left-6 text-left font-mono text-[9px] text-green-400/50 space-y-0.5">
              <div>LAT: 47.6062 N</div>
              <div>LON: 122.3321 W</div>
              <div>ALT: 142.0m</div>
            </div>

            <div className="absolute bottom-6 right-6 text-right font-mono text-[9px] text-green-400/50">
              <div>HD LINK SYNC</div>
              <div>SECURE_DEV_FEED</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Mail App Component ---
const MailApp = () => {
  const [emails, setEmails] = useState([
    {
      id: 1,
      sender: "Nebulabs Core Admin",
      senderMail: "admin@nebulabs.os",
      subject: "Welcome to Atomos OS v1.0.0 Stable Build",
      body: "Hello Administrator,\n\nCongratulations on successfully configuring Atomos OS on this secure client node. We have loaded your core services, local workspaces, and configured our state systems to store all elements locally.\n\nYour Workspace uuid is registered to: neb-2a65a-068d-4cbd.\n\nPlease complete your settings profile setup and verify your display name to link accounts in Nebula OS Link.\n\nSincerely,\nNebulabs Operating Systems Coordination Dept.",
      date: "May 24, 2026",
      read: false,
      folder: 'inbox'
    },
    {
      id: 2,
      sender: "AI Cloud Services",
      senderMail: "ai-sync@nebulabs.os",
      subject: "Nebula AI Integration Status Check",
      body: "System Alert:\n\nYour secure Gemini interface is online. You can now use the Nebula AI chat widget directly from your desktop or start menu to query systems, draft notes, or solve developer queries.\n\nEnsure process.env.GEMINI_API_KEY is configured in your platform settings to enable server-side processing.\n\nStatus: ONLINE",
      date: "May 23, 2026",
      read: true,
      folder: 'inbox'
    },
    {
      id: 3,
      sender: "Vercel Sync Hook",
      senderMail: "hooks@vercel.com",
      subject: "nebula-os-link.vercel.app Deployment Ready",
      body: "Commit c4ea06f9 - Build Succeeded.\n\nThe Cloud Device Recovery portal was built and linked to this workspace. You can access it directly through the OS browser by clicking on the Nebula Link bookmark.\n\nTo dry test the module, trigger a deep device recovery wipe directly from the portal.",
      date: "May 22, 2026",
      read: true,
      folder: 'inbox'
    }
  ]);

  const [activeFolder, setActiveFolder] = useState<'inbox' | 'sent' | 'trash'>('inbox');
  const [selectedMail, setSelectedMail] = useState<typeof emails[0] | null>(emails[0]);
  const [isComposing, setIsComposing] = useState(false);
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');

  const currentEmails = emails.filter(e => e.folder === activeFolder);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeTo || !composeSubject) return;

    const newMail = {
      id: Date.now(),
      sender: "Me (Nebula Administrator)",
      senderMail: "admin@nebulabs.os",
      subject: composeSubject,
      body: composeBody,
      date: "Today, " + format(new Date(), 'HH:mm'),
      read: true,
      folder: 'sent' as const
    };

    setEmails(prev => [newMail, ...prev]);
    setIsComposing(false);
    setComposeTo('');
    setComposeSubject('');
    setComposeBody('');
    setActiveFolder('sent');
    setSelectedMail(newMail);
  };

  return (
    <div className="flex h-full text-white font-sans bg-[#0c0d12]">
      <div className="w-52 bg-white/5 border-r border-white/10 p-5 space-y-6 shrink-0 flex flex-col">
        <button 
          onClick={() => setIsComposing(true)}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md cursor-pointer text-center"
        >
          Compose
        </button>

        <div className="space-y-1 text-left">
          <div className="text-[9px] uppercase tracking-widest text-white/30 font-black mb-3 px-1">Mailboxes</div>
          {[
            { id: 'inbox', label: 'Inbox', count: emails.filter(e => e.folder === 'inbox' && !e.read).length },
            { id: 'sent', label: 'Sent', count: emails.filter(e => e.folder === 'sent').length },
            { id: 'trash', label: 'Trash', count: emails.filter(e => e.folder === 'trash').length }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => {
                setActiveFolder(item.id as any);
                setIsComposing(false);
                setSelectedMail(null);
              }}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                activeFolder === item.id && !isComposing ? "bg-white/10 text-white" : "text-white/40 hover:bg-white/5 hover:text-white"
              )}
            >
              <span>{item.label}</span>
              {item.count > 0 && (
                <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded-full text-[9px] font-black">{item.count}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex max-h-full">
        {isComposing ? (
          <form onSubmit={handleSend} className="flex-1 p-8 space-y-6 flex flex-col overflow-y-auto w-full">
            <div className="text-left">
              <h3 className="text-lg font-black tracking-tight mb-1">New Message</h3>
              <p className="text-white/40 text-xs uppercase tracking-widest font-bold">Draft Composition Space</p>
            </div>

            <div className="space-y-4 flex-1 flex flex-col">
              <input 
                type="text" 
                placeholder="To (Recipient email list)" 
                value={composeTo}
                onChange={(e) => setComposeTo(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-xs outline-none focus:border-blue-500/50 text-white/80"
              />
              <input 
                type="text" 
                placeholder="Subject Line" 
                value={composeSubject}
                onChange={(e) => setComposeSubject(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-xs outline-none focus:border-blue-500/50 text-white/80"
              />
              <textarea 
                placeholder="Compose your email core body text here..." 
                value={composeBody}
                onChange={(e) => setComposeBody(e.target.value)}
                required
                className="w-full flex-1 min-h-[150px] bg-white/5 border border-white/10 rounded-xl p-4 text-xs outline-none resize-none focus:border-blue-500/50 text-white/70 font-sans"
              />
            </div>

            <div className="flex gap-3 justify-end shrink-0">
              <button 
                type="button"
                onClick={() => setIsComposing(false)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                Cancel Draft
              </button>
              <button 
                type="submit"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
              >
                Send Message
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-1 max-h-full">
            <div className="w-80 border-r border-white/10 flex flex-col max-h-full">
              <div className="p-4 border-b border-white/10 shrink-0 text-left">
                <span className="text-[10px] uppercase tracking-widest text-blue-400 font-extrabold px-1">Active Hub Mail</span>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-white/5 scrollbar-hide">
                {currentEmails.length === 0 ? (
                  <div className="p-8 text-center text-white/30 text-xs italic">
                    This folder is empty.
                  </div>
                ) : (
                  currentEmails.map(mail => (
                    <div
                      key={mail.id}
                      onClick={() => {
                        setSelectedMail(mail);
                        setEmails(prev => prev.map(e => e.id === mail.id ? { ...e, read: true } : e));
                      }}
                      className={cn(
                        "p-4 cursor-pointer text-left transition-all select-none border-l-2",
                        selectedMail?.id === mail.id ? "bg-white/10 border-blue-500" : "hover:bg-white/5 border-transparent",
                        !mail.read && "font-semibold bg-blue-500/5"
                      )}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-white/90 truncate max-w-[150px]">{mail.sender}</span>
                        <span className="text-[8px] text-white/40 font-mono">{mail.date}</span>
                      </div>
                      <h4 className="text-[11px] font-bold text-white truncate mb-1">{mail.subject}</h4>
                      <p className="text-[10px] text-white/30 line-clamp-2 leading-relaxed">{mail.body}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto scrollbar-hide">
              {selectedMail ? (
                <div className="space-y-6 text-left">
                  <div className="border-b border-white/10 pb-4 space-y-1.5">
                    <div className="flex justify-between items-start text-left">
                      <h2 className="text-base font-black text-white">{selectedMail.subject}</h2>
                      <span className="text-[9px] text-white/40 font-mono uppercase bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">{selectedMail.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-left">
                      <span className="text-white/40">From:</span>
                      <span className="text-blue-400 font-bold">{selectedMail.sender}</span>
                      <span className="text-white/20">&lt;{selectedMail.senderMail}&gt;</span>
                    </div>
                  </div>

                  <div className="text-xs text-white/80 leading-relaxed whitespace-pre-line font-sans text-left">
                    {selectedMail.body}
                  </div>
                </div>
              ) : (
                <div className="h-full w-full flex flex-col items-center justify-center text-center text-white/30 space-y-2">
                  <Mail size={32} />
                  <p className="text-xs">No email selected</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Calendar App Component ---
const CalendarApp = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<{[key: string]: { id: number, text: string, time: string, color: string }[]}>({
    "2026-05-24": [
      { id: 1, text: "Nebula OS Release Launch", time: "10:00 AM", color: "blue" },
      { id: 2, text: "Check BIOS Recovery Loop", time: "2:00 PM", color: "purple" }
    ],
    "2026-05-25": [
      { id: 3, text: "Sync Workspace Directories", time: "11:30 AM", color: "green" }
    ]
  });

  const [selectedDayString, setSelectedDayString] = useState<string | null>(null);
  const [newEventText, setNewEventText] = useState('');
  const [newEventTime, setNewEventTime] = useState('12:00');
  const [newEventColor, setNewEventColor] = useState('blue');

  const startOfMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  const startDayOfWeek = startOfMonthDate.getDay();
  const totalDays = endOfMonthDate.getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const daysGrid = [];
  for (let i = 0; i < startDayOfWeek; i++) {
    daysGrid.push(null);
  }
  for (let i = 1; i <= totalDays; i++) {
    daysGrid.push(i);
  }

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDayString || !newEventText.trim()) return;

    const newEv = {
      id: Date.now(),
      text: newEventText,
      time: format(new Date(`2000-01-01T${newEventTime}`), 'h:mm a'),
      color: newEventColor
    };

    setEvents(prev => ({
      ...prev,
      [selectedDayString]: [...(prev[selectedDayString] || []), newEv]
    }));

    setNewEventText('');
  };

  const handleDeleteEvent = (dateString: string, eventId: number) => {
    setEvents(prev => ({
      ...prev,
      [dateString]: (prev[dateString] || []).filter(e => e.id !== eventId)
    }));
  };

  return (
    <div className="flex h-full text-white font-sans bg-[#0c0d12]">
      <div className="w-64 bg-white/5 border-r border-white/10 p-5 space-y-6 shrink-0 flex flex-col text-left">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-white/30 font-black">Agenda Log</span>
          <h3 className="text-sm font-black mt-1 text-white/95">{selectedDayString ? `Events on ${selectedDayString}` : "Select a day"}</h3>
        </div>

        {selectedDayString ? (
          <div className="flex-1 flex flex-col space-y-4 max-h-[400px] overflow-y-auto scrollbar-hide">
            <div className="space-y-2">
              {(events[selectedDayString] || []).length === 0 ? (
                <div className="text-white/30 text-xs italic py-2">No key events scheduled.</div>
              ) : (
                (events[selectedDayString] || []).map(ev => (
                  <div key={ev.id} className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-1 relative group text-left">
                    <button 
                      onClick={() => handleDeleteEvent(selectedDayString, ev.id)}
                      className="absolute top-2 right-2 text-white/30 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                    <div className="flex items-center gap-1.5">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        ev.color === 'blue' && "bg-blue-500",
                        ev.color === 'purple' && "bg-purple-500",
                        ev.color === 'green' && "bg-green-500"
                      )} />
                      <span className="text-[10px] text-white/40 font-mono">{ev.time}</span>
                    </div>
                    <p className="text-xs font-bold text-white/80">{ev.text}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleAddEvent} className="space-y-3 pt-3 border-t border-white/10 shrink-0 text-left">
              <span className="text-[9px] font-black uppercase tracking-widest text-blue-400">Quick Event</span>
              <input 
                type="text" 
                placeholder="Event Title" 
                value={newEventText}
                onChange={(e) => setNewEventText(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded-lg py-1.5 px-3 text-xs outline-none focus:border-blue-500/50 text-white"
              />
              <div className="flex gap-2">
                <input 
                  type="time" 
                  value={newEventTime}
                  onChange={(e) => setNewEventTime(e.target.value)}
                  required
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg py-1 px-2 text-xs outline-none text-white"
                />
                <select 
                  value={newEventColor} 
                  onChange={(e) => setNewEventColor(e.target.value)}
                  className="bg-zinc-950 border border-white/10 rounded-lg py-1 px-1.5 text-xs outline-none text-white/80"
                >
                  <option value="blue">Blue</option>
                  <option value="purple">Purple</option>
                  <option value="green">Green</option>
                </select>
              </div>
              <button 
                type="submit"
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer text-center text-white"
              >
                Schedule
              </button>
            </form>
          </div>
        ) : (
          <div className="text-white/30 text-xs italic">Select any calendar cell in the grid to view detailed events list and schedule a task.</div>
        )}
      </div>

      <div className="flex-1 p-6 flex flex-col justify-between max-h-full">
        <div className="flex items-center justify-between px-2 pb-4 border-b border-white/10 shrink-0">
          <h3 className="text-base font-black uppercase tracking-tight text-white">
            {format(currentDate, 'MMMM yyyy')}
          </h3>
          <div className="flex gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
            <button onClick={prevMonth} className="p-1 px-2.5 hover:bg-white/5 rounded-lg text-xs font-black transition-all cursor-pointer">&larr;</button>
            <button onClick={() => setCurrentDate(new Date())} className="px-3 hover:bg-white/5 rounded-lg text-[10px] uppercase font-black cursor-pointer">Today</button>
            <button onClick={nextMonth} className="p-1 px-2.5 hover:bg-white/5 rounded-lg text-xs font-black transition-all cursor-pointer">&rarr;</button>
          </div>
        </div>

        <div className="grid grid-cols-7 text-center py-2 text-[9px] uppercase tracking-wider font-extrabold text-white/30 shrink-0">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        <div className="flex-1 grid grid-cols-7 grid-rows-6 gap-1 bg-white/5 border border-white/10 rounded-2xl p-1 overflow-hidden">
          {daysGrid.map((day, cellIndex) => {
            if (day === null) return <div key={`empty-${cellIndex}`} className="bg-black/20 rounded-lg opacity-25" />;
            
            const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isToday = format(new Date(), 'yyyy-MM-dd') === dateStr;
            const isSelected = selectedDayString === dateStr;
            const dayEvents = events[dateStr] || [];

            return (
              <div
                key={dateStr}
                onClick={() => setSelectedDayString(dateStr)}
                className={cn(
                  "bg-black/10 hover:bg-white/5 rounded-xl p-2 cursor-pointer flex flex-col justify-between text-left transition-all border border-transparent select-none relative",
                  isToday && "bg-blue-600/10 border-blue-500/30",
                  isSelected && "bg-white/10 border-white/20 shadow-md ring-1 ring-white/10"
                )}
              >
                <div className="flex justify-between items-center">
                  <span className={cn(
                    "text-xs font-black w-5 h-5 flex items-center justify-center rounded-full",
                    isToday ? "bg-blue-600 text-white" : "text-white/60"
                  )}>
                    {day}
                  </span>
                  {dayEvents.length > 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                  )}
                </div>

                <div className="space-y-0.5 mt-1 overflow-hidden hidden sm:block">
                  {dayEvents.slice(0, 2).map(ev => (
                    <div 
                      key={ev.id} 
                      className={cn(
                        "text-[8px] font-semibold px-1 rounded-sm py-0.5 text-white/80 truncate border text-left",
                        ev.color === 'blue' && "bg-blue-500/20 border-blue-500/15",
                        ev.color === 'purple' && "bg-purple-500/20 border-purple-500/15",
                        ev.color === 'green' && "bg-green-500/20 border-green-500/15"
                      )}
                    >
                      {ev.text}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-[7px] text-white/30 font-bold uppercase text-center mt-0.5">+{dayEvents.length - 2} more</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// --- Paint App (Magic Edit) Component ---
const PaintApp = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState('#3b82f6');
  const [lineWidth, setLineWidth] = useState(5);
  const [isDrawing, setIsDrawing] = useState(false);
  const [mode, setMode] = useState<'brush' | 'eraser'>('brush');

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      if (e.touches.length === 0) return null;
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCoordinates(e);
    if (!coords) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const coords = getCoordinates(e);
    if (!coords) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(coords.x, coords.y);
    ctx.strokeStyle = mode === 'eraser' ? '#141418' : color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;
    ctx.fillStyle = '#141418';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.parentElement?.clientWidth || 600;
    canvas.height = canvas.parentElement?.clientHeight || 450;
    clearCanvas();
  }, []);

  return (
    <div className="flex h-full bg-[#0c0d12] text-white font-sans flex-col select-none">
      <div className="h-14 bg-white/5 border-b border-white/10 flex items-center justify-between px-6 shrink-0 gap-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-left">
            <span className="text-[10px] uppercase tracking-widest text-white/30 font-black">Brush Core</span>
            <div className="flex gap-1.5 p-1 bg-white/5 border border-white/10 rounded-xl">
              <button
                onClick={() => setMode('brush')}
                className={cn(
                  "px-3 py-1 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer",
                  mode === 'brush' ? "bg-blue-600 text-white shadow" : "text-white/40 hover:text-white"
                )}
              >
                Brush
              </button>
              <button
                onClick={() => setMode('eraser')}
                className={cn(
                  "px-3 py-1 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer",
                  mode === 'eraser' ? "bg-blue-600 text-white shadow" : "text-white/40 hover:text-white"
                )}
              >
                Eraser
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-left">
            <span className="text-[10px] uppercase tracking-widest text-white/30 font-black">Size</span>
            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-xl p-1">
              {[3, 5, 10, 20].map(sz => (
                <button
                  key={sz}
                  onClick={() => setLineWidth(sz)}
                  className={cn(
                    "w-6 h-6 rounded-lg text-[9px] font-black transition-all flex items-center justify-center cursor-pointer",
                    lineWidth === sz ? "bg-blue-600 text-white" : "text-white/40 hover:text-white hover:bg-white/5"
                  )}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>
        </div>

        {mode === 'brush' && (
          <div className="flex items-center gap-2 text-left">
            <span className="text-[10px] uppercase tracking-widest text-white/30 font-black">Palette</span>
            <div className="flex gap-1.5">
              {['#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#10b981', '#f59e0b', '#ffffff', '#000000'].map(paletteColor => (
                <button
                  key={paletteColor}
                  onClick={() => setColor(paletteColor)}
                  className={cn(
                    "w-5 h-5 rounded-full border-2 transition-all cursor-pointer hover:scale-110",
                    color === paletteColor ? "border-white scale-110 shadow-md" : "border-transparent"
                  )}
                  style={{ backgroundColor: paletteColor }}
                />
              ))}
            </div>
          </div>
        )}

        <button
          onClick={clearCanvas}
          className="px-4 py-1.5 border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
        >
          Clear Grid
        </button>
      </div>

      <div className="flex-1 relative bg-[#141418] overflow-hidden flex items-center justify-center">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="bg-[#141418] cursor-crosshair shadow-inner"
        />
      </div>
    </div>
  );
};


// --- Desktop Widgets ---

interface WidgetProps {
  onClose: () => void;
}

const ClockWidget = ({ onClose }: WidgetProps) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-56 p-5 bg-black/40 backdrop-blur-3xl border border-white/10 rounded-[1.5rem] text-white shadow-2xl pointer-events-auto select-none relative group transition-all duration-300 hover:border-white/20">
      <button 
        onClick={onClose}
        className="absolute top-3 right-3 text-white/20 hover:text-white/60 transition-colors"
      >
        <X size={12} />
      </button>
      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-2 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
        Atomos Clock
      </div>
      <div className="text-3xl font-black tracking-tight font-mono">
        {format(time, 'HH:mm:ss')}
      </div>
      <div className="text-[10px] text-white/40 font-bold uppercase tracking-wider mt-1">
        {format(time, 'EEEE, LLLL d')}
      </div>
    </div>
  );
};

const WeatherWidget = ({ onClose }: WidgetProps) => {
  const [temp, setTemp] = useState(21.4);

  useEffect(() => {
    const interval = setInterval(() => {
      setTemp(t => t + (Math.random() > 0.5 ? 0.1 : -0.1));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-56 p-5 bg-black/40 backdrop-blur-3xl border border-white/10 rounded-[1.5rem] text-white shadow-2xl pointer-events-auto select-none relative group transition-all duration-300 hover:border-white/20">
      <button 
        onClick={onClose}
        className="absolute top-3 right-3 text-white/20 hover:text-white/60 transition-colors"
      >
        <X size={12} />
      </button>
      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-2 flex items-center gap-1.5">
        <Cloud size={12} className="text-blue-400" />
        Synoptic Node
      </div>
      <div className="flex items-center gap-3">
        <CloudRain size={28} className="text-blue-200 animate-bounce" style={{ animationDuration: '3s' }} />
        <div className="text-left">
          <div className="text-2xl font-black tracking-tight">{temp.toFixed(1)}°C</div>
          <div className="text-[9px] text-white/40 uppercase tracking-wider font-extrabold">Dreamy Clouds</div>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-[8px] font-bold uppercase tracking-wider text-white/30 border-t border-white/5 pt-2">
        <div className="text-left">
          <span className="block text-white/50 text-[7px]">Wind</span>
          <span className="text-white/60 font-mono">12 km/h</span>
        </div>
        <div className="text-left">
          <span className="block text-white/50 text-[7px]">Humidity</span>
          <span className="text-white/60 font-mono">78%</span>
        </div>
      </div>
    </div>
  );
};

const StatsWidget = ({ onClose }: WidgetProps) => {
  const [cpu, setCpu] = useState(38);
  const [ram] = useState(2.1);

  useEffect(() => {
    const interval = setInterval(() => {
      setCpu(Math.floor(25 + Math.random() * 30));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-56 p-5 bg-black/40 backdrop-blur-3xl border border-white/10 rounded-[1.5rem] text-white shadow-2xl pointer-events-auto select-none relative group transition-all duration-300 hover:border-white/20">
      <button 
        onClick={onClose}
        className="absolute top-3 right-3 text-white/20 hover:text-white/60 transition-colors"
      >
        <X size={12} />
      </button>
      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-3 flex items-center gap-1.5">
        <TerminalIcon size={12} className="text-purple-400" />
        Core Telemetry
      </div>
      
      <div className="space-y-2.5">
        <div className="space-y-1">
          <div className="flex justify-between text-[8px] font-black uppercase tracking-wider text-white/40">
            <span>CPU Core</span>
            <span className="font-mono text-purple-400">{cpu}%</span>
          </div>
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-purple-500 transition-all duration-1000" style={{ width: `${cpu}%` }} />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-[8px] font-black uppercase tracking-wider text-white/40">
            <span>Core RAM</span>
            <span className="font-mono text-blue-400">{ram} GB / 4.0 GB</span>
          </div>
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${(ram / 4.0) * 100}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [isBooting, setIsBooting] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile>({
    name: 'Nebula User',
    avatar: '',
    role: 'Administrator'
  });

  const users: UserProfile[] = [
    { name: 'Nebula User', avatar: '', role: 'Administrator' },
    { name: 'Guest', avatar: '', role: 'Guest' }
  ];

  const [time, setTime] = useState(new Date());
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const [isQuickSettingsOpen, setIsQuickSettingsOpen] = useState(false);
  const [windows, setWindows] = useState<WindowState[]>([
    { id: 'files', title: 'Files', icon: <Folder size={18} />, isOpen: false, isMinimized: false, zIndex: 10 },
    { id: 'browser', title: 'Browser', icon: <Globe size={18} />, isOpen: false, isMinimized: false, zIndex: 10 },
    { id: 'ai', title: 'AI Assistant', icon: <MessageSquare size={18} />, isOpen: false, isMinimized: false, zIndex: 10 },
    { id: 'notes', title: 'Notes', icon: <FileText size={18} />, isOpen: false, isMinimized: false, zIndex: 10 },
    { id: 'magic-edit', title: 'Magic Edit', icon: <ImageIcon size={18} />, isOpen: false, isMinimized: false, zIndex: 10 },
    { id: 'terminal', title: 'Terminal', icon: <TerminalIcon size={18} />, isOpen: false, isMinimized: false, zIndex: 10 },
    { id: 'camera', title: 'Camera', icon: <Video size={18} />, isOpen: false, isMinimized: false, zIndex: 10 },
    { id: 'mail', title: 'Mail', icon: <Mail size={18} />, isOpen: false, isMinimized: false, zIndex: 10 },
    { id: 'calendar', title: 'Calendar', icon: <Calendar size={18} />, isOpen: false, isMinimized: false, zIndex: 10 },
    { id: 'settings', title: 'Settings', icon: <SettingsIcon size={18} />, isOpen: false, isMinimized: false, zIndex: 10 },
  ]);
  const [maxZIndex, setMaxZIndex] = useState(10);
  const [browserUrl, setBrowserUrl] = useState('https://nebulabs.os');
  const [showWidgets, setShowWidgets] = useState({
    clock: true,
    weather: true,
    stats: true
  });

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const openWindow = (id: AppId) => {
    setWindows(prev => prev.map(w => {
      if (w.id === id) {
        return { ...w, isOpen: true, isMinimized: false, zIndex: maxZIndex + 1 };
      }
      return w;
    }));
    setMaxZIndex(prev => prev + 1);
  };

  const closeWindow = (id: AppId) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isOpen: false } : w));
  };

  const minimizeWindow = (id: AppId) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isMinimized: true } : w));
  };

  const focusWindow = (id: AppId) => {
    setWindows(prev => prev.map(w => {
      if (w.id === id) {
        return { ...w, zIndex: maxZIndex + 1 };
      }
      return w;
    }));
    setMaxZIndex(prev => prev + 1);
  };

  const toggleWindow = (id: AppId) => {
    const win = windows.find(w => w.id === id);
    if (!win) return;
    if (win.isOpen && !win.isMinimized) {
      minimizeWindow(id);
    } else {
      openWindow(id);
    }
  };

  const handleFactoryReset = () => {
    setCurrentUser({
      name: 'Nebula User',
      avatar: '',
      role: 'Administrator'
    });
    setWindows([
      { id: 'files', title: 'Files', icon: <Folder size={18} />, isOpen: false, isMinimized: false, zIndex: 10 },
      { id: 'browser', title: 'Browser', icon: <Globe size={18} />, isOpen: false, isMinimized: false, zIndex: 10 },
      { id: 'ai', title: 'AI Assistant', icon: <MessageSquare size={18} />, isOpen: false, isMinimized: false, zIndex: 10 },
      { id: 'notes', title: 'Notes', icon: <FileText size={18} />, isOpen: false, isMinimized: false, zIndex: 10 },
      { id: 'magic-edit', title: 'Magic Edit', icon: <ImageIcon size={18} />, isOpen: false, isMinimized: false, zIndex: 10 },
      { id: 'terminal', title: 'Terminal', icon: <TerminalIcon size={18} />, isOpen: false, isMinimized: false, zIndex: 10 },
      { id: 'camera', title: 'Camera', icon: <Video size={18} />, isOpen: false, isMinimized: false, zIndex: 10 },
      { id: 'mail', title: 'Mail', icon: <Mail size={18} />, isOpen: false, isMinimized: false, zIndex: 10 },
      { id: 'calendar', title: 'Calendar', icon: <Calendar size={18} />, isOpen: false, isMinimized: false, zIndex: 10 },
      { id: 'settings', title: 'Settings', icon: <SettingsIcon size={18} />, isOpen: false, isMinimized: false, zIndex: 10 },
    ]);
    setMaxZIndex(10);
    setIsStartMenuOpen(false);
    setIsQuickSettingsOpen(false);
    setIsLoggedIn(false);
    setIsBooting(true);
  };

  if (isBooting) return <BIOS onComplete={() => setIsBooting(false)} />;
  if (!isLoggedIn) return <Login users={users} onLogin={(user) => { setCurrentUser(user); setIsLoggedIn(true); }} />;

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#050505] font-sans selection:bg-blue-500/30 cursor-none">
      <CustomCursor />
      {/* Wallpaper */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
        style={{ 
          backgroundImage: `url('/src/assets/images/cosmic_cloud_wallpaper_1782007785959.jpg')`,
          filter: 'brightness(0.9) contrast(1.1)'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-505/20 via-transparent to-pink-500/10" />
      </div>

      {/* Widgets Layer (Desktop Background Widgets) */}
      <div className="absolute inset-x-0 top-12 bottom-16 pointer-events-none z-[1]">
        {showWidgets.clock && (
          <motion.div 
            drag 
            dragMomentum={false}
            dragElastic={0}
            className="absolute right-24 top-12 cursor-grab active:cursor-grabbing pointer-events-auto"
          >
            <ClockWidget onClose={() => setShowWidgets(prev => ({ ...prev, clock: false }))} />
          </motion.div>
        )}

        {showWidgets.weather && (
          <motion.div 
            drag 
            dragMomentum={false}
            dragElastic={0}
            className="absolute right-24 top-[230px] cursor-grab active:cursor-grabbing pointer-events-auto"
          >
            <WeatherWidget onClose={() => setShowWidgets(prev => ({ ...prev, weather: false }))} />
          </motion.div>
        )}

        {showWidgets.stats && (
          <motion.div 
            drag 
            dragMomentum={false}
            dragElastic={0}
            className="absolute right-24 top-[420px] cursor-grab active:cursor-grabbing pointer-events-auto"
          >
            <StatsWidget onClose={() => setShowWidgets(prev => ({ ...prev, stats: false }))} />
          </motion.div>
        )}
      </div>

      {/* Sidebar */}
      <div className="absolute left-8 top-12 flex flex-col gap-8 z-10">
        {[
          { id: 'files', icon: <Folder size={24} />, label: 'Files', color: 'bg-blue-500' },
          { id: 'browser', icon: <Globe size={24} />, label: 'Browser', color: 'bg-indigo-500' },
          { id: 'ai', icon: <MessageSquare size={24} />, label: 'AI Assistant', color: 'bg-purple-500' },
          { id: 'magic-edit', icon: <ImageIcon size={24} />, label: 'Paint', color: 'bg-blue-400' },
          { id: 'notes', icon: <FileText size={24} />, label: 'Notes', color: 'bg-amber-500' },
          { id: 'settings', icon: <SettingsIcon size={24} />, label: 'Settings', color: 'bg-gray-500' },
          { id: 'terminal', icon: <TerminalIcon size={24} />, label: 'Terminal', color: 'bg-gray-800' },
        ].map((app) => (
          <button
            key={app.id}
            onClick={() => openWindow(app.id as AppId)}
            className="group relative flex flex-col items-center gap-2"
          >
            <div className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl transition-all duration-300 group-hover:scale-110 group-active:scale-95",
              app.color
            )}>
              {app.icon}
            </div>
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/60 drop-shadow-md">
              {app.label}
            </span>
          </button>
        ))}
      </div>

      {/* Windows Layer */}
      <div className="absolute inset-0 pointer-events-none z-20">
        <div className="relative w-full h-full pointer-events-auto">
          <AnimatePresence>
            {windows.map(win => (
              <Window 
                key={win.id} 
                window={win} 
                onClose={() => closeWindow(win.id)}
                onMinimize={() => minimizeWindow(win.id)}
                onFocus={() => focusWindow(win.id)}
              >
                {win.id === 'ai' && <AIAssistant />}
                {win.id === 'browser' && (
                  <Browser 
                    onFactoryReset={handleFactoryReset} 
                    url={browserUrl}
                    onUrlChange={setBrowserUrl}
                  />
                )}
                {win.id === 'files' && <Files />}
                {win.id === 'terminal' && <Terminal />}
                {win.id === 'notes' && <Notes />}
                {win.id === 'settings' && (
                  <Settings 
                    user={currentUser} 
                    onUpdateUser={setCurrentUser} 
                    onFactoryReset={handleFactoryReset}
                    onResetToNebulaOSLink={() => {
                      setBrowserUrl('https://nebula-os-link.vercel.app');
                      openWindow('browser');
                    }}
                  />
                )}
                {win.id === 'camera' && <Camera />}
                {win.id === 'mail' && <MailApp />}
                {win.id === 'calendar' && <CalendarApp />}
                {win.id === 'magic-edit' && <PaintApp />}
              </Window>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Panels Layer */}
      <AnimatePresence>
        <StartMenu 
          isOpen={isStartMenuOpen} 
          onOpenApp={(id) => {
            openWindow(id);
            setIsStartMenuOpen(false);
          }} 
        />
        <QuickSettings 
          isOpen={isQuickSettingsOpen} 
          showWidgets={showWidgets}
          setShowWidgets={setShowWidgets}
        />
      </AnimatePresence>

      {/* Bottom Taskbar */}
      <div className="absolute bottom-0 left-0 right-0 h-14 bg-white/70 backdrop-blur-3xl border-t border-white/20 flex items-center justify-between px-6 shadow-2xl z-[2000]">
        {/* Start Button */}
        <button 
          onClick={() => {
            setIsStartMenuOpen(!isStartMenuOpen);
            setIsQuickSettingsOpen(false);
          }}
          className={cn(
            "w-10 h-10 flex items-center justify-center hover:scale-110 transition-transform active:scale-95",
            isStartMenuOpen && "scale-110"
          )}
        >
          <AtomosLogo className="w-8 h-8" />
        </button>

        {/* Dock */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-1.5 bg-black/5 rounded-full border border-black/5">
          {[
            { id: 'browser', icon: <Globe size={18} />, color: 'bg-blue-500' },
            { id: 'ai', icon: <MessageSquare size={18} />, color: 'bg-purple-500' },
            { id: 'files', icon: <Folder size={18} />, color: 'bg-indigo-500' },
            { id: 'settings', icon: <SettingsIcon size={18} />, color: 'bg-gray-500' },
            { id: 'mail', icon: <Mail size={18} />, color: 'bg-pink-500' },
            { id: 'calendar', icon: <Calendar size={18} />, color: 'bg-amber-500' },
          ].map((app) => (
            <button
              key={app.id}
              onClick={() => toggleWindow(app.id as AppId)}
              className="relative group"
            >
              <div className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center text-white transition-all duration-300 hover:-translate-y-1 active:scale-90 shadow-md",
                app.color,
                windows.find(w => w.id === app.id)?.isOpen && "ring-2 ring-blue-500/50 ring-offset-2 ring-offset-white/70"
              )}>
                {app.icon}
              </div>
              {windows.find(w => w.id === app.id)?.isOpen && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* System Tray */}
        <button 
          onClick={() => {
            setIsQuickSettingsOpen(!isQuickSettingsOpen);
            setIsStartMenuOpen(false);
          }}
          className={cn(
            "flex items-center gap-4 px-4 py-1.5 bg-black/5 rounded-full border border-black/5 hover:bg-black/10 transition-colors active:scale-95",
            isQuickSettingsOpen && "bg-black/10"
          )}
        >
          <div className="flex items-center gap-3 text-black/60">
            <Volume2 size={14} />
            <Wifi size={14} />
            <Battery size={14} className="text-green-600" />
          </div>
          <div className="h-4 w-px bg-black/10" />
          <div className="flex items-center gap-3 text-black/80 font-medium">
            <span className="text-[10px] uppercase tracking-widest">{format(time, 'MMM d')}</span>
            <span className="text-xs font-mono">{format(time, 'HH:mm')}</span>
          </div>
          <div className="w-5 h-5 rounded-full bg-black/10 flex items-center justify-center text-[10px] font-bold text-black/60">1</div>
        </button>
      </div>
    </div>
  );
}
