import { useState } from "react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Check } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function Signup() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<"plans" | "register">("plans");
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const { data: plans = [] } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      const response = await fetch('/api/subscription-plans');
      if (!response.ok) throw new Error('Failed to fetch plans');
      return response.json();
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Account created. You can now login.",
        className: "bg-green-600 border-green-700 text-white",
      });
      setLocation("/login");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handlePlanSelect = (planId: number) => {
    setSelectedPlan(planId);
    setStep("register");
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    registerMutation.mutate({
      name: formData.name,
      email: formData.email,
      passwordHash: formData.password,
      plan: plans.find(p => p.id === selectedPlan)?.name.toLowerCase() || 'free',
    });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute bottom-0 left-0 right-0 h-[60vh] bg-gradient-to-t from-blue-900/20 to-transparent opacity-60 blur-3xl" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[120%] h-[50%] bg-blue-600/20 blur-[100px]" />
      </div>

      <div className="w-full max-w-5xl px-8 z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="mb-12 flex items-center gap-3 justify-center">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
            <path d="M20.2 6.00001C18.8 3.80001 16.4 2.20001 13.6 2.00001C13.6 2.00001 16.2 5.00001 15.2 8.00001C15.2 8.00001 12.2 5.60001 9.2 6.60001C9.2 6.60001 11.2 9.00001 9.8 11.2C9.8 11.2 7 9.40001 5 10.6C5 10.6 7.4 12.2 7.2 14.8C7.2 14.8 4.4 14 3 15.6C3 15.6 6 17 7.2 19.4C7.2 19.4 5.4 21.2 6.4 22.8C6.4 22.8 9.4 20.8 12 20.8C15.6 20.8 18.8 18.4 19.8 15C20.8 11.6 20.2 6.00001 20.2 6.00001Z" fill="white"/>
          </svg>
          <h1 className="text-5xl font-bold text-white">Fenix</h1>
        </div>

        {step === "plans" ? (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-2">Choose Your Plan</h2>
              <p className="text-muted-foreground">Select a subscription to get started</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan: any) => (
                <div key={plan.id} className="relative group">
                  <div className={`absolute inset-0 rounded-xl blur transition-all ${selectedPlan === plan.id ? 'bg-blue-500/50' : 'bg-white/5'} group-hover:bg-white/10`} />
                  <div className="relative bg-black/80 backdrop-blur border border-white/10 rounded-xl p-6 flex flex-col h-full hover:border-white/20 transition-colors cursor-pointer"
                    onClick={() => handlePlanSelect(plan.id)}>
                    <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                    <p className="text-muted-foreground text-sm mb-4">{plan.description}</p>
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-white">${(plan.price / 100).toFixed(2)}</span>
                      <span className="text-muted-foreground">/{plan.billingPeriod}</span>
                    </div>
                    <div className="space-y-3 flex-1 mb-6">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-white">{plan.maxDevices} devices</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-white">Up to {plan.maxQuality}</span>
                      </div>
                      {plan.features?.map((feature: any, i: number) => (
                        <div key={i} className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-white">{feature}</span>
                        </div>
                      ))}
                    </div>
                    <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white">
                      {selectedPlan === plan.id ? "Selected" : "Select"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-md mx-auto space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
              <p className="text-muted-foreground">Complete your registration</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <Label className="text-white mb-2 block">Full Name</Label>
                <Input 
                  placeholder="John Doe" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-white/90 border-0 text-black h-11"
                  required
                />
              </div>
              <div>
                <Label className="text-white mb-2 block">Email</Label>
                <Input 
                  type="email"
                  placeholder="you@example.com" 
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-white/90 border-0 text-black h-11"
                  required
                />
              </div>
              <div>
                <Label className="text-white mb-2 block">Password</Label>
                <Input 
                  type="password"
                  placeholder="••••••••" 
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="bg-white/90 border-0 text-black h-11"
                  required
                />
              </div>
              <div>
                <Label className="text-white mb-2 block">Confirm Password</Label>
                <Input 
                  type="password"
                  placeholder="••••••••" 
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="bg-white/90 border-0 text-black h-11"
                  required
                />
              </div>

              <Button 
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            <Button 
              variant="ghost" 
              className="w-full text-muted-foreground hover:text-white"
              onClick={() => setStep("plans")}
            >
              Back to Plans
            </Button>
          </div>
        )}

        <div className="mt-12 text-center text-muted-foreground text-sm">
          Already have an account? <Button variant="link" className="text-blue-400 hover:text-blue-300 p-0" onClick={() => setLocation("/login")}>Sign in</Button>
        </div>
      </div>
    </div>
  );
}
