import React, { useState, useRef } from 'react';
import { Camera, Check, User } from 'lucide-react';
import { UserProfile } from '../types';

interface ProfileViewProps {
  user: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user, onUpdateUser }) => {
  const [fullName, setFullName] = useState(user.fullName);
  const [email, setEmail] = useState(user.email);
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber);
  const [companyName, setCompanyName] = useState(user.companyName);
  const [country, setCountry] = useState(user.country);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);
  const [isSaved, setIsSaved] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...user,
      fullName,
      email,
      phoneNumber,
      companyName,
      country,
      avatarUrl,
    };
    onUpdateUser(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="flex-1 p-6 md:p-8 flex flex-col items-center justify-start overflow-y-auto">
      <form onSubmit={handleSave} className="w-full max-w-xl flex flex-col items-center">
        {/* Avatar Section matching UI._05_40df4b8a.PNG */}
        <div className="relative mb-6">
          <div className="w-28 h-28 rounded-full bg-gray-400 overflow-hidden flex items-center justify-center border-4 border-white shadow-md">
            {avatarUrl ? (
              <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
            ) : (
              <User className="w-16 h-16 text-gray-200 fill-gray-200" />
            )}
          </div>

          {/* Camera Badge */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-1 right-1 p-2 bg-gray-700/80 hover:bg-gray-800 text-white rounded-full shadow-md transition"
            title="Upload profile picture"
          >
            <Camera className="w-4 h-4" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAvatarChange}
            accept="image/*"
            className="hidden"
          />

          {/* Edit Badge next to avatar as in screenshot */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute -right-16 top-6 px-3 py-1 bg-amber-200 hover:bg-amber-300 text-amber-900 text-xs font-semibold rounded-full shadow-xs transition"
          >
            Edit
          </button>
        </div>

        {/* Input Fields with pill-like borders */}
        <div className="w-full space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1 ml-1">
              Full name :
            </label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              required
              className="w-full px-4 py-2 bg-white border border-gray-400 rounded-full text-sm text-gray-900 shadow-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1 ml-1">
              Email :
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 bg-white border border-gray-400 rounded-full text-sm text-gray-900 shadow-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1 ml-1">
              Phone number :
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={e => setPhoneNumber(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-gray-400 rounded-full text-sm text-gray-900 shadow-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1 ml-1">
              Company name :
            </label>
            <input
              type="text"
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-gray-400 rounded-full text-sm text-gray-900 shadow-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1 ml-1">
              Country :
            </label>
            <input
              type="text"
              value={country}
              onChange={e => setCountry(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-gray-400 rounded-full text-sm text-gray-900 shadow-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          {/* Account Role Card (Display status only - activated via passcode) */}
          <div className="p-3.5 bg-gray-50 border border-gray-300 rounded-2xl flex items-center justify-between gap-3 shadow-2xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-800">Account Access Role:</span>
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                    user.role === 'admin'
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {user.role === 'admin' ? '🛡️ Administrator (Active)' : 'Standard User'}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 mt-0.5">
                {user.role === 'admin'
                  ? 'Active: Unlocks AI Datasheet specifications generator bot and universal Edit on all libraries.'
                  : 'Standard: View-only access on community libraries; Edit access on personal library.'}
              </p>
            </div>
          </div>
        </div>

        {/* Big Blue SAVE Button */}
        <div className="w-full flex justify-end mt-6">
          <button
            type="submit"
            className="px-8 py-2.5 bg-[#0066cc] hover:bg-[#0052a3] active:bg-[#004080] text-white text-sm font-bold tracking-wider rounded-lg shadow-md transition flex items-center gap-2"
          >
            {isSaved ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                SAVED
              </>
            ) : (
              'SAVE'
            )}
          </button>
        </div>

        {/* Session Info */}
        <div className="mt-8 text-center text-xs text-gray-500">
          Logged in via <span className="capitalize font-semibold text-gray-700">{user.provider}</span>.
          Session valid for 7 days from last visit.
        </div>
      </form>
    </div>
  );
};
