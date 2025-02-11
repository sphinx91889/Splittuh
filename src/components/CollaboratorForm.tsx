import React from 'react';
import type { Collaborator } from '../types';
import { UserCircle, Mail, Building2, Music2, AlertTriangle } from 'lucide-react';

interface CollaboratorFormProps {
  collaborator: Collaborator;
  showPublisherSplits: boolean;
  onUpdate: (collaborator: Collaborator) => void;
  onRemove: () => void;
  totalPercentage: number;
}

export function CollaboratorForm({ collaborator, showPublisherSplits, onUpdate, onRemove, totalPercentage }: CollaboratorFormProps) {
  // Ensure all values are initialized
  const {
    legalName = '',
    stageName = '',
    role = 'Artist',
    email = '',
    publisherName = '',
    proAffiliation = 'ASCAP',
    ipiNumber = '',
    percentage = 0
  } = collaborator;

  const handlePercentageChange = (value: number) => {
    // Ensure percentage is between 0 and 100
    const newPercentage = Math.min(100, Math.max(0, value));
    onUpdate({ ...collaborator, percentage: newPercentage });
  };

  const remainingPercentage = 100 - (totalPercentage - percentage);
  const showPercentageWarning = percentage > remainingPercentage;

  return (
    <div className="p-6 bg-white rounded-lg shadow-md space-y-6 border border-gray-200">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Collaborator Details</h3>
        <button
          onClick={onRemove}
          className="text-red-600 hover:text-red-800 font-medium"
        >
          Remove
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <UserCircle className="w-4 h-4" />
            Legal Name
          </label>
          <input
            type="text"
            value={legalName}
            onChange={(e) => onUpdate({ ...collaborator, legalName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <UserCircle className="w-4 h-4" />
            Stage Name
          </label>
          <input
            type="text"
            value={stageName}
            onChange={(e) => onUpdate({ ...collaborator, stageName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Role</label>
          <select
            value={role}
            onChange={(e) => onUpdate({ ...collaborator, role: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="Artist">Artist</option>
            <option value="Producer">Producer</option>
            <option value="Songwriter">Songwriter</option>
            <option value="Engineer">Engineer</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Mail className="w-4 h-4" />
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => onUpdate({ ...collaborator, email: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Building2 className="w-4 h-4" />
            Publisher Name
          </label>
          <input
            type="text"
            value={publisherName}
            onChange={(e) => onUpdate({ ...collaborator, publisherName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Music2 className="w-4 h-4" />
            PRO Affiliation
          </label>
          <select
            value={proAffiliation}
            onChange={(e) => onUpdate({ ...collaborator, proAffiliation: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="ASCAP">ASCAP</option>
            <option value="BMI">BMI</option>
            <option value="SESAC">SESAC</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">IPI Number</label>
          <input
            type="text"
            value={ipiNumber}
            onChange={(e) => onUpdate({ ...collaborator, ipiNumber: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Writer's Share (%)</label>
          <div className="space-y-2">
            <input
              type="number"
              min="0"
              max="100"
              value={percentage}
              onChange={(e) => handlePercentageChange(Number(e.target.value))}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
                showPercentageWarning ? 'border-yellow-500' : 'border-gray-300'
              }`}
            />
            {showPercentageWarning && (
              <div className="flex items-center text-yellow-600 text-sm">
                <AlertTriangle className="w-4 h-4 mr-1" />
                <span>Maximum available: {remainingPercentage}%</span>
              </div>
            )}
          </div>
        </div>

        {showPublisherSplits && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Publisher's Share (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={collaborator.publisherPercentage || 0}
              onChange={(e) => onUpdate({ ...collaborator, publisherPercentage: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        )}
      </div>
    </div>
  );
}