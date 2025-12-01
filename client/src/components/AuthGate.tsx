import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { LogIn, UserPlus } from "lucide-react";

/**
 * Authentication Gate Component
 * Displays sign-in and sign-up options when user attempts to access restricted content
 */
export function AuthGate() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center space-y-12">
        {/* Logo */}
        <div className="flex items-center gap-3 justify-center mb-8">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
            <path d="M20.2 6.00001C18.8 3.80001 16.4 2.20001 13.6 2.00001C13.6 2.00001 16.2 5.00001 15.2 8.00001C15.2 8.00001 12.2 5.60001 9.2 6.60001C9.2 6.60001 11.2 9.00001 9.8 11.2C9.8 11.2 7 9.40001 5 10.6C5 10.6 7.4 12.2 7.2 14.8C7.2 14.8 4.4 14 3 15.6C3 15.6 6 17 7.2 19.4C7.2 19.4 5.4 21.2 6.4 22.8C6.4 22.8 9.4 20.8 12 20.8C15.6 20.8 18.8 18.4 19.8 15C20.8 11.6 20.2 6.00001 20.2 6.00001Z" fill="white"/>
          </svg>
          <h1 className="text-5xl font-bold text-white">Fenix</h1>
        </div>

        {/* Header */}
        <div className="space-y-4">
          <h2 className="text-4xl font-bold text-white">
            Ready to Stream?
          </h2>
          <p className="text-xl text-slate-300">
            Sign in to your account or create a new membership to access exclusive content
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
          {/* Sign In Button */}
          <Button
            onClick={() => setLocation("/login")}
            size="lg"
            className="px-12 py-6 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl"
            data-testid="button-signin-gate"
          >
            <LogIn className="w-5 h-5 mr-2" />
            Sign In
          </Button>

          {/* Sign Up Button */}
          <Button
            onClick={() => setLocation("/signup")}
            size="lg"
            variant="outline"
            className="px-12 py-6 border-2 border-white text-white bg-transparent hover:bg-white/10 text-lg font-semibold rounded-lg transition-all"
            data-testid="button-signup-gate"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Start Your Membership
          </Button>
        </div>

        {/* Features List */}
        <div className="grid sm:grid-cols-3 gap-8 pt-12 border-t border-slate-700">
          <div className="space-y-2">
            <div className="text-3xl">🎬</div>
            <h3 className="font-semibold text-white">Unlimited Content</h3>
            <p className="text-sm text-slate-400">Thousands of movies and series</p>
          </div>
          <div className="space-y-2">
            <div className="text-3xl">📱</div>
            <h3 className="font-semibold text-white">Multi-Device</h3>
            <p className="text-sm text-slate-400">Watch on all your devices</p>
          </div>
          <div className="space-y-2">
            <div className="text-3xl">👨‍👩‍👧‍👦</div>
            <h3 className="font-semibold text-white">Family Profiles</h3>
            <p className="text-sm text-slate-400">Up to 5 profiles per account</p>
          </div>
        </div>
      </div>
    </div>
  );
}
