import React, { useState, useRef } from 'react';
import {
  X,
  Image as ImageIcon,
  FileUp,
  Save,
  Folder,
  Check,
  Trash2,
  Sparkles,
  Bot,
  MessageSquare,
  Send,
  Shield,
  ShieldCheck,
  Loader2,
  FileText,
  AlertCircle
} from 'lucide-react';
import { ElectronicComponent } from '../types';
import {
  generateDetailsFromDatasheet,
  askDatasheetBot,
  DatasheetChatMessage
} from '../utils/aiDatasheetBot';

interface ManageComponentModalProps {
  component: ElectronicComponent | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: ElectronicComponent) => void;
  isAdmin?: boolean;
  onActivateAdmin?: () => void;
}

export const ManageComponentModal: React.FC<ManageComponentModalProps> = ({
  component,
  isOpen,
  onClose,
  onSave,
  isAdmin = false,
  onActivateAdmin,
}) => {
  if (!isOpen || !component) return null;

  const [details, setDetails] = useState(component.description || '');
  const [appNotes, setAppNotes] = useState(component.applicationNotes || '');
  const [customImage, setCustomImage] = useState<string | undefined>(component.customImage);
  const [datasheetName, setDatasheetName] = useState(component.datasheetName || '');
  const [isSaved, setIsSaved] = useState(false);

  // AI Bot state
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionSuccess, setExtractionSuccess] = useState(false);
  const [showChatBot, setShowChatBot] = useState(false);
  const [chatMessages, setChatMessages] = useState<DatasheetChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: `Hello! I am the CompShare Datasheet AI Assistant. Ask me anything about ${component.name}'s pinout, absolute ratings, or application circuits.`,
      timestamp: Date.now(),
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isBotResponding, setIsBotResponding] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const datasheetInputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

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

  // Admin AI Bot Extraction
  const handleGenerateDetailsWithBot = async () => {
    if (!isAdmin) return;
    setIsExtracting(true);
    setExtractionSuccess(false);

    try {
      const result = await generateDetailsFromDatasheet(component, datasheetName || `${component.name}_datasheet.pdf`);
      setDetails(result.description);
      setAppNotes(result.applicationNotes);
      setExtractionSuccess(true);
      setTimeout(() => setExtractionSuccess(false), 4000);
    } catch (err) {
      console.error('Extraction error:', err);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isBotResponding) return;

    const userMsg: DatasheetChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text: chatInput.trim(),
      timestamp: Date.now(),
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsBotResponding(true);

    try {
      const answer = await askDatasheetBot(userMsg.text, component, datasheetName);
      const botMsg: DatasheetChatMessage = {
        id: `bot_${Date.now()}`,
        sender: 'bot',
        text: answer,
        timestamp: Date.now(),
      };
      setChatMessages(prev => [...prev, botMsg]);
    } catch (err) {
      // fallback message
      setChatMessages(prev => [
        ...prev,
        {
          id: `bot_err_${Date.now()}`,
          sender: 'bot',
          text: `Error retrieving response from datasheet service. Please verify your connection or Gemini API key.`,
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsBotResponding(false);
      setTimeout(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white border-2 border-gray-400 rounded-xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-4 sm:px-5 py-3.5 border-b border-gray-300 flex items-center justify-between bg-gray-50 shrink-0">
          <div className="flex items-center gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                  Edit Component Details
                </span>
                {isAdmin ? (
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-amber-600" />
                    Admin Mode Active
                  </span>
                ) : (
                  <span className="text-[10px] bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                    Standard User
                  </span>
                )}
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 font-mono">
                {component.name}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {/* Component Visual / Folder Preview */}
          <div className="flex items-center gap-4 p-3 bg-gray-50 border border-gray-200 rounded-xl">
            <div className="w-16 h-16 rounded-lg border border-gray-300 bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
              {customImage ? (
                <img src={customImage} alt={component.name} className="w-full h-full object-cover" />
              ) : (
                <Folder className="w-10 h-10 text-amber-500 fill-amber-400" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-700 mb-1">
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
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Add Image</span>
                </button>

                {customImage && (
                  <button
                    type="button"
                    onClick={() => setCustomImage(undefined)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg text-xs transition cursor-pointer"
                    title="Remove custom image and reset to folder"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Upload Datasheet Section with AI Bot Generator Button */}
          <div className="p-3.5 bg-neutral-50 border border-gray-300 rounded-xl space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs font-bold text-gray-800 uppercase tracking-wide flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Component Datasheet</span>
              </label>

              {/* Datasheet Upload Input */}
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={datasheetInputRef}
                  onChange={handleDatasheetChange}
                  accept=".pdf,.doc,.docx,.txt"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => datasheetInputRef.current?.click()}
                  className="px-3 py-1 bg-white hover:bg-gray-100 border border-gray-300 text-gray-800 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
                >
                  <FileUp className="w-3.5 h-3.5 text-gray-600" />
                  <span>{datasheetName ? 'Replace Datasheet' : 'Upload Datasheet'}</span>
                </button>
              </div>
            </div>

            <div className="text-xs font-mono text-gray-600 bg-white p-2 rounded border border-gray-200 truncate">
              {datasheetName || 'No datasheet uploaded yet (Standard template available)'}
            </div>

            {/* AI Bot "Generate Details" Action - Restricted to Admin */}
            <div className="pt-2 border-t border-gray-200 flex flex-wrap items-center justify-between gap-2">
              {isAdmin ? (
                <div className="flex flex-wrap items-center gap-2 w-full justify-between">
                  <button
                    type="button"
                    onClick={handleGenerateDetailsWithBot}
                    disabled={isExtracting}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    title="Extract specifications and auto-fill details from datasheet using AI Bot"
                  >
                    {isExtracting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>AI Bot Extracting Specifications...</span>
                      </>
                    ) : (
                      <>
                        <Bot className="w-4 h-4 text-amber-300" />
                        <span>🤖 Generate Details (AI Bot)</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowChatBot(!showChatBot)}
                    className="px-3 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{showChatBot ? 'Close Datasheet Bot' : 'Ask Datasheet Bot'}</span>
                  </button>
                </div>
              ) : (
                /* Non-admin notice - no public button */
                <div className="flex items-center gap-1.5 w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600">
                  <Shield className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>Generate Details AI Bot is restricted to Administrator access.</span>
                </div>
              )}

              {extractionSuccess && (
                <div className="w-full text-xs text-emerald-700 font-semibold bg-emerald-50 p-2 rounded border border-emerald-200 flex items-center gap-1.5 animate-fadeIn">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Component details &amp; application notes automatically written and filled from datasheet!</span>
                </div>
              )}
            </div>

            {/* Interactive Datasheet Chat Bot Assistant when opened */}
            {isAdmin && showChatBot && (
              <div className="mt-3 bg-white border border-purple-200 rounded-xl p-3 shadow-inner space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between pb-1 border-b border-purple-100 text-xs font-bold text-purple-900">
                  <span className="flex items-center gap-1.5">
                    <Bot className="w-4 h-4 text-purple-600" />
                    Datasheet Assistant Chat
                  </span>
                  <span className="text-[10px] text-gray-500 font-normal">Real-time Technical Q&amp;A</span>
                </div>

                <div className="max-h-40 overflow-y-auto space-y-1.5 text-xs p-1">
                  {chatMessages.map(msg => (
                    <div
                      key={msg.id}
                      className={`p-2 rounded-lg max-w-[88%] text-[11px] leading-relaxed ${
                        msg.sender === 'user'
                          ? 'ml-auto bg-blue-600 text-white'
                          : 'mr-auto bg-gray-100 text-gray-900 border border-gray-200'
                      }`}
                    >
                      {msg.text}
                    </div>
                  ))}
                  {isBotResponding && (
                    <div className="mr-auto bg-gray-100 text-gray-600 p-2 rounded-lg text-xs flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-600" />
                      <span>Reading datasheet...</span>
                    </div>
                  )}
                  <div ref={chatBottomRef} />
                </div>

                <form onSubmit={handleSendChatMessage} className="flex gap-1.5 pt-1">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    placeholder="Ask about voltage, pinout, ratings..."
                    className="flex-1 px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                  <button
                    type="submit"
                    disabled={isBotResponding || !chatInput.trim()}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Add Component Details */}
          <div>
            <label className="block text-xs font-bold text-gray-800 uppercase tracking-wide mb-1">
              Component Details / Description:
            </label>
            <p className="text-[11px] text-gray-500 mb-1.5">
              Add details or description about the component, its function and electrical architecture:
            </p>
            <textarea
              value={details}
              onChange={e => setDetails(e.target.value)}
              rows={3}
              placeholder="e.g. Synchronous step-up converter for single-cell Li-ion batteries..."
              className="w-full p-2.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition font-sans"
            />
          </div>

          {/* Application Notes */}
          <div>
            <label className="block text-xs font-bold text-gray-800 uppercase tracking-wide mb-1">
              Work &amp; Application Notes:
            </label>
            <textarea
              value={appNotes}
              onChange={e => setAppNotes(e.target.value)}
              rows={2}
              placeholder="e.g. Used in wearable sensors, smart meters, Bluetooth low energy nodes..."
              className="w-full p-2.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition font-sans"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-gray-100 border-t border-gray-300 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-xs font-medium transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
          >
            {isSaved ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
