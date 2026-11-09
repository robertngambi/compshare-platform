import React from 'react';
import { Folder, Search } from 'lucide-react';
import { ElectronicComponent } from '../types';

interface LibraryViewProps {
  title: string;
  isMyLibrary: boolean;
  isAdmin?: boolean;
  components: ElectronicComponent[];
  selectedComponentId: string | null;
  onSelectComponent: (comp: ElectronicComponent) => void;
  onOpenViewModal: (comp: ElectronicComponent) => void;
  onOpenManageModal?: (comp: ElectronicComponent) => void;
  onDownloadComponent?: (comp: ElectronicComponent) => void;
  filterType: 'all' | 'Imported' | 'Converted';
  searchQuery: string;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  title,
  isMyLibrary,
  isAdmin = false,
  components,
  selectedComponentId,
  onSelectComponent,
  onOpenViewModal,
  onOpenManageModal,
  onDownloadComponent,
  filterType,
  searchQuery,
}) => {
  // Filter by imported / converted and search query
  const filtered = components.filter(c => {
    if (filterType !== 'all' && c.type !== filterType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        c.name.toLowerCase().includes(q) ||
        c.sourceSoftware.toLowerCase().includes(q) ||
        c.destinationSoftware.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.packageType.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="flex-1 flex flex-col p-4 overflow-y-auto select-none space-y-3">
      {/* Header bar within view */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-300">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
            {title}
          </h3>
          <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full font-mono">
            {filtered.length} files
          </span>
        </div>

        {filterType !== 'all' && (
          <span className="text-xs text-blue-700 font-semibold">
            Showing {filterType} only
          </span>
        )}
      </div>

      {/* Components List matching UI._02_19a93593.PNG */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500 text-xs italic bg-white/30 rounded-lg border border-dashed border-gray-300">
          No components match the current filter or search criteria.
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(comp => {
            const isSelected = selectedComponentId === comp.id;

            return (
              <div
                key={comp.id}
                onClick={() => onSelectComponent(comp)}
                className={`flex items-center justify-between p-2.5 rounded-2xl transition cursor-pointer border ${
                  isSelected
                    ? 'bg-[#c5d8ea] border-[#9cbcd9] shadow-inner'
                    : 'bg-white/40 hover:bg-white/70 border-transparent hover:border-gray-300'
                }`}
              >
                {/* Left side: Folder or Uploaded Image + Component Name */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded shrink-0 flex items-center justify-center overflow-hidden">
                    {comp.customImage ? (
                      <img
                        src={comp.customImage}
                        alt={comp.name}
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <Folder className="w-6 h-6 text-amber-400 fill-amber-300" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <span className="text-xs sm:text-sm font-bold text-gray-900 block truncate">
                      {comp.name}
                    </span>
                    <span className="text-[10px] text-gray-500 block truncate">
                      {comp.packageType} • {comp.sourceSoftware} → {comp.destinationSoftware}
                    </span>
                  </div>
                </div>

                {/* Middle: File size in orange font */}
                <div className="px-3 shrink-0">
                  <span className="text-xs font-mono font-bold text-[#e0662a]">
                    {comp.size}
                  </span>
                </div>

                {/* Right side: Edit & View buttons */}
                <div
                  className="flex items-center gap-2 shrink-0"
                  onClick={e => e.stopPropagation()}
                >
                  {(isMyLibrary || isAdmin) && onOpenManageModal && (
                    <button
                      onClick={() => onOpenManageModal(comp)}
                      className="px-3.5 py-1 bg-white hover:bg-blue-50 active:bg-blue-100 border border-blue-400 text-blue-700 text-xs font-semibold rounded-full shadow-xs transition cursor-pointer flex items-center gap-1"
                      title={isAdmin && !isMyLibrary ? "Admin Edit Access" : "Edit Component Details"}
                    >
                      Edit
                    </button>
                  )}
                  <button
                    onClick={() => onOpenViewModal(comp)}
                    className="px-5 py-1 bg-[#eed3be] hover:bg-[#e6c4ab] active:bg-[#dbb599] border border-gray-400 text-gray-800 text-xs font-semibold rounded-full shadow-xs transition cursor-pointer"
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
