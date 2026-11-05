import React from 'react';
import { ArrowRight, Sparkles, Zap } from 'lucide-react';
import { PlatformStats } from '../types';


interface LandingPageViewProps {
  onStartConverting: () => void;
  onExploreAbout: () => void;
  onOpenChat: () => void;
  stats: PlatformStats;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  onStartConverting,
  onExploreAbout,
  onOpenChat,
  stats,
}) => {
  return (
    <div className="flex-1 overflow-y-auto flex flex-col justify-between select-none">
      <div className="max-w-5xl mx-auto w-full p-4 sm:p-6 md:p-8 space-y-8 sm:space-y-12">
        {/* Hero Section with Logo & Welcoming Context */}
        <section className="text-center space-y-4 pt-2 sm:pt-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-blue-700 text-xs font-bold tracking-wide shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>CompShare Version 1.0 • Universal Electronic Component Interoperability</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
            Convert Any Electronic Component <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-600">
              Across 15+ Major PCB Design Suites
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-xs sm:text-base text-gray-600 leading-relaxed font-normal">
            Welcome to <strong>CompShare</strong> — the dedicated engineering cloud and offline host library that parses proprietary EDA components into neutral standardized formats and compiles them into KiCad, Proteus, Altium, EAGLE, OrCAD, and more.
          </p>

          {/* Quick Hero Actions */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onStartConverting}
              className="px-6 sm:px-8 py-3 bg-[#0055d4] hover:bg-[#0044b3] active:bg-[#003399] text-white text-xs sm:text-sm font-bold rounded-full shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5 cursor-pointer flex items-center gap-2"
            >
              <span>Continue to start converting</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onExploreAbout}
              className="px-5 py-3 bg-white/90 hover:bg-white border border-gray-300 text-gray-800 text-xs sm:text-sm font-semibold rounded-full shadow-xs transition cursor-pointer"
            >
              Explore Architecture &amp; Services
            </button>
          </div>
        </section>

        {/* Live Platform Counters Bar */}
        <section className="bg-white/80 backdrop-blur-xs border border-gray-300 rounded-2xl p-4 sm:p-5 shadow-xs grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div>
            <span className="text-xs text-gray-500 font-medium block">Active Engineers</span>
            <span className="text-lg sm:text-2xl font-extrabold text-gray-900 font-mono">
              {stats.subscribers.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-xs text-gray-500 font-medium block">Engineers Online</span>
            <span className="text-lg sm:text-2xl font-extrabold text-emerald-600 font-mono">
              {stats.online.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-xs text-gray-500 font-medium block">Imported Components</span>
            <span className="text-lg sm:text-2xl font-extrabold text-blue-700 font-mono">
              {stats.totalImported.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-xs text-gray-500 font-medium block">Total Library Parts</span>
            <span className="text-lg sm:text-2xl font-extrabold text-indigo-700 font-mono">
              {(stats.totalImported + stats.totalConverted).toLocaleString()}
            </span>
          </div>
        </section>



        {/* Bottom Prominent Welcome & CTA Card */}
        <section className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-xl sm:text-2xl font-bold">
              Ready to Convert Your Electronic Parts?
            </h3>
            <p className="text-xs sm:text-sm text-blue-200 max-w-lg">
              Upload up to 5 zipped component files or single CAD parts, select your destination EDA software, and package your converted library instantly.
            </p>
          </div>

          <div className="shrink-0 flex flex-col gap-2 w-full sm:w-auto">
            {/* The specified 'Continue to start converting' button on the bottom */}
            <button
              onClick={onStartConverting}
              className="px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-extrabold text-sm rounded-full shadow-lg hover:shadow-xl transition transform hover:scale-105 cursor-pointer flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>Continue to start converting</span>
            </button>

            <button
              onClick={onOpenChat}
              className="px-4 py-1.5 text-xs text-blue-200 hover:text-white transition text-center underline cursor-pointer"
            >
              Or join the Engineer Community Chat
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
