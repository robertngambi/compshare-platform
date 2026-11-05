import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  LogIn,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Layers,
  MessageSquare,
  Info as InfoIcon,
  Home as HomeIcon,
} from 'lucide-react';
import {
  ElectronicComponent,
  CADSoftware,
  UserProfile,
  ChatMessage,
  ThemeBottomColor,
  PlatformStats,
} from './types';
import {
  INITIAL_USER,
  INITIAL_STATS,
  INITIAL_COMPONENTS,
  INITIAL_CHAT_MESSAGES,
} from './utils/defaultData';
import {
  detectCADFormat,
  formatFileSize,
  convertComponentPackage,
  downloadBlob,
  generatePinsForPackage,
  generatePadsForPackage,
} from './utils/converterEngine';
import { Sidebar, NavTab } from './components/Sidebar';
import { TopConvertBar } from './components/TopConvertBar';
import { ComponentDetailsPane } from './components/ComponentDetailsPane';
import { NewConvertView } from './components/NewConvertView';
import { LibraryView } from './components/LibraryView';
import { ProfileView } from './components/ProfileView';
import { ChatView } from './components/ChatView';
import { SettingsView } from './components/SettingsView';
import { AboutView } from './components/AboutView';
import { ViewComponentModal } from './components/ViewComponentModal';
import { ManageComponentModal } from './components/ManageComponentModal';
import { AuthModal } from './components/AuthModal';
import { RecentsView } from './components/RecentsView';
import { LandingPageView } from './components/LandingPageView';
import { WebsiteFooter } from './components/WebsiteFooter';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export type SiteSection = 'landing' | 'platform' | 'about' | 'chat';

