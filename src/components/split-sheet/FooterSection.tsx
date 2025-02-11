import React from 'react';
import { Download, AlertCircle } from 'lucide-react';

interface FooterSectionProps {
  rightsType: string;
  onDownload: () => void;
  isGeneratingPDF: boolean;
  allSigned: boolean;
  error?: string | null;
}

export function FooterSection({ rightsType, onDownload, isGeneratingPDF, allSigned, error }: FooterSectionProps) {
  return (
    <>
      <div className="px-4 py-6 bg-gray-50 dark:bg-gray-700/50 rounded-b-lg">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-medium text-gray-900 dark:text-white">Rights Type:</span>
            <span className="text-lg text-gray-900 dark:text-white">{rightsType}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-lg font-medium text-gray-900 dark:text-white">Total Percentage:</span>
            <span className="text-lg text-gray-900 dark:text-white">100%</span>
          </div>
        </div>
      </div>

      {/* Separate container for the button that will be hidden in print/PDF */}
      <div className="print:hidden screen:block">
        <button 
          onClick={onDownload}
          className="w-full px-4 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed dark:bg-indigo-500 dark:hover:bg-indigo-600 print:hidden"
          disabled={isGeneratingPDF || !allSigned}
        >
          {isGeneratingPDF ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Generating PDF...
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              {allSigned
                ? "Download Split Sheet PDF"
                : "All collaborators must sign before downloading"}
            </>
          )}
        </button>
        {error && (
          <div className="mt-2 text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
      </div>
    </>
  );
}