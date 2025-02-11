import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { NavBar } from '../components/NavBar';
import { PenTool, AlertCircle, Clock, Users, Calendar, LogIn } from 'lucide-react';
import { AuthModal } from '../components/auth/AuthModal';

export function SignSplitSheet() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingSplitSheets, setPendingSplitSheets] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const loadPendingSplitSheets = async () => {
    if (!user?.email) return;

    setLoading(true);
    setError('');

    try {
      // Get all collaborator records for the user that need signatures
      const { data: collaborators, error: collaboratorsError } = await supabase
        .from('collaborators')
        .select(`
          id,
          legal_name,
          role,
          percentage,
          signature,
          signature_date,
          split_sheet_id,
          split_sheets (
            id,
            title,
            release_date,
            artist_name,
            produced_by,
            created_at,
            status,
            user_id
          )
        `)
        .eq('email', user.email)
        .is('signature', null)
        .not('split_sheets', 'is', null)
        .order('created_at', { foreignTable: 'split_sheets', ascending: false });

      if (collaboratorsError) throw collaboratorsError;

      // Transform the data for display
      const sheets = collaborators?.reduce((acc: any[], collab) => {
        if (!collab.split_sheets) return acc;

        // Check if we already have this split sheet
        const existingSheet = acc.find(s => s.id === collab.split_sheets.id);
        if (existingSheet) {
          existingSheet.collaborators.push({
            id: collab.id,
            legalName: collab.legal_name,
            role: collab.role,
            percentage: collab.percentage,
            signature: collab.signature,
            signatureDate: collab.signature_date
          });
          return acc;
        }

        // Add new split sheet
        acc.push({
          id: collab.split_sheets.id,
          title: collab.split_sheets.title,
          releaseDate: collab.split_sheets.release_date,
          artistName: collab.split_sheets.artist_name,
          producedBy: collab.split_sheets.produced_by,
          createdAt: collab.split_sheets.created_at,
          status: collab.split_sheets.status,
          isOwner: collab.split_sheets.user_id === user.id,
          collaborators: [{
            id: collab.id,
            legalName: collab.legal_name,
            role: collab.role,
            percentage: collab.percentage,
            signature: collab.signature,
            signatureDate: collab.signature_date
          }]
        });

        return acc;
      }, []);

      setPendingSplitSheets(sheets || []);
    } catch (err: any) {
      console.error('Error loading pending split sheets:', err);
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
      loadPendingSplitSheets();
    }
  }, [user]);

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
        <div className="flex items-center justify-center p-4 h-[calc(100vh-80px)]">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <PenTool className="mx-auto h-12 w-12 text-blue-600 dark:text-blue-400" />
              <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">Sign In Required</h2>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Please sign in to view and sign your pending split sheets
              </p>
            </div>

            <button
              onClick={() => setShowAuthModal(true)}
              className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Sign In to Your Account
            </button>

            {showAuthModal && (
              <AuthModal
                onClose={() => setShowAuthModal(false)}
                onSuccess={handleAuthSuccess}
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <NavBar />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
            <span>Loading pending split sheets...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <NavBar />
        <div className="flex items-center justify-center p-4 h-[calc(100vh-80px)]">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start max-w-lg">
            <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <p className="text-red-700 dark:text-red-200">{error}</p>
              <button
                onClick={() => loadPendingSplitSheets()}
                className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <NavBar />
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <PenTool className="mx-auto h-12 w-12 text-blue-600 dark:text-blue-400" />
          <h1 className="mt-3 text-3xl font-bold text-gray-900 dark:text-white">Pending Split Sheets</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Review and sign your pending split sheets</p>
        </div>

        {pendingSplitSheets.length === 0 ? (
          <div className="text-center bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
            <p className="text-gray-600 dark:text-gray-300">You don't have any pending split sheets to sign.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pendingSplitSheets.map((sheet) => (
              <div
                key={sheet.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        {sheet.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{sheet.artistName}</p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                      Pending Signature
                    </span>
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

                  <div className="mt-6">
                    <button
                      onClick={() => navigate(`/split-sheet/${sheet.id}`)}
                      className="w-full bg-blue-600 dark:bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200"
                    >
                      Review & Sign
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}