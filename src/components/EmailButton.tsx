import React from 'react';
import { Mail } from 'lucide-react';

interface EmailButtonProps {
  email: string;
  hasSigned?: boolean;
}

export function EmailButton({ email, hasSigned = false }: EmailButtonProps) {
  if (hasSigned) {
    return null;
  }

  const subject = encodeURIComponent('Split Sheet Signature Request');
  const body = encodeURIComponent(
    'You have been requested to sign a split sheet. ' +
    'Please visit Splittuh.com to create an account or log in to review and sign the document.\n\n' +
    'Splittuh helps music creators like you manage song ownership and rights easily and professionally.\n\n' +
    'Best regards,\n' +
    'Splittuh Team'
  );
  
  const mailtoLink = `mailto:${encodeURIComponent(email)}?subject=${subject}&body=${body}`;

  return (
    <a
      href={mailtoLink}
      className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg transition-colors shadow-sm hover:shadow-md active:shadow-inner touch-manipulation"
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      <Mail className="w-4 h-4 mr-1.5" />
      <span className="whitespace-nowrap">Send Signature Request</span>
    </a>
  );
}