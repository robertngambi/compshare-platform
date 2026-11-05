import React, { useRef, useState } from 'react';
import { Image as ImageIcon, Folder, FileArchive, X, Sparkles, HelpCircle } from 'lucide-react';
import { ElectronicComponent, CADSoftware } from '../types';

interface QueuedFile {
  id: string;
  file: File;
  name: string;
  size: string;
  sizeBytes: number;
  detectedFormat: CADSoftware;
}

interface NewConvertViewProps {
  queuedFiles: QueuedFile[];
  onAddFiles: (files: FileList | File[]) => void;
  onRemoveQueuedFile: (id: string) => void;
  recentComponents: ElectronicComponent[];
  selectedComponentId: string | null;
  onSelectComponent: (comp: ElectronicComponent) => void;
  onOpenViewModal: (comp: ElectronicComponent) => void;
  onDownloadComponent?: (comp: ElectronicComponent) => void;
  isConverting: boolean;
  progressPercentage: number;
}

export const NewConvertView: React.FC<NewConvertViewProps> = ({
  queuedFiles,
  onAddFiles,
  onRemoveQueuedFile,
  recentComponents,
  selectedComponentId,
  onSelectComponent,
  onOpenViewModal,
  onDownloadComponent,
  isConverting,
  progressPercentage,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onAddFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onAddFiles(e.target.files);
    }
  };

  // Quick preset loader helper for mobile and desktop testing
  const handleLoadSampleFile = (sampleName: string, ext: string, sizeBytes: number) => {
    const blob = new Blob([`SAMPLE COMPONENT DATA FOR ${sampleName}`], { type: 'text/plain' });
    const file = new File([blob], `${sampleName}.${ext}`, { type: 'text/plain' });
    onAddFiles([file]);
  };

  return (
    <div className="flex-1 flex flex-col p-3 sm:p-4 overflow-y-auto select-none space-y-3 sm:space-y-4">
      {/* Drag & Drop Area matching UI._01_8615edf2.PNG */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-4 sm:p-6 md:p-8 flex flex-col items-center justify-center transition-all ${
          isDragOver
            ? 'border-blue-500 bg-blue-50/50 scale-[1.01]'
            : 'border-gray-500 bg-white/35 hover:bg-white/45'
        }`}
      >
        <h3 className="text-xs sm:text-base font-bold text-gray-800 mb-2 sm:mb-3 text-center">
          Drag and Drop Files Here
        </h3>

        {/* Central Graphic Box matching screenshot */}
        <div className="w-36 sm:w-48 h-20 sm:h-24 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center bg-gray-200/50 mb-3 shadow-inner">
          <ImageIcon className="w-10 sm:w-12 h-10 sm:h-12 text-gray-400 stroke-1" />
        </div>

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          multiple
          accept=".zip,.dpif,.kicad_sym,.kicad_mod,.SchLib,.PcbLib,.lbr,.json,.step,.stp,.gcode,.ecad,.lib,.asc"
          className="hidden"
        />

        {/* Insert Files Button (Cyan pill button matching UI._01) */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-5 sm:px-6 py-1.5 sm:py-2 bg-[#00a8e8] hover:bg-[#0096d1] active:bg-[#0083b8] text-white font-semibold text-xs sm:text-sm rounded-full shadow-md transition transform hover:-translate-y-0.5 cursor-pointer"
          >
            Insert Files
          </button>

          <button
            onClick={() => setShowHowItWorks(!showHowItWorks)}
            className="px-3 py-1.5 bg-white/80 hover:bg-white border border-gray-400 text-gray-700 font-medium text-xs rounded-full shadow-2xs transition flex items-center gap-1 cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">How Conversion Works</span>
            <span className="sm:hidden">Format Specs</span>
          </button>
        </div>

        <p className="text-[10px] sm:text-[11px] text-gray-600 mt-2 text-center max-w-sm sm:max-w-md">
          Upload up to 5 zipped component archives or raw ECAD files (.dpif, .kicad_sym, .step, .lbr, .SchLib, etc.)
        </p>

        {/* Quick Sample Presets for Fast Mobile & Desktop Testing */}
        <div className="mt-3 pt-2 border-t border-gray-300/80 w-full flex flex-col items-center">
          <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Instant Test Presets (Click to queue):
          </span>
          <div className="flex flex-wrap justify-center gap-1.5">
            <button
              onClick={() => handleLoadSampleFile('TPS6170A_Boost', 'dpif', 516812)}
              className="px-2 py-0.5 bg-white hover:bg-blue-50 border border-gray-400 rounded text-[11px] font-mono text-gray-800 transition shadow-2xs"
            >
              + TPS6170A.dpif (Proteus)
            </button>
            <button
              onClick={() => handleLoadSampleFile('ESP8205H_MOSFET', 'kicad_sym', 410931)}
              className="px-2 py-0.5 bg-white hover:bg-blue-50 border border-gray-400 rounded text-[11px] font-mono text-gray-800 transition shadow-2xs"
            >
              + ESP8205H.kicad_sym (KiCad)
            </button>
            <button
              onClick={() => handleLoadSampleFile('MAX2633_RF_LNA', 'SchLib', 328089)}
              className="px-2 py-0.5 bg-white hover:bg-blue-50 border border-gray-400 rounded text-[11px] font-mono text-gray-800 transition shadow-2xs"
            >
              + MAX2633.SchLib (Altium)
            </button>
            <button
              onClick={() => handleLoadSampleFile('NE555_PrecisionTimer', 'lbr', 189644)}
              className="px-2 py-0.5 bg-white hover:bg-blue-50 border border-gray-400 rounded text-[11px] font-mono text-gray-800 transition shadow-2xs"
            >
              + NE555.lbr (EAGLE)
            </button>
          </div>
        </div>
      </div>

      {/* Format Explanation Modal / Banner */}
      {showHowItWorks && (
        <div className="p-3 bg-blue-50 border border-blue-300 rounded-xl text-xs text-blue-950 space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between font-bold text-sm text-blue-900">
            <span>CompShare 4-Step Universal Conversion Engine</span>
            <button onClick={() => setShowHowItWorks(false)} className="text-gray-500 hover:text-gray-800">
              <X className="w-4 h-4" />
            </button>
          </div>
          <ol className="list-decimal pl-4 space-y-1 text-[11px] leading-relaxed text-blue-900">
            <li><strong>Ingest:</strong> Extracts uploaded `.zip` archives or raw software files (Proteus `.dpif`, KiCad `.kicad_sym`, Altium `.SchLib`, EAGLE `.lbr`, etc.).</li>
            <li><strong>Normalize to Neutral Schema:</strong> Pin definitions (electrical types, coordinates, numbers), pad arrays (SMD/THT, mm/mils pitch), and 3D STEP geometries are parsed into a uniform intermediate format.</li>
            <li><strong>Cross-Compile:</strong> Re-encodes the component data into any of the 18 popular target formats chosen in the "Convert to:" dropdown.</li>
            <li><strong>Download &amp; Library Host:</strong> Packaged into a ready-to-use archive with symbols, footprints, 3D definitions, and ERC compliance report.</li>
          </ol>
        </div>
      )}

      {/* Queued Files to Convert (up to 5 files) */}
      {queuedFiles.length > 0 && (
        <div className="bg-white/85 border border-blue-300 rounded-xl p-2.5 sm:p-3 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-gray-700 px-1">
            <span>Ready for Conversion ({queuedFiles.length}/5 queued):</span>
            <span className="text-blue-700 font-bold text-[11px]">Click [ ▶ ] on top to convert</span>
          </div>

          <div className="space-y-1.5">
            {queuedFiles.map(q => (
              <div
                key={q.id}
                className="flex items-center justify-between bg-white border border-gray-300 rounded-lg p-2 text-xs"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <FileArchive className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="font-bold text-gray-900 truncate max-w-[120px] sm:max-w-xs">{q.name}</span>
                  <span className="text-[10px] text-amber-600 font-mono font-bold shrink-0">({q.size})</span>
                  <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded hidden sm:inline shrink-0">
                    {q.detectedFormat}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {isConverting ? (
                    <span className="text-[10px] text-blue-600 animate-pulse font-medium">
                      Converting... {progressPercentage}%
                    </span>
                  ) : (
                    <button
                      onClick={() => onRemoveQueuedFile(q.id)}
                      className="p-1 text-gray-400 hover:text-red-600 rounded transition"
                      title="Remove from queue"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Section matching UI._01_8615edf2.PNG */}
      <div className="pt-1">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wide">
            Recent (Last 5 Days)
          </h4>
          <span className="text-[11px] text-gray-600">
            {recentComponents.length} files
          </span>
        </div>

        <div className="space-y-2">
          {recentComponents.length === 0 ? (
            <div className="text-center py-6 text-gray-500 text-xs italic bg-white/30 rounded-lg border border-dashed border-gray-300">
              No recent conversions yet. Drag and drop component files or click the sample presets above!
            </div>
          ) : (
            recentComponents.slice(0, 50).map(comp => {
              const isSelected = selectedComponentId === comp.id;
              return (
                <div
                  key={comp.id}
                  onClick={() => onSelectComponent(comp)}
                  className={`flex items-center justify-between p-2 sm:p-2.5 rounded-2xl transition cursor-pointer border gap-2 ${
                    isSelected
                      ? 'bg-[#c5d8ea] border-[#9cbcd9] shadow-inner'
                      : 'bg-white/40 hover:bg-white/70 border-transparent hover:border-gray-300'
                  }`}
                >
                  {/* Left: Folder / Custom Image + Name */}
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded shrink-0 flex items-center justify-center overflow-hidden">
                      {comp.customImage ? (
                        <img src={comp.customImage} alt={comp.name} className="w-full h-full object-cover rounded" />
                      ) : (
                        <Folder className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 fill-amber-300" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <span className="text-xs sm:text-sm font-bold text-gray-900 block truncate">
                        {comp.name}
                      </span>
                    </div>
                  </div>

                  {/* Middle: Size in orange font matching UI._01 */}
                  <div className="px-1 sm:px-3 shrink-0">
                    <span className="text-[11px] sm:text-xs font-mono font-bold text-[#e0662a]">
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
            })
          )}
        </div>
      </div>
    </div>
  );
};
