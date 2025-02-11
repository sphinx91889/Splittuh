import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music2, Wand2, AlertCircle, UserPlus, Percent } from 'lucide-react';
import { AuthModal } from '../components/auth/AuthModal';
import { NavBar } from '../components/NavBar';
import { SongForm } from '../components/SongForm';
import { CollaboratorForm } from '../components/CollaboratorForm';
import { PublisherSplitsForm } from '../components/PublisherSplitsForm';
import { SplitSheetPreview } from '../components/SplitSheetPreview';
import { saveSplitSheet } from '../lib/splitSheetService';
import { supabase } from '../lib/supabase';
import type { FormData } from '../types';

const roles = ['Artist', 'Producer', 'Songwriter', 'Engineer'] as const;
const proAffiliations = ['ASCAP', 'BMI', 'SESAC'] as const;

const defaultFormData: FormData = {
  songTitle: '',
  releaseDate: new Date().toISOString().split('T')[0],
  artistName: '',
  producerName: '',
  isrcCode: '',
  songDuration: '',
  rightsType: 'both',
  collaborators: [{
    name: '',
    legal_name: '',
    stage_name: '',
    address: '',
    role: 'artist',
    percentage: 100,
    email: '',
    publisher_name: '',
    pro_affiliation: 'ASCAP',
    ipi_number: '',
    signature: ''
  }],
  publishers: [],
  showPublishing: false,
  disclaimerAccepted: false
};

function generateRandomCollaborator(percentage: number) {
  const randomId = Math.floor(Math.random() * 10000);
  const roles = ['artist', 'producer', 'songwriter', 'engineer'] as const;
  const role = roles[Math.floor(Math.random() * roles.length)];
  
  return {
    name: '',
    legal_name: `John Doe ${randomId}`,
    stage_name: `Artist ${randomId}`,
    address: '123 Music Street',
    role,
    percentage,
    email: `artist${randomId}@example.com`,
    publisher_name: `Publisher ${randomId}`,
    pro_affiliation: 'ASCAP',
    ipi_number: `IPI${Math.floor(Math.random() * 1000000)}`,
    signature: ''
  };
}

