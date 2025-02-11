import React, { useState } from 'react';
import { TermsOfServiceModal } from './TermsOfServiceModal';
import { PrivacyPolicyModal } from './PrivacyPolicyModal';

export function Footer() {
  const [showTOS, setShowTOS] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  return (
    <>
      <footer className="mt-auto py-6 text-center text-gray-600 dark:text-gray-400 text-sm">
        <p className="mb-2">Splittuh 2025. All Rights Reserved.</p>
        <div className="space-x-4">
          <button
            onClick={() => setShowTOS(true)}
            className="text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Terms of Service
          </button>
          <span>|</span>
          <button
            onClick={() => setShowPrivacy(true)}
            className="text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Privacy Policy
          </button>
        </div>
      </footer>

      {showTOS && <TermsOfServiceModal onClose={() => setShowTOS(false)} />}
      {showPrivacy && <PrivacyPolicyModal onClose={() => setShowPrivacy(false)} />}
    </>
  );
}