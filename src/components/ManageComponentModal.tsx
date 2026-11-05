import React, { useState, useRef } from 'react';
import { X, Image as ImageIcon, FileUp, Save, Folder, Check, Trash2 } from 'lucide-react';
import { ElectronicComponent } from '../types';

interface ManageComponentModalProps {
  component: ElectronicComponent | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: ElectronicComponent) => void;
}

export const ManageComponentModal: React.FC<ManageComponentModalProps> = ({
  component,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen || !component) return null;

  const [details, setDetails] = useState(component.description || '');
  const [appNotes, setAppNotes] = useState(component.applicationNotes || '');
  const [customImage, setCustomImage] = useState<string | undefined>(component.customImage);
  const [datasheetName, setDatasheetName] = useState(component.datasheetName || '');
  const [isSaved, setIsSaved] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const datasheetInputRef = useRef<HTMLInputElement>(null);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCustomImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDatasheetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDatasheetName(file.name);
    }
  };

  const handleSave = () => {
    const updated: ElectronicComponent = {
      ...component,
      description: details,
      applicationNotes: appNotes,
      customImage: customImage,
      datasheetName: datasheetName,
    };
    onSave(updated);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white border-2 border-gray-400 rounded-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-gray-300 flex items-center justify-between bg-gray-50">
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
              Manage Component
            </span>
            <h3 className="text-lg font-bold text-gray-900 font-mono">
              {component.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Component Visual / Folder Preview */}
          <div className="flex items-center gap-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
            <div className="w-16 h-16 rounded border border-gray-300 bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
              {customImage ? (
                <img src={customImage} alt={component.name} className="w-full h-full object-cover" />
              ) : (
                <Folder className="w-10 h-10 text-amber-500 fill-amber-400" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-600 mb-1">
                Component Thumbnail (replaces folder icon in library):
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={imageInputRef}
                  onChange={handleImageFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold rounded flex items-center gap-1.5 shadow-xs transition"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  Add Image
                </button>

                {customImage && (
                  <button
                    type="button"
                    onClick={() => setCustomImage(undefined)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded text-xs transition"
                    title="Remove custom image and reset to folder"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Add Component Details */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
              Add Component Details:
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Add details or description about the component, its work, and applications (does not alter CAD pinout):
            </p>
            <textarea
              value={details}
              onChange={e => setDetails(e.target.value)}
              rows={3}
              placeholder="e.g. Synchronous step-up converter for single-cell Li-ion batteries..."
              className="w-full p-2.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          {/* Application Notes */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
              Work & Application Notes:
            </label>
            <textarea
              value={appNotes}
              onChange={e => setAppNotes(e.target.value)}
              rows={2}
              placeholder="e.g. Used in wearable sensors, smart meters, Bluetooth low energy nodes..."
              className="w-full p-2.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          {/* Upload Datasheet */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
              Upload Datasheet:
            </label>
            <input
              type="file"
              ref={datasheetInputRef}
              onChange={handleDatasheetChange}
              accept=".pdf,.doc,.docx,.txt"
              className="hidden"
            />
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => datasheetInputRef.current?.click()}
                className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-400 text-gray-800 text-xs font-semibold rounded flex items-center gap-1.5 transition"
              >
                <FileUp className="w-4 h-4 text-gray-700" />
                Upload Datasheet
              </button>
              <span className="text-xs text-gray-600 font-mono truncate max-w-xs">
                {datasheetName || 'No datasheet uploaded yet'}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-gray-100 border-t border-gray-300 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-xs font-medium transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
          >
            {isSaved ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                Saved!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
