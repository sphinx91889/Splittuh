import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { NavBar } from '../components/NavBar';
import { TutorialGuide } from '../components/TutorialGuide';
import { 
  FileText, 
  Bell, 
  Users, 
  ChevronRight, 
  AlertCircle, 
  Plus,
  BookOpen,
  PenSquare
} from 'lucide-react';

export function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);
  const [isBlogAuthor, setIsBlogAuthor] = useState(false);
  const [pendingSignatures, setPendingSignatures] = useState<any[]>([]);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/');
        return;
      }
      setUser(user);

      // Check if user is a blog author
      const { data: author } = await supabase
        .from('blog_authors')
        .select('id')
        .eq('email', user.email)
        .single();

      setIsBlogAuthor(!!author);
    }
    getUser();
  }, [navigate]);

  useEffect(() => {
    async function loadPendingSignatures() {
      if (!user?.email) return;

      setLoading(true);
      setError('');

      try {
        const { data: pendingSignatures, error: pendingError } = await supabase
          .from('split_sheets')
          .select(`
            id,
            title,
            artist_name,
            created_at,
            collaborators (
              id,
              legal_name,
              email,
              signature,
              signature_date
            )
          `)
          .is('deleted_at', null)
          .order('created_at', { ascending: false });

        if (pendingError) throw pendingError;

        const needsSignature = pendingSignatures?.filter(sheet => {
          const userCollab = sheet.collaborators.find((c: any) => c.email === user.email);
          return userCollab && !userCollab.signature;
        }) || [];

        setPendingSignatures(needsSignature);
      } catch (err: any) {
        console.error('Error loading pending signatures:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadPendingSignatures();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <NavBar />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
            <span>Loading dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <NavBar />
      {/* Logo */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
        <img 
          src="https://i.imghippo.com/files/iIC1934sY.png" 
          alt="Splittuh Logo" 
          className="w-16 h-16 object-contain dark:invert opacity-80 hover:opacity-100 transition-opacity"
        />
      </div>
      <div className="max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-12">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}!
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Here's an overview of your split sheets and pending actions.
              </p>
            </div>
            <button
              onClick={() => setShowTutorial(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
            >
              <BookOpen className="w-5 h-5" />
              <span>How to Use Splittuh</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid gap-6 mb-8 md:grid-cols-2">
          <button
            onClick={() => navigate('/create')}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            <Plus className="w-5 h-5" />
            Create New Split Sheet
          </button>

          {isBlogAuthor && (
            <button
              onClick={() => navigate('/blog/manage')}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors dark:bg-purple-500 dark:hover:bg-purple-600"
            >
              <PenSquare className="w-5 h-5" />
              Create a Blog Post
            </button>
          )}
        </div>

        {/* Navigation Cards */}
        <div className="grid gap-6 mb-8 md:grid-cols-2">
          <button
            onClick={() => navigate('/my-split-sheets')}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-all text-left flex items-center group"
          >
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
              <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">My Split Sheets</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">View and manage your split sheets</p>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300" />
          </button>

          <button
            onClick={() => navigate('/my-collaborations')}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-all text-left flex items-center group"
          >
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
              <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">My Collaborations</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">View split sheets you're collaborating on</p>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300" />
          </button>
        </div>

        {/* Pending Signatures Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <Bell className="h-6 w-6 text-yellow-500 dark:text-yellow-400 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Pending Signatures
              </h2>
            </div>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {pendingSignatures.length === 0 ? (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                No pending signatures at the moment
              </div>
            ) : (
              pendingSignatures.map((sheet) => (
                <div key={sheet.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {sheet.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {sheet.artist_name} • Created {new Date(sheet.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => navigate(`/split-sheet/${sheet.id}`)}
                      className="flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Review & Sign
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showTutorial && <TutorialGuide onClose={() => setShowTutorial(false)} />}
    </div>
  );
}