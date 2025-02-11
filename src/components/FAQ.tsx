import React from 'react';
import { HelpCircle } from 'lucide-react';

export function FAQ() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <HelpCircle className="w-6 h-6" />
        Frequently Asked Questions
      </h2>

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">When should I create a split sheet?</h3>
          <p className="text-gray-600">Create a split sheet as soon as possible after completing a song, ideally before any release or monetization begins.</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900">Are split sheets legally binding?</h3>
          <p className="text-gray-600">Yes, when properly executed with signatures from all parties, split sheets are legally binding documents.</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900">What happens if I don't have a split sheet?</h3>
          <p className="text-gray-600">Without a split sheet, royalty distribution can become complicated and may lead to legal disputes between collaborators.</p>
        </div>
      </div>
    </div>
  );
}