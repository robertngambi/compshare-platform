import React from 'react';
import { Wifi, WifiOff, ShieldCheck, Heart } from 'lucide-react';

interface WebsiteFooterProps {
  onNavigate: (section: 'landing' | 'platform' | 'about' | 'chat') => void;
  isOnline: boolean;
}

export const WebsiteFooter: React.FC<WebsiteFooterProps> = ({ onNavigate, isOnline }) => {
  return (
    <footer className="w-full bg-white/90 border-t border-gray-400 py-3 sm:py-4 px-4 sm:px-8 text-xs text-gray-600 select-none shrink-0 shadow-2xs">
      <div className="max-w-[1240px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        {/* Left: Brand & Tagline */}
        <div className="flex items-center gap-2.5">
          <img
            src="/assets/aistudio/UI._07_efa59c02.PNG"
            alt="CompShare Logo"
            className="h-6 sm:h-7 object-contain"
          />
          <div>
            <div className="flex items-center gap-1.5 font-bold text-gray-900">
              <span>CompShare</span>
              <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                v1.0
              </span>
            </div>
            <p className="text-[10px] text-gray-500 hidden sm:block">
              Universal Electronics Components Converter &amp; Library Platform
            </p>
          </div>
        </div>

        {/* Center: Quick Nav Links */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 text-xs font-medium text-gray-700">
          <button
            onClick={() => onNavigate('landing')}
            className="hover:text-blue-700 transition cursor-pointer"
          >
            Home
          </button>
          <button
            onClick={() => onNavigate('platform')}
            className="hover:text-blue-700 transition cursor-pointer font-bold text-blue-900"
          >
            Converter Platform
          </button>
          <button
            onClick={() => onNavigate('about')}
            className="hover:text-blue-700 transition cursor-pointer"
          >
            About
          </button>
          <button
            onClick={() => onNavigate('chat')}
            className="hover:text-blue-700 transition cursor-pointer"
          >
            Chat
          </button>
        </div>

        {/* Right: Security & Network Sync Status */}
        <div className="flex items-center gap-3 text-[11px]">
          <div className="flex items-center gap-1 text-emerald-700 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="hidden md:inline">ERC Verified</span>
          </div>

          <div className="flex items-center gap-1 text-gray-500 font-mono">
            {isOnline ? (
              <>
                <Wifi className="w-3 h-3 text-emerald-600" />
                <span>Cloud Synced</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-amber-600" />
                <span>Offline Mode</span>
              </>
            )}
          </div>

          <span className="text-gray-400">|</span>
          <span className="text-gray-500">© 2026 CompShare</span>
        </div>
      </div>
    </footer>
  );
};
