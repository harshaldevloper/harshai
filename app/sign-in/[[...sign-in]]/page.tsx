import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-2xl">H</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome Back
          </h1>
          <p className="text-indigo-200">
            Sign in to access your HarshAI dashboard
          </p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <SignIn 
            appearance={{
              elements: {
                formButtonPrimary: 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white',
                card: 'bg-transparent shadow-none',
                headerTitle: 'text-white',
                headerSubtitle: 'text-indigo-200',
                socialButtonsBlockButton: 'bg-white/10 hover:bg-white/20 text-white border-white/20',
                footerActionLink: 'text-indigo-300 hover:text-white',
              },
            }}
          />
        </div>
        
        <p className="text-center text-indigo-300 mt-6 text-sm">
          Don't have an account?{' '}
          <a href="/sign-up" className="text-white font-semibold hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
