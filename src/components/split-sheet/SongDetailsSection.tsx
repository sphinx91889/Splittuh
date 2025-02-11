import React from 'react';
import { Music, Calendar, User, Users, Hash, Clock } from 'lucide-react';
import type { SongDetails } from '../../types';

interface SongDetailsSectionProps {
  songDetails: SongDetails;
  formatDate: (date: string) => string;
}

export function SongDetailsSection({ songDetails, formatDate }: SongDetailsSectionProps) {
  return (
    <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Song Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-center gap-3">
          <Music className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Song Title</p>
            <p className="text-lg font-medium text-gray-900 dark:text-white">{songDetails.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Release Date</p>
            <p className="text-lg font-medium text-gray-900 dark:text-white">{formatDate(songDetails.releaseDate)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Artist(s)</p>
            <p className="text-lg font-medium text-gray-900 dark:text-white">{songDetails.artistName}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Produced By</p>
            <p className="text-lg font-medium text-gray-900 dark:text-white">{songDetails.producedBy}</p>
          </div>
        </div>
        {songDetails.isrcCode && (
          <div className="flex items-center gap-3">
            <Hash className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">ISRC Code</p>
              <p className="text-lg font-medium text-gray-900 dark:text-white">{songDetails.isrcCode}</p>
            </div>
          </div>
        )}
        {songDetails.duration && (
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Duration</p>
              <p className="text-lg font-medium text-gray-900 dark:text-white">{songDetails.duration}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}