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
  Settings as SettingsIcon
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
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[9999] drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)]"
      animate={{ 
        x: position.x, 
        y: position.y,
        scale: isPointer ? 1.1 : 1
      }}
      transition={{ type: 'spring', damping: 30, stiffness: 400, mass: 0.4 }}
    >
      <svg 
        width="32" 
        height="32" 
        viewBox="0 0 32 32" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        style={{ transform: 'translate(-2px, -2px)' }}
      >
        <path 
          d="M6 4V27.5L12.5 21L16.5 29L20 27.5L16 19.5H25L6 4Z" 
          fill="black" 
          stroke="white" 
          strokeWidth="2.5" 
          strokeLinejoin="round"
        />
      </svg>
    </motion.div>
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
    <div className="fixed inset-0 bg-white z-[10000] font-mono text-sm p-12 flex flex-col gap-8">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 border-2 border-blue-500 rounded-lg flex items-center justify-center">
          <div className="w-8 h-8 border border-blue-500 rotate-45" />
        </div>
        <h1 className="text-2xl font-bold tracking-tighter text-blue-600">ATOMOS BIOS</h1>
      </div>
      <div className="flex-1 space-y-1 text-black/60">
        {logs.map((log, i) => (
          <div key={i} className="flex gap-4">
            <span className="text-blue-600/50">[{format(new Date(), 'HH:mm:ss')}]</span>
            <span>{log}</span>
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold text-black/30">
          <span>Booting Atomos OS</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-1 w-full bg-black/5 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-blue-600 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
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
    <div className="fixed inset-0 bg-white z-[9000] flex items-center justify-center font-sans">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-10 blur-xl"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')` }}
      />
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-[320px] flex flex-col items-center gap-8"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 p-1 shadow-2xl">
            <div className="w-full h-full rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl font-bold text-black">
              {selectedUser.name[0]}
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-black tracking-tight text-black">{selectedUser.name}</h2>
            <p className="text-xs font-bold uppercase tracking-widest text-black/30">{selectedUser.role}</p>
          </div>
        </div>

        <div className="w-full space-y-4">
          <input 
            type="password" 
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onLogin(selectedUser)}
            className="w-full bg-black/5 border border-black/10 rounded-2xl py-3 px-6 text-black text-center outline-none focus:border-blue-500/50 transition-all backdrop-blur-xl"
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
              <div className="w-full h-full bg-black/10 flex items-center justify-center text-xs font-bold text-black">
                {user.name[0]}
              </div>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

const Settings = ({ user, onUpdateUser }: { user: UserProfile, onUpdateUser: (u: UserProfile) => void }) => {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="flex h-full text-black font-sans">
      <div className="w-64 bg-black/5 border-r border-black/10 p-6 space-y-2">
        <div className="text-[10px] uppercase tracking-[0.2em] text-black/30 font-black mb-6">Settings</div>
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
              activeTab === item.id ? "bg-blue-600 text-white shadow-lg" : "text-black/50 hover:bg-black/5"
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
              <p className="text-black/30 text-sm">Manage your account and personal information.</p>
            </div>
            <div className="flex items-center gap-6 p-6 bg-black/5 rounded-3xl border border-black/10">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-2xl font-bold text-white">
                {user.name[0]}
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold">{user.name}</h3>
                <p className="text-black/30 text-xs uppercase tracking-widest font-black">{user.role}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-black text-black/30 ml-1">Display Name</label>
                <input 
                  type="text" 
                  value={user.name}
                  onChange={(e) => onUpdateUser({ ...user, name: e.target.value })}
                  className="w-full bg-black/5 border border-black/10 rounded-2xl py-3 px-4 outline-none focus:border-blue-500/50 transition-all font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-black text-black/30 ml-1">Role</label>
                <input 
                  type="text" 
                  value={user.role}
                  onChange={(e) => onUpdateUser({ ...user, role: e.target.value })}
                  className="w-full bg-black/5 border border-black/10 rounded-2xl py-3 px-4 outline-none focus:border-blue-500/50 transition-all font-bold"
                />
              </div>
            </div>
          </div>
        )}
        {activeTab === 'about' && (
          <div className="max-w-md space-y-8">
            <div>
              <h2 className="text-3xl font-black tracking-tight mb-2">About</h2>
              <p className="text-black/30 text-sm">System information and version details.</p>
            </div>
            <div className="p-8 bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-[3rem] border border-black/10 flex flex-col items-center text-center gap-6">
              <AtomosLogo className="w-24 h-24" />
              <div>
                <h3 className="text-2xl font-black tracking-tight">Atomos OS</h3>
                <p className="text-black/30 font-bold uppercase tracking-widest text-[10px] mt-1">Version 1.0.0 Stable</p>
              </div>
              <p className="text-black/60 text-sm leading-relaxed">
                A next-generation web-based operating system built by Nebulabs. Designed for performance, security, and beauty.
              </p>
              <div className="flex gap-4">
                <button className="px-6 py-2 bg-black/10 hover:bg-black/20 rounded-full text-[10px] font-black uppercase tracking-widest transition-all">Check for Updates</button>
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

const QuickSettings = ({ isOpen }: { isOpen: boolean }) => {
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
      className="absolute top-20 left-1/4 w-[900px] h-[600px] bg-white/80 backdrop-blur-3xl border border-black/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
    >
      {/* Title Bar */}
      <div className="h-12 bg-black/5 flex items-center justify-between px-4 cursor-move select-none">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 flex items-center justify-center text-black/70">{window.icon}</div>
          <span className="text-xs font-bold uppercase tracking-widest text-black/90">{window.title}</span>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={(e) => { e.stopPropagation(); onMinimize(); }}
            className="p-2 hover:bg-black/10 rounded-full transition-colors"
          >
            <Minimize2 size={16} className="text-black/70" />
          </button>
          <button 
            className="p-2 hover:bg-black/10 rounded-full transition-colors"
          >
            <Maximize2 size={16} className="text-black/70" />
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
      <div className="flex-1 overflow-auto bg-white/20">
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
    <div className="flex flex-col h-full text-black">
      <div className="h-14 bg-black/5 border-b border-black/10 flex items-center px-6 gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white">
          <Bot size={18} />
        </div>
        <div>
          <h3 className="text-sm font-black tracking-tight">Nebula AI</h3>
          <p className="text-[10px] text-black/30 uppercase tracking-widest font-bold">Powered by Gemini</p>
        </div>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-50 space-y-4">
            <Bot size={48} className="text-black" />
            <p className="text-lg font-medium text-black">How can I help you today?</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={cn("flex gap-3", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}>
            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white", msg.role === 'user' ? "bg-blue-600" : "bg-purple-600")}>
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className={cn("max-w-[80%] p-3 rounded-2xl text-sm", msg.role === 'user' ? "bg-blue-600/10 text-black rounded-tr-none" : "bg-black/5 text-black rounded-tl-none")}>
              <div className="prose prose-sm max-w-none prose-headings:text-black prose-p:text-black prose-strong:text-black">
                <ReactMarkdown>
                  {msg.content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3 animate-pulse">
            <div className="w-8 h-8 rounded-full bg-purple-600/50 flex items-center justify-center text-white">
              <Bot size={16} />
            </div>
            <div className="bg-black/5 p-3 rounded-2xl rounded-tl-none text-sm text-black">
              Thinking...
            </div>
          </div>
        )}
      </div>
      <div className="p-4 bg-black/5 border-t border-black/10 flex gap-2">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask me anything..."
          className="flex-1 bg-black/5 border border-black/10 rounded-lg px-4 py-2 text-sm text-black focus:outline-none focus:border-blue-500/50 transition-colors"
        />
        <button 
          onClick={handleSend}
          disabled={isLoading}
          className="p-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors disabled:opacity-50 text-white"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

const Browser = () => {
  const [url, setUrl] = useState('https://nebulabs.os');
  return (
    <div className="flex flex-col h-full bg-white text-black font-sans">
      <div className="h-14 bg-gray-50 border-b flex items-center px-6 gap-6">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-400 shadow-sm" />
          <div className="w-3 h-3 rounded-full bg-yellow-400 shadow-sm" />
          <div className="w-3 h-3 rounded-full bg-green-400 shadow-sm" />
        </div>
        <div className="flex-1 max-w-2xl mx-auto bg-white border border-gray-200 rounded-full px-4 py-1.5 text-sm flex items-center gap-3 shadow-sm focus-within:border-blue-500/50 transition-all">
          <Globe size={14} className="text-gray-400" />
          <input 
            type="text" 
            value={url} 
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 bg-transparent outline-none text-gray-600"
          />
        </div>
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
          <User size={16} />
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-50 p-12 text-center">
        <div className="w-28 h-28 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-2xl transform hover:rotate-6 transition-transform">
          <Globe size={56} className="text-white" />
        </div>
        <h1 className="text-4xl font-extrabold mb-3 tracking-tight text-gray-900">Nebulabs OS</h1>
        <p className="text-gray-500 max-w-lg text-lg leading-relaxed">The next generation of web-based computing. Fast, secure, and beautiful by design.</p>
        <div className="mt-12 grid grid-cols-2 gap-6 w-full max-w-xl">
          {[
            { name: 'Documentation', icon: <FileText size={18} /> },
            { name: 'Community', icon: <MessageSquare size={18} /> },
            { name: 'GitHub', icon: <TerminalIcon size={18} /> },
            { name: 'Support', icon: <Mail size={18} /> }
          ].map(item => (
            <div key={item.name} className="group p-6 bg-white border border-gray-100 rounded-2xl hover:shadow-xl hover:border-blue-500/20 transition-all cursor-pointer flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                {item.icon}
              </div>
              <span className="font-semibold text-gray-700">{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Files = () => {
  const folders = [
    { name: 'Documents', color: 'text-blue-600', bg: 'bg-blue-600/10' },
    { name: 'Downloads', color: 'text-green-600', bg: 'bg-green-600/10' },
    { name: 'Pictures', color: 'text-purple-600', bg: 'bg-purple-600/10' },
    { name: 'Music', color: 'text-pink-600', bg: 'bg-pink-600/10' },
    { name: 'Videos', color: 'text-red-600', bg: 'bg-red-600/10' },
    { name: 'System', color: 'text-gray-600', bg: 'bg-gray-600/10' }
  ];
  return (
    <div className="flex h-full text-black font-sans">
      <div className="w-56 bg-black/5 border-r border-black/10 p-6 space-y-6">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-black/30 font-black mb-4">Favorites</div>
          <div className="space-y-1">
            {folders.map(f => (
              <div key={f.name} className="flex items-center gap-3 p-2.5 hover:bg-black/10 rounded-xl cursor-pointer transition-all text-sm group">
                <Folder size={16} className={cn("transition-transform group-hover:scale-110", f.color)} />
                <span className="text-black/70 group-hover:text-black">{f.name}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-black/30 font-black mb-4">Storage</div>
          <div className="p-3 bg-black/5 rounded-2xl border border-black/10">
            <div className="flex justify-between text-[10px] mb-2 font-bold">
              <span className="text-black/40 uppercase">Atomos HD</span>
              <span className="text-blue-600">64%</span>
            </div>
            <div className="h-1.5 w-full bg-black/10 rounded-full overflow-hidden">
              <div className="h-full w-[64%] bg-blue-600 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 p-8 overflow-y-auto scrollbar-hide">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-black tracking-tight">Home</h2>
            <p className="text-black/30 text-xs font-bold uppercase tracking-widest mt-1">/users/atomos/home</p>
          </div>
          <div className="flex gap-3">
            <div className="p-3 bg-black/5 rounded-xl border border-black/10 hover:bg-black/10 transition-colors cursor-pointer"><Search size={18} /></div>
          </div>
        </div>
        <div className="grid grid-cols-3 xl:grid-cols-4 gap-8">
          {folders.map(f => (
            <div key={f.name} className="group flex flex-col items-center gap-4 p-6 hover:bg-white/5 rounded-3xl cursor-pointer transition-all border border-transparent hover:border-black/10">
              <div className={cn("w-20 h-20 rounded-[2rem] flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl", f.bg)}>
                <Folder size={40} className={f.color} />
              </div>
              <span className="text-sm font-bold tracking-wide text-black/80 group-hover:text-black">{f.name}</span>
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
             Theme: Nebularite Light
        `;
        break;
      default:
        response = `Command not found: ${cmd}`;
    }

    setHistory(prev => [...prev, `> ${input}`, response]);
    setInput('');
  };

  return (
    <div className="h-full bg-white/90 p-4 font-mono text-sm text-black overflow-y-auto">
      {history.map((line, i) => (
        <div key={i} className="whitespace-pre-wrap mb-1">{line}</div>
      ))}
      <form onSubmit={handleCommand} className="flex">
        <span className="mr-2 text-blue-600 font-bold">user@atomos:~$</span>
        <input 
          autoFocus
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-transparent outline-none border-none p-0 text-black"
        />
      </form>
    </div>
  );
};

const Notes = () => {
  const [text, setText] = useState('# Welcome to Atomos Notes\n\nThis is your personal workspace for ideas, drafts, and quick thoughts.\n\n- [ ] Task 1\n- [ ] Task 2\n- [ ] Task 3\n\nFeel free to edit this note!');
  return (
    <div className="h-full flex flex-col bg-white">
      <div className="h-10 bg-black/5 border-b border-black/10 flex items-center px-4 gap-4">
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-black/20" />
          <div className="w-2 h-2 rounded-full bg-black/20" />
          <div className="w-2 h-2 rounded-full bg-black/20" />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-black/40">Untitled Note</span>
      </div>
      <textarea 
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="flex-1 bg-transparent p-8 outline-none resize-none font-mono text-sm text-black leading-relaxed"
        placeholder="Start typing..."
      />
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

  if (isBooting) return <BIOS onComplete={() => setIsBooting(false)} />;
  if (!isLoggedIn) return <Login users={users} onLogin={(user) => { setCurrentUser(user); setIsLoggedIn(true); }} />;

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#050505] font-sans selection:bg-blue-500/30 cursor-none">
      <CustomCursor />
      {/* Wallpaper */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
        style={{ 
          backgroundImage: `url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')`,
          filter: 'brightness(0.9) contrast(1.1)'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-transparent to-blue-600/20" />
      </div>

      {/* Sidebar */}
      <div className="absolute left-8 top-12 flex flex-col gap-8">
        {[
          { id: 'files', icon: <Folder size={24} />, label: 'Files', color: 'bg-blue-600' },
          { id: 'browser', icon: <Globe size={24} />, label: 'Browser', color: 'bg-indigo-600' },
          { id: 'ai', icon: <MessageSquare size={24} />, label: 'AI Assistant', color: 'bg-purple-600' },
          { id: 'magic-edit', icon: <ImageIcon size={24} />, label: 'Paint', color: 'bg-blue-500' },
          { id: 'notes', icon: <FileText size={24} />, label: 'Notes', color: 'bg-amber-600' },
          { id: 'settings', icon: <SettingsIcon size={24} />, label: 'Settings', color: 'bg-gray-600' },
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
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-black drop-shadow-sm">
              {app.label}
            </span>
          </button>
        ))}
      </div>

      {/* Windows Layer */}
      <div className="absolute inset-0 pointer-events-none">
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
                {win.id === 'browser' && <Browser />}
                {win.id === 'files' && <Files />}
                {win.id === 'terminal' && <Terminal />}
                {win.id === 'notes' && <Notes />}
                {win.id === 'settings' && <Settings user={currentUser} onUpdateUser={setCurrentUser} />}
                {['camera', 'mail', 'calendar', 'magic-edit'].includes(win.id) && (
                  <div className="p-8 text-black/50 italic h-full flex items-center justify-center">
                    Module coming soon...
                  </div>
                )}
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
        <QuickSettings isOpen={isQuickSettingsOpen} />
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
