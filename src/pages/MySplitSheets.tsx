import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { FileText, AlertCircle, LogIn, Clock, Users, Calendar, Trash2, Percent, Eye } from 'lucide-react';
import { AuthModal } from '../components/auth/AuthModal';
import { NavBar } from '../components/NavBar';
import { DeleteConfirmationModal } from '../components/DeleteConfirmationModal';

export function MySplitSheets() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [splitSheets, setSplitSheets] = useState<any[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSheet, setSelectedSheet] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadSplitSheets = async () => {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const { data: sheets, error: sheetsError } = await supabase
        .from('split_sheets')
        .select(`
          id,
          title,
          release_date,
          artist_name,
          produced_by,
          status,
          created_at,
          collaborators (
            id,
            legal_name,
            role,
            percentage,
            signature,
            signature_date,
            email
          )
        `)
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (sheetsError) throw sheetsError;

      // Process sheets to determine signature status
      const processedSheets = sheets?.map(sheet => {
        const unsignedCollaborators = sheet.collaborators.filter((c: any) => !c.signature);
        const currentUserCollab = sheet.collaborators.find((c: any) => c.email === user.email);
        
        let signatureStatus;
        if (currentUserCollab?.signature) {
          signatureStatus = 'signed_by_you';
        } else if (unsignedCollaborators.length === 0) {
          signatureStatus = 'completed';
        } else {
          signatureStatus = 'pending';
        }

        return {
          ...sheet,
          signatureStatus
        };
      });

      setSplitSheets(processedSheets || []);
    } catch (err: any) {
      console.error('Error loading split sheets:', err);
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
      loadSplitSheets();
    }
  }, [user]);

  const handleDelete = async () => {
    if (!selectedSheet || !user) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('split_sheets')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', selectedSheet.id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      await loadSplitSheets();
      setShowDeleteModal(false);
      setSelectedSheet(null);
    } catch (err: any) {
      console.error('Error deleting split sheet:', err);
      setError(err.message || 'Failed to delete split sheet');
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'signed_by_you':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
            You've Signed
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
            All Signed
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
            Needs Signatures
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
            No Signatures
          </span>
        );
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <NavBar />
        <div className="flex items-center justify-center p-4 h-[calc(100vh-80px)]">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <FileText className="mx-auto h-12 w-12 text-blue-600 dark:text-blue-400" />
              <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">Sign In Required</h2>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Please sign in to view your split sheets
              </p>
            </div>

            <button
              onClick={() => setShowAuthModal(true)}
              className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Sign In
            </button>
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
          <FileText className="mx-auto h-12 w-12 text-blue-600 dark:text-blue-400" />
          <h1 className="mt-3 text-3xl font-bold text-gray-900 dark:text-white">My Split Sheets</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Manage and track all your song split sheets</p>
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
        ) : splitSheets.length === 0 ? (
          <div className="text-center bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
            <p className="text-gray-600 dark:text-gray-300">You haven't created any split sheets yet.</p>
            <button
              onClick={() => navigate('/create')}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              Create Your First Split Sheet
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {splitSheets.map((sheet) => (
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
                      <p className="text-sm text-gray-600 dark:text-gray-300">{sheet.artist_name}</p>
                    </div>
                    {getStatusBadge(sheet.signatureStatus)}
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(sheet.release_date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <Users className="w-4 h-4 mr-2" />
                      {sheet.collaborators.length} Collaborator{sheet.collaborators.length !== 1 ? 's' : ''}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <Clock className="w-4 h-4 mr-2" />
                      Created {new Date(sheet.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                      <Percent className="w-4 h-4 mr-2" />
                      Split Breakdown
                    </h4>
                    <div className="space-y-1">
                      {sheet.collaborators.map((collaborator: any) => (
                        <div key={collaborator.id} className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-300 truncate max-w-[60%]">
                            {collaborator.legal_name} ({collaborator.role})
                            {collaborator.signature && ' ✓'}
                          </span>
                          <span className="text-gray-900 dark:text-white font-medium">
                            {collaborator.percentage}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 space-y-2">
                    <button
                      onClick={() => navigate(`/split-sheet/${sheet.id}`)}
                      className="w-full flex items-center justify-center bg-blue-600 dark:bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </button>
                    <button
                      onClick={() => {
                        setSelectedSheet(sheet);
                        setShowDeleteModal(true);
                      }}
                      className="w-full flex items-center justify-center bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-300 py-2 px-4 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors duration-200"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
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
          onSuccess={() => setShowAuthModal(false)}
        />
      )}

      {showDeleteModal && selectedSheet && (
        <DeleteConfirmationModal
          title={selectedSheet.title}
          onConfirm={handleDelete}
          onCancel={() => {
            setShowDeleteModal(false);
            setSelectedSheet(null);
          }}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}