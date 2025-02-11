import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { SplitSheetForm } from './pages/SplitSheetForm';
import { SplitSheetView } from './pages/SplitSheetView';
import { MySplitSheets } from './pages/MySplitSheets';
import { SignSplitSheet } from './pages/SignSplitSheet';
import { UserProfile } from './pages/UserProfile';
import { AuthSuccess } from './components/auth/AuthSuccess';
import { MyCollaborations } from './pages/MyCollaborations';
import { SignOut } from './pages/SignOut';
import { SplashPage } from './pages/SplashPage';
import { Dashboard } from './pages/Dashboard';
import { Blog } from './pages/Blog';
import { BlogPost } from './pages/BlogPost';
import { BlogManagement } from './pages/BlogManagement';
import { BlogEditor } from './pages/BlogEditor';
import { usePageTracking } from './lib/analytics';
import { supabase } from './lib/supabase';
import { Loader2 } from 'lucide-react';
import { Footer } from './components/Footer';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  usePageTracking();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);

        // Only redirect if at root path and authenticated
        if (session && location.pathname === '/') {
          navigate('/dashboard', { replace: true });
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const isAuthed = !!session;
      setIsAuthenticated(isAuthed);

      // Only redirect on sign out or when at root path
      if (!isAuthed && !isPublicRoute(location.pathname)) {
        navigate('/', { replace: true });
      } else if (isAuthed && location.pathname === '/') {
        navigate('/dashboard', { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, location.pathname]);

  // Helper function to check if a route is public
  const isPublicRoute = (path: string) => {
    return ['/', '/blog', '/blog/'].some(route => path.startsWith(route));
  };

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-800 flex flex-col">
        <div className="flex items-center justify-center flex-grow">
          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading...</span>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Routes>
        <Route path="/" element={<SplashPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create" element={<SplitSheetForm />} />
        <Route path="/split-sheet/:id" element={<SplitSheetView />} />
        <Route path="/my-split-sheets" element={<MySplitSheets />} />
        <Route path="/my-collaborations" element={<MyCollaborations />} />
        <Route path="/sign-split-sheet" element={<SignSplitSheet />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/auth/success" element={<AuthSuccess />} />
        <Route path="/sign-out" element={<SignOut />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/blog/manage" element={<BlogManagement />} />
        <Route path="/blog/new" element={<BlogEditor />} />
        <Route path="/blog/edit/:id" element={<BlogEditor />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;