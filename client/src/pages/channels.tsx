import { Layout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Radio, PlayCircle, Settings2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const mockChannels = [
  { id: 1, name: "CNN International", category: "News", status: "Online", viewers: 1200 },
  { id: 2, name: "ESPN", category: "Sports", status: "Online", viewers: 3400 },
  { id: 3, name: "HBO", category: "Movies", status: "Online", viewers: 5600 },
  { id: 4, name: "Discovery Channel", category: "Documentary", status: "Offline", viewers: 0 },
  { id: 5, name: "Cartoon Network", category: "Kids", status: "Online", viewers: 890 },
  { id: 6, name: "National Geographic", category: "Documentary", status: "Online", viewers: 650 },
];

export default function Channels() {
  const [search, setSearch] = useState("");

  const filteredChannels = mockChannels.filter(channel => 
    channel.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Live Channels</h1>
          <p className="text-muted-foreground">Manage streaming channels and EPG data.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-white gap-2" data-testid="button-add-channel">
          <Plus className="w-4 h-4" /> Add Channel
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search channels..." 
            className="pl-9 bg-card border-border"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="input-search-channels"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredChannels.map((channel) => (
          <Card key={channel.id} className="bg-card border-border hover:border-primary/50 transition-colors group">
            <CardContent className="p-0">
              <div className="h-32 bg-muted/30 flex items-center justify-center relative">
                <Radio className="w-12 h-12 text-muted-foreground/50" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button size="sm" variant="secondary" className="h-8">
                    <PlayCircle className="w-4 h-4 mr-2" /> Preview
                  </Button>
                  <Button size="sm" variant="secondary" className="h-8">
                    <Settings2 className="w-4 h-4" />
                  </Button>
                </div>
                <Badge 
                  className={`absolute top-2 right-2 ${
                    channel.status === "Online" ? "bg-green-500" : "bg-red-500"
                  }`}
                >
                  {channel.status}
                </Badge>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-semibold text-white">{channel.name}</h3>
                  <Badge variant="outline" className="text-xs">{channel.category}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {channel.status === "Online" ? `${channel.viewers} watching now` : "Stream offline"}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </Layout>
  );
}
