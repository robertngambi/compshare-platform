import React, { useState } from 'react';
import { Folder, Clock, Filter, ArrowUpRight } from 'lucide-react';
import { ElectronicComponent } from '../types';

interface RecentsViewProps {
  recentComponents: ElectronicComponent[];
  selectedComponentId: string | null;
  onSelectComponent: (comp: ElectronicComponent) => void;
  onOpenViewModal: (comp: ElectronicComponent) => void;
  onDownloadComponent?: (comp: ElectronicComponent) => void;
  onGoToNew: () => void;
}

export const RecentsView: React.FC<RecentsViewProps> = ({
  recentComponents,
  selectedComponentId,
  onSelectComponent,
  onOpenViewModal,
  onDownloadComponent,
  onGoToNew,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'Imported' | 'Converted'>('all');

  const filtered = recentComponents.filter(c => {
    if (filterType !== 'all') {
      return c.type === filterType;
    }
    return true;
  });

  const importedCount = recentComponents.filter(c => c.type === 'Imported').length;
  const convertedCount = recentComponents.filter(c => c.type === 'Converted').length;

  return (
    <div className="flex-1 flex flex-col p-3 sm:p-4 overflow-y-auto select-none space-y-3">
      {/* Recents Header & Organization Filters */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-gray-300">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-600" />
          <h3 className="text-xs sm:text-sm font-bold text-gray-800 uppercase tracking-wide">
            Recent Files (Last 7 Days)
          </h3>
          <span className="text-[11px] bg-blue-100 text-blue-800 font-mono font-bold px-2 py-0.5 rounded-full border border-blue-200">
            {recentComponents.length} total
          </span>
        </div>

        {/* Organized Sub-Tabs: All, Imported, Converted */}
        <div className="flex items-center gap-1.5 bg-gray-100 p-0.5 rounded-full border border-gray-300 text-xs">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded-full font-semibold transition cursor-pointer ${
              filterType === 'all'
                ? 'bg-white text-gray-900 shadow-xs font-bold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All ({recentComponents.length})
          </button>
          <button
            onClick={() => setFilterType('Imported')}
            className={`px-3 py-1 rounded-full font-semibold transition cursor-pointer ${
              filterType === 'Imported'
                ? 'bg-[#7a9ec7] text-white shadow-xs font-bold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Imported ({importedCount})
          </button>
          <button
            onClick={() => setFilterType('Converted')}
            className={`px-3 py-1 rounded-full font-semibold transition cursor-pointer ${
              filterType === 'Converted'
                ? 'bg-[#7a9ec7] text-white shadow-xs font-bold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Converted ({convertedCount})
          </button>
        </div>
      </div>

      {/* Components Stream */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500 text-xs italic bg-white/30 rounded-xl border border-dashed border-gray-300 space-y-2">
          <p>No recent {filterType !== 'all' ? filterType.toLowerCase() : ''} files found in the last 7 days.</p>
          <button
            onClick={onGoToNew}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-semibold shadow-xs inline-flex items-center gap-1 transition cursor-pointer"
          >
            <span>Upload or Convert New Files</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(comp => {
            const isSelected = selectedComponentId === comp.id;
            return (
              <div
                key={comp.id}
                onClick={() => onSelectComponent(comp)}
                className={`flex items-center justify-between p-2.5 rounded-2xl transition cursor-pointer border gap-2 ${
                  isSelected
                    ? 'bg-[#c5d8ea] border-[#9cbcd9] shadow-inner'
                    : 'bg-white/45 hover:bg-white/75 border-transparent hover:border-gray-300'
                }`}
              >
                {/* Left: Thumbnail + Name + Metadata */}
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded shrink-0 flex items-center justify-center overflow-hidden">
                    {comp.customImage ? (
                      <img src={comp.customImage} alt={comp.name} className="w-full h-full object-cover rounded" />
                    ) : (
                      <Folder className="w-6 h-6 text-amber-400 fill-amber-300" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                        {comp.name}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border ${
                          comp.type === 'Converted'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {comp.type}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-500 block truncate">
                      {comp.packageType} • {comp.conversionDate} • {comp.sourceSoftware} → {comp.destinationSoftware}
                    </span>
                  </div>
                </div>

                {/* Middle: File Size in orange font */}
                <div className="px-2 shrink-0">
                  <span className="text-xs font-mono font-bold text-[#e0662a]">
                    {comp.size}
                  </span>
                </div>

                {/* Right: View Button exclusively */}
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => onOpenViewModal(comp)}
                    className="px-4 sm:px-5 py-1 bg-[#eed3be] hover:bg-[#e6c4ab] active:bg-[#dbb599] border border-gray-400 text-gray-800 text-xs font-semibold rounded-full shadow-xs transition cursor-pointer"
                  >
                    View
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
