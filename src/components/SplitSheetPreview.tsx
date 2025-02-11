import React, { useRef, useState, useEffect } from 'react';
import type { SongDetails, Collaborator } from '../types';
import { AlertCircle } from 'lucide-react';
import { SignaturePad } from './SignaturePad';
import { supabase } from '../lib/supabase';
import { generatePDF } from '../lib/pdfGenerator';
import { SongDetailsSection } from './split-sheet/SongDetailsSection';
import { SplitBreakdownSection } from './split-sheet/SplitBreakdownSection';
import { CollaboratorSignatureSection } from './split-sheet/CollaboratorSignatureSection';
import { FooterSection } from './split-sheet/FooterSection';

interface SignatureData {
  image: string;
  timestamp: string;
}

interface SplitSheetPreviewProps {
  songDetails: SongDetails;
  collaborators: Collaborator[];
  onBack: () => void;
}

export function SplitSheetPreview({ songDetails, collaborators, onBack }: SplitSheetPreviewProps) {
  const [showSignaturePad, setShowSignaturePad] = useState<string | null>(null);
  const [signatures, setSignatures] = useState<{ [key: string]: SignatureData }>({});
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentCollaborators, setCurrentCollaborators] = useState(collaborators);
  const contentRef = useRef<HTMLDivElement>(null);

  const sortedCollaborators = [...currentCollaborators].sort((a, b) => b.percentage - a.percentage);

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    }
    getUser();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const canUserSign = (collaboratorEmail: string) => {
    return user?.email === collaboratorEmail;
  };

  const hasSignature = (collaborator: Collaborator) => {
    return Boolean(collaborator.signature || signatures[collaborator.email]?.image);
  };

  const refreshCollaborators = async () => {
    if (!songDetails.id) {
      console.error('Split sheet ID is missing');
      return;
    }

    try {
      const { data: updatedCollaborators, error: fetchError } = await supabase
        .from('collaborators')
        .select('*')
        .eq('split_sheet_id', songDetails.id);

      if (fetchError) throw fetchError;
      
      if (updatedCollaborators) {
        const mergedCollaborators = updatedCollaborators.map(c => ({
          ...c,
          signature: c.signature || signatures[c.email]?.image,
          signatureDate: c.signature_date || (signatures[c.email] ? new Date().toISOString() : undefined)
        }));
        setCurrentCollaborators(mergedCollaborators);
      }
    } catch (err) {
      console.error('Error refreshing collaborators:', err);
    }
  };

  const handleSaveSignature = async (signature: string) => {
    if (!showSignaturePad) return;
    if (!user?.email) {
      setError('Please sign in to save your signature');
      return;
    }
    if (!songDetails.id) {
      setError('Split sheet ID is missing');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const { data: collaboratorData, error: collaboratorError } = await supabase
        .from('collaborators')
        .select('id')
        .eq('split_sheet_id', songDetails.id)
        .eq('email', user.email)
        .single();

      if (collaboratorError) {
        console.error('Error finding collaborator:', collaboratorError);
        throw new Error('Unable to find your collaborator record');
      }

      if (!collaboratorData) {
        throw new Error('Collaborator record not found');
      }

      const now = new Date().toISOString();
      const { error: updateError } = await supabase
        .from('collaborators')
        .update({
          signature: signature,
          signature_date: now
        })
        .eq('id', collaboratorData.id);

      if (updateError) {
        console.error('Error updating signature:', updateError);
        throw new Error('Failed to save signature');
      }

      // Update local states
      const newSignatures = {
        ...signatures,
        [user.email]: {
          image: signature,
          timestamp: formatTimestamp(new Date())
        }
      };
      setSignatures(newSignatures);

      // Update current collaborators
      setCurrentCollaborators(prev => prev.map(c => {
        if (c.email === user.email) {
          return {
            ...c,
            signature: signature,
            signatureDate: now
          };
        }
        return c;
      }));

      setShowSignaturePad(null);
    } catch (err) {
      console.error('Error saving signature:', err);
      setError(err instanceof Error ? err.message : 'Failed to save signature. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPDF = async () => {
    setGeneratingPDF(true);
    setError(null);

    try {
      const success = await generatePDF(
        'split-sheet-content',
        `${songDetails.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_split_sheet`
      );

      if (!success) {
        throw new Error('Failed to generate PDF');
      }
    } catch (err) {
      setError('Failed to generate PDF. Please try again.');
    } finally {
      setGeneratingPDF(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div id="split-sheet-content" ref={contentRef} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg print:shadow-none">
          <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Split Sheet</h1>
            </div>
          </div>

          <SongDetailsSection songDetails={songDetails} formatDate={formatDate} />
          <SplitBreakdownSection collaborators={sortedCollaborators} />

          <div className="px-8 py-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Collaborator Information & Signatures</h2>
            <div className="space-y-8">
              {sortedCollaborators.map((collaborator, index) => (
                <CollaboratorSignatureSection
                  key={index}
                  collaborator={collaborator}
                  canUserSign={canUserSign}
                  hasSignature={hasSignature}
                  onSignatureClick={setShowSignaturePad}
                  formatTimestamp={formatTimestamp}
                  signatures={signatures}
                />
              ))}
            </div>
          </div>

          <FooterSection
            rightsType={songDetails.rightsType}
            onDownload={handleDownloadPDF}
            isGeneratingPDF={generatingPDF}
            allSigned={sortedCollaborators.every(c => hasSignature(c))}
            error={error}
          />
        </div>
      </div>

      {showSignaturePad && (
        <SignaturePad
          collaboratorName={sortedCollaborators.find(c => c.email === showSignaturePad)?.legalName || ''}
          onSave={handleSaveSignature}
          onClose={() => setShowSignaturePad(null)}
        />
      )}
    </div>
  );
}