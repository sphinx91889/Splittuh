import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { X } from 'lucide-react';

interface SignaturePadProps {
  collaboratorName: string;
  onSave: (signature: string) => void;
  onClose: () => void;
}

export function SignaturePad({ collaboratorName, onSave, onClose }: SignaturePadProps) {
  const sigPad = useRef<SignatureCanvas>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  const clear = () => {
    sigPad.current?.clear();
    setIsEmpty(true);
  };

  const save = () => {
    if (sigPad.current && !isEmpty) {
      // Optimize signature storage by reducing quality
      const signature = sigPad.current.toDataURL('image/png', 0.5);
      onSave(signature);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Sign Split Sheet</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Signing as: {collaboratorName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg mb-4 bg-white">
          <SignatureCanvas
            ref={sigPad}
            canvasProps={{
              className: 'w-full h-64',
              style: { 
                width: '100%', 
                height: '256px',
                backgroundColor: '#ffffff'
              }
            }}
            onBegin={() => setIsEmpty(false)}
          />
        </div>
        
        <div className="flex justify-end gap-3">
          <button
            onClick={clear}
            className="px-4 py-2 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Clear
          </button>
          <button
            onClick={save}
            disabled={isEmpty}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:bg-gray-400 dark:bg-indigo-500 dark:hover:bg-indigo-600 dark:disabled:bg-gray-600"
          >
            Save Signature
          </button>
        </div>
      </div>
    </div>
  );
}