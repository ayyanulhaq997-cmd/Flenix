import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full text-center">
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Fenix Streaming
          </h1>
          <p className="text-lg sm:text-xl text-slate-300">
            Watch movies, series, and live channels anytime, anywhere
          </p>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 sm:p-8 mb-8 border border-slate-700">
          <h2 className="text-xl sm:text-2xl font-semibold text-white mb-6">
            Welcome to Your Entertainment Hub
          </h2>
          <p className="text-slate-300 mb-8 leading-relaxed">
            Stream thousands of movies and series in stunning quality. 
            Create multiple profiles for your family, set parental controls, 
            and enjoy personalized recommendations.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="text-4xl mb-2">📺</div>
              <h3 className="font-semibold text-white mb-2">Watch Everywhere</h3>
              <p className="text-sm text-slate-400">
                Mobile, Web, and TV apps with seamless sync
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">👨‍👩‍👧‍👦</div>
              <h3 className="font-semibold text-white mb-2">Family Profiles</h3>
              <p className="text-sm text-slate-400">
                Up to 5 profiles with custom watchlists
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">🔒</div>
              <h3 className="font-semibold text-white mb-2">Parental Controls</h3>
              <p className="text-sm text-slate-400">
                Maturity ratings and PIN protection
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => setLocation("/signup")}
              size="lg"
              className="px-8"
            >
              Sign Up
            </Button>
            <Button
              onClick={() => setLocation("/login")}
              variant="outline"
              size="lg"
              className="px-8 cursor-pointer pointer-events-auto"
              data-testid="button-signin"
            >
              Sign In
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-slate-400 text-sm">
          <div>
            <div className="font-semibold text-white mb-1">4K Quality</div>
            <p>Ultra HD streaming</p>
          </div>
          <div>
            <div className="font-semibold text-white mb-1">Offline Mode</div>
            <p>Download & watch later</p>
          </div>
          <div>
            <div className="font-semibold text-white mb-1">Ad-Free</div>
            <p>Uninterrupted viewing</p>
          </div>
          <div>
            <div className="font-semibold text-white mb-1">Multi-Device</div>
            <p>Watch on all screens</p>
          </div>
        </div>
      </div>
    </div>
  );
}
