import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Feather } from "lucide-react";
import { toast } from "sonner";

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("admin@fenix.local");
  const [password, setPassword] = useState("Admin@123456");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect to dashboard if already logged in
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      setLocation("/");
    }
  }, [setLocation]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Login failed");
      }

      const data = await response.json();
      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("user", JSON.stringify(data));
      toast.success("Login successful!");
      setLocation("/");
    } catch (err: any) {
      const message = err.message || "Login failed. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black relative overflow-hidden">
      {/* Abstract Blue Wave Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute bottom-0 left-0 right-0 h-[60vh] bg-gradient-to-t from-blue-900/20 to-transparent opacity-60 blur-3xl transform scale-y-150" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[120%] h-[50%] bg-blue-600/20 blur-[100px] rounded-[100%]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
        
        {/* Subtle wave line effect */}
        <svg className="absolute bottom-0 left-0 w-full h-[50vh] opacity-30" viewBox="0 0 1440 320" preserveAspectRatio="none">
           <path fill="url(#grad1)" fillOpacity="0.2" d="M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,165.3C672,139,768,117,864,128C960,139,1056,181,1152,186.7C1248,192,1344,160,1392,144L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
           <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{stopColor:"#000000", stopOpacity:0}} />
              <stop offset="50%" style={{stopColor:"#3b82f6", stopOpacity:1}} />
              <stop offset="100%" style={{stopColor:"#000000", stopOpacity:0}} />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="w-full max-w-md px-8 z-10 flex flex-col items-center animate-in fade-in zoom-in-95 duration-500">
        {/* Logo */}
        <div className="mb-12 flex items-center gap-3">
          <div className="relative">
            {/* Custom Fenix Icon */}
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-0"/>
              <path d="M20.2 6.00001C18.8 3.80001 16.4 2.20001 13.6 2.00001C13.6 2.00001 16.2 5.00001 15.2 8.00001C15.2 8.00001 12.2 5.60001 9.2 6.60001C9.2 6.60001 11.2 9.00001 9.8 11.2C9.8 11.2 7 9.40001 5 10.6C5 10.6 7.4 12.2 7.2 14.8C7.2 14.8 4.4 14 3 15.6C3 15.6 6 17 7.2 19.4C7.2 19.4 5.4 21.2 6.4 22.8C6.4 22.8 9.4 20.8 12 20.8C15.6 20.8 18.8 18.4 19.8 15C20.8 11.6 20.2 6.00001 20.2 6.00001Z" fill="white"/>
            </svg>
          </div>
          <h1 className="text-5xl font-bold text-white tracking-tight">Fenix</h1>
        </div>

        <div className="w-full space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
            <p className="text-muted-foreground">Sign in to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Input 
                  type="email" 
                  placeholder="Email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/90 border-0 text-black placeholder:text-gray-500 h-12 text-md font-medium"
                  defaultValue="trbikerentals@gmail.com"
                />
              </div>
              <div className="space-y-2">
                <Input 
                  type="password" 
                  placeholder="Password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/90 border-0 text-black placeholder:text-gray-500 h-12 text-md font-medium"
                  defaultValue="password123"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-md font-bold bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white border-0 shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all duration-300"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Login"}
            </Button>
          </form>
        </div>

        {/* Footer branding/copyright if needed */}
        <div className="absolute bottom-8 left-8">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white text-xs font-bold">N</div>
        </div>
      </div>
    </div>
  );
}
