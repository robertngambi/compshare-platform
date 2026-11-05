import React from 'react';
import { X } from 'lucide-react';
import { ElectronicComponent, PlatformStats } from '../types';

interface ComponentDetailsPaneProps {
  selectedComponent: ElectronicComponent | null;
  stats: PlatformStats;
  myLibraryStats: {
    imported: number;
    converted: number;
    total: number;
  };
  onCloseMobile?: () => void;
}

export const ComponentDetailsPane: React.FC<ComponentDetailsPaneProps> = ({
  selectedComponent,
  stats,
  myLibraryStats,
  onCloseMobile,
}) => {
  return (
    <aside className="w-60 sm:w-64 shrink-0 border-l border-gray-400 p-3.5 flex flex-col justify-between text-xs select-none bg-white/95 sm:bg-white/80 h-full overflow-y-auto">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-900 tracking-tight">
            Component Details
          </h3>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1 text-gray-500 hover:text-gray-900 rounded"
              title="Close panel"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {selectedComponent ? (
          <dl className="space-y-1.5 text-gray-800">
            <div className="grid grid-cols-[85px_1fr] gap-1">
              <dt className="text-gray-600 font-medium">Folder name:</dt>
              <dd className="font-semibold text-gray-900 truncate" title={selectedComponent.folderName}>
                {selectedComponent.folderName}
              </dd>
            </div>

            <div className="grid grid-cols-[85px_1fr] gap-1">
              <dt className="text-gray-600 font-medium">File name:</dt>
              <dd className="font-bold text-gray-900 truncate" title={selectedComponent.fileName}>
                {selectedComponent.fileName}
              </dd>
            </div>

            <div className="grid grid-cols-[85px_1fr] gap-1">
              <dt className="text-gray-600 font-medium">Origin:</dt>
              <dd className="text-gray-800 truncate" title={selectedComponent.origin}>
                {selectedComponent.origin}
              </dd>
            </div>

            <div className="grid grid-cols-[85px_1fr] gap-1">
              <dt className="text-gray-600 font-medium">Source:</dt>
              <dd className="text-gray-800 truncate" title={selectedComponent.sourceSoftware}>
                {selectedComponent.sourceSoftware}
              </dd>
            </div>

            <div className="grid grid-cols-[85px_1fr] gap-1">
              <dt className="text-gray-600 font-medium">Designation:</dt>
              <dd className="font-semibold text-blue-700 truncate" title={selectedComponent.destinationSoftware}>
                {selectedComponent.destinationSoftware}
              </dd>
            </div>

            <div className="grid grid-cols-[85px_1fr] gap-1">
              <dt className="text-gray-600 font-medium">Size:</dt>
              <dd className="font-mono text-amber-700 font-bold">
                {selectedComponent.size}
              </dd>
            </div>

            <div className="grid grid-cols-[85px_1fr] gap-1">
              <dt className="text-gray-600 font-medium">Type:</dt>
              <dd className="font-medium text-gray-900">
                {selectedComponent.type}
              </dd>
            </div>

            <div className="grid grid-cols-[85px_1fr] gap-1">
              <dt className="text-gray-600 font-medium">Date of conv.:</dt>
              <dd className="text-gray-700 font-mono">
                {selectedComponent.conversionDate}
              </dd>
            </div>
          </dl>
        ) : (
          <div className="p-3 bg-white/40 border border-dashed border-gray-300 rounded text-center text-gray-500 text-xs italic">
            Click on any component row in the library or recent list to inspect details.
          </div>
        )}
      </div>

      {/* Horizontal Divider Line */}
      <div className="my-3">
        <div className="w-full h-[1px] bg-gray-400" />
      </div>

      {/* Platform and User Statistics matching screenshots */}
      <div className="space-y-3 text-gray-800">
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-600">Subscribers:</span>
            <span className="font-semibold font-mono text-gray-900">{stats.subscribers.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Online:</span>
            <span className="font-semibold font-mono text-emerald-700">{stats.online.toLocaleString()}</span>
          </div>
        </div>

        <div className="space-y-1 pt-1">
          <div className="flex justify-between">
            <span className="text-gray-600">Imported files:</span>
            <span className="font-mono text-gray-800">{stats.totalImported.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Converted files:</span>
            <span className="font-mono text-gray-800">{stats.totalConverted.toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-bold border-t border-gray-300 pt-0.5">
            <span className="text-gray-700">Total:</span>
            <span className="font-mono text-gray-900">
              {(stats.totalImported + stats.totalConverted).toLocaleString()}
            </span>
          </div>
        </div>

        {/* My Library Stats */}
        <div className="pt-2">
          <h4 className="font-bold text-gray-900 mb-1">My library</h4>
          <div className="space-y-0.5 text-[11px]">
            <div className="flex justify-between">
              <span className="text-gray-600">Imported files:</span>
              <span className="font-mono font-bold text-gray-800">{myLibraryStats.imported}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Converted files:</span>
              <span className="font-mono font-bold text-gray-800">{myLibraryStats.converted}</span>
            </div>
            <div className="flex justify-between font-bold border-t border-gray-300 pt-0.5">
              <span className="text-gray-700">Total:</span>
              <span className="font-mono text-blue-900">{myLibraryStats.total}</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
