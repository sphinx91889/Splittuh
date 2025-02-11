import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { FileText, AlertCircle, LogIn, Clock, Users, Calendar, Eye } from 'lucide-react';
import { AuthModal } from '../components/auth/AuthModal';
import { NavBar } from '../components/NavBar';

export function MyCollaborations() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [collaborations, setCollaborations] = useState<any[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState<any>(null);

  const loadCollaborations = async () => {
    if (!user?.email) return;

    setLoading(true);
    setError('');

    try {
      const { data: collabSheets, error: collabError } = await supabase
        .from('collaborators')
        .select(`
          id,
          legal_name,
          role,
          email,
          percentage,
          signature,
          signature_date,
          split_sheets (
            id,
            title,
            release_date,
            artist_name,
            produced_by,
            status,
            created_at,
            user_id,
            collaborators (*)
          )
        `)
        .eq('email', user.email)
        .is('split_sheets.deleted_at', null)
        .order('created_at', { foreignTable: 'split_sheets', ascending: false });

      if (collabError) throw collabError;

      // Format the data for display
      const formattedCollabs = collabSheets
        ?.filter(collab => collab.split_sheets)
        .map(collab => ({
          id: collab.split_sheets.id,
          title: collab.split_sheets.title,
          artistName: collab.split_sheets.artist_name,
          releaseDate: collab.split_sheets.release_date,
          createdAt: collab.split_sheets.created_at,
          status: collab.split_sheets.status,
          collaborators: collab.split_sheets.collaborators,
          userRole: collab.role,
          userSignature: collab.signature,
          userSignatureDate: collab.signature_date
        }));

      // Sort collaborations: unsigned first, then by creation date
      const sortedCollabs = formattedCollabs?.sort((a, b) => {
        const aUnsigned = !a.collaborators.find((c: any) => c.email === user.email)?.signature;
        const bUnsigned = !b.collaborators.find((c: any) => c.email === user.email)?.signature;
        
        if (aUnsigned && !bUnsigned) return -1;
        if (!aUnsigned && bUnsigned) return 1;
        
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      setCollaborations(sortedCollabs || []);
    } catch (err: any) {
      console.error('Error loading collaborations:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
      }
    }
    checkSession();
  }, []);

  useEffect(() => {
    if (user) {
      loadCollaborations();
    }
  }, [user]);

  const needsSignature = (sheet: any) => {
    const userCollab = sheet.collaborators.find((c: any) => c.email === user?.email);
    return userCollab && !userCollab.signature;
  };

  const handleAuthSuccess = async () => {
    setShowAuthModal(false);
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <NavBar />
        <div className="text-center bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 max-w-lg mx-auto mt-12">
          <p className="text-gray-600 dark:text-gray-300">Please sign in to view your collaborations.</p>
          <button
            onClick={() => setShowAuthModal(true)}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            <LogIn className="w-4 h-4 mr-2" />
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <NavBar />
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <FileText className="mx-auto h-12 w-12 text-blue-600 dark:text-blue-400" />
          <h1 className="mt-3 text-3xl font-bold text-gray-900 dark:text-white">My Collaborations</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">View and manage split sheets you're collaborating on</p>
        </div>

        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">{error}</div>
              </div>
            </div>
          </div>
        ) : collaborations.length === 0 ? (
          <div className="text-center bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
            <p className="text-gray-600 dark:text-gray-300">You haven't been added to any split sheets yet.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {collaborations.map((sheet) => (
              <div
                key={sheet.id}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 ${
                  needsSignature(sheet) ? 'ring-2 ring-yellow-400 dark:ring-yellow-500' : ''
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        {sheet.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{sheet.artistName}</p>
                    </div>
                    {needsSignature(sheet) && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                        Needs Signature
                      </span>
                    )}
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(sheet.releaseDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <Users className="w-4 h-4 mr-2" />
                      {sheet.collaborators.length} Collaborator{sheet.collaborators.length !== 1 ? 's' : ''}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <Clock className="w-4 h-4 mr-2" />
                      Created {new Date(sheet.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Split Breakdown</h4>
                    <div className="space-y-1">
                      {sheet.collaborators.map((collaborator: any) => (
                        <div key={collaborator.id} className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-300 truncate max-w-[60%]">
                            {collaborator.legal_name} ({collaborator.role})
                          </span>
                          <span className="text-gray-900 dark:text-white font-medium">
                            {collaborator.percentage}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6">
                    <button
                      onClick={() => navigate(`/split-sheet/${sheet.id}`, { state: { from: '/my-collaborations' } })}
                      className={`w-full flex items-center justify-center py-2 px-4 rounded-lg transition-colors duration-200 ${
                        needsSignature(sheet)
                          ? 'bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white'
                      }`}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      {needsSignature(sheet) ? 'Review & Sign' : 'View Details'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
}