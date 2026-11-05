import React from 'react';
import { Settings as SettingsIcon, Database, HardDrive, ShieldCheck, Download, RefreshCw } from 'lucide-react';
import { CADSoftware } from '../types';
import { CAD_SOFTWARE_LIST } from '../utils/converterEngine';

interface SettingsViewProps {
  defaultCad: CADSoftware;
  onChangeDefaultCad: (cad: CADSoftware) => void;
  checkComponents: boolean;
  onToggleCheckComponents: () => void;
  isOnline: boolean;
  onToggleOnline: () => void;
  onExportBackup: () => void;
  onResetStorage: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  defaultCad,
  onChangeDefaultCad,
  checkComponents,
  onToggleCheckComponents,
  isOnline,
  onToggleOnline,
  onExportBackup,
  onResetStorage,
}) => {
  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-6">
      <div className="flex items-center gap-2 border-b border-gray-300 pb-3">
        <SettingsIcon className="w-5 h-5 text-gray-700" />
        <h2 className="text-base font-bold text-gray-900">Platform Settings</h2>
      </div>

      <div className="space-y-4 max-w-xl">
        {/* Default CAD Target */}
        <div className="bg-white/80 p-4 rounded-xl border border-gray-300 shadow-xs space-y-2">
          <label className="block text-xs font-bold text-gray-800 uppercase tracking-wide">
            Default Target CAD Software:
          </label>
          <select
            value={defaultCad}
            onChange={e => onChangeDefaultCad(e.target.value as CADSoftware)}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-sm text-gray-800 font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
          >
            {CAD_SOFTWARE_LIST.map(cad => (
              <option key={cad} value={cad}>
                {cad}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500">
            Pre-selected format in the 'Convert to:' box when opening the converter.
          </p>
        </div>

        {/* Verification Check */}
        <div className="bg-white/80 p-4 rounded-xl border border-gray-300 shadow-xs flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              Automated Electrical Rules Check (ERC)
            </h4>
            <p className="text-xs text-gray-500 mt-0.5">
              Validate pin directions, power nets, and footprint dimensions during conversion.
            </p>
          </div>
          <input
            type="checkbox"
            checked={checkComponents}
            onChange={onToggleCheckComponents}
            className="w-5 h-5 rounded text-blue-600 cursor-pointer"
          />
        </div>

        {/* Cloud Sync & Offline Mode */}
        <div className="bg-white/80 p-4 rounded-xl border border-gray-300 shadow-xs flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
              <RefreshCw className="w-4 h-4 text-emerald-600" />
              Network & Offline Mode
            </h4>
            <p className="text-xs text-gray-500 mt-0.5">
              {isOnline
                ? 'Cloud synchronization active. All changes synced across devices.'
                : 'Offline mode active. All conversions running completely in browser memory.'}
            </p>
          </div>
          <button
            onClick={onToggleOnline}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
              isOnline
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-amber-100 text-amber-800 border border-amber-300'
            }`}
          >
            {isOnline ? 'Online (Synced)' : 'Offline (Local)'}
          </button>
        </div>

        {/* Local Storage & Backup */}
        <div className="bg-white/80 p-4 rounded-xl border border-gray-300 shadow-xs space-y-3">
          <h4 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
            <HardDrive className="w-4 h-4 text-purple-600" />
            Data Storage & Backup
          </h4>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={onExportBackup}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-400 rounded-lg text-xs font-semibold text-gray-800 flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" />
              Export Component Library JSON
            </button>
            <button
              onClick={onResetStorage}
              className="px-4 py-2 bg-red-50 hover:bg-red-100 border border-red-300 rounded-lg text-xs font-semibold text-red-700 transition"
            >
              Reset to Factory Defaults
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
