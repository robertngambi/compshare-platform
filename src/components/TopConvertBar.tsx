import React from 'react';
import { Play, FolderPlus } from 'lucide-react';
import { CADSoftware } from '../types';
import { CAD_SOFTWARE_LIST } from '../utils/converterEngine';

interface TopConvertBarProps {
  activeTypeFilter: 'all' | 'Imported' | 'Converted';
  onChangeTypeFilter: (filter: 'all' | 'Imported' | 'Converted') => void;
  selectedTargetFormat: CADSoftware;
  onChangeTargetFormat: (format: CADSoftware) => void;
  progressPercentage: number;
  isConverting: boolean;
  onTriggerConvert: () => void;
  onAddToLibrary?: () => void;
  hasQueuedFiles: boolean;
}

export const TopConvertBar: React.FC<TopConvertBarProps> = ({
  activeTypeFilter,
  onChangeTypeFilter,
  selectedTargetFormat,
  onChangeTargetFormat,
  progressPercentage,
  isConverting,
  onTriggerConvert,
  onAddToLibrary,
  hasQueuedFiles,
}) => {
  return (
    <div className="px-2.5 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2 border-b border-gray-400 select-none bg-white/40">
      {/* Filter Buttons & Add to Library Button */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        <button
          onClick={() => onChangeTypeFilter(activeTypeFilter === 'Imported' ? 'all' : 'Imported')}
          className={`px-3.5 sm:px-5 py-1 sm:py-1.5 rounded-full text-xs font-semibold border border-gray-400 transition cursor-pointer ${
            activeTypeFilter === 'Imported'
              ? 'bg-[#7a9ec7] text-white shadow-inner font-bold border-[#5d83b0]'
              : 'bg-white hover:bg-gray-100 text-gray-800'
          }`}
        >
          Imported
        </button>

        <button
          onClick={() => onChangeTypeFilter(activeTypeFilter === 'Converted' ? 'all' : 'Converted')}
          className={`px-3.5 sm:px-5 py-1 sm:py-1.5 rounded-full text-xs font-semibold border border-gray-400 transition cursor-pointer ${
            activeTypeFilter === 'Converted'
              ? 'bg-[#7a9ec7] text-white shadow-inner font-bold border-[#5d83b0]'
              : 'bg-white hover:bg-gray-100 text-gray-800'
          }`}
        >
          Converted
        </button>

        {/* Add to library button directly in main screen bar */}
        {onAddToLibrary && (
          <button
            onClick={onAddToLibrary}
            disabled={!hasQueuedFiles || isConverting}
            title={
              hasQueuedFiles
                ? 'Add imported files directly to library without converting'
                : 'Upload files in New tab to add directly to library'
            }
            className="px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-xs font-semibold border transition cursor-pointer flex items-center gap-1 shadow-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <FolderPlus className="w-3.5 h-3.5 text-emerald-600" />
            <span>Add to library</span>
          </button>
        )}
      </div>

      {/* Convert To: Dropdown + Progress Box + Play Button */}
      <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">
        <div className="flex flex-col items-start sm:items-center">
          <span className="text-[10px] text-gray-600 font-medium leading-none mb-0.5">
            Convert to:
          </span>
          <div className="relative">
            <select
              value={selectedTargetFormat}
              onChange={e => onChangeTargetFormat(e.target.value as CADSoftware)}
              className="px-2 sm:px-3 py-1 bg-white border border-gray-400 rounded text-xs font-semibold text-gray-800 shadow-xs focus:ring-1 focus:ring-blue-500 focus:outline-none pr-6 sm:pr-7 cursor-pointer max-w-[130px] sm:max-w-none truncate"
            >
              {CAD_SOFTWARE_LIST.map(cad => (
                <option key={cad} value={cad}>
                  {cad}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Progress Percentage Box matching screenshot [ 0% ] */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-transparent leading-none mb-0.5 select-none">.</span>
          <div className="w-12 sm:w-16 h-[26px] bg-white border border-gray-400 rounded flex items-center justify-center font-mono text-xs font-bold text-gray-800 shadow-xs overflow-hidden relative">
            {isConverting && (
              <div
                className="absolute left-0 top-0 bottom-0 bg-blue-300 transition-all duration-200"
                style={{ width: `${progressPercentage}%` }}
              />
            )}
            <span className="relative z-10">{progressPercentage}%</span>
          </div>
        </div>

        {/* Play Button matching screenshot [ ▶ ] */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-transparent leading-none mb-0.5 select-none">.</span>
          <button
            onClick={onTriggerConvert}
            disabled={isConverting}
            title={hasQueuedFiles ? 'Click to convert files' : 'Select files to convert'}
            className="w-8 h-[26px] bg-white hover:bg-red-50 active:bg-red-100 border border-gray-400 rounded flex items-center justify-center shadow-xs transition cursor-pointer group disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-red-600 text-red-600 group-hover:scale-110 transition" />
          </button>
        </div>
      </div>
    </div>
  );
};
