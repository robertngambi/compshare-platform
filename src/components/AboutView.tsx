import React, { useState } from 'react';
import {
  Layers,
  Cpu,
  RefreshCw,
  CheckCircle2,
  GitCompare,
  Server,
  Cloud,
  Terminal,
  ExternalLink,
  ShieldCheck,
  Zap,
  Globe,
  Radio,
  Copy,
  Check
} from 'lucide-react';
import { CAD_SOFTWARE_LIST, CAD_EXTENSIONS } from '../utils/converterEngine';

export const AboutView: React.FC = () => {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="space-y-6 pb-6 select-none animate-fadeIn">
      {/* Brand Header */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white/85 backdrop-blur-xs p-5 rounded-2xl border border-gray-300 shadow-xs">
        <img
          src="/assets/aistudio/UI._07_efa59c02.PNG"
          alt="CompShare Logo"
          className="h-14 sm:h-16 object-contain"
        />
        <div className="text-center sm:text-left flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">CompShare</h2>
            <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2.5 py-0.5 rounded-full border border-blue-200">
              Version 1.0
            </span>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
              <Radio className="w-3 h-3 text-emerald-600 animate-pulse" /> Live Ready
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Universal Electronics Components Converter &amp; Engineering Host Library Platform
          </p>
        </div>
      </div>

      {/* 3 Pillar Features moved from Landing Page */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-600" />
          Core Conversion Technology
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/85 p-5 rounded-2xl border border-gray-300 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-2">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-gray-900">Neutral Translation Matrix</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Deconstructs schematic symbols, PCB footprint copper pads, and 3D geometric dimensions into a universal neutral model before compiling to your selected target format.
            </p>
          </div>

          <div className="bg-white/85 p-5 rounded-2xl border border-gray-300 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2">
              <Cpu className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-gray-900">3D WebGL &amp; Pinout Verification</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Interactive side-by-side inspection of schematic logic diagrams, copper pads, and real-time Three.js 3D mechanical package models with automated ERC validation.
            </p>
          </div>

          <div className="bg-white/85 p-5 rounded-2xl border border-gray-300 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-2">
              <RefreshCw className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-gray-900">Offline Ready &amp; Cloud Sync</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Parse, convert, and inspect electronic components completely inside your browser without needing constant network access. Auto-reconciles with cloud sync when online.
            </p>
          </div>
        </div>
      </div>

      {/* 18 Supported EDA PCB Suites Showcase moved from Landing Page */}
      <div className="bg-white/85 p-5 sm:p-6 rounded-2xl border border-gray-300 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 pb-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-2">
              <GitCompare className="w-4 h-4 text-blue-600" />
              18 Supported Electronic PCB Designing Softwares
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Full 2-way and multi-format translation between any of these industry standard formats:
            </p>
          </div>
          <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            18 Formats Verified
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 pt-1">
          {CAD_SOFTWARE_LIST.map(cad => {
            const exts = CAD_EXTENSIONS[cad] || [];
            return (
              <div
                key={cad}
                className="p-2.5 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-xl text-left transition shadow-2xs group flex flex-col justify-between"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="text-xs font-bold text-gray-900 truncate group-hover:text-blue-700">
                    {cad}
                  </span>
                </div>
                <div className="text-[10px] text-gray-500 font-mono truncate">
                  {exts.slice(0, 2).join(', ')}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Deployment & Hosting Guide */}
      <div className="bg-white/90 p-5 sm:p-6 rounded-2xl border border-gray-300 shadow-xs space-y-4">
        <div className="border-b border-gray-200 pb-3">
          <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm sm:text-base">
            <Cloud className="w-5 h-5 text-indigo-600" />
            Deploying CompShare: Platforms &amp; Step-by-Step Examples
          </div>
          <p className="text-xs text-gray-600 mt-1">
            CompShare is engineered as an offline-first full-stack React SPA with Express/Node.js capabilities, ready for single-click deployment across popular cloud infrastructure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Platform 1: Google Cloud Run */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <Server className="w-4 h-4 text-blue-600" />
                1. Google Cloud Run (Recommended)
              </span>
              <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">
                Serverless Container
              </span>
            </div>
            <p className="text-xs text-gray-600">
              Zero-maintenance serverless container scaling to zero when idle. Ideal for AI Studio and enterprise production.
            </p>
            <div className="bg-slate-900 text-slate-100 p-2.5 rounded-lg text-[11px] font-mono flex items-center justify-between">
              <code>gcloud run deploy compshare --source . --port 3000</code>
              <button
                onClick={() => handleCopy('gcloud run deploy compshare --source . --port 3000', 'gcloud')}
                className="p-1 hover:text-white transition cursor-pointer"
                title="Copy command"
              >
                {copiedCmd === 'gcloud' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Platform 2: Vercel */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-black" />
                2. Vercel
              </span>
              <span className="text-[10px] bg-neutral-200 text-neutral-800 font-bold px-2 py-0.5 rounded">
                Edge / Global CDN
              </span>
            </div>
            <p className="text-xs text-gray-600">
              Lightning fast global CDN deployment. Auto-detects Vite and deploys in seconds from Git.
            </p>
            <div className="bg-slate-900 text-slate-100 p-2.5 rounded-lg text-[11px] font-mono flex items-center justify-between">
              <code>npx vercel --prod</code>
              <button
                onClick={() => handleCopy('npx vercel --prod', 'vercel')}
                className="p-1 hover:text-white transition cursor-pointer"
                title="Copy command"
              >
                {copiedCmd === 'vercel' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Platform 3: Docker Container */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-cyan-600" />
                3. Docker / Self-Hosted
              </span>
              <span className="text-[10px] bg-cyan-100 text-cyan-800 font-bold px-2 py-0.5 rounded">
                Any Linux VPS
              </span>
            </div>
            <p className="text-xs text-gray-600">
              Build a lightweight container with Node 22 Alpine, run locally or on DigitalOcean, AWS, or GCP.
            </p>
            <div className="bg-slate-900 text-slate-100 p-2.5 rounded-lg text-[11px] font-mono flex items-center justify-between">
              <code>docker build -t compshare . &amp;&amp; docker run -p 3000:3000 compshare</code>
              <button
                onClick={() => handleCopy('docker build -t compshare . && docker run -p 3000:3000 compshare', 'docker')}
                className="p-1 hover:text-white transition cursor-pointer"
                title="Copy command"
              >
                {copiedCmd === 'docker' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Platform 4: Render / Railway */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-600" />
                4. Render &amp; Railway
              </span>
              <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">
                Managed PaaS
              </span>
            </div>
            <p className="text-xs text-gray-600">
              Connect your GitHub repository, configure build command <code>npm run build</code>, and start command <code>npm run preview</code> or <code>node server.ts</code>.
            </p>
            <div className="bg-slate-900 text-slate-100 p-2.5 rounded-lg text-[11px] font-mono flex items-center justify-between">
              <code>Build: npm run build | Start: npm run start</code>
              <button
                onClick={() => handleCopy('npm run build', 'render')}
                className="p-1 hover:text-white transition cursor-pointer"
                title="Copy build command"
              >
                {copiedCmd === 'render' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
