import { useLocation } from "wouter";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Plan {
  id: string;
  name: string;
  price: string;
  description: string;
  features: string[];
  highlighted?: boolean;
}

const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    description: "Basic streaming access",
    features: [
      "SD Quality (480p)",
      "1 Device",
      "Basic Content",
      "No Offline",
    ],
  },
  {
    id: "standard",
    name: "Standard",
    price: "$9.99",
    description: "Best for most viewers",
    features: [
      "HD Quality (1080p)",
      "2 Devices",
      "Full Content Library",
      "Offline Download",
    ],
    highlighted: true,
  },
  {
    id: "premium",
    name: "Premium",
    price: "$19.99",
    description: "Ultimate experience",
    features: [
      "4K Quality (2160p)",
      "4 Devices",
      "Exclusive Content",
      "Download & Stream",
    ],
  },
];

export default function PlanSelection() {
  const [, setLocation] = useLocation();

  const handleSelectPlan = (planId: string) => {
    // Store selected plan in localStorage
    localStorage.setItem("selectedPlan", planId);
    
    // Check if user is authenticated
    const token = localStorage.getItem("appToken");
    
    if (token) {
      // Already logged in - go to browse
      setLocation("/browse");
    } else {
      // Not logged in - go to signup
      setLocation("/signup");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl w-full py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-lg text-slate-300">
            Select the perfect plan for your entertainment needs
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-lg p-8 transition-all ${
                plan.highlighted
                  ? "bg-gradient-to-br from-blue-600 to-blue-800 border-2 border-blue-400 transform scale-105 shadow-2xl"
                  : "bg-slate-800 border-2 border-slate-700 hover:border-slate-600"
              }`}
              data-testid={`plan-card-${plan.id}`}
            >
              {plan.highlighted && (
                <div className="text-center mb-4">
                  <span className="inline-block bg-white/20 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    MOST POPULAR
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {plan.name}
                </h2>
                <p className="text-slate-300 text-sm">{plan.description}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline">
                  <span className="text-5xl font-bold text-white">
                    {plan.price}
                  </span>
                  {plan.price !== "$0" && (
                    <span className="text-slate-300 ml-2">/month</span>
                  )}
                </div>
              </div>

              <div className="space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-200 text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => handleSelectPlan(plan.id)}
                className={`w-full py-3 font-semibold transition-all ${
                  plan.highlighted
                    ? "bg-white text-blue-600 hover:bg-slate-100"
                    : "bg-slate-700 text-white hover:bg-slate-600"
                }`}
                data-testid={`button-select-${plan.id}`}
              >
                Choose {plan.name}
              </Button>
            </div>
          ))}
        </div>

        {/* Features Comparison */}
        <div className="bg-slate-800/50 rounded-lg p-8 border border-slate-700">
          <h3 className="text-xl font-semibold text-white mb-6">
            All Plans Include:
          </h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              "Multiple Profiles (up to 5)",
              "Parental Controls",
              "Personalized Recommendations",
              "Multi-Device Support",
              "Spanish Language Support",
              "Cancel Anytime",
            ].map((feature) => (
              <div key={feature} className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-200 text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
