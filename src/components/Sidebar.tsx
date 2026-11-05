import React from 'react';
import { User, ShieldCheck, X } from 'lucide-react';
import { UserProfile, ThemeBottomColor } from '../types';

export type NavTab = 'profile' | 'myLibrary' | 'recents' | 'new' | 'allLibraries' | 'settings' | 'about' | 'chat';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  currentUser: UserProfile;
  checkComponents: boolean;
  onToggleCheckComponents: () => void;
  currentTheme: ThemeBottomColor;
  onChangeTheme: (theme: ThemeBottomColor) => void;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  checkComponents,
  onToggleCheckComponents,
  currentTheme,
  onChangeTheme,
  onCloseMobile,
}) => {
  const navItems: { id: NavTab; label: string }[] = [
    { id: 'profile', label: 'My profile' },
    { id: 'myLibrary', label: 'My library' },
    { id: 'recents', label: 'Recents' },
    { id: 'new', label: 'New' },
    { id: 'allLibraries', label: 'All libraries' },
    { id: 'settings', label: 'Settings' },
    { id: 'about', label: 'About' },
  ];

  const themes: { id: ThemeBottomColor; name: string; bgClass: string; hex: string }[] = [
    { id: 'blue', name: 'Light Blue', bgClass: 'bg-sky-400', hex: '#7fb7e8' },
    { id: 'black', name: 'Light Black', bgClass: 'bg-zinc-700', hex: '#4b5563' },
    { id: 'orange', name: 'Orange', bgClass: 'bg-amber-500', hex: '#f97316' },
    { id: 'green', name: 'Green', bgClass: 'bg-emerald-600', hex: '#16a34a' },
    { id: 'brown', name: 'Brown', bgClass: 'bg-amber-800', hex: '#92400e' },
  ];

  const handleNavClick = (tab: NavTab) => {
    onSelectTab(tab);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <aside className="w-56 sm:w-60 shrink-0 border-r border-gray-400 flex flex-col justify-between p-3 select-none bg-white/95 sm:bg-white/80 h-full overflow-y-auto">
      {/* Top Profile Header */}
      <div>
        <div className="flex items-center justify-between">
          <div
            onClick={() => handleNavClick('profile')}
            className="flex items-center gap-3 cursor-pointer group p-1 rounded-lg hover:bg-black/5 transition flex-1 min-w-0"
            title="Click to view and edit profile"
          >
            <div className="w-11 h-11 rounded-full bg-gray-500/80 overflow-hidden flex items-center justify-center border-2 border-white shadow-xs shrink-0">
              {currentUser.avatarUrl ? (
                <img src={currentUser.avatarUrl} alt={currentUser.fullName} className="w-full h-full object-cover" />
              ) : (
                <User className="w-6 h-6 text-gray-200 fill-gray-200" />
              )}
            </div>
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-gray-900 truncate group-hover:text-blue-700 transition">
                {currentUser.fullName}
              </h4>
              <span className="text-[10px] text-gray-500 block truncate">Online • 7-day session</span>
            </div>
          </div>

          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 text-gray-500 hover:text-gray-900 rounded-md"
              title="Close panel"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Horizontal Divider */}
        <div className="w-full h-[1px] bg-gray-400 my-3" />

        {/* Main Navigation Buttons matching screenshots */}
        <nav className="space-y-2">
          {navItems.map(item => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full py-2 px-4 rounded-full text-xs sm:text-sm font-semibold transition-all duration-150 text-center shadow-xs cursor-pointer ${
                  isActive
                    ? 'bg-[#7a9ec7] text-white shadow-inner font-bold'
                    : 'bg-[#d8d8d8] hover:bg-[#cecece] text-gray-800 hover:text-gray-900'
                }`}
              >
                {item.label}
              </button>
            );
          })}

        </nav>
      </div>

      {/* Bottom Controls: Check components checkbox & Bottom Theme color buttons */}
      <div className="pt-4 border-t border-gray-400/60 space-y-3 mt-4">
        {/* Check components checkbox matching screenshot */}
        <label className="flex items-center gap-2 cursor-pointer group select-none">
          <input
            type="checkbox"
            checked={checkComponents}
            onChange={onToggleCheckComponents}
            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-400 cursor-pointer"
          />
          <span className="text-xs font-semibold text-gray-800 group-hover:text-black flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            Check components
          </span>
        </label>

        {/* Gradient Bottom Color Changer Buttons */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600 block mb-1.5">
            Bottom Theme:
          </span>
          <div className="flex items-center gap-1.5">
            {themes.map(t => (
              <button
                key={t.id}
                onClick={() => onChangeTheme(t.id)}
                title={`Set bottom background to ${t.name}`}
                className={`w-6 h-6 rounded-full border-2 transition-all ${t.bgClass} ${
                  currentTheme === t.id
                    ? 'border-gray-900 scale-110 shadow-md ring-2 ring-white'
                    : 'border-white/80 hover:scale-105 opacity-80 hover:opacity-100'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};
