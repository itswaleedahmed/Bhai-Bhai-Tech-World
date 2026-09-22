import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, UserCheck, Sparkles, LogOut, CheckCircle, Lock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SUPER_ADMIN_EMAIL } from '../lib/firebase';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    user,
    userProfile,
    isAuthLoading,
    isSuperAdmin,
    isAdmin,
    loginWithGoogle,
    logout,
    setCurrentPage,
  } = useApp();

  if (!isAuthModalOpen) return null;

  return (
    <AnimatePresence>
      <div
        id="auth-modal-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={() => setIsAuthModalOpen(false)}
      >
        <motion.div
          id="auth-modal-dialog"
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="bg-[#121316] border border-white/10 rounded-2xl w-full max-w-md max-h-[92vh] overflow-y-auto p-6 sm:p-7 shadow-2xl relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top glow accent */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-24 bg-[#25D366]/20 blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            id="btn-close-auth-modal"
            type="button"
            onClick={() => setIsAuthModalOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Close authentication modal"
          >
            <X className="w-5 h-5" />
          </button>

          {user ? (
            /* Logged In State */
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                {user.photoURL ? (
                  <img
                    referrerPolicy="no-referrer"
                    src={user.photoURL}
                    alt={user.displayName || 'User Avatar'}
                    className="w-14 h-14 rounded-full border-2 border-[#25D366] object-cover"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-[#25D366]/20 text-[#25D366] font-bold text-xl flex items-center justify-center border border-[#25D366]/40">
                    {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-bold text-lg text-white">
                      {user.displayName || 'Customer'}
                    </h3>
                    {isSuperAdmin && (
                      <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Store Owner
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400">{user.email}</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-[#25D366]" />
                    Authenticated via Firebase
                  </p>
                </div>
              </div>

              {/* Special Owner Notice if logged in with itswaleedahmed@gmail.com */}
              {isSuperAdmin && (
                <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-3.5 space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Super Admin Permissions Active</span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Access granted for <span className="font-mono text-emerald-300">{SUPER_ADMIN_EMAIL}</span>. You can manage inventory, prices, orders, and inquiries.
                  </p>
                  <button
                    id="btn-goto-admin-from-modal"
                    type="button"
                    onClick={() => {
                      setIsAuthModalOpen(false);
                      setCurrentPage('admin');
                    }}
                    className="w-full mt-2 py-2 px-3 bg-[#25D366] hover:bg-[#20ba5a] text-black font-bold text-xs uppercase tracking-wider rounded-lg transition-all shadow-[0_0_15px_rgba(37,211,102,0.3)] flex items-center justify-center gap-2"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Open Admin Desk</span>
                  </button>
                </div>
              )}

              {/* Action buttons */}
              <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
                <button
                  id="btn-goto-my-account"
                  type="button"
                  onClick={() => {
                    setIsAuthModalOpen(false);
                    setCurrentPage('my-account');
                  }}
                  className="w-full py-2.5 px-4 bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>View My Account & Orders</span>
                </button>

                <button
                  id="btn-logout"
                  type="button"
                  onClick={async () => {
                    await logout();
                    setIsAuthModalOpen(false);
                  }}
                  className="w-full py-2 px-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          ) : (
            /* Logged Out State */
            <div className="space-y-5">
              <div className="text-center space-y-1.5">
                <div className="w-12 h-12 rounded-2xl bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] flex items-center justify-center mx-auto mb-3 shadow-[0_0_20px_rgba(37,211,102,0.2)]">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h2 className="font-display font-black text-xl text-white uppercase tracking-wide">
                  Sign In to Bhai Bhai
                </h2>
                <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                  Sign in with your Google account to track orders, save PC builds, and access store accounts.
                </p>
              </div>

              {/* Benefits list */}
              <div className="bg-white/5 border border-white/5 rounded-xl p-3.5 space-y-2 text-xs text-zinc-300">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Track orders and live delivery consignments</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#25D366] shrink-0" />
                  <span>Earn Bhai Bhai Reward points on every purchase</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-zinc-400">
                    Owner access for <span className="text-emerald-400 font-mono font-medium">{SUPER_ADMIN_EMAIL}</span>
                  </span>
                </div>
              </div>

              {/* Google Sign In Button */}
              <button
                id="btn-google-signin"
                type="button"
                disabled={isAuthLoading}
                onClick={loginWithGoogle}
                className="w-full py-3 px-4 bg-white hover:bg-zinc-100 text-zinc-900 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <p className="text-[11px] text-zinc-500 text-center">
                Secure authentication powered by Google Firebase.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
