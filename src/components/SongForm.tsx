import React from 'react';
import { Calendar, Clock, Music, User, Users } from 'lucide-react';
import type { SongDetails } from '../types';

interface SongFormProps {
  songDetails: SongDetails;
  onUpdate: (details: Partial<SongDetails>) => void;
}

export function SongForm({ songDetails, onUpdate }: SongFormProps) {
  // Ensure all values are initialized to empty strings if undefined
  const {
    title = '',
    releaseDate = new Date().toISOString().split('T')[0],
    artistName = '',
    producedBy = '',
    isrcCode = '',
    duration = '',
    rightsType = 'Both',
    separatePublishingSplits = false
  } = songDetails;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Song Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Music className="w-4 h-4" />
            Song Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter song title"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Calendar className="w-4 h-4" />
            Release Date
          </label>
          <input
            type="date"
            value={releaseDate}
            onChange={(e) => onUpdate({ releaseDate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <User className="w-4 h-4" />
            Artist(s) Name
          </label>
          <input
            type="text"
            value={artistName}
            onChange={(e) => onUpdate({ artistName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter artist name(s)"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Users className="w-4 h-4" />
            Produced By
          </label>
          <input
            type="text"
            value={producedBy}
            onChange={(e) => onUpdate({ producedBy: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter producer name"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">ISRC Code</label>
          <input
            type="text"
            value={isrcCode}
            onChange={(e) => onUpdate({ isrcCode: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter ISRC code"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Clock className="w-4 h-4" />
            Song Duration
          </label>
          <input
            type="text"
            value={duration}
            onChange={(e) => onUpdate({ duration: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="e.g. 3:30"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Rights Type</label>
          <select
            value={rightsType}
            onChange={(e) => onUpdate({ rightsType: e.target.value as SongDetails['rightsType'] })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="Composition">Composition</option>
            <option value="Master">Master</option>
            <option value="Both">Both (Composition & Master)</option>
          </select>
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="separatePublishingSplits"
            checked={separatePublishingSplits}
            onChange={(e) => onUpdate({ separatePublishingSplits: e.target.checked })}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="separatePublishingSplits" className="text-sm font-medium text-gray-700">
            Include Separate Publishing Splits
          </label>
        </div>
      </div>
    </div>
  );
}