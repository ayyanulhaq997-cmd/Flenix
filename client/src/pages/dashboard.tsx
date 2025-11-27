import { Layout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  Film, 
  Tv, 
  Activity, 
  TrendingUp,
  AlertCircle,
  Database,
  ArrowUpRight,
  PlayCircle,
  Radio
} from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";
import { useLocation } from "wouter";

const data = [
  { name: "Mon", users: 400, streams: 240 },
  { name: "Tue", users: 300, streams: 139 },
  { name: "Wed", users: 200, streams: 980 },
  { name: "Thu", users: 278, streams: 390 },
  { name: "Fri", users: 189, streams: 480 },
  { name: "Sat", users: 239, streams: 380 },
  { name: "Sun", users: 349, streams: 430 },
];

export default function Dashboard() {
  const [, setLocation] = useLocation();

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setLocation("/login");
    }
  }, [setLocation]);

  const { data: stats, isLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const token = localStorage.getItem("auth_token");
      const response = await fetch('/api/stats', {
        headers: token ? { "Authorization": `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
  });

  return (
    <Layout>
      <div className="mb-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">Fenix Control Center</h1>
            <p className="text-base text-muted-foreground max-w-2xl">Monitor and manage your streaming platform with real-time analytics, content performance, and user engagement metrics.</p>
          </div>
        </div>
      </div>

      <div className="mb-10 p-5 border border-blue-500/20 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl flex items-center justify-between gap-6 backdrop-blur-sm">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-500/15 rounded-xl">
            <Database className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h4 className="text-base font-semibold text-blue-300 mb-1">Data Migration Toolkit Available</h4>
            <p className="text-sm text-muted-foreground">
              Seamlessly migrate content from legacy infrastructure. Use the Migration tools to export, validate, and import all your existing data.
            </p>
          </div>
        </div>
        <a href="/migration" className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap">
          Go to Migration
        </a>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-10">
        <Card className="glass-card border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-transparent hover:border-blue-500/40 transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Active Subscribers</CardTitle>
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <Users className="h-5 w-5 text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-9 w-24 bg-white/5" />
            ) : (
              <>
                <div className="text-3xl font-bold text-white" data-testid="text-total-users">{stats?.totalUsers?.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground mt-2">
                  <span className="text-green-400 font-semibold">+12% YoY</span> growth
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-transparent hover:border-purple-500/40 transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Movie Catalog</CardTitle>
            <div className="p-3 bg-purple-500/20 rounded-xl">
              <Film className="h-5 w-5 text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-9 w-24 bg-white/5" />
            ) : (
              <>
                <div className="text-3xl font-bold text-white" data-testid="text-total-movies">{stats?.totalMovies?.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground mt-2">
                  <span className="text-green-400 font-semibold">+2 new</span> this week
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card border-pink-500/20 bg-gradient-to-br from-pink-500/10 to-transparent hover:border-pink-500/40 transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Series Library</CardTitle>
            <div className="p-3 bg-pink-500/20 rounded-xl">
              <Tv className="h-5 w-5 text-pink-400" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-9 w-24 bg-white/5" />
            ) : (
              <>
                <div className="text-3xl font-bold text-white" data-testid="text-total-series">{stats?.totalSeries?.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground mt-2">
                  Series in catalog
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card border-white/5 bg-card/40">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Live Channels</CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg">
              <Radio className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-9 w-24 bg-white/5" />
            ) : (
              <>
                <div className="text-3xl font-bold text-white" data-testid="text-active-channels">{stats?.activeChannels || 0}/{stats?.totalChannels || 0}</div>
                <p className="text-xs text-muted-foreground mt-2">
                  Channels online
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 mb-8">
        <Card className="col-span-4 bg-card/40 border-white/5 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Streaming Activity</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorStreams" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" />
                  <YAxis stroke="rgba(255,255,255,0.3)" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }}
                    labelStyle={{ color: "#fff" }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="streams" 
                    stroke="#3b82f6" 
                    fillOpacity={1} 
                    fill="url(#colorStreams)" 
                    name="Streams"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="users" 
                    stroke="#8b5cf6" 
                    fillOpacity={1} 
                    fill="url(#colorUsers)" 
                    name="Users"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 bg-card/40 border-white/5">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Avg Stream Duration</span>
                <span className="text-sm font-semibold text-white">2h 34m</span>
              </div>
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full w-[73%] bg-blue-500 rounded-full" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Peak Hours</span>
                <span className="text-sm font-semibold text-white">8-11 PM</span>
              </div>
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full w-[92%] bg-purple-500 rounded-full" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Completion Rate</span>
                <span className="text-sm font-semibold text-white">68%</span>
              </div>
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full w-[68%] bg-pink-500 rounded-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
