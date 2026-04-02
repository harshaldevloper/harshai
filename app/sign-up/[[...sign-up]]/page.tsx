import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center px-4 py-12">
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/30">
              <span className="text-white font-bold text-3xl">H</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">
            Create Your Account
          </h1>
          <p className="text-indigo-200 text-lg">
            Start building AI workflows in minutes
          </p>
        </div>
        
        {/* Sign Up Form Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
          <SignUp 
            appearance={{
              elements: {
                formButtonPrimary: 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200',
                card: 'bg-transparent shadow-none',
                headerTitle: 'text-white text-xl font-bold',
                headerSubtitle: 'text-indigo-200',
                socialButtonsBlockButton: 'bg-white/10 hover:bg-white/20 text-white border-white/20 rounded-xl py-3 transition-all duration-200',
                socialButtonsBlockButtonText: 'text-white font-medium',
                footerActionLink: 'text-indigo-300 hover:text-white font-semibold',
                identityPreviewEditButton: 'text-indigo-300 hover:text-white',
                formFieldLabel: 'text-indigo-200 font-medium',
                formFieldInput: 'bg-white/5 border-white/20 text-white rounded-xl focus:border-purple-500 focus:ring-purple-500',
                formFieldAction: 'text-indigo-300 hover:text-white',
                dividerLine: 'bg-white/20',
                dividerText: 'text-indigo-200',
                formFieldError: 'text-red-400',
                formFieldSuccess: 'text-green-400',
              },
            }}
          />
        </div>
        
        {/* Sign In Link */}
        <p className="text-center text-indigo-300 mt-8 text-base">
          Already have an account?{' '}
          <a href="/sign-in" className="text-white font-semibold hover:underline transition-all duration-200">
            Sign in
          </a>
        </p>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <a 
            href="/" 
            className="text-indigo-300 hover:text-white text-sm transition-all duration-200 inline-flex items-center gap-2"
          >
            ← Back to home
          </a>
        </div>
      </div>
    </div>
  );
}