export default function App() {
  // 1. Persistent State Initialization
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('compshare_user');
      return saved ? JSON.parse(saved) : INITIAL_USER;
    } catch {
      return INITIAL_USER;
    }
  });

  const [components, setComponents] = useState<ElectronicComponent[]>(() => {
    try {
      const saved = localStorage.getItem('compshare_components');
      return saved ? JSON.parse(saved) : INITIAL_COMPONENTS;
    } catch {
      return INITIAL_COMPONENTS;
    }
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('compshare_chat');
      return saved ? JSON.parse(saved) : INITIAL_CHAT_MESSAGES;
    } catch {
      return INITIAL_CHAT_MESSAGES;
    }
  });

  const [stats, setStats] = useState<PlatformStats>(() => {
    try {
      const saved = localStorage.getItem('compshare_stats');
      return saved ? JSON.parse(saved) : INITIAL_STATS;
    } catch {
      return INITIAL_STATS;
    }
  });

  // Website Navigation Section: 'landing' (Home), 'platform' (Converter Platform), 'about', 'chat'
  const [currentSection, setCurrentSection] = useState<SiteSection>('landing');

  // Platform Internal UI State
  const [currentTab, setCurrentTab] = useState<NavTab>('new');
  const [currentTheme, setCurrentTheme] = useState<ThemeBottomColor>('blue');
  const [checkComponents, setCheckComponents] = useState(true);
  const [selectedTargetFormat, setSelectedTargetFormat] = useState<CADSoftware>('KiCad');
  const [activeTypeFilter, setActiveTypeFilter] = useState<'all' | 'Imported' | 'Converted'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isOnline, setIsOnline] = useState(true);

  // Mobile / Desktop Sidebars Visibility State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDetailsPaneOpen, setIsDetailsPaneOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      setIsSidebarOpen(true);
      // Keep details pane closed initially so the '>' button is clearly displayed to access it
      setIsDetailsPaneOpen(false);
    }
  }, []);

  // Periodic realistic simulation pulse for online engineers & active community subscribers
  useEffect(() => {
    const pulseInterval = setInterval(() => {
      setStats(prev => {
        const deltaOnline = Math.floor(Math.random() * 5) - 2; // -2 to +2
        const shouldAddSubscriber = Math.random() < 0.3; // 30% chance of new subscriber
        return {
          ...prev,
          online: Math.max(95, Math.min(180, prev.online + deltaOnline)),
          subscribers: prev.subscribers + (shouldAddSubscriber ? 1 : 0),
        };
      });
    }, 25000);

    return () => clearInterval(pulseInterval);
  }, []);

  // Selected Component for Right Pane
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(
    INITIAL_COMPONENTS[0]?.id || null
  );


  // Modals State
  const [viewingComponent, setViewingComponent] = useState<ElectronicComponent | null>(null);
  const [managingComponent, setManagingComponent] = useState<ElectronicComponent | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authGateReason, setAuthGateReason] = useState<'first_time' | 'session_expired' | 'manual'>('manual');
  const [pendingPlatformNav, setPendingPlatformNav] = useState(false);

  // User Authenticated Status with 7-Day Session Validity
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const auth = localStorage.getItem('compshare_authenticated');
      const lastLoginStr = localStorage.getItem('compshare_last_login');
      if (auth !== 'true' || !lastLoginStr) return false;
      const lastLogin = parseInt(lastLoginStr, 10);
      return Date.now() - lastLogin <= SEVEN_DAYS_MS;
    } catch {
      return false;
    }
  });

  // Conversion Queuing & Progress
  const [queuedFiles, setQueuedFiles] = useState<
    {
      id: string;
      file: File;
      name: string;
      size: string;
      sizeBytes: number;
      detectedFormat: CADSoftware;
    }[]
  >([]);
  const [isConverting, setIsConverting] = useState(false);
  const [progressPercentage, setProgressPercentage] = useState(0);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('compshare_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('compshare_components', JSON.stringify(components));
  }, [components]);

  useEffect(() => {
    localStorage.setItem('compshare_chat', JSON.stringify(chatMessages));
  }, [chatMessages]);

  useEffect(() => {
    localStorage.setItem('compshare_stats', JSON.stringify(stats));
  }, [stats]);

  // 7-day Session Expiration Check
  useEffect(() => {
    const lastLoginStr = localStorage.getItem('compshare_last_login');
    const lastLogin = lastLoginStr ? parseInt(lastLoginStr, 10) : currentUser.lastLoginTimestamp;
    const elapsed = Date.now() - lastLogin;
    if (elapsed > SEVEN_DAYS_MS) {
      setIsAuthenticated(false);
      localStorage.removeItem('compshare_authenticated');
    }
  }, [currentUser.lastLoginTimestamp]);

  // Guard access to the Converter Platform: First-time users or expired sessions must authenticate first
  const attemptNavigateToPlatform = () => {
    const hasAuth = localStorage.getItem('compshare_authenticated') === 'true';
    const lastLoginStr = localStorage.getItem('compshare_last_login');
    const lastLogin = lastLoginStr ? parseInt(lastLoginStr, 10) : currentUser.lastLoginTimestamp;
    const elapsed = Date.now() - lastLogin;

    if (!hasAuth) {
      // First-time user needs to sign up (subscribe)
      setAuthGateReason('first_time');
      setPendingPlatformNav(true);
      setIsAuthOpen(true);
      return;
    }

    if (elapsed > SEVEN_DAYS_MS) {
      // More than 7 days from last visit: prompt sign in (log in)
      setIsAuthenticated(false);
      setAuthGateReason('session_expired');
      setPendingPlatformNav(true);
      setIsAuthOpen(true);
      return;
    }

    // Authenticated within 7 days
    setIsAuthenticated(true);
    setCurrentSection('platform');
  };

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('compshare_authenticated', 'true');
    localStorage.setItem('compshare_last_login', Date.now().toString());
    setIsAuthOpen(false);
    if (pendingPlatformNav) {
      setCurrentSection('platform');
      setPendingPlatformNav(false);
    }
  };

  const handleOpenAccountModal = () => {
    setAuthGateReason('manual');
    setIsAuthOpen(true);
  };


  // Selected Component helper
  const selectedComponent = useMemo(() => {
    return components.find(c => c.id === selectedComponentId) || components[0] || null;
  }, [components, selectedComponentId]);

  // Filtered Components based on Search Query
  const searchFilteredComponents = useMemo(() => {
    if (!searchQuery.trim()) return components;
    const q = searchQuery.toLowerCase();
    return components.filter(
      c =>
        c.name.toLowerCase().includes(q) ||
        c.folderName.toLowerCase().includes(q) ||
        c.sourceSoftware.toLowerCase().includes(q) ||
        c.destinationSoftware.toLowerCase().includes(q) ||
        c.packageType.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
    );
  }, [components, searchQuery]);

  // Filter Recent Files: 7-day retention for all imported and converted components
  const recentComponents = useMemo(() => {
    const now = Date.now();
    return searchFilteredComponents
      .filter(c => now - c.conversionTimestamp <= SEVEN_DAYS_MS)
      .sort((a, b) => b.conversionTimestamp - a.conversionTimestamp);
  }, [searchFilteredComponents]);

  // User's own library items
  const myComponents = useMemo(() => {
    return searchFilteredComponents.filter(c => c.ownerId === currentUser.id);
  }, [searchFilteredComponents, currentUser.id]);

  // My Library Stats
  const myLibraryStats = useMemo(() => {
    const myTotal = components.filter(c => c.ownerId === currentUser.id);
    const imported = myTotal.filter(c => c.type === 'Imported').length;
    const converted = myTotal.filter(c => c.type === 'Converted').length;
    return {
      imported,
      converted,
      total: myTotal.length,
    };
  }, [components, currentUser.id]);

  // Handle Adding Upload Files to Queue (max 5)
  const handleAddFiles = (filesList: FileList | File[]) => {
    const filesArray = Array.from(filesList);
    const availableSlots = 5 - queuedFiles.length;
    if (availableSlots <= 0) {
      alert('You can upload a maximum of 5 files simultaneously.');
      return;
    }

    const filesToAdd = filesArray.slice(0, availableSlots).map(file => {
      const detected = detectCADFormat(file.name);
      return {
        id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        file,
        name: file.name,
        size: formatFileSize(file.size),
        sizeBytes: file.size,
        detectedFormat: detected,
      };
    });

    setQueuedFiles(prev => [...prev, ...filesToAdd]);
  };

  const handleRemoveQueuedFile = (id: string) => {
    setQueuedFiles(prev => prev.filter(q => q.id !== id));
  };

  // Trigger Conversion Engine with live percentage progress bar
  const handleTriggerConvert = async () => {
    if (queuedFiles.length === 0) {
      alert('Please insert or drag and drop component files to convert first.');
      return;
    }

    setIsConverting(true);
    setProgressPercentage(0);

    let currentPct = 0;
    const interval = setInterval(() => {
      currentPct += Math.floor(Math.random() * 20) + 15;
      if (currentPct >= 100) {
        currentPct = 100;
        clearInterval(interval);
      }
      setProgressPercentage(currentPct);
    }, 150);

    setTimeout(() => {
      clearInterval(interval);
      setProgressPercentage(100);

      const now = Date.now();
      const dateStr = new Date(now).toISOString().split('T')[0];

      const newConvertedList: ElectronicComponent[] = queuedFiles.map((q, idx) => {
        const cleanName = q.name.replace(/\.[^/.]+$/, '');
        const pkg = cleanName.toUpperCase().includes('555')
          ? 'DIP-8'
          : cleanName.toUpperCase().includes('SOT')
          ? 'SOT-23-6'
          : 'SOIC-8';
        return {
          id: `comp_conv_${Date.now()}_${idx}`,
          name: cleanName,
          folderName: `${cleanName}_Converted`,
          fileName: `${cleanName}.${selectedTargetFormat.toLowerCase().slice(0, 3)}`,
          origin: `${q.name} file`,
          sourceSoftware: q.detectedFormat,
          destinationSoftware: selectedTargetFormat,
          size: q.size,
          sizeBytes: q.sizeBytes,
          type: 'Converted',
          conversionDate: dateStr,
          conversionTimestamp: now,
          ownerId: currentUser.id,
          ownerName: currentUser.fullName,
          description: `Automatically parsed and translated from ${q.detectedFormat} to ${selectedTargetFormat} with neutral schema intermediate.`,
          packageType: pkg,
          pins: generatePinsForPackage(pkg, cleanName),
          pads: generatePadsForPackage(pkg),
          ercVerified: checkComponents,
        };
      });

      const newImportedList: ElectronicComponent[] = queuedFiles.map((q, idx) => {
        const cleanName = q.name.replace(/\.[^/.]+$/, '');
        const pkg = cleanName.toUpperCase().includes('555')
          ? 'DIP-8'
          : cleanName.toUpperCase().includes('SOT')
          ? 'SOT-23-6'
          : 'SOIC-8';
        return {
          id: `comp_imp_${Date.now()}_${idx}`,
          name: cleanName,
          folderName: `${cleanName}_Imported`,
          fileName: q.name,
          origin: `${q.name} original file`,
          sourceSoftware: q.detectedFormat,
          destinationSoftware: q.detectedFormat,
          size: q.size,
          sizeBytes: q.sizeBytes,
          type: 'Imported',
          conversionDate: dateStr,
          conversionTimestamp: now,
          ownerId: currentUser.id,
          ownerName: currentUser.fullName,
          description: `Raw uploaded component package before target compilation.`,
          packageType: pkg,
          pins: generatePinsForPackage(pkg, cleanName),
          pads: generatePadsForPackage(pkg),
          ercVerified: checkComponents,
        };
      });

      setComponents(prev => [...newConvertedList, ...newImportedList, ...prev]);
      setStats(prev => ({
        ...prev,
        totalConverted: prev.totalConverted + newConvertedList.length,
        totalImported: prev.totalImported + newImportedList.length,
        subscribers: prev.subscribers + Math.max(1, newConvertedList.length),
        online: Math.max(100, prev.online + 1),
      }));

      if (newConvertedList[0]) {
        setSelectedComponentId(newConvertedList[0].id);
      }

      setQueuedFiles([]);
      setIsConverting(false);

      setTimeout(() => setProgressPercentage(0), 1200);
    }, 1200);
  };


  // Add imported/uploaded files directly to library without converting
  const handleAddToLibraryDirectly = () => {
    if (queuedFiles.length === 0) {
      alert('Please insert or drag and drop component files to add first.');
      return;
    }

    const now = Date.now();
    const dateStr = new Date(now).toISOString().split('T')[0];

    const newImportedList: ElectronicComponent[] = queuedFiles.map((q, idx) => {
      const cleanName = q.name.replace(/\.[^/.]+$/, '');
      const pkg = cleanName.toUpperCase().includes('555')
        ? 'DIP-8'
        : cleanName.toUpperCase().includes('SOT')
        ? 'SOT-23-6'
        : 'SOIC-8';
      return {
        id: `comp_imp_${Date.now()}_${idx}`,
        name: cleanName,
        folderName: `${cleanName}_Imported`,
        fileName: q.name,
        origin: `${q.name} original file`,
        sourceSoftware: q.detectedFormat,
        destinationSoftware: q.detectedFormat,
        size: q.size,
        sizeBytes: q.sizeBytes,
        type: 'Imported',
        conversionDate: dateStr,
        conversionTimestamp: now,
        ownerId: currentUser.id,
        ownerName: currentUser.fullName,
        description: `Raw uploaded component package added directly to library without conversion.`,
        packageType: pkg,
        pins: generatePinsForPackage(pkg, cleanName),
        pads: generatePadsForPackage(pkg),
        ercVerified: checkComponents,
      };
    });

    setComponents(prev => [...newImportedList, ...prev]);
    setStats(prev => ({
      ...prev,
      totalImported: prev.totalImported + newImportedList.length,
      subscribers: prev.subscribers + 1,
      online: Math.max(100, prev.online + 1),
    }));

    if (newImportedList[0]) {
      setSelectedComponentId(newImportedList[0].id);
    }


    setQueuedFiles([]);
    alert(`Successfully added ${newImportedList.length} component(s) directly to your library.`);
  };

  const handleSaveManagedComponent = (updated: ElectronicComponent) => {
    setComponents(prev => prev.map(c => (c.id === updated.id ? updated : c)));
  };

  // Chat message handlers
  const handleSendMessage = (text: string, replyTo?: { authorName: string; text: string }) => {
    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.fullName,
      authorAvatar: currentUser.avatarUrl,
      dateLabel: 'Today',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      content: text,
      replyTo: replyTo,
      reactions: {
        heart: 0,
        replies: 0,
      },
      isCurrentUser: true,
    };
    setChatMessages(prev => [...prev, newMsg]);
  };

  const handleReactChatMessage = (messageId: string, reactionType: 'heart' | 'replies') => {
    setChatMessages(prev =>
      prev.map(m => {
        if (m.id === messageId) {
          return {
            ...m,
            reactions: {
              ...m.reactions,
              [reactionType]: m.reactions[reactionType] + 1,
            },
          };
        }
        return m;
      })
    );
  };

  // Richer, increased percentage bottom gradients
  const themeGradients: Record<ThemeBottomColor, string> = {
    blue: 'from-white from-0% via-[#b9dbfb] via-30% to-[#1e66b8] to-90%',
    black: 'from-white from-0% via-[#cbd5e1] via-30% to-[#1e293b] to-90%',
    orange: 'from-white from-0% via-[#fed7aa] via-30% to-[#c2410c] to-90%',
    green: 'from-white from-0% via-[#bbf7d0] via-30% to-[#15803d] to-90%',
    brown: 'from-white from-0% via-[#fde68a] via-30% to-[#78350f] to-90%',
  };

  return (
    <div
      className={`min-h-screen w-full bg-gradient-to-b ${themeGradients[currentTheme]} p-1.5 sm:p-3 md:p-6 flex flex-col items-center justify-center font-sans antialiased text-gray-900 transition-colors duration-500`}
    >
      {/* Outer Application Window Frame */}
      <div className="w-full max-w-[1240px] bg-white/80 backdrop-blur-md rounded-2xl border-2 border-gray-400 shadow-2xl overflow-hidden flex flex-col min-h-[660px] max-h-[96vh] sm:max-h-[93vh]">
        {/* Full-Time Website Top Header Bar */}
        <header className="px-2.5 sm:px-4 py-2 border-b border-gray-400 flex items-center justify-between gap-2 bg-white/95 select-none shrink-0">
          {/* Left: Optional Sidebar Toggle (when on platform) + Logo & Version */}
          <div className="flex items-center gap-2 sm:gap-3">
            {currentSection === 'platform' && (
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={`p-1.5 sm:p-2 rounded-lg border transition flex items-center justify-center cursor-pointer shadow-2xs ${
                  isSidebarOpen
                    ? 'bg-blue-100 border-blue-400 text-blue-800'
                    : 'bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-800'
                }`}
                title={isSidebarOpen ? 'Hide sidebar (pointing down)' : 'Show sidebar (less-than)'}
              >
                {isSidebarOpen ? (
                  <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-blue-700 stroke-[2.5]" />
                ) : (
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-800 stroke-[2.5]" />
                )}
              </button>
            )}

            {/* CompShare Logo & Home link */}
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setCurrentSection('landing')}
              title="CompShare Home Landing Page"
            >
              <img
                src="/assets/aistudio/UI._07_efa59c02.PNG"
                alt="CompShare Logo"
                className="h-8 sm:h-10 object-contain"
              />
              <span className="text-xs sm:text-sm font-semibold italic text-gray-700 tracking-wide hidden sm:inline">
                Version 1.0
              </span>
            </div>
          </div>

          {/* Center Website Display Nav Menus: Home, Converter Platform, About, Chat */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setCurrentSection('landing')}
              className={`px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                currentSection === 'landing'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <HomeIcon className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>

            <button
              onClick={attemptNavigateToPlatform}
              className={`px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                currentSection === 'platform'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Converter</span> Platform
            </button>

            <button
              onClick={() => setCurrentSection('about')}
              className={`px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                currentSection === 'about'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <InfoIcon className="w-3.5 h-3.5" />
              <span>About</span>
            </button>

            {/* Chat moved to website display nav menu as requested */}
            <button
              onClick={() => setCurrentSection('chat')}
              className={`px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                currentSection === 'chat'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Chat</span>
            </button>
          </nav>

          {/* Right Controls: Account & Optional Details Pane Toggle (when on platform) */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={handleOpenAccountModal}
              className={`px-2.5 sm:px-3 py-1 text-[11px] font-bold border rounded-full transition flex items-center gap-1.5 shadow-2xs cursor-pointer ${
                isAuthenticated
                  ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                  : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
              }`}
              title={isAuthenticated ? `Verified Account: ${currentUser.fullName}` : 'Subscribe / Sign In (2-Way Auth)'}
            >
              <LogIn className="w-3.5 h-3.5 text-blue-600" />
              <span>{isAuthenticated ? currentUser.fullName.split(' ')[0] : 'Sign In'}</span>
            </button>

            {currentSection === 'platform' && (
              <button
                onClick={() => setIsDetailsPaneOpen(!isDetailsPaneOpen)}
                className={`p-1.5 sm:p-2 rounded-lg border-2 transition flex items-center justify-center cursor-pointer shadow-xs ${
                  isDetailsPaneOpen
                    ? 'bg-blue-100 border-blue-500 text-blue-900'
                    : 'bg-white hover:bg-gray-100 border-gray-400 text-gray-900'
                }`}
                title={isDetailsPaneOpen ? 'Hide component details pane (pointing downwards)' : 'Access component details pane (>)'}
                aria-label="Toggle Component Details Pane"
              >
                {isDetailsPaneOpen ? (
                  <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-blue-700 stroke-[3]" />
                ) : (
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-900 stroke-[3]" />
                )}
              </button>
            )}

          </div>
        </header>

        {/* Website Page Body Router */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* 1. Website Landing Page ('Home') with Welcoming Context & 'Continue to start converting' button */}
          {currentSection === 'landing' && (
            <LandingPageView
              onStartConverting={attemptNavigateToPlatform}
              onExploreAbout={() => setCurrentSection('about')}
              onOpenChat={() => setCurrentSection('chat')}
              stats={stats}
            />
          )}

          {/* 2. Full details of the platform and services ('About') */}
          {currentSection === 'about' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <div className="max-w-4xl mx-auto space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">About CompShare Platform &amp; Services</h2>
                  <button
                    onClick={attemptNavigateToPlatform}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    Open Converter Platform →
                  </button>
                </div>
                <AboutView />
              </div>
            </div>
          )}

          {/* 3. Community Discussion Room ('Chat') moved to website display nav menu */}
          {currentSection === 'chat' && (
            <div className="flex-1 overflow-hidden p-2 sm:p-4 flex flex-col max-w-4xl mx-auto w-full">
              <div className="flex items-center justify-between pb-2 border-b border-gray-300 mb-2">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">CompShare Engineer Community Chat</h3>
                  <p className="text-xs text-gray-500">Ask questions, request specific component conversions, or discuss footprints.</p>
                </div>
                <button
                  onClick={attemptNavigateToPlatform}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-full text-xs font-semibold text-gray-700 transition cursor-pointer"
                >
                  Back to Platform
                </button>
              </div>
              <ChatView
                messages={chatMessages}
                currentUser={currentUser}
                onSendMessage={handleSendMessage}
                onReact={handleReactChatMessage}
              />
            </div>
          )}


          {/* 4. Ready-Made Converting Platform */}
          {currentSection === 'platform' && (
            <div className="flex-1 flex overflow-hidden relative">
              {/* Left Selection Pane - Desktop docked or Mobile overlay */}
              {isSidebarOpen && (
                <>
                  <div
                    className="lg:hidden fixed inset-0 z-30 bg-black/40 backdrop-blur-2xs transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                  />
                  <div className="z-40 fixed lg:static inset-y-0 left-0 h-full shadow-xl lg:shadow-none animate-fadeIn flex">
                    <Sidebar
                      currentTab={currentTab}
                      onSelectTab={tab => {
                        setCurrentTab(tab);
                        if (window.innerWidth < 1024) setIsSidebarOpen(false);
                      }}
                      currentUser={currentUser}
                      checkComponents={checkComponents}
                      onToggleCheckComponents={() => setCheckComponents(!checkComponents)}
                      currentTheme={currentTheme}
                      onChangeTheme={setCurrentTheme}
                      onCloseMobile={() => setIsSidebarOpen(false)}
                    />
                  </div>
                </>
              )}

              {/* Main Middle Screen */}
              <main className="flex-1 flex flex-col overflow-hidden bg-transparent w-full min-w-0">
                {/* Search Bar on Top */}
                <div className="px-3 sm:px-4 py-2 border-b border-gray-300 bg-white/60">
                  <div className="relative w-full max-w-2xl mx-auto flex items-center">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search components, packages, or formats ..."
                      className="w-full pl-4 pr-16 py-1.5 bg-white border border-gray-400 rounded-full text-xs sm:text-sm text-gray-800 shadow-xs focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-gray-500"
                    />

                    <div className="absolute right-3 flex items-center gap-1.5">
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="p-0.5 text-gray-400 hover:text-gray-700 rounded-full cursor-pointer"
                          title="Clear search"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <Search className="w-4 h-4 text-gray-600 pointer-events-none" />
                    </div>
                  </div>

                  {searchQuery.trim() && (
                    <div className="text-center mt-1 text-[11px] text-blue-800 font-semibold">
                      Found {searchFilteredComponents.length} component(s) matching "{searchQuery}"
                    </div>
                  )}
                </div>

                {/* Top Convert Bar */}
                {(currentTab === 'new' || currentTab === 'myLibrary' || currentTab === 'allLibraries' || currentTab === 'recents') && (
                  <TopConvertBar
                    activeTypeFilter={activeTypeFilter}
                    onChangeTypeFilter={setActiveTypeFilter}
                    selectedTargetFormat={selectedTargetFormat}
                    onChangeTargetFormat={setSelectedTargetFormat}
                    progressPercentage={progressPercentage}
                    isConverting={isConverting}
                    onTriggerConvert={handleTriggerConvert}
                    onAddToLibrary={handleAddToLibraryDirectly}
                    hasQueuedFiles={queuedFiles.length > 0}
                  />
                )}

                {/* Dynamic View Router for Center Workspace */}
                <div className="flex-1 flex flex-col overflow-hidden">
                  {currentTab === 'new' && (
                    <NewConvertView
                      queuedFiles={queuedFiles}
                      onAddFiles={handleAddFiles}
                      onRemoveQueuedFile={handleRemoveQueuedFile}
                      recentComponents={recentComponents}
                      selectedComponentId={selectedComponentId}
                      onSelectComponent={comp => setSelectedComponentId(comp.id)}
                      onOpenViewModal={comp => setViewingComponent(comp)}
                      isConverting={isConverting}
                      progressPercentage={progressPercentage}
                    />
                  )}

                  {currentTab === 'recents' && (
                    <RecentsView
                      recentComponents={recentComponents}
                      selectedComponentId={selectedComponentId}
                      onSelectComponent={comp => setSelectedComponentId(comp.id)}
                      onOpenViewModal={comp => setViewingComponent(comp)}
                      onGoToNew={() => setCurrentTab('new')}
                    />
                  )}

                  {currentTab === 'myLibrary' && (
                    <LibraryView
                      title="My Library"
                      isMyLibrary={true}
                      components={myComponents}
                      selectedComponentId={selectedComponentId}
                      onSelectComponent={comp => setSelectedComponentId(comp.id)}
                      onOpenViewModal={comp => setViewingComponent(comp)}
                      onOpenManageModal={comp => setManagingComponent(comp)}
                      filterType={activeTypeFilter}
                      searchQuery={searchQuery}
                    />
                  )}

                  {currentTab === 'allLibraries' && (
                    <LibraryView
                      title="All Libraries"
                      isMyLibrary={false}
                      components={searchFilteredComponents}
                      selectedComponentId={selectedComponentId}
                      onSelectComponent={comp => setSelectedComponentId(comp.id)}
                      onOpenViewModal={comp => setViewingComponent(comp)}
                      onOpenManageModal={comp => setManagingComponent(comp)}
                      filterType={activeTypeFilter}
                      searchQuery={searchQuery}
                    />
                  )}

                  {currentTab === 'profile' && (
                    <ProfileView user={currentUser} onUpdateUser={setCurrentUser} />
                  )}

                  {currentTab === 'settings' && (
                    <SettingsView
                      defaultCad={selectedTargetFormat}
                      onChangeDefaultCad={setSelectedTargetFormat}
                      checkComponents={checkComponents}
                      onToggleCheckComponents={() => setCheckComponents(!checkComponents)}
                      isOnline={isOnline}
                      onToggleOnline={() => setIsOnline(!isOnline)}
                      onExportBackup={() => {
                        const json = JSON.stringify(components, null, 2);
                        const blob = new Blob([json], { type: 'application/json' });
                        downloadBlob(blob, 'compshare_library_backup.json');
                      }}
                      onResetStorage={() => {
                        if (confirm('Reset components and chat to defaults?')) {
                          localStorage.clear();
                          setComponents(INITIAL_COMPONENTS);
                          setChatMessages(INITIAL_CHAT_MESSAGES);
                          setStats(INITIAL_STATS);
                        }
                      }}
                    />
                  )}

                  {currentTab === 'about' && <AboutView />}
                </div>
              </main>

              {/* Right Side Docked '>' Button for accessing component details pane when closed */}
              {!isDetailsPaneOpen && (
                <button
                  onClick={() => setIsDetailsPaneOpen(true)}
                  className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-30 bg-white/95 hover:bg-blue-50 border-l-2 border-t-2 border-b-2 border-gray-400 hover:border-blue-500 text-gray-800 hover:text-blue-700 py-3 px-1.5 rounded-l-xl shadow-lg items-center justify-center cursor-pointer transition transform hover:-translate-x-0.5"
                  title="Access component details pane (>)"
                >
                  <ChevronRight className="w-5 h-5 text-gray-800 hover:text-blue-700 stroke-[3]" />
                </button>
              )}

              {/* Right Side Component Details Pane */}
              {isDetailsPaneOpen && (

                <>
                  <div
                    className="lg:hidden fixed inset-0 z-30 bg-black/40 backdrop-blur-2xs transition-opacity"
                    onClick={() => setIsDetailsPaneOpen(false)}
                  />
                  <div className="z-40 fixed lg:static inset-y-0 right-0 h-full shadow-xl lg:shadow-none animate-fadeIn flex">
                    <ComponentDetailsPane
                      selectedComponent={selectedComponent}
                      stats={stats}
                      myLibraryStats={myLibraryStats}
                      onCloseMobile={() => setIsDetailsPaneOpen(false)}
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Full-Time Website Footer on the Bottom (shown across website & platform) */}
        <WebsiteFooter onNavigate={setCurrentSection} isOnline={isOnline} />
      </div>

      {/* 3-Panel View Component Modal (Schematic, Footprints, 3D Model, Details, View/Download Datasheet, Part Download) */}
      {viewingComponent && (
        <ViewComponentModal
          component={viewingComponent}
          onClose={() => setViewingComponent(null)}
        />
      )}

      {/* Manage Component Modal for My Library */}
      {managingComponent && (
        <ManageComponentModal
          component={managingComponent}
          isOpen={Boolean(managingComponent)}
          onClose={() => setManagingComponent(null)}
          onSave={handleSaveManagedComponent}
        />
      )}

      {/* 2-Way Authentication Modal with First-Time User & 7-Day Session Expiration Handling */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => {
          setIsAuthOpen(false);
          setPendingPlatformNav(false);
        }}
        onLoginSuccess={handleLoginSuccess}
        currentUser={currentUser}
        gateReason={authGateReason}
      />
    </div>
  );
}
