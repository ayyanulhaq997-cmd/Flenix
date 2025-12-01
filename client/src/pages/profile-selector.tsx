import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

interface Profile {
  id: number;
  name: string;
  avatarUrl?: string;
  isKidsProfile: boolean;
  isPinProtected: boolean;
}

export default function ProfileSelector() {
  const [, setLocation] = useLocation();
  const [pinInput, setPinInput] = useState("");
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null);

  const { data: profiles = [] } = useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const response = await fetch("/api/profiles");
      if (!response.ok) throw new Error("Failed to load profiles");
      return response.json();
    },
  });

  const handleProfileSelect = (profile: Profile) => {
    if (profile.isPinProtected) {
      setSelectedProfileId(profile.id);
      setPinInput("");
    } else {
      selectProfile(profile.id);
    }
  };

  const handlePinSubmit = async () => {
    const response = await fetch(`/api/profiles/${selectedProfileId}/verify-pin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin: pinInput }),
    });

    if (response.ok) {
      selectProfile(selectedProfileId!);
    } else {
      setPinInput("");
    }
  };

  const selectProfile = (profileId: number) => {
    localStorage.setItem("selectedProfileId", profileId.toString());
    setLocation("/browse");
  };

  if (selectedProfileId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 flex items-center justify-center px-4">
        <div className="max-w-sm w-full">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">
            Enter PIN
          </h2>
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <input
              type="password"
              placeholder="Enter 4-digit PIN"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value.slice(0, 4))}
              maxLength={4}
              className="w-full px-4 py-3 bg-slate-700 text-white rounded mb-4 text-center text-2xl tracking-widest border border-slate-600 focus:border-blue-500 focus:outline-none"
              autoFocus
            />
            <Button
              onClick={handlePinSubmit}
              className="w-full mb-2"
              disabled={pinInput.length !== 4}
            >
              Unlock
            </Button>
            <Button
              onClick={() => setSelectedProfileId(null)}
              variant="outline"
              className="w-full"
            >
              Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 flex items-center justify-center px-4">
      <div className="max-w-4xl w-full">
        <h1 className="text-4xl font-bold text-white mb-12 text-center">
          Who's Watching?
        </h1>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
          {profiles.map((profile: Profile) => (
            <button
              key={profile.id}
              onClick={() => handleProfileSelect(profile)}
              className="group flex flex-col items-center gap-3 hover:opacity-80 transition-opacity"
              data-testid={`profile-card-${profile.id}`}
            >
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-3xl group-hover:ring-2 group-hover:ring-white transition-all">
                {profile.isKidsProfile ? "👶" : profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full rounded-lg object-cover" />
                ) : (
                  "👤"
                )}
                {profile.isPinProtected && (
                  <div className="absolute -bottom-1 -right-1 bg-yellow-500 rounded-full p-1">
                    🔒
                  </div>
                )}
              </div>
              <span className="text-white font-medium text-center text-sm">
                {profile.name}
              </span>
            </button>
          ))}

          {/* Add Profile Button */}
          {profiles.length < 5 && (
            <button className="flex flex-col items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-24 h-24 bg-slate-700 rounded-lg flex items-center justify-center text-3xl hover:bg-slate-600 transition-colors">
                ➕
              </div>
              <span className="text-slate-400 font-medium text-center text-sm">
                Add Profile
              </span>
            </button>
          )}
        </div>

        <div className="text-center">
          <Button
            onClick={() => setLocation("/account")}
            variant="outline"
          >
            Account Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
