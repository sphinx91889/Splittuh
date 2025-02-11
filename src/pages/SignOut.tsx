import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

export function SignOut() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else {
      navigate('/', { replace: true });
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [countdown, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-3">
            <LogOut className="w-12 h-12 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        
        <h2 className="mt-6 text-2xl font-bold text-gray-900 dark:text-white">
          Successfully Signed Out
        </h2>
        
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Thank you for using Splittuh
        </p>

        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          This page will redirect in {countdown} seconds...
        </p>

        <button
          onClick={() => navigate('/')}
          className="mt-8 w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
        >
          Return to Home
        </button>
      </div>
    </div>
  );
}