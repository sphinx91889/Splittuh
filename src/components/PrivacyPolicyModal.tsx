import React from 'react';
import { X } from 'lucide-react';

interface PrivacyPolicyModalProps {
  onClose: () => void;
}

export function PrivacyPolicyModal({ onClose }: PrivacyPolicyModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Privacy Policy</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
          <div className="prose dark:prose-invert max-w-none">
            <h1>Splittuh Privacy Policy</h1>
            <p><strong>Effective Date:</strong> January 1, 2025</p>

            <p>Welcome to Splittuh, a service provided by The Riviere Group, LLC ("Company," "we," "our," or "us"). We value your privacy and are committed to protecting your personal information.</p>

            <h2>1. Information We Collect</h2>
            <h3>a. Information You Provide</h3>
            <ul>
              <li><strong>Account Information</strong>: When you sign up, we collect your email address and any optional profile details you provide.</li>
              <li><strong>Collaborator Details</strong>: If you add collaborators to split sheets, their names, email addresses, and role details may be stored.</li>
              <li><strong>Support Requests</strong>: When you contact us, we may collect information related to your request.</li>
            </ul>

            <h3>b. Information We Automatically Collect</h3>
            <ul>
              <li><strong>Usage Data</strong>: We collect data on how you interact with Splittuh.</li>
              <li><strong>Device Information</strong>: We collect technical details about the device and browser you use.</li>
              <li><strong>Cookies & Tracking Technologies</strong>: We use cookies to improve functionality and user experience.</li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <p>We use your data to:</p>
            <ul>
              <li>Provide, operate, and improve Splittuh.</li>
              <li>Process and store split sheet agreements.</li>
              <li>Communicate with you about updates, support, and security alerts.</li>
              <li>Prevent fraud and enforce our Terms of Service.</li>
              <li>Comply with legal obligations.</li>
            </ul>

            <h2>3. How We Share Your Information</h2>
            <p>We <strong>do not sell your personal data</strong>. However, we may share information in the following cases:</p>
            <ul>
              <li><strong>With Collaborators</strong>: If you use Splittuh to create split sheets, collaborator information may be shared among parties.</li>
              <li><strong>With Service Providers</strong>: We may use third-party providers for hosting, analytics, and email services.</li>
              <li><strong>For Legal Reasons</strong>: If required by law, we may disclose information to comply with legal requests.</li>
            </ul>

            <h2>4. Data Security & Retention</h2>
            <ul>
              <li>We implement industry-standard security measures to protect your data.</li>
              <li>Your data is retained for as long as necessary to provide the Service and comply with legal requirements.</li>
            </ul>

            <h2>5. Your Rights & Choices</h2>
            <p>Depending on your location, you may have the right to:</p>
            <ul>
              <li>Access and update your data.</li>
              <li>Request deletion of your data.</li>
              <li>Opt-out of marketing communications.</li>
            </ul>

            <h2>6. Changes to This Privacy Policy</h2>
            <p>We may update this Privacy Policy from time to time. If significant changes occur, we will notify you by email or through the Service.</p>

            <h2>7. Contact Information</h2>
            <p>For any privacy-related questions, contact us at:</p>
            <p><strong>Email</strong>: Info@RiviereGroup.org</p>
          </div>
        </div>
      </div>
    </div>
  );
}