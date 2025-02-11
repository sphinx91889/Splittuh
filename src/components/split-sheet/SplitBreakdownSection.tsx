import React from 'react';
import { Percent } from 'lucide-react';
import type { Collaborator } from '../../types';

interface SplitBreakdownSectionProps {
  collaborators: Collaborator[];
}

export function SplitBreakdownSection({ collaborators }: SplitBreakdownSectionProps) {
  return (
    <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-4">
        <Percent className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Split Breakdown</h2>
      </div>
      <div className="space-y-2">
        {collaborators.map((collaborator, index) => (
          <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{collaborator.legalName}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{collaborator.role}</p>
            </div>
            <div className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
              {collaborator.percentage}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}