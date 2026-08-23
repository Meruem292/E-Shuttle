import React, { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useBackHandler } from '../../contexts/NativeBackContext';
import officialLogo from '../../images/official_logo.jpg';
import scsLogo from '../../images/scs_logo.jpg';
import cctLogo from '../../images/cct_logo.jpg';

export const AuthModal: React.FC = () => {
  const { signIn, signInAdmin, signUpCustomer, signUpDriver, resetPassword } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'admin_login'>('login');
  const [roleSelection, setRoleSelection] = useState<'customer' | 'driver'>('customer');

  // Discrete 5-tap gesture state for Admin Portal access
  const [logoTapCount, setLogoTapCount] = useState<number>(0);
  const tapTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogoTap = () => {
    if (tapTimerRef.current) {
      clearTimeout(tapTimerRef.current);
    }

    const nextCount = logoTapCount + 1;

    if (nextCount >= 5) {
      setLogoTapCount(0);
      if (mode === 'admin_login') {
        setMode('login');
        setErrorMsg(null);
        setSuccessMsg(null);
      } else {
        setMode('admin_login');
        setErrorMsg(null);
        setSuccessMsg(null);
      }
    } else {
      setLogoTapCount(nextCount);
      tapTimerRef.current = setTimeout(() => {
        setLogoTapCount(0);
      }, 2500);
    }
  };

  // Handle native back button inside Auth views (returns to login)
  useBackHandler(
    mode !== 'login',
    () => {
      setMode('login');
      setErrorMsg(null);
      setSuccessMsg(null);
      return true;
    },
    15,
    'auth-mode'
  );

  // Form fields
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Translate Firebase error codes to readable messages
  const formatFirebaseError = (err: any): string => {
    if (err?.message?.includes('Access Denied')) {
      return err.message;
    }
    const code = err?.code || '';
    switch (code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'Invalid email or password. Please check your login credentials.';
      case 'auth/email-already-in-use':
        return 'An account with this email address already exists. Try signing in instead.';
      case 'auth/weak-password':
        return 'Password is too weak. Please use at least 6 characters.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/too-many-requests':
        return 'Too many failed login attempts. Please try again in a few minutes.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your internet connection.';
      default:
        return err?.message || 'Authentication failed. Please try again.';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await signIn(email, password);
      } else if (mode === 'admin_login') {
        await signInAdmin(email, password);
      } else if (mode === 'register') {
        if (roleSelection === 'customer') {
          await signUpCustomer(fullName, email, phone, password);
        } else if (roleSelection === 'driver') {
          await signUpDriver(fullName, email, phone, password);
        }
      } else if (mode === 'forgot') {
        if (!email) {
          setErrorMsg('Please enter your account email address.');
          setLoading(false);
          return;
        }
        await resetPassword(email);
        setSuccessMsg(`Password reset link sent to ${email}. Check your email inbox!`);
      }
    } catch (err: any) {
      console.error('Firebase Auth error:', err);
      setErrorMsg(formatFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0D47A1]/25 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border-2 border-[#0D47A1] rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl my-auto text-[#0D47A1]">
        {/* Header Branding */}
        {mode === 'admin_login' ? (
          <div className="text-center space-y-2">
            <div className="relative inline-block cursor-pointer" onClick={handleLogoTap}>
              <img
                src={officialLogo}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/official_logo.jpg';
                }}
                alt="E-Shuttle Official Logo"
                className="w-16 h-16 rounded-2xl object-cover shadow-lg border-2 border-[#0D47A1] mx-auto active:scale-90 transition-transform"
              />
              <span className="absolute -bottom-1 -right-1 bg-[#0D47A1] text-white text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider shadow">
                ADMIN
              </span>
            </div>
            <h2 className="text-xl font-black text-[#0D47A1]">Admin Portal</h2>
            <p className="text-xs text-slate-500 font-medium">E-Shuttle Operations & Control System</p>
          </div>
        ) : (
          <div className="text-center space-y-2">
            <div className="relative inline-block cursor-pointer" onClick={handleLogoTap}>
              <img
                src={officialLogo}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/official_logo.jpg';
                }}
                alt="E-Shuttle Official Logo"
                className="w-16 h-16 rounded-2xl object-cover shadow-lg border-2 border-[#0D47A1] mx-auto active:scale-90 transition-transform"
              />
            </div>
            <h2 className="text-xl font-black text-[#0D47A1]">E-Shuttle</h2>
            <p className="text-xs text-slate-500 font-medium">Urban E-Shuttle Transit Service</p>
          </div>
        )}

        {/* Toggle Login vs Register (Hidden when in Forgot or Admin mode) */}
        {mode !== 'forgot' && mode !== 'admin_login' && (
          <div className="flex bg-[#E3F2FD] p-1 rounded-2xl border border-[#0D47A1]/40">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                mode === 'login'
                  ? 'bg-[#0D47A1] text-white shadow-md'
                  : 'text-[#0D47A1]/80 hover:text-[#0D47A1]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                mode === 'register'
                  ? 'bg-[#0D47A1] text-white shadow-md'
                  : 'text-[#0D47A1]/80 hover:text-[#0D47A1]'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Admin Banner Indicator */}
        {mode === 'admin_login' && (
          <div className="p-3 bg-[#E3F2FD] border border-[#0D47A1] rounded-2xl text-[#0D47A1] text-xs">
            <b className="text-[#0D47A1] block font-bold">Restricted Admin Access</b>
            System administrators only.
          </div>
        )}

        {/* Forgot Password Header Back Button */}
        {mode === 'forgot' && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className="px-2.5 py-1 text-xs text-white bg-[#0D47A1] hover:bg-[#1565C0] border border-[#0D47A1] rounded-xl transition-colors font-bold uppercase"
            >
              Back
            </button>
            <span className="text-sm font-bold text-[#0D47A1]">Reset Password</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded-xl font-medium">
            {successMsg}
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-300 text-rose-700 text-xs rounded-xl text-center font-medium">
            {errorMsg}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'register' && (
            <>
              {/* Role Selection */}
              <div className="grid grid-cols-2 gap-2 pb-1">
                <button
                  type="button"
                  onClick={() => setRoleSelection('customer')}
                  title="Create an account to request E-Shuttle pick-ups"
                  className={`p-2.5 rounded-xl border-2 text-xs font-bold transition-all ${
                    roleSelection === 'customer'
                      ? 'bg-[#0D47A1] border-[#0D47A1] text-white shadow-sm'
                      : 'bg-white border-[#0D47A1] text-[#0D47A1] hover:bg-[#E3F2FD]/50'
                  }`}
                >
                  User Account
                </button>
                <button
                  type="button"
                  onClick={() => setRoleSelection('driver')}
                  title="Create a driver account to operate E-Shuttle vehicles"
                  className={`p-2.5 rounded-xl border-2 text-xs font-bold transition-all ${
                    roleSelection === 'driver'
                      ? 'bg-[#0D47A1] border-[#0D47A1] text-white shadow-sm'
                      : 'bg-white border-[#0D47A1] text-[#0D47A1] hover:bg-[#E3F2FD]/50'
                  }`}
                >
                  E-Shuttle Driver
                </button>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#0D47A1]">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maria Santos"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full mt-1 bg-[#F8FAFC] border-2 border-[#0D47A1] rounded-xl p-2.5 text-xs text-[#0D47A1] placeholder-slate-400 focus:outline-none focus:border-[#1565C0] focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#0D47A1]">Mobile Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="+63 917 123 4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full mt-1 bg-[#F8FAFC] border-2 border-[#0D47A1] rounded-xl p-2.5 text-xs text-[#0D47A1] placeholder-slate-400 focus:outline-none focus:border-[#1565C0] focus:bg-white transition-colors"
                />
              </div>
            </>
          )}

          <div>
            <label className="text-[11px] font-bold text-[#0D47A1]">
              {mode === 'admin_login' ? 'Admin Email Address' : 'Email Address'}
            </label>
            <input
              type="email"
              required
              placeholder={mode === 'admin_login' ? 'admin@eshuttle.com' : 'user@example.com'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 bg-[#F8FAFC] border-2 border-[#0D47A1] rounded-xl p-2.5 text-xs text-[#0D47A1] placeholder-slate-400 focus:outline-none focus:border-[#1565C0] focus:bg-white transition-colors"
            />
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold text-[#0D47A1]">Password</label>
                {(mode === 'login' || mode === 'admin_login') && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className="text-[11px] text-[#0D47A1] hover:underline font-bold"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-1 bg-[#F8FAFC] border-2 border-[#0D47A1] rounded-xl p-2.5 text-xs text-[#0D47A1] placeholder-slate-400 focus:outline-none focus:border-[#1565C0] focus:bg-white transition-colors"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            title={
              mode === 'admin_login'
                ? 'Sign in as system administrator'
                : mode === 'login'
                ? 'Sign into your account'
                : mode === 'register'
                ? 'Create a new account'
                : 'Send password reset link'
            }
            className="w-full py-3.5 text-white font-black text-xs rounded-2xl shadow-lg transition-all active:scale-95 mt-2 disabled:opacity-50 bg-[#0D47A1] hover:bg-[#1565C0] shadow-blue-900/25 uppercase tracking-wider"
          >
            {loading
              ? 'Verifying...'
              : mode === 'admin_login'
              ? 'Sign In (Admin)'
              : mode === 'login'
              ? 'Sign In'
              : mode === 'register'
              ? `Register ${roleSelection === 'customer' ? 'User' : 'Driver'}`
              : 'Reset Password'}
          </button>
        </form>

        {/* Return link when in Admin mode */}
        {mode === 'admin_login' && (
          <div className="border-t border-[#0D47A1]/40 pt-3 text-center">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              title="Return to user and driver login portal"
              className="text-xs text-[#0D47A1] hover:underline font-bold transition-colors"
            >
              Back to User / Driver Login
            </button>
          </div>
        )}

        {/* Partner / Institutional Accreditation Footer */}
        <div className="pt-2 border-t border-[#0D47A1]/30 flex items-center justify-center gap-4 opacity-85 hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-600 font-semibold">
            <img
              src={cctLogo}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/cct_logo.jpg';
              }}
              alt="CCT Logo"
              className="w-6 h-6 rounded-full object-cover border border-[#0D47A1]"
            />
            <span>CCT</span>
          </div>
          <div className="w-1 h-1 bg-[#0D47A1] rounded-full" />
          <div className="flex items-center gap-1.5 text-[10px] text-slate-600 font-semibold">
            <img
              src={scsLogo}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/scs_logo.jpg';
              }}
              alt="SCS Logo"
              className="w-6 h-6 rounded-full object-cover border border-[#0D47A1]"
            />
            <span>SCS</span>
          </div>
        </div>
      </div>
    </div>
  );
};
