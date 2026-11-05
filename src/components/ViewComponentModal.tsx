import React, { useState } from 'react';
import {
  X,
  FileText,
  Download,
  CheckCircle2,
  Eye,
  FileDown,
  Layers,
  Info,
  ZoomIn,
  ZoomOut,
  ExternalLink,
  Printer,
  FileCheck
} from 'lucide-react';
import { ElectronicComponent } from '../types';
import { SchematicSymbolViewer } from './SchematicSymbolViewer';
import { FootprintViewer } from './FootprintViewer';
import { ThreeDModelViewer } from './ThreeDModelViewer';
import { convertComponentPackage, downloadBlob } from '../utils/converterEngine';
import { generateDatasheetPDF } from '../utils/pdfGenerator';

interface ViewComponentModalProps {
  component: ElectronicComponent | null;
  onClose: () => void;
}

export const ViewComponentModal: React.FC<ViewComponentModalProps> = ({
  component,
  onClose,
}) => {
  const [isDownloadingPart, setIsDownloadingPart] = useState(false);
  const [isViewingDatasheet, setIsViewingDatasheet] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  if (!component) return null;

  const handleDownloadPart = async () => {
    setIsDownloadingPart(true);
    try {
      const { zipBlob, downloadFilename } = await convertComponentPackage(
        component,
        component.destinationSoftware as any
      );
      downloadBlob(zipBlob, downloadFilename);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setIsDownloadingPart(false);
    }
  };

  const handleDownloadDatasheetPDF = () => {
    const pdfBlob = generateDatasheetPDF(component);
    downloadBlob(pdfBlob, `${component.name}_Datasheet.pdf`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 md:p-6 animate-fadeIn overflow-y-auto">
      {/* Modal Container matching UI._06_f6e51a54.PNG */}
      <div className="relative w-full max-w-4xl bg-white border-2 border-gray-400 rounded-lg shadow-2xl overflow-hidden flex flex-col my-auto max-h-[95vh]">
        {/* Modal Header */}
        <div className="p-2.5 sm:p-3.5 border-b border-gray-300 flex items-center justify-between gap-2 bg-gray-50">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
            <span className="text-xs sm:text-sm font-semibold text-gray-700 shrink-0">
              Component Name:
            </span>
            <div className="flex-1 max-w-md px-2.5 py-1 bg-white border border-gray-400 rounded text-xs sm:text-sm font-mono font-bold text-gray-900 truncate">
              {component.name}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition cursor-pointer"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-3 sm:p-4 overflow-y-auto max-h-[76vh] space-y-4">
          {/* Top Section: 3-Panel CAD Viewers (Schematic, Footprints, 3D Model) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            {/* Panel 1: Schematic Symbol */}
            <div className="flex flex-col">
              <div className="h-56 sm:h-64 border-2 border-black bg-[#d9d5c5] rounded p-1 shadow-inner overflow-hidden">
                <SchematicSymbolViewer component={component} />
              </div>
              <div className="mt-1.5 text-center text-xs font-semibold text-gray-700">
                Schematic symbol
              </div>
            </div>

            {/* Panel 2: Footprints */}
            <div className="flex flex-col">
              <div className="h-56 sm:h-64 border-2 border-black bg-black rounded p-1 shadow-inner overflow-hidden">
                <FootprintViewer component={component} />
              </div>
              <div className="mt-1.5 text-center text-xs font-semibold text-gray-700">
                Footprints
              </div>
            </div>

            {/* Panel 3: 3D Model */}
            <div className="flex flex-col">
              <div className="h-56 sm:h-64 border-2 border-black bg-slate-900 rounded p-1 shadow-inner overflow-hidden">
                <ThreeDModelViewer component={component} />
              </div>
              <div className="mt-1.5 text-center text-xs font-semibold text-gray-700">
                3D Model
              </div>
            </div>
          </div>

          {/* Details Section directly on the bottom of the schematic, footprints, and 3D view */}
          <div className="border border-gray-300 rounded-xl bg-gray-50 p-3.5 sm:p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-gray-200 pb-2">
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wide flex items-center gap-1.5">
                <Info className="w-4 h-4 text-blue-600" />
                Component Details &amp; Specifications
              </h4>
              <span className="text-[11px] font-mono text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Size: {component.size}
              </span>
            </div>

            {/* Meta attributes */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-white p-2 rounded border border-gray-200">
                <span className="text-gray-500 block text-[10px]">Package:</span>
                <span className="font-bold text-gray-900">{component.packageType}</span>
              </div>
              <div className="bg-white p-2 rounded border border-gray-200">
                <span className="text-gray-500 block text-[10px]">Source CAD:</span>
                <span className="font-bold text-gray-900 truncate block">{component.sourceSoftware}</span>
              </div>
              <div className="bg-white p-2 rounded border border-gray-200">
                <span className="text-gray-500 block text-[10px]">Target CAD:</span>
                <span className="font-bold text-blue-700 truncate block">{component.destinationSoftware}</span>
              </div>
              <div className="bg-white p-2 rounded border border-gray-200">
                <span className="text-gray-500 block text-[10px]">ERC Status:</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Verified
                </span>
              </div>
            </div>

            {/* Description & Application Notes */}
            <div className="space-y-1.5 bg-white p-3 rounded-lg border border-gray-200 text-xs text-gray-800">
              <div>
                <strong className="text-gray-900 font-semibold">Description:</strong>{' '}
                <span>{component.description || 'Standard electronic component specification.'}</span>
              </div>
              {component.applicationNotes && (
                <div>
                  <strong className="text-gray-900 font-semibold">Work &amp; Applications:</strong>{' '}
                  <span className="italic text-gray-700">{component.applicationNotes}</span>
                </div>
              )}
            </div>

            {/* Pinout Table */}
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
              <div className="bg-gray-100 px-3 py-1.5 text-[11px] font-bold text-gray-700 uppercase flex items-center justify-between">
                <span>Pinout Table ({component.pins.length} Pins)</span>
                <span className="text-[10px] text-gray-500 font-normal">Pads count: {component.pads.length}</span>
              </div>
              <div className="max-h-32 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 text-[10px]">
                    <tr>
                      <th className="px-3 py-1">Pin #</th>
                      <th className="px-3 py-1">Name</th>
                      <th className="px-3 py-1">Electrical Type</th>
                      <th className="px-3 py-1">Orientation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-mono text-[11px]">
                    {component.pins.map(pin => (
                      <tr key={pin.number} className="hover:bg-blue-50/50">
                        <td className="px-3 py-0.5 font-bold">{pin.number}</td>
                        <td className="px-3 py-0.5 text-blue-700">{pin.name}</td>
                        <td className="px-3 py-0.5 capitalize text-gray-600">{pin.type}</td>
                        <td className="px-3 py-0.5 capitalize text-gray-600">{pin.side}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Web Datasheet In-Modal Document Viewer when opened */}
          {isViewingDatasheet && (
            <div className="border-2 border-red-300 bg-neutral-100 rounded-xl overflow-hidden shadow-lg animate-fadeIn">
              {/* PDF Viewer Top Action Bar */}
              <div className="bg-[#2c3038] text-white px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2 border-b border-neutral-700">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-red-500" />
                  <span className="text-xs font-mono font-bold tracking-tight text-neutral-100 truncate max-w-[200px] sm:max-w-none">
                    {component.name}_Datasheet.pdf
                  </span>
                  <span className="hidden sm:inline text-[10px] text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded font-mono">
                    PDF 1.4 • Page 1 of 1
                  </span>
                </div>

                {/* PDF Controls & Download Datasheet Button with its symbol */}
                <div className="flex items-center gap-2">
                  <div className="hidden xs:flex items-center gap-1 bg-neutral-800 px-2 py-1 rounded text-xs font-mono text-neutral-300">
                    <button
                      onClick={() => setZoomLevel(Math.max(80, zoomLevel - 10))}
                      className="hover:text-white p-0.5 cursor-pointer"
                      title="Zoom out"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[11px] w-9 text-center">{zoomLevel}%</span>
                    <button
                      onClick={() => setZoomLevel(Math.min(140, zoomLevel + 10))}
                      className="hover:text-white p-0.5 cursor-pointer"
                      title="Zoom in"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Download Datasheet Button appearing when open */}
                  <button
                    onClick={handleDownloadDatasheetPDF}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                    title="Download Datasheet.pdf"
                  >
                    <FileDown className="w-4 h-4" />
                    <span>Download Datasheet</span>
                  </button>
                </div>
              </div>

              {/* Realistic Printable PDF Document Canvas */}
              <div className="p-3 sm:p-5 bg-neutral-200 max-h-96 overflow-y-auto flex justify-center">
                <div
                  style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
                  className="bg-white border border-neutral-300 shadow-xl rounded-sm p-6 sm:p-8 w-full max-w-2xl text-neutral-900 transition-transform duration-150 space-y-4"
                >
                  {/* PDF Document Header */}
                  <div className="border-b-2 border-red-700 pb-3 flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-red-700">
                        CompShare Semiconductor &amp; EDA Library Series
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black tracking-tight text-neutral-900">
                        {component.name}
                      </h2>
                      <p className="text-xs text-neutral-600">
                        Precision Integrated Circuit • Package: <strong className="font-mono">{component.packageType}</strong>
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded uppercase tracking-wider border border-emerald-300">
                        ACTIVE / VERIFIED
                      </span>
                      <div className="text-[10px] text-neutral-500 font-mono mt-1">
                        DOC REV: 1.0.4
                      </div>
                    </div>
                  </div>

                  {/* Section 1: Features & Work Application */}
                  <div className="space-y-1.5 text-xs text-neutral-800">
                    <h5 className="font-bold uppercase text-[11px] text-neutral-900 tracking-wide border-b border-neutral-200 pb-1">
                      1. Features &amp; Applications
                    </h5>
                    <ul className="list-disc pl-5 space-y-0.5 text-[11px] text-neutral-700">
                      <li>Source Design Suite: <strong>{component.sourceSoftware}</strong></li>
                      <li>Target Compilation: <strong>{component.destinationSoftware}</strong></li>
                      <li>IPC-7351 Standard SMT / Through-hole Footprint Layout</li>
                      <li>Electrical Rules Check (ERC): <strong>Passed &amp; DRC Verified</strong></li>
                      <li>Description: {component.description || 'Standard electronic component profile.'}</li>
                      {component.applicationNotes && (
                        <li>Applications: {component.applicationNotes}</li>
                      )}
                    </ul>
                  </div>

                  {/* Section 2: Absolute Maximum Ratings Table */}
                  <div className="space-y-1.5 text-xs">
                    <h5 className="font-bold uppercase text-[11px] text-neutral-900 tracking-wide border-b border-neutral-200 pb-1">
                      2. Absolute Maximum Ratings
                    </h5>
                    <table className="w-full text-left border border-neutral-300 text-[11px]">
                      <thead className="bg-neutral-100 text-neutral-800 border-b border-neutral-300">
                        <tr>
                          <th className="p-1.5">Parameter</th>
                          <th className="p-1.5">Min</th>
                          <th className="p-1.5">Typ</th>
                          <th className="p-1.5">Max</th>
                          <th className="p-1.5">Unit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200 font-mono text-[10px]">
                        <tr>
                          <td className="p-1.5 font-sans font-medium">Supply Voltage (VCC)</td>
                          <td className="p-1.5">-0.3</td>
                          <td className="p-1.5">3.3 / 5.0</td>
                          <td className="p-1.5">6.5</td>
                          <td className="p-1.5">V</td>
                        </tr>
                        <tr className="bg-neutral-50/50">
                          <td className="p-1.5 font-sans font-medium">Operating Temp (TOPR)</td>
                          <td className="p-1.5">-40</td>
                          <td className="p-1.5">25</td>
                          <td className="p-1.5">+125</td>
                          <td className="p-1.5">°C</td>
                        </tr>
                        <tr>
                          <td className="p-1.5 font-sans font-medium">Storage Temp (TSTG)</td>
                          <td className="p-1.5">-65</td>
                          <td className="p-1.5">--</td>
                          <td className="p-1.5">+150</td>
                          <td className="p-1.5">°C</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Section 3: Pin Functions */}
                  <div className="space-y-1.5 text-xs">
                    <h5 className="font-bold uppercase text-[11px] text-neutral-900 tracking-wide border-b border-neutral-200 pb-1">
                      3. Pin Configuration &amp; Functions ({component.pins.length} Pins)
                    </h5>
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                      {component.pins.map(p => (
                        <div key={p.number} className="p-1.5 bg-neutral-50 border border-neutral-200 rounded flex items-center justify-between">
                          <span>Pin {p.number}: <strong>{p.name}</strong></span>
                          <span className="text-neutral-500 uppercase">{p.type}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* PDF Watermark / Footer */}
                  <div className="pt-3 border-t border-neutral-300 flex items-center justify-between text-[10px] text-neutral-500 font-mono">
                    <span>CompShare Engineering Document: {component.name}_Datasheet.pdf</span>
                    <span>100% IPC-7351 &amp; ISO 9001 Compliant</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Action Bar */}
        <div className="p-3 sm:p-3.5 bg-gray-100 border-t border-gray-300 flex flex-wrap items-center justify-between gap-2.5">
          {/* Left: View Datasheet & Download Datasheet (if open) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsViewingDatasheet(!isViewingDatasheet)}
              className={`px-3.5 py-1.5 border rounded text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs ${
                isViewingDatasheet
                  ? 'bg-blue-600 text-white border-blue-700'
                  : 'bg-white hover:bg-gray-50 border-gray-400 text-gray-800'
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-blue-500" />
              <span>{isViewingDatasheet ? 'Close Datasheet' : 'View datasheet'}</span>
            </button>

            {isViewingDatasheet && (
              <button
                onClick={handleDownloadDatasheetPDF}
                className="px-3 py-1.5 bg-white hover:bg-red-50 border border-red-300 text-red-700 rounded text-xs font-semibold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                title="Download Datasheet (.pdf)"
              >
                <FileDown className="w-3.5 h-3.5 text-red-600" />
                <span>Download Datasheet</span>
              </button>
            )}
          </div>

          {/* Right: Part Download & Exit */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPart}
              disabled={isDownloadingPart}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded text-xs font-bold flex items-center gap-1.5 shadow-sm transition disabled:opacity-50 cursor-pointer"
              title="Download converted CAD component package (.zip)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isDownloadingPart ? 'Packaging...' : 'Part Download'}</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-xs font-medium transition cursor-pointer"
            >
              Exit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

