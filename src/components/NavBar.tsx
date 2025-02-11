import React, { useState, useEffect } from 'react';
import { Music2, PenTool, LogIn, LogOut, User, Menu, X, Sun, Moon, FileText, Users, LayoutDashboard, BookOpen } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { AuthModal } from './auth/AuthModal';
import { useNavigate } from 'react-router-dom';
import { useTheme } from './ThemeProvider';

export function NavBar() {
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    if (signingOut) return;

    try {
      setSigningOut(true);
      localStorage.clear();
      setSession(null);
      setIsOpen(false);

      await supabase.auth.signOut({
        scope: 'local'
      });

      navigate('/sign-out', { replace: true });
    } catch (error) {
      console.error('Error during sign out cleanup:', error);
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <>
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-12 h-12 flex items-center justify-center bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-full shadow-lg hover:bg-white/80 dark:hover:bg-gray-800/80 transition-colors"
        >
          {isOpen ? (
            <X className="w-6 h-6 text-gray-600 dark:text-gray-200" />
          ) : (
            <Menu className="w-6 h-6 text-gray-600 dark:text-gray-200" />
          )}
        </button>

        <div
          className={`absolute top-16 left-0 backdrop-blur-md bg-white/70 dark:bg-gray-800/70 rounded-2xl shadow-lg p-2 flex flex-col space-y-2 transition-all duration-200 origin-top-left w-[220px] ${
            isOpen
              ? 'opacity-100 scale-100 translate-y-0'
              : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
          }`}
        >
          {session ? (
            <>
              <button
                onClick={() => {
                  navigate('/dashboard');
                  setIsOpen(false);
                }}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl transition-colors hover:bg-gray-100/70 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-200 w-full text-left"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="text-sm font-medium">Dashboard</span>
              </button>

              <button
                onClick={() => {
                  navigate('/create');
                  setIsOpen(false);
                }}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl transition-colors hover:bg-gray-100/70 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-200 w-full text-left"
              >
                <Music2 className="w-4 h-4" />
                <span className="text-sm font-medium">Create Split Sheet</span>
              </button>

              <button
                onClick={() => {
                  navigate('/my-split-sheets');
                  setIsOpen(false);
                }}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl transition-colors hover:bg-gray-100/70 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-200 w-full text-left"
              >
                <FileText className="w-4 h-4" />
                <span className="text-sm font-medium">My Split Sheets</span>
              </button>

              <button
                onClick={() => {
                  navigate('/my-collaborations');
                  setIsOpen(false);
                }}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl transition-colors hover:bg-gray-100/70 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-200 w-full text-left"
              >
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">My Collaborations</span>
              </button>

              <button
                onClick={() => {
                  navigate('/blog');
                  setIsOpen(false);
                }}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl transition-colors hover:bg-gray-100/70 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-200 w-full text-left"
              >
                <BookOpen className="w-4 h-4" />
                <span className="text-sm font-medium">Blog</span>
              </button>

              <div className="w-full h-px bg-gray-200 dark:bg-gray-700" />

              <button
                onClick={() => {
                  navigate('/profile');
                  setIsOpen(false);
                }}
                className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-200 hover:bg-gray-100/70 dark:hover:bg-gray-700/50 rounded-xl w-full text-left"
              >
                <User className="w-4 h-4" />
                <span className="font-medium truncate max-w-[140px]">
                  {session.user.email}
                </span>
              </button>

              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl transition-colors hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-300 hover:text-red-700 dark:hover:text-red-200 disabled:opacity-50 w-full text-left"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {signingOut ? 'Signing out...' : 'Sign Out'}
                </span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  navigate('/blog');
                  setIsOpen(false);
                }}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl transition-colors hover:bg-gray-100/70 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-200 w-full text-left"
              >
                <BookOpen className="w-4 h-4" />
                <span className="text-sm font-medium">Blog</span>
              </button>

              <button
                onClick={() => {
                  setShowAuthModal(true);
                  setIsOpen(false);
                }}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-200 hover:text-blue-700 dark:hover:text-blue-100"
              >
                <LogIn className="w-4 h-4" />
                <span className="text-sm font-medium">Sign In</span>
              </button>
            </>
          )}
        </div>
      </div>

      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 z-50 w-12 h-12 flex items-center justify-center bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-full shadow-lg hover:bg-white/80 dark:hover:bg-gray-800/80 transition-colors"
        aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      >
        {theme === 'light' ? (
          <Moon className="w-6 h-6 text-gray-600 dark:text-gray-200" />
        ) : (
          <Sun className="w-6 h-6 text-gray-200" />
        )}
      </button>

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => setShowAuthModal(false)}
        />
      )}
    </>
  );
}