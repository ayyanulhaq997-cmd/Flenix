import { Layout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Radio, PlayCircle, Settings2, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function Channels() {
  const [search, setSearch] = useState("");
  const { toast } = useToast();

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

  return (
    <Layout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Live Channels</h1>
          <p className="text-muted-foreground">Manage streaming channels and EPG data.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-white gap-2 shadow-lg shadow-primary/20" data-testid="button-add-channel">
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
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center backdrop-blur-md border border-white/10 group-hover:scale-110 transition-transform duration-300">
                    <Radio className="w-8 h-8 text-white/70" />
                  </div>
                  
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
                    <Button size="sm" className="bg-white text-black hover:bg-white/90 h-9">
                      <PlayCircle className="w-4 h-4 mr-2" /> Preview
                    </Button>
                    <Button size="sm" variant="outline" className="bg-transparent border-white/20 text-white hover:bg-white/10 h-9">
                      <Settings2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <Badge 
                    className={`absolute top-3 right-3 border-0 ${
                      channel.status === "online" ? "bg-green-500 text-white shadow-[0_0_10px_rgba(34,197,94,0.5)]" : "bg-red-500 text-white"
                    }`}
                    data-testid={`status-${channel.id}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 bg-white ${channel.status === "online" ? "animate-pulse" : ""}`} />
                    {channel.status}
                  </Badge>
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-white text-lg">{channel.name}</h3>
                    <Badge variant="outline" className="text-xs border-white/10 bg-white/5">{channel.category}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {channel.status === "online" ? `${channel.currentViewers?.toLocaleString() || 0} watching now` : "Stream offline"}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </Layout>
  );
}
