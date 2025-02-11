import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { NavBar } from '../components/NavBar';
import { SplitSheetPreview } from '../components/SplitSheetPreview';
import { getSplitSheet } from '../lib/splitSheetService';
import { ArrowLeft, Loader2 } from 'lucide-react';

interface SplitSheetData {
  id: string;
  title: string;
  releaseDate: string;
  artistName: string;
  producedBy: string;
  isrcCode: string;
  duration: string;
  rightsType: string;
  separatePublishingSplits: boolean;
  collaborators: Array<{
    legalName: string;
    stageName: string;
    role: string;
    email: string;
    publisherName: string;
    proAffiliation: string;
    ipiNumber: string;
    percentage: number;
    signature?: string;
    signatureDate?: string;
  }>;
}

export function SplitSheetView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [state, setState] = useState<{
    loading: boolean;
    error: string | null;
    data: SplitSheetData | null;
  }>({
    loading: true,
    error: null,
    data: null
  });

  // Check if user came from collaborations page
  const isFromCollaborations = location.state?.from === '/my-collaborations';

  useEffect(() => {
    async function loadSplitSheet(splitSheetId: string) {
      try {
        const result = await getSplitSheet(splitSheetId);
        if (!result.success) {
          throw new Error(result.error as string);
        }

        setState({
          loading: false,
          error: null,
          data: {
            ...result.data,
            id: splitSheetId // Ensure ID is included
          }
        });
      } catch (err) {
        console.error('Error loading split sheet:', err);
        setState({
          loading: false,
          error: err instanceof Error ? err.message : 'An error occurred while loading the split sheet',
          data: null
        });
      }
    }

    if (id) {
      loadSplitSheet(id);
    }
  }, [id]);

  const renderBackButton = () => (
    <button
      onClick={() => navigate(isFromCollaborations ? '/my-collaborations' : '/my-split-sheets')}
      className="mb-6 inline-flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
    >
      <ArrowLeft className="w-5 h-5 mr-2" />
      Back to {isFromCollaborations ? 'My Collaborations' : 'My Split Sheets'}
    </button>
  );

  const renderContent = () => {
    if (state.loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading split sheet...</span>
          </div>
        </div>
      );
    }

    if (state.error || !state.data) {
      return (
        <div className="bg-red-50 dark:bg-red-900/20 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                {state.error || 'Split sheet not found'}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <SplitSheetPreview
        songDetails={{
          id: state.data.id, // Pass the ID here
          title: state.data.title,
          releaseDate: state.data.releaseDate,
          artistName: state.data.artistName,
          producedBy: state.data.producedBy,
          isrcCode: state.data.isrcCode,
          duration: state.data.duration,
          rightsType: state.data.rightsType as 'Composition' | 'Master' | 'Both',
          separatePublishingSplits: state.data.separatePublishingSplits
        }}
        collaborators={state.data.collaborators}
        onBack={() => navigate(isFromCollaborations ? '/my-collaborations' : '/my-split-sheets')}
      />
    );
  };

  return (
    <>
      <NavBar />
      <div className="max-w-7xl mx-auto pt-24 px-4 sm:px-6 lg:px-8">
        {renderBackButton()}
        {renderContent()}
      </div>
    </>
  );
}