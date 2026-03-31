import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-black/40 backdrop-blur-lg border-t border-white/10">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">H</span>
              </div>
              <span className="text-white font-bold text-lg">HarshAI</span>
            </div>
            <p className="text-indigo-300 mb-4 max-w-md">
              Your AI Command Center. Connect 50+ AI tools into automated workflows. No code required.
            </p>
            <p className="text-indigo-400 text-sm">
              Built with ❤️ by Harshal Lahare
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-2">
              <li>
                <Link href="#features" className="text-indigo-300 hover:text-white transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="text-indigo-300 hover:text-white transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="#integrations" className="text-indigo-300 hover:text-white transition-colors">
                  Integrations
                </Link>
              </li>
              <li>
                <Link href="#changelog" className="text-indigo-300 hover:text-white transition-colors">
                  Changelog
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link href="#docs" className="text-indigo-300 hover:text-white transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="#templates" className="text-indigo-300 hover:text-white transition-colors">
                  Templates
                </Link>
              </li>
              <li>
                <Link href="#blog" className="text-indigo-300 hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#support" className="text-indigo-300 hover:text-white transition-colors">
                  Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-indigo-400 text-sm">
            © 2026 HarshAI. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="#privacy" className="text-indigo-400 hover:text-white text-sm transition-colors">
              Privacy
            </Link>
            <Link href="#terms" className="text-indigo-400 hover:text-white text-sm transition-colors">
              Terms
            </Link>
            <Link href="#twitter" className="text-indigo-400 hover:text-white text-sm transition-colors">
              Twitter
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
