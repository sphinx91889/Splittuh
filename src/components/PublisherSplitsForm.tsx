import React from 'react';
import { Building2, Music2 } from 'lucide-react';
import type { PublisherSplit } from '../types';

interface PublisherSplitsFormProps {
  publisherSplits: PublisherSplit[];
  onUpdate: (splits: PublisherSplit[]) => void;
}

export function PublisherSplitsForm({ publisherSplits, onUpdate }: PublisherSplitsFormProps) {
  const handleAdd = () => {
    const remainingPercentage = 100 - publisherSplits.reduce((sum, split) => sum + split.percentage, 0);
    onUpdate([...publisherSplits, {
      publisherName: '',
      percentage: remainingPercentage > 0 ? remainingPercentage : 0,
      proAffiliation: 'ASCAP',
      ipiNumber: '',
      notes: ''
    }]);
  };

  const handleRemove = (index: number) => {
    onUpdate(publisherSplits.filter((_, i) => i !== index));
  };

  const handleUpdate = (index: number, updates: Partial<PublisherSplit>) => {
    const newSplits = [...publisherSplits];
    newSplits[index] = { ...newSplits[index], ...updates };
    onUpdate(newSplits);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Publisher Splits</h2>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          Add Publisher
        </button>
      </div>

      {publisherSplits.map((split, index) => (
        <div key={index} className="p-6 bg-white rounded-lg shadow-md space-y-6 border border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Publisher {index + 1}</h3>
            <button
              onClick={() => handleRemove(index)}
              className="text-red-600 hover:text-red-800 font-medium"
            >
              Remove
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Building2 className="w-4 h-4" />
                Publisher Name
              </label>
              <input
                type="text"
                value={split.publisherName}
                onChange={(e) => handleUpdate(index, { publisherName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter publisher name"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Percentage</label>
              <input
                type="number"
                min="0"
                max="100"
                value={split.percentage}
                onChange={(e) => handleUpdate(index, { percentage: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Music2 className="w-4 h-4" />
                PRO Affiliation
              </label>
              <select
                value={split.proAffiliation}
                onChange={(e) => handleUpdate(index, { proAffiliation: e.target.value })}
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
                value={split.ipiNumber}
                onChange={(e) => handleUpdate(index, { ipiNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter IPI number"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Additional Notes</label>
              <textarea
                value={split.notes}
                onChange={(e) => handleUpdate(index, { notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                rows={3}
                placeholder="Enter any additional notes about this publisher"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}