import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, ArrowRight, Shield } from 'lucide-react';
import { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  currentUser: UserProfile;
  gateReason?: 'first_time' | 'session_expired' | 'manual';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  currentUser,
  gateReason = 'manual',
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'signin' | 'signup'>(
    gateReason === 'first_time' ? 'signup' : 'signin'
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [step, setStep] = useState<'credentials' | '2fa'>('credentials');
  const [pendingUser, setPendingUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (gateReason === 'first_time') {
      setMode('signup');
    } else if (gateReason === 'session_expired') {
      setMode('signin');
    }
  }, [gateReason]);

  const handleOAuthLogin = (provider: 'google' | 'apple') => {
    const newUser: UserProfile = {
      id: `usr_${provider}_${Date.now()}`,
      fullName: provider === 'google' ? 'Robert N. (Google User)' : 'Apple Engineer',
      email: provider === 'google' ? 'robertngambi303@gmail.com' : 'engineer@icloud.com',
      phoneNumber: '+1 (555) 729-3841',
      companyName: 'Silicon Hardware Labs',
      country: 'United States',
      avatarUrl: '',
      lastLoginTimestamp: Date.now(),
      provider: provider,
    };

    setPendingUser(newUser);
    setStep('2fa');
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    const newUser: UserProfile = {
      id: `usr_email_${Date.now()}`,
      fullName: fullName || email.split('@')[0],
      email: email,
      phoneNumber: '+1 (555) 382-9471',
      companyName: 'EDA Engineering Labs',
      country: 'United States',
      avatarUrl: '',
      lastLoginTimestamp: Date.now(),
      provider: 'email',
    };

    setPendingUser(newUser);
    setStep('2fa');
  };

  const handleVerify2FA = (e: React.FormEvent) => {
    e.preventDefault();
    if (pendingUser) {
      onLoginSuccess(pendingUser);
      setStep('credentials');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="relative w-full max-w-md bg-white border-2 border-gray-400 rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-4 bg-gray-50 border-b border-gray-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/assets/aistudio/UI._07_efa59c02.PNG"
              alt="CompShare Logo"
              className="h-8 object-contain"
            />
            <span className="text-xs font-bold text-gray-700">Account Access</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body without extra contexts */}
        <div className="p-6">
          {step === 'credentials' ? (
            <>
              {/* Tab Switcher */}
              <div className="flex bg-gray-100 p-1 rounded-lg mb-5 border border-gray-300">
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md transition cursor-pointer ${
                    mode === 'signin'
                      ? 'bg-white text-gray-900 shadow-xs'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md transition cursor-pointer ${
                    mode === 'signup'
                      ? 'bg-white text-gray-900 shadow-xs'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* 2-Way Google & Apple OAuth Buttons */}
              <div className="space-y-2 mb-4">
                <button
                  type="button"
                  onClick={() => handleOAuthLogin('google')}
                  className="w-full py-2 px-3 border border-gray-300 hover:bg-gray-50 rounded-lg text-xs font-semibold text-gray-800 flex items-center justify-center gap-2.5 transition shadow-2xs cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  Continue with Google
                </button>

                <button
                  type="button"
                  onClick={() => handleOAuthLogin('apple')}
                  className="w-full py-2 px-3 bg-black hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2.5 transition shadow-2xs cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 170 170">
                    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.69-7.85-12.01-14.42-6.19-9.47-11.1-20.48-14.75-33.02-3.65-12.55-5.48-24.13-5.48-34.76 0-14.36 3.65-26.04 10.96-35.04 7.31-9 16.48-13.62 27.52-13.88 4.58 0 9.87 1.25 15.86 3.75 6 2.5 10.15 3.86 12.44 4.08 2.83-.33 7.15-1.74 12.98-4.23 5.82-2.5 10.74-3.65 14.75-3.46 13.91.76 24.62 5.76 32.13 15-12.18 7.39-18.17 17.5-17.96 30.33.22 10.22 4.13 18.7 11.74 25.43 7.61 6.74 16.52 10.65 26.74 11.74-2.17 6.74-4.78 13.37-7.83 19.89zM119.22 31.09c0-7.39 2.61-14.35 7.83-20.87C132.27 3.7 138.8.11 146.63 0c.22 1.3.33 2.5.33 3.59 0 7.39-2.72 14.46-8.15 21.19-5.43 6.74-12.06 10.43-19.59 11.08-.22-1.52-.33-2.61-.33-4.77z" />
                  </svg>
                  Continue with Apple
                </button>
              </div>

              {/* Divider */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-white px-2 text-gray-500 font-semibold">Or with Email</span>
                </div>
              </div>

              {/* Email Form */}
              <form onSubmit={handleEmailSubmit} className="space-y-3">
                {mode === 'signup' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        placeholder="John Doe"
                        required
                        className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="engineer@domain.com"
                      required
                      className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#0066cc] hover:bg-[#0052a3] text-white rounded-lg text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>{mode === 'signin' ? 'Sign In & Verify' : 'Create Account'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </>
          ) : (
            /* 2FA Verification Step */
            <form onSubmit={handleVerify2FA} className="space-y-4">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Shield className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-gray-900">2-Way Security Verification</h4>
                <p className="text-xs text-gray-600">
                  Enter 6-digit confirmation token sent to{' '}
                  <strong className="text-gray-900">{pendingUser?.email}</strong>
                </p>
              </div>

              <div>
                <input
                  type="text"
                  maxLength={6}
                  value={twoFactorCode}
                  onChange={e => setTwoFactorCode(e.target.value)}
                  placeholder="123456"
                  required
                  className="w-full py-2.5 text-center text-lg font-mono font-bold tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep('credentials')}
                  className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium transition cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  Confirm &amp; Log In
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
