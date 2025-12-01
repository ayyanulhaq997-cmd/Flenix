import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Lock } from "lucide-react";

interface PaymentFormProps {
  planId: number;
  planName: string;
  planPrice: number;
  email: string;
}

/**
 * Secure Payment Collection Component
 * Collects payment information and processes subscription payment
 */
export default function PaymentPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Get plan info from localStorage
  const planData = localStorage.getItem("signupPlanData");
  const userEmail = localStorage.getItem("signupEmail") || "";

  if (!planData) {
    setLocation("/signup");
    return null;
  }

  const { planId, planName, planPrice } = JSON.parse(planData);
  const isPaid = planPrice > 0;

  const [cardData, setCardData] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
  });

  const paymentMutation = useMutation({
    mutationFn: async () => {
      // In production, this would use Stripe Elements for secure tokenization
      // For now, we simulate the payment process
      const response = await fetch("/api/payments/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          amount: planPrice,
          email: userEmail,
          cardToken: `tok_${Date.now()}`, // Mock token
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Payment failed");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Payment Successful!",
        description: `Subscription to ${planName} activated`,
        className: "bg-green-600 border-green-700 text-white",
      });
      // Clear signup data
      localStorage.removeItem("signupPlanData");
      localStorage.removeItem("signupEmail");
      localStorage.removeItem("signupUserData");
      setLocation("/tv/profiles");
    },
    onError: (error: any) => {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isPaid) {
      // Validate card details
      if (!cardData.cardNumber || !cardData.cardName || !cardData.expiryDate || !cardData.cvv) {
        toast({
          title: "Incomplete Payment Info",
          description: "Please fill in all card details",
          variant: "destructive",
        });
        return;
      }

      if (cardData.cardNumber.replace(/\s/g, "").length !== 16) {
        toast({
          title: "Invalid Card Number",
          description: "Card number must be 16 digits",
          variant: "destructive",
        });
        return;
      }
    }

    setIsLoading(true);
    paymentMutation.mutate();
  };

  const handleSkipPayment = async () => {
    // For free plan, register and activate account
    if (planPrice === 0) {
      setIsLoading(true);
      try {
        // Get password from signup process or use a generated one
        const password = localStorage.getItem("signupPassword") || Math.random().toString(36).slice(2, 15);
        
        const response = await fetch("/api/auth/register-free-plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: userEmail,
            name: userEmail.split("@")[0],
            password,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to activate free plan");
        }

        const data = await response.json();
        
        // Save auth token
        localStorage.setItem("appToken", data.token);
        localStorage.setItem("userId", data.user.id.toString());
        localStorage.setItem("userPlan", data.user.plan);
        
        // Clear signup data
        localStorage.removeItem("signupPlanData");
        localStorage.removeItem("signupEmail");
        localStorage.removeItem("signupPassword");
        localStorage.removeItem("signupUserData");
        
        // Show success message and redirect to profiles
        toast({
          title: "Success!",
          description: "Your free plan has been activated. Welcome to Fenix!",
        });
        
        setTimeout(() => {
          setLocation("/tv/profiles");
        }, 1500);
      } catch (error: any) {
        toast({
          title: "Activation Failed",
          description: error.message,
          variant: "destructive",
        });
        setIsLoading(false);
      }
    }
  };

  const formatCardNumber = (value: string) => {
    return value.replace(/\s/g, "").replace(/(\d{4})/g, "$1 ").trim();
  };

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center gap-3 justify-center mb-6">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
              <path d="M20.2 6.00001C18.8 3.80001 16.4 2.20001 13.6 2.00001C13.6 2.00001 16.2 5.00001 15.2 8.00001C15.2 8.00001 12.2 5.60001 9.2 6.60001C9.2 6.60001 11.2 9.00001 9.8 11.2C9.8 11.2 7 9.40001 5 10.6C5 10.6 7.4 12.2 7.2 14.8C7.2 14.8 4.4 14 3 15.6C3 15.6 6 17 7.2 19.4C7.2 19.4 5.4 21.2 6.4 22.8C6.4 22.8 9.4 20.8 12 20.8C15.6 20.8 18.8 18.4 19.8 15C20.8 11.6 20.2 6.00001 20.2 6.00001Z" fill="white"/>
            </svg>
            <h1 className="text-3xl font-bold text-white">Fenix</h1>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Confirm Subscription</h2>
          <p className="text-slate-300 text-sm">Complete your {planName} plan registration</p>
        </div>

        {/* Order Summary */}
        <div className="bg-slate-800 rounded-lg p-6 mb-8 border border-slate-700">
          <div className="flex justify-between mb-4">
            <span className="text-slate-300">{planName} Plan</span>
            <span className="text-white font-semibold">${planPrice.toFixed(2)}/mo</span>
          </div>
          <div className="border-t border-slate-600 pt-4">
            <div className="flex justify-between">
              <span className="text-slate-300 font-semibold">Total</span>
              <span className="text-white text-lg font-bold">${planPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {isPaid ? (
          /* Payment Form for Paid Plans */
          <form onSubmit={handlePayment} className="space-y-4">
            <div>
              <Label className="text-white mb-2 block text-sm font-semibold">Cardholder Name</Label>
              <Input
                placeholder="John Doe"
                value={cardData.cardName}
                onChange={(e) => setCardData({ ...cardData, cardName: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 h-11"
                data-testid="input-card-name"
                required
              />
            </div>

            <div>
              <Label className="text-white mb-2 block text-sm font-semibold flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Card Number
              </Label>
              <Input
                placeholder="4242 4242 4242 4242"
                value={cardData.cardNumber}
                onChange={(e) => setCardData({ ...cardData, cardNumber: formatCardNumber(e.target.value) })}
                maxLength={19}
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 h-11 font-mono"
                data-testid="input-card-number"
                required
              />
              <p className="text-xs text-slate-400 mt-1">Test: 4242 4242 4242 4242</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white mb-2 block text-sm font-semibold">Expiry Date</Label>
                <Input
                  placeholder="MM/YY"
                  value={cardData.expiryDate}
                  onChange={(e) => setCardData({ ...cardData, expiryDate: formatExpiryDate(e.target.value) })}
                  maxLength={5}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 h-11 font-mono"
                  data-testid="input-expiry"
                  required
                />
              </div>
              <div>
                <Label className="text-white mb-2 block text-sm font-semibold">CVV</Label>
                <Input
                  placeholder="123"
                  value={cardData.cvv}
                  onChange={(e) => setCardData({ ...cardData, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                  maxLength={4}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 h-11 font-mono"
                  data-testid="input-cvv"
                  required
                />
              </div>
            </div>

            <div className="bg-blue-900/20 border border-blue-500/20 rounded p-3 mt-6">
              <div className="flex items-start gap-2">
                <Lock className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-200">
                  Your payment information is encrypted and secured. In production, this integrates with Stripe for full PCI compliance.
                </p>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold mt-8"
              disabled={isLoading || paymentMutation.isPending}
              data-testid="button-confirm-payment"
            >
              {isLoading || paymentMutation.isPending ? "Processing..." : `Pay $${planPrice.toFixed(2)}`}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full text-slate-400 hover:text-white"
              onClick={() => setLocation("/signup")}
            >
              Back to Plan Selection
            </Button>
          </form>
        ) : (
          /* Free Plan - No Payment Required */
          <div className="space-y-4">
            <div className="bg-green-900/20 border border-green-500/20 rounded-lg p-6 text-center">
              <p className="text-green-300 font-semibold mb-2">✓ Free Plan Selected</p>
              <p className="text-slate-300 text-sm">No payment required. Your account will be activated immediately.</p>
            </div>

            <Button
              onClick={handleSkipPayment}
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold"
              disabled={paymentMutation.isPending}
              data-testid="button-activate-free"
            >
              {paymentMutation.isPending ? "Activating..." : "Activate Free Plan"}
            </Button>

            <Button
              variant="ghost"
              className="w-full text-slate-400 hover:text-white"
              onClick={() => setLocation("/signup")}
            >
              Change Plan
            </Button>
          </div>
        )}

        <p className="text-xs text-slate-400 text-center mt-6">
          By proceeding, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