export function SplitSheetForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>(() => {
    const saved = sessionStorage.getItem('splitSheetFormData');
    return saved ? JSON.parse(saved) : defaultFormData;
  });
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [createdSplitSheet, setCreatedSplitSheet] = useState<any>(null);
  const [percentageError, setPercentageError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

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

  const totalPercentage = formData.collaborators.reduce((sum, collab) => sum + collab.percentage, 0);

  const validateForm = () => {
    const errors: string[] = [];

    // Validate song details
    if (!formData.songTitle.trim()) {
      errors.push('Song title is required');
    }
    if (!formData.artistName.trim()) {
      errors.push('Artist name is required');
    }
    if (!formData.producerName.trim()) {
      errors.push('Producer name is required');
    }

    // Validate collaborators
    formData.collaborators.forEach((collab, index) => {
      if (!collab.legal_name.trim()) {
        errors.push(`Legal name is required for collaborator ${index + 1}`);
      }
      if (!collab.email.trim()) {
        errors.push(`Email is required for collaborator ${index + 1}`);
      } else if (!collab.email.includes('@') || !collab.email.includes('.')) {
        errors.push(`Invalid email format for collaborator ${index + 1}`);
      }
      if (!collab.role) {
        errors.push(`Role is required for collaborator ${index + 1}`);
      }
      if (collab.percentage <= 0) {
        errors.push(`Percentage must be greater than 0 for collaborator ${index + 1}`);
      }
    });

    // Validate total percentage
    if (totalPercentage !== 100) {
      errors.push(`Total percentage must equal 100%. Current total: ${totalPercentage}%`);
    }

    // Validate disclaimer
    if (!formData.disclaimerAccepted) {
      errors.push('You must accept the disclaimer to continue');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const generateRandomInfo = () => {
    const randomId = Math.floor(Math.random() * 1000);
    const collaborator1 = generateRandomCollaborator(60);
    const collaborator2 = generateRandomCollaborator(40);

    const newFormData = {
      ...formData,
      songTitle: `Song ${randomId}`,
      releaseDate: new Date().toISOString().split('T')[0],
      artistName: collaborator1.stage_name,
      producerName: `Producer ${randomId}`,
      isrcCode: `USRC${Math.floor(Math.random() * 1000000)}`,
      songDuration: '3:30',
      collaborators: [collaborator1, collaborator2]
    };

    setFormData(newFormData);
    sessionStorage.setItem('splitSheetFormData', JSON.stringify(newFormData));
  };

  const addCollaborator = () => {
    const remainingPercentage = Math.max(0, 100 - totalPercentage);
    const newCollaborator = {
      name: '',
      legal_name: '',
      stage_name: '',
      address: '',
      role: 'artist' as const,
      percentage: remainingPercentage,
      email: '',
      publisher_name: '',
      pro_affiliation: 'ASCAP',
      ipi_number: '',
      signature: ''
    };

    const newFormData = {
      ...formData,
      collaborators: [...formData.collaborators, newCollaborator]
    };
    setFormData(newFormData);
    sessionStorage.setItem('splitSheetFormData', JSON.stringify(newFormData));
  };

  const handleFormDataChange = (updates: Partial<FormData>) => {
    const newFormData = { ...formData, ...updates };
    setFormData(newFormData);
    sessionStorage.setItem('splitSheetFormData', JSON.stringify(newFormData));
    
    // Clear errors when form is updated
    setError('');
    setValidationErrors([]);
    setPercentageError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setValidationErrors([]);
    setPercentageError(null);
    
    if (!validateForm()) {
      return;
    }

    if (!session) {
      sessionStorage.setItem('splitSheetFormData', JSON.stringify(formData));
      setShowAuthModal(true);
      return;
    }

    setSaving(true);
    try {
      const result = await saveSplitSheet(
        {
          title: formData.songTitle,
          releaseDate: formData.releaseDate,
          artistName: formData.artistName,
          producedBy: formData.producerName,
          isrcCode: formData.isrcCode,
          duration: formData.songDuration,
          rightsType: formData.rightsType === 'both' ? 'Both' : formData.rightsType === 'master' ? 'Master' : 'Composition',
          separatePublishingSplits: formData.showPublishing
        },
        formData.collaborators.map(c => ({
          legalName: c.legal_name,
          stageName: c.stage_name,
          role: c.role,
          email: c.email,
          publisherName: c.publisher_name,
          proAffiliation: c.pro_affiliation,
          ipiNumber: c.ipi_number,
          percentage: c.percentage
        }))
      );

      if (!result.success) {
        throw new Error(result.error as string);
      }

      setCreatedSplitSheet(result.data);
      sessionStorage.removeItem('splitSheetFormData');
      setShowSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save split sheet');
    } finally {
      setSaving(false);
    }
  };

  const handleAuthSuccess = async () => {
    setShowAuthModal(false);
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setSession(session.user);
      handleSubmit(new Event('submit') as any);
    }
  };

  if (showSuccess && createdSplitSheet) {
    return (
      <>
        <NavBar />
        <SplitSheetPreview 
          songDetails={{
            id: createdSplitSheet.id,
            title: formData.songTitle,
            releaseDate: formData.releaseDate,
            artistName: formData.artistName,
            producedBy: formData.producerName,
            isrcCode: formData.isrcCode,
            duration: formData.songDuration,
            rightsType: formData.rightsType === 'both' ? 'Both' : formData.rightsType === 'master' ? 'Master' : 'Composition',
            separatePublishingSplits: formData.showPublishing
          }}
          collaborators={formData.collaborators.map(c => ({
            legalName: c.legal_name,
            stageName: c.stage_name,
            role: c.role,
            email: c.email,
            publisherName: c.publisher_name,
            proAffiliation: c.pro_affiliation,
            ipiNumber: c.ipi_number,
            percentage: c.percentage
          }))}
          onBack={() => setShowSuccess(false)}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-800 relative">
      <NavBar />
      <div className="relative z-10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <Music2 className="mx-auto h-12 w-12 text-blue-600 dark:text-blue-400" />
            <div className="flex items-center justify-center gap-4 mt-3">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Song Split Sheet Generator</h1>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                totalPercentage === 100 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
              }`}>
                <Percent className="w-4 h-4" />
                <span className="font-medium">{totalPercentage}%</span>
              </div>
            </div>
            <p className="mt-2 text-gray-600 dark:text-gray-300">Document ownership and rights for your music</p>
            
            <div className="mt-6">
              <button
                type="button"
                onClick={generateRandomInfo}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 dark:bg-purple-500 dark:hover:bg-purple-600"
              >
                <Wand2 className="w-4 h-4 mr-2" />
                Generate Random Info
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-6">
            <SongForm 
              songDetails={{
                title: formData.songTitle,
                releaseDate: formData.releaseDate,
                artistName: formData.artistName,
                producedBy: formData.producerName,
                isrcCode: formData.isrcCode,
                duration: formData.songDuration,
                rightsType: formData.rightsType === 'both' ? 'Both' : formData.rightsType === 'master' ? 'Master' : 'Composition',
                separatePublishingSplits: formData.showPublishing
              }}
              onUpdate={(updates) => {
                handleFormDataChange({
                  songTitle: updates.title,
                  releaseDate: updates.releaseDate,
                  artistName: updates.artistName,
                  producerName: updates.producedBy,
                  isrcCode: updates.isrcCode,
                  songDuration: updates.duration,
                  rightsType: updates.rightsType === 'Both' ? 'both' : updates.rightsType === 'Master' ? 'master' : 'composition',
                  showPublishing: updates.separatePublishingSplits
                });
              }}
            />

            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Collaborators</h2>
                <button
                  onClick={addCollaborator}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Collaborator
                </button>
              </div>

              {validationErrors.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                        Please fix the following errors:
                      </h3>
                      <ul className="mt-2 text-sm text-red-700 dark:text-red-300 list-disc list-inside">
                        {validationErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {percentageError && (
                <div className="flex items-center space-x-2 text-yellow-600 dark:text-yellow-400 text-sm bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md">
                  <AlertCircle className="w-4 h-4" />
                  <span>{percentageError}</span>
                </div>
              )}

              {formData.collaborators.map((collaborator, index) => (
                <CollaboratorForm
                  key={index}
                  collaborator={{
                    legalName: collaborator.legal_name,
                    stageName: collaborator.stage_name || '',
                    role: collaborator.role,
                    email: collaborator.email,
                    publisherName: collaborator.publisher_name || '',
                    proAffiliation: collaborator.pro_affiliation || '',
                    ipiNumber: collaborator.ipi_number || '',
                    percentage: collaborator.percentage
                  }}
                  showPublisherSplits={formData.showPublishing}
                  totalPercentage={totalPercentage}
                  onUpdate={(updates) => {
                    const newCollaborators = [...formData.collaborators];
                    newCollaborators[index] = {
                      ...collaborator,
                      legal_name: updates.legalName,
                      stage_name: updates.stageName,
                      role: updates.role,
                      email: updates.email,
                      publisher_name: updates.publisherName,
                      pro_affiliation: updates.proAffiliation,
                      ipi_number: updates.ipiNumber,
                      percentage: updates.percentage
                    };
                    handleFormDataChange({ collaborators: newCollaborators });
                  }}
                  onRemove={() => {
                    const newCollaborators = formData.collaborators.filter((_, i) => i !== index);
                    handleFormDataChange({ collaborators: newCollaborators });
                  }}
                />
              ))}
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="disclaimer"
                  checked={formData.disclaimerAccepted}
                  onChange={(e) => handleFormDataChange({ disclaimerAccepted: e.target.checked })}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div>
                  <label htmlFor="disclaimer" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    I understand and agree to the following:
                  </label>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    By submitting this split sheet, I confirm that all information provided is accurate and I have the authority to document these ownership splits. I understand this document will be used to determine royalty distributions and rights ownership.
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={saving || totalPercentage !== 100}
              className={`w-full px-4 py-2 text-white rounded-md transition-colors flex items-center justify-center gap-2 ${
                totalPercentage === 100
                  ? 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600'
                  : 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
              }`}
            >
              {saving ? 'Saving...' : 'Generate Split Sheet'}
              {totalPercentage !== 100 && (
                <span className="text-sm">({totalPercentage}% of 100%)</span>
              )}
            </button>
          </div>
        </div>
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