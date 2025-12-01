import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface AccountData {
  email: string;
  name: string;
  plan: string;
  joinedAt: string;
}

export default function AccountSettings() {
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { data: account } = useQuery({
    queryKey: ["account"],
    queryFn: async () => {
      const response = await fetch("/api/account", {
        headers: { Authorization: `Bearer ${localStorage.getItem("appToken")}` },
      });
      if (!response.ok) throw new Error("Failed to load account");
      return response.json() as Promise<AccountData>;
    },
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ["sessions"],
    queryFn: async () => {
      const response = await fetch("/api/sessions", {
        headers: { Authorization: `Bearer ${localStorage.getItem("appToken")}` },
      });
      if (!response.ok) throw new Error("Failed to load sessions");
      return response.json();
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/account/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("appToken")}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!response.ok) throw new Error("Failed to change password");
      return response.json();
    },
    onSuccess: () => {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setIsChangingPassword(false);
    },
  });

  const signOutAllMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/account/sign-out-all-devices", {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("appToken")}` },
      });
      if (!response.ok) throw new Error("Failed to sign out");
      localStorage.removeItem("appToken");
      window.location.href = "/login";
    },
  });

  const signOutDeviceMutation = useMutation({
    mutationFn: async (sessionId: number) => {
      const response = await fetch(`/api/sessions/${sessionId}/sign-out`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("appToken")}` },
      });
      if (!response.ok) throw new Error("Failed to sign out device");
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Account Settings</h1>

        {/* Account Information */}
        <Card className="bg-slate-800 border-slate-700 p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Account Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-400">Email</label>
              <p className="text-white font-medium">{account?.email}</p>
            </div>
            <div>
              <label className="text-sm text-slate-400">Name</label>
              <p className="text-white font-medium">{account?.name}</p>
            </div>
            <div>
              <label className="text-sm text-slate-400">Plan</label>
              <p className="text-white font-medium capitalize">{account?.plan}</p>
            </div>
            <div>
              <label className="text-sm text-slate-400">Member Since</label>
              <p className="text-white font-medium">
                {account?.joinedAt ? new Date(account.joinedAt).toLocaleDateString() : "-"}
              </p>
            </div>
          </div>
        </Card>

        {/* Change Password */}
        <Card className="bg-slate-800 border-slate-700 p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Security
          </h2>
          {isChangingPassword ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-400 block mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                  data-testid="input-current-password"
                />
              </div>
              <div>
                <label className="text-sm text-slate-400 block mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                  data-testid="input-new-password"
                />
              </div>
              <div>
                <label className="text-sm text-slate-400 block mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                  data-testid="input-confirm-password"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => changePasswordMutation.mutate()}
                  disabled={!currentPassword || !newPassword || newPassword !== confirmPassword}
                  data-testid="button-save-password"
                >
                  Save Password
                </Button>
                <Button
                  onClick={() => setIsChangingPassword(false)}
                  variant="outline"
                  data-testid="button-cancel-password"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              onClick={() => setIsChangingPassword(true)}
              variant="outline"
              data-testid="button-change-password"
            >
              Change Password
            </Button>
          )}
        </Card>

        {/* Device Management */}
        <Card className="bg-slate-800 border-slate-700 p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">
              Active Devices
            </h2>
            <Button
              onClick={() => signOutAllMutation.mutate()}
              variant="outline"
              size="sm"
              data-testid="button-sign-out-all"
            >
              Sign Out All
            </Button>
          </div>
          <div className="space-y-3">
            {sessions.map((session: any) => (
              <div
                key={session.id}
                className="bg-slate-700 p-4 rounded flex justify-between items-center"
                data-testid={`session-device-${session.id}`}
              >
                <div>
                  <p className="text-white font-medium">{session.deviceName}</p>
                  <p className="text-sm text-slate-400">
                    {session.deviceType} • Last active:{" "}
                    {new Date(session.lastActivityAt).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  onClick={() => signOutDeviceMutation.mutate(session.id)}
                  variant="outline"
                  size="sm"
                  data-testid={`button-sign-out-${session.id}`}
                >
                  Sign Out
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
