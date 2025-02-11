import React from 'react';
import { PenTool, AlertCircle } from 'lucide-react';
import type { Collaborator } from '../../types';
import { EmailButton } from '../EmailButton';

interface CollaboratorSignatureSectionProps {
  collaborator: Collaborator;
  canUserSign: (email: string) => boolean;
  hasSignature: (collaborator: Collaborator) => boolean;
  onSignatureClick: (email: string) => void;
  formatTimestamp: (date: Date) => string;
  signatures: { [key: string]: { image: string; timestamp: string } };
}

export function CollaboratorSignatureSection({
  collaborator,
  canUserSign,
  hasSignature,
  onSignatureClick,
  formatTimestamp,
  signatures
}: CollaboratorSignatureSectionProps) {
  return (
    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Legal Name</p>
          <p className="text-lg font-medium text-gray-900 dark:text-white">{collaborator.legalName}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Stage Name</p>
          <p className="text-lg font-medium text-gray-900 dark:text-white">{collaborator.stageName}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Role</p>
          <p className="text-lg font-medium text-gray-900 dark:text-white">{collaborator.role}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-900 dark:text-white">{collaborator.email}</p>
            <EmailButton 
              email={collaborator.email} 
              hasSigned={!!collaborator.signature}
            />
          </div>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Publisher</p>
          <p className="text-lg font-medium text-gray-900 dark:text-white">{collaborator.publisherName}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">PRO Affiliation</p>
          <p className="text-lg font-medium text-gray-900 dark:text-white">{collaborator.proAffiliation}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">IPI Number</p>
          <p className="text-lg font-medium text-gray-900 dark:text-white">{collaborator.ipiNumber}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Percentage</p>
          <p className="text-lg font-medium text-gray-900 dark:text-white">{collaborator.percentage}%</p>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Signature</h3>
          {!hasSignature(collaborator) && (
            <>
              {canUserSign(collaborator.email) ? (
                <button
                  onClick={() => onSignatureClick(collaborator.email)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  <PenTool className="w-4 h-4" />
                  Sign Here
                </button>
              ) : (
                <div className="flex items-center text-gray-500 dark:text-gray-400">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Only {collaborator.email} can sign here
                </div>
              )}
            </>
          )}
        </div>
        {hasSignature(collaborator) ? (
          <div className="space-y-2">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
              <img 
                src={collaborator.signature || signatures[collaborator.email]?.image} 
                alt={`${collaborator.legalName}'s Signature`} 
                className="max-h-24"
              />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">
              Signed on {collaborator.signatureDate ? 
                formatTimestamp(new Date(collaborator.signatureDate)) : 
                signatures[collaborator.email]?.timestamp}
            </p>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center text-gray-500 dark:text-gray-400">
            No signature yet
          </div>
        )}
      </div>
    </div>
  );
}