'use client';

import { SignUp } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

export default function SignUpPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4 py-12 overflow-hidden" style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.3s ease-in' }}>
      {/* Animated Background Orbs - Same as Homepage */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
        <div className="absolute top-20 right-20 w-64 h-64 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-6000" />
        <div className="absolute bottom-20 left-20 w-56 h-56 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-8000" />
      </div>

      {/* Gradient Overlay */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 25% 25%, rgba(147, 51, 234, 0.15) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(6, 182, 212, 0.15) 0%, transparent 50%)',
        }}
      />

      {/* Back to Home Link */}
      <a 
        href="/" 
        className="absolute top-6 left-6 text-gray-400 hover:text-white transition-colors flex items-center gap-2 z-50"
      >
        ← Home
      </a>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-3 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/30">
              <span className="text-white font-black text-4xl">H</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent mb-3">
            Create Your Account
          </h1>
          <p className="text-gray-400 text-lg">
            Start building AI workflows in minutes
          </p>
        </div>
        
        {/* Sign Up Form Card - Glassmorphism */}
        <div className="bg-white/5 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 shadow-2xl">
          <SignUp 
            appearance={{
              elements: {
                // ROOT ELEMENTS - Remove all default containers
                rootBox: 'w-full max-w-none',
                container: 'bg-transparent shadow-none p-0',
                card: 'bg-transparent shadow-none p-0 border-0',
                
                // Main button - Gradient with hover effects
                formButtonPrimary: 'bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-200 hover:scale-105 shadow-lg shadow-purple-500/30',
                formButtonReset: 'text-gray-400 hover:text-white transition-colors',
                
                // Headers - Custom gradient text
                headerTitle: 'text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2',
                headerSubtitle: 'text-gray-400 text-base font-normal',
                header: 'mb-6 text-center',
                headerIcon: 'hidden',
                
                // Social buttons - Glassmorphism style
                socialButtons: 'gap-3 mb-6',
                socialButtonsBlockButton: 'bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl py-3.5 transition-all duration-200 hover:scale-105 hover:border-purple-500/50 backdrop-blur-sm',
                socialButtonsBlockButtonText: 'text-white font-semibold text-sm',
                socialButtonsBlockButtonArrow: 'text-white',
                socialButtonsBlockButtonIcon: 'text-white',
                
                // Form fields - Clean dark theme
                form: 'space-y-4',
                formField: 'space-y-1',
                formFieldLabel: 'text-gray-300 font-semibold text-sm mb-1.5',
                formFieldInput: 'bg-white/5 border border-white/20 text-white rounded-xl px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-gray-500',
                formFieldAction: 'text-purple-400 hover:text-purple-300 text-sm font-medium',
                
                // Divider
                dividerLine: 'bg-white/20 my-6',
                dividerText: 'text-gray-400 font-medium text-sm bg-[#0a0a0f] px-3',
                
                // Messages
                formFieldError: 'text-red-400 text-sm mt-1',
                formFieldSuccess: 'text-green-400 text-sm mt-1',
                identityPreviewEditButton: 'text-purple-400 hover:text-purple-300 font-medium',
                
                // Code inputs (OTP)
                formCodeField: 'bg-white/10 border border-white/20 rounded-xl text-white text-center text-xl font-bold',
                formCodeFieldList: 'gap-3',
                
                // Footer
                footer: 'mt-8 pt-6 border-t border-white/10',
                footerContent: 'text-gray-400 text-sm text-center',
                footerActionLink: 'text-purple-400 hover:text-purple-300 font-bold transition-colors',
                
                // Links
                link: 'text-purple-400 hover:text-purple-300 font-semibold transition-colors',
                linkButton: 'text-purple-400 hover:text-purple-300 font-semibold transition-colors',
                
                // Profile/Avatar
                avatarBox: 'w-16 h-16',
                
                // Modal/Overlay
                modalBackdrop: 'backdrop-blur-sm',
                modal: 'rounded-2xl',
              },
            }}
          />
        </div>
        
        {/* Sign In Link */}
        <p className="text-center text-gray-400 mt-8 text-base">
          Already have an account?{' '}
          <a href="/sign-in" className="text-purple-400 hover:text-purple-300 font-bold transition-colors">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
