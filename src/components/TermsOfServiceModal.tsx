import React from 'react';
import { X } from 'lucide-react';

interface TermsOfServiceModalProps {
  onClose: () => void;
}

export function TermsOfServiceModal({ onClose }: TermsOfServiceModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Terms of Service</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
          <div className="prose dark:prose-invert max-w-none">
            <h1>Splittuh Terms of Service (TOS) & Disclaimers</h1>
            <p><strong>Effective Date:</strong> 01-01-2025</p>

            <p>Welcome to Splittuh, a digital tool developed by The Riviere Group, LLC ("Company," "we," "our," or "us"). By signing up for and using Splittuh ("Service"), you agree to these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the Service.</p>

            <h2>1. Acceptance of Terms</h2>
            <p>By creating an account and using Splittuh, you confirm that you have read, understood, and agree to be bound by these Terms, including our Privacy Policy. If you do not agree, you may not use the Service.</p>

            <h2>2. Nature of the Service & Disclaimer</h2>
            <ul>
              <li>Splittuh provides a digital tool for generating and managing song split sheets.</li>
              <li>Splittuh is <strong>not a legal service</strong> and <strong>does not provide legal advice</strong>.</li>
              <li>Users are solely responsible for ensuring the accuracy and validity of their split sheets.</li>
              <li>The Company is not responsible for any disputes, losses, or liabilities arising from the use of the Service.</li>
              <li>The Company does not verify the identities of users or the validity of any agreements generated on the platform.</li>
              <li>Users should seek <strong>independent legal counsel</strong> before finalizing agreements.</li>
            </ul>

            <h2>3. User Responsibilities</h2>
            <ul>
              <li>Users must ensure that all collaborator information entered is correct and legally accurate.</li>
              <li>Users are responsible for confirming that all parties agree to the ownership percentages outlined in the split sheet.</li>
              <li>Users must not use Splittuh for fraudulent, misleading, or unlawful activities.</li>
            </ul>

            <h2>4. Digital Signatures & Authentication</h2>
            <ul>
              <li>Splittuh may allow users to <strong>digitally sign</strong> agreements.</li>
              <li>Users acknowledge that Splittuh <strong>does not verify</strong> signatures, legal capacity, or authority of signers.</li>
              <li>Users are solely responsible for confirming the authenticity and enforceability of any digital signature.</li>
            </ul>

            <h2>5. Indemnification & Liability Waiver</h2>
            <p>By using the Service, you <strong>agree to indemnify and hold harmless</strong> The Riviere Group, LLC, its owners, employees, and affiliates from any claims, damages, or disputes arising from your use of Splittuh.</p>

            <h2>6. Limitation of Liability</h2>
            <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE COMPANY DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.</p>

            <h2>7. Termination of Service</h2>
            <ul>
              <li>The Company reserves the right to suspend or terminate any user account that violates these Terms.</li>
              <li>Users may terminate their account at any time, but previously generated split sheets may still be retained for record-keeping purposes.</li>
            </ul>

            <h2>8. Governing Law</h2>
            <p>These Terms shall be governed by and interpreted in accordance with the laws of the State of Florida, without regard to conflict of law principles.</p>

            <h2>9. Changes to Terms</h2>
            <p>The Company reserves the right to modify these Terms at any time. Users will be notified of significant changes via email or an in-app notification.</p>

            <h2>10. Contact Information</h2>
            <p>For any questions regarding these Terms, please contact us at <strong>Info@RiviereGroup.org</strong>.</p>
          </div>
        </div>
      </div>
    </div>
  );
}