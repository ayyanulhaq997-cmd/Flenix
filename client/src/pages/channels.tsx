import { Layout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Radio, PlayCircle, Settings2, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function Channels() {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [streamUrl, setStreamUrl] = useState("");
  const [epgUrl, setEpgUrl] = useState("");
  const [logo, setLogo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: channels = [] } = useQuery({
    queryKey: ['channels'],
    queryFn: async () => {
      const response = await fetch('/api/channels');
      if (!response.ok) throw new Error('Failed to fetch channels');
      return response.json();
    },
  });

  const filteredChannels = channels.filter((channel: any) => 
    channel.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({ title: "Error", description: "Channel name is required", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/channels", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          description: description || "",
          streamUrl: streamUrl || "",
          epgUrl: epgUrl || "",
          logo: logo || "",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create channel");
      }

      toast({
        title: "Success!",
        description: "Channel created successfully",
        className: "bg-green-600 border-green-700 text-white",
      });

      setName("");
      setDescription("");
      setStreamUrl("");
      setEpgUrl("");
      setLogo("");
      setShowForm(false);
      
      queryClient.invalidateQueries({ queryKey: ['channels'] });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Live Channels</h1>
          <p className="text-muted-foreground">Manage streaming channels and EPG data.</p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="bg-primary hover:bg-primary/90 text-white gap-2 shadow-lg shadow-primary/20" 
          data-testid="button-add-channel"
        >
          <Plus className="w-4 h-4" /> Add Channel
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search channels..." 
            className="pl-9 bg-card/50 border-white/10 backdrop-blur-sm focus:border-primary/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="input-search-channels"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredChannels.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Radio className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No channels available. Create one to get started.</p>
          </div>
        ) : (
          filteredChannels.map((channel: any) => (
            <Card key={channel.id} className="glass-card border-white/5 bg-card/40 group overflow-hidden" data-testid={`card-channel-${channel.id}`}>
              <CardContent className="p-0">
                <div className="h-40 bg-gradient-to-br from-black/40 to-black/10 flex items-center justify-center relative">
                  {channel.logo ? (
                    <img src={channel.logo} alt={channel.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center backdrop-blur-md border border-white/10 group-hover:scale-110 transition-transform duration-300">
                      <Radio className="w-8 h-8 text-white/70" />
                    </div>
                  )}
                  
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
                    <Button size="sm" className="bg-white text-black hover:bg-white/90 h-9">
                      <PlayCircle className="w-4 h-4 mr-2" /> Preview
                    </Button>
                    <Button size="sm" variant="outline" className="bg-transparent border-white/20 text-white hover:bg-white/10 h-9">
                      <Settings2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-white mb-1" data-testid={`text-channel-${channel.id}`}>{channel.name}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{channel.description || "No description"}</p>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs">
                    • Active
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add Channel Modal */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="bg-card/95 border-white/10 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-white">Create New Channel</DialogTitle>
            <DialogDescription>Add a new live streaming channel to your platform</DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleCreateChannel} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Channel Name *</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., HBO Max"
                className="bg-black/20 border-white/10"
                data-testid="input-channel-name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Description</label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Channel description"
                className="bg-black/20 border-white/10"
                data-testid="input-channel-description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Stream URL</label>
              <Input
                value={streamUrl}
                onChange={(e) => setStreamUrl(e.target.value)}
                placeholder="https://stream.example.com/channel"
                className="bg-black/20 border-white/10"
                data-testid="input-channel-stream-url"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">EPG URL</label>
              <Input
                value={epgUrl}
                onChange={(e) => setEpgUrl(e.target.value)}
                placeholder="https://epg.example.com/channel.xml"
                className="bg-black/20 border-white/10"
                data-testid="input-channel-epg-url"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Logo URL</label>
              <Input
                value={logo}
                onChange={(e) => setLogo(e.target.value)}
                placeholder="https://example.com/logo.png"
                className="bg-black/20 border-white/10"
                data-testid="input-channel-logo"
              />
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
                className="border-white/10"
                data-testid="button-cancel-channel"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-primary hover:bg-primary/90"
                data-testid="button-submit-channel"
              >
                {isLoading ? "Creating..." : "Create Channel"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
