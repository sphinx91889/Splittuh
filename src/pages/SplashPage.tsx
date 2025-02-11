import React, { useState, useEffect } from 'react';
import { LogIn, Sparkles, BookOpen } from 'lucide-react';
import { AuthModal } from '../components/auth/AuthModal';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { RainbowButton } from '../components/ui/rainbow-button';
import { updateMetaTags, generateStructuredData } from '../lib/seo';

export function SplashPage() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Update meta tags for homepage
    updateMetaTags({
      title: 'Professional Split Sheet Management',
      description: 'Create, manage, and sign split sheets for your music collaborations. Track ownership, manage rights, and get signatures - all in one place.',
      url: 'https://splittuh.com',
      type: 'website'
    });

    // Add structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = generateStructuredData('WebSite', {});
    document.head.appendChild(script);
  }, []);

  const handleAuthSuccess = async () => {
    setShowAuthModal(false);
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      navigate('/auth/success');
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-4 overflow-hidden bg-white">
      {/* Alpha Badge - Fixed to top right */}
      <div className="fixed top-4 right-4 z-50 animate-fade-in">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg animate-pulse">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-yellow-300" />
            <span className="text-white font-medium">Join Our Exclusive Alpha</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-[3] max-w-3xl w-full text-center mt-[50px]">
        <div className="animate-fade-in-up">
          <img 
            src="https://i.imghippo.com/files/iIC1934sY.png" 
            alt="Splittuh Logo" 
            className="w-40 h-40 object-contain mx-auto mb-8"
          />
        </div>
        
        <p className="text-xl text-black mb-8 max-w-2xl mx-auto animate-fade-in-up [animation-delay:200ms]">
          Create professional split sheets for your music collaborations. Track ownership, manage rights, and get signatures - all in one place.
        </p>

        <RainbowButton
          onClick={() => setShowAuthModal(true)}
          className="!h-auto !px-12 !py-6 text-2xl animate-fade-in-up [animation-delay:400ms]"
        >
          <div className="flex items-center gap-3 text-white">
            <LogIn className="w-8 h-8" />
            Get Started with Splittuh
          </div>
        </RainbowButton>

        <div className="mt-16 mb-8 relative animate-fade-in-up [animation-delay:600ms]">
          <div className="absolute inset-0 bg-white/10 blur-xl"></div>
          <h2 className="relative z-10 text-4xl md:text-5xl font-bold text-black tracking-tight leading-tight">
            DON'T LEAVE MONEY<br />
            ON THE TABLE.
          </h2>
        </div>

        {/* Dashboard Preview */}
        <div className="mb-12 relative animate-fade-in-up [animation-delay:800ms]">
          <div className="absolute inset-0 bg-white/20 blur-xl rounded-2xl"></div>
          <img
            src="https://i.imghippo.com/files/ap5833Ewo.png"
            alt="Splittuh Preview"
            className="relative z-10 w-full max-w-2xl mx-auto rounded-lg shadow-2xl"
          />
        </div>

        {/* Feature Panels */}
        <div className="grid gap-12">
          {/* Split Sheet Generation & Signing Feature Panel */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden animate-fade-in-up [animation-delay:1000ms]">
            <div className="grid md:grid-cols-2 items-center">
              <div className="p-8 text-left">
                <h3 className="text-3xl font-bold text-black mb-4">
                  Lock in Your Splits. Secure Your Rights.
                </h3>
                <p className="text-lg text-gray-700">
                  No paperwork, no hassle—just fair splits. Generate and sign industry-standard split sheets instantly.
                </p>
              </div>
              <div className="relative h-[300px]">
                <img
                  src="https://i.imghippo.com/files/ptgJ3894Gd.png"
                  alt="Split Sheet Generation"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Master & Publishing Ownership Tracking Feature Panel */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden animate-fade-in-up [animation-delay:1200ms]">
            <div className="grid md:grid-cols-2 items-center">
              <div className="relative h-[300px] md:order-2">
                <img
                  src="https://i.imghippo.com/files/RmJY4527e.png"
                  alt="Ownership Tracking"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              <div className="p-8 text-left md:order-1">
                <h3 className="text-3xl font-bold text-black mb-4">
                  Track Your Rights. Maximize Your Profits.
                </h3>
                <p className="text-lg text-gray-700">
                  Know what you own, get what you're owed. Keep full control of your master and publishing splits in one place.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-3 text-left mt-12">
          <div className="bg-gray-50 p-6 rounded-lg animate-fade-in-up [animation-delay:1400ms]">
            <h3 className="text-lg font-semibold text-black mb-2">
              Easy Collaboration
            </h3>
            <p className="text-black">
              Invite collaborators, track contributions, and manage ownership splits effortlessly.
            </p>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg animate-fade-in-up [animation-delay:1600ms]">
            <h3 className="text-lg font-semibold text-black mb-2">
              Digital Signatures
            </h3>
            <p className="text-black">
              Collect signatures electronically and maintain a clear record of agreements.
            </p>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg animate-fade-in-up [animation-delay:1800ms]">
            <h3 className="text-lg font-semibold text-black mb-2">
              Professional Format
            </h3>
            <p className="text-black">
              Generate industry-standard split sheets that look professional and protect your rights.
            </p>
          </div>
        </div>

        {/* Blog Link - Now at the bottom */}
        <div className="mt-16 mb-8 animate-fade-in-up [animation-delay:2000ms]">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 text-lg font-medium text-gray-900 hover:text-blue-600 dark:text-gray-100 dark:hover:text-blue-400 transition-colors"
          >
            <BookOpen className="w-6 h-6" />
            Read Our Blog
          </Link>
        </div>
      </div>

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
}