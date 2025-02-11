import React from 'react';
import { 
  BookOpen, 
  FileText, 
  Users, 
  PenTool, 
  CheckCircle2, 
  X,
  AlertCircle 
} from 'lucide-react';

interface TutorialGuideProps {
  onClose: () => void;
}

export function TutorialGuide({ onClose }: TutorialGuideProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              How to Use Splittuh
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Important Notice */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200">Important Note About Signatures</h4>
                <p className="text-yellow-700 dark:text-yellow-300 text-sm mt-1">
                  Collaborators can only sign split sheets if their account email address matches the email address listed on the split sheet. Make sure to use the correct email addresses for all collaborators.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Creating Your First Split Sheet
            </h3>
            <ol className="ml-6 space-y-3 text-gray-600 dark:text-gray-300">
              <li>1. Click the "Create New Split Sheet" button on your dashboard</li>
              <li>2. Enter the song details (title, release date, artist name)</li>
              <li>3. Add collaborator information and their ownership percentages</li>
              <li>4. Review and confirm all details before generating</li>
            </ol>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Managing Collaborators
            </h3>
            <ul className="ml-6 space-y-3 text-gray-600 dark:text-gray-300">
              <li>• Add collaborators with their correct email addresses</li>
              <li>• Assign ownership percentages (must total 100%)</li>
              <li>• Include publisher information if applicable</li>
              <li>• Track signature status in real-time</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <PenTool className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Signatures and Verification
            </h3>
            <ul className="ml-6 space-y-3 text-gray-600 dark:text-gray-300">
              <li>• Collaborators must sign in with their matching email address</li>
              <li>• Digital signatures are legally binding</li>
              <li>• View signature status directly on the split sheet</li>
              <li>• Download the completed split sheet as PDF</li>
            </ul>
          </div>

          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 dark:text-blue-200">Pro Tips</h4>
                <ul className="mt-2 space-y-2 text-blue-700 dark:text-blue-300 text-sm">
                  <li>• Create split sheets before releasing your music to prevent future disputes</li>
                  <li>• Double-check all collaborator email addresses before finalizing</li>
                  <li>• Keep your account email address up to date to maintain signing access</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-800/90 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
}