import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Copy, RotateCw, Trash2, Plus } from "lucide-react";

interface ApiKey {
  id: number;
  appName: string;
  key: string;
  secret: string;
  status: "active" | "revoked";
  createdBy: string;
  createdAt: string;
  lastUsed?: string;
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [appName, setAppName] = useState("");

  const loadKeys = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/keys", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setKeys(data);
      }
    } catch (error) {
      toast.error("Failed to load API keys");
    } finally {
      setLoading(false);
    }
  };

  const generateKey = async () => {
    try {
      if (!appName) {
        toast.error("Enter an app name");
        return;
      }

      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ appName, createdBy: "admin" }),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success("API key generated successfully");
        setAppName("");
        setIsOpen(false);
        loadKeys();
      } else {
        toast.error("Failed to generate API key");
      }
    } catch (error) {
      toast.error("Error generating API key");
    }
  };

  const revokeKey = async (id: number) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/admin/keys/${id}/revoke`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        toast.success("API key revoked");
        loadKeys();
      } else {
        toast.error("Failed to revoke API key");
      }
    } catch (error) {
      toast.error("Error revoking API key");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Mobile App Keys</h1>
            <p className="text-slate-400">Generate and manage API keys for mobile applications</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700" data-testid="button-generate-key">
                <Plus className="w-4 h-4 mr-2" />
                Generate New Key
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate New API Key</DialogTitle>
                <DialogDescription>Create a new API key for your mobile application</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="appName">Application Name</Label>
                  <Input
                    id="appName"
                    placeholder="e.g., iOS App v1.0"
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    data-testid="input-app-name"
                  />
                </div>
                <Button onClick={generateKey} className="w-full bg-blue-600 hover:bg-blue-700">
                  Generate
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {keys.length === 0 ? (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-12 text-center">
              <p className="text-slate-400 mb-4">No API keys yet. Generate one to get started.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {keys.map((key) => (
              <Card key={key.id} className="bg-slate-800 border-slate-700" data-testid={`card-key-${key.id}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-white">{key.appName}</CardTitle>
                      <CardDescription>
                        Created by {key.createdBy} on {new Date(key.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      key.status === "active"
                        ? "bg-green-900 text-green-200"
                        : "bg-red-900 text-red-200"
                    }`} data-testid={`status-${key.id}`}>
                      {key.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-slate-300 text-sm">API Key</Label>
                    <div className="flex gap-2 mt-1">
                      <code className="flex-1 bg-slate-900 p-2 rounded text-sm text-slate-200 font-mono break-all" data-testid={`text-key-${key.id}`}>
                        {key.key}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(key.key)}
                        data-testid={`button-copy-key-${key.id}`}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className="text-slate-300 text-sm">Secret</Label>
                    <div className="flex gap-2 mt-1">
                      <code className="flex-1 bg-slate-900 p-2 rounded text-sm text-slate-200 font-mono">{key.secret}</code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(key.secret)}
                        data-testid={`button-copy-secret-${key.id}`}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {key.status === "active" && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => revokeKey(key.id)}
                      data-testid={`button-revoke-${key.id}`}
                    >
                      <RotateCw className="w-4 h-4 mr-2" />
                      Revoke Key
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
