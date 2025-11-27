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
  const { data: stats, isLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const response = await fetch('/api/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
  });

  return (
    <Layout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h1>
          <p className="text-muted-foreground">Real-time insights and performance metrics.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-white/10 hover:bg-white/5">Download Report</Button>
          <Button className="bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20">Live View</Button>
        </div>
      </div>

      <div className="mb-8 p-4 border border-yellow-500/20 bg-yellow-500/5 rounded-xl flex items-center justify-between gap-4 backdrop-blur-sm">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-yellow-500/10 rounded-lg">
            <Database className="w-5 h-5 text-yellow-500" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-yellow-500 mb-1">System Migration Required</h4>
            <p className="text-sm text-muted-foreground/80">
              Content transfer from legacy infrastructure is pending. 
              <span className="hidden sm:inline"> Please start the migration wizard to secure your assets.</span>
            </p>
          </div>
        </div>
        <Button size="sm" variant="outline" className="border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/10 shrink-0">
          Start Migration
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="glass-card border-white/5 bg-card/40">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Users className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-9 w-24 bg-white/5" />
            ) : (
              <>
                <div className="text-3xl font-bold text-white" data-testid="text-total-users">{stats?.totalUsers?.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground flex items-center mt-2">
                  <span className="text-green-500 flex items-center mr-2 bg-green-500/10 px-1.5 py-0.5 rounded">
                    <TrendingUp className="w-3 h-3 mr-1" /> +15%
                  </span>
                  vs last month
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card border-white/5 bg-card/40">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Movie Library</CardTitle>
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Film className="h-4 w-4 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-9 w-24 bg-white/5" />
            ) : (
              <>
                <div className="text-3xl font-bold text-white" data-testid="text-total-movies">{stats?.totalMovies?.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground flex items-center mt-2">
                  <span className="text-green-500 flex items-center mr-2 bg-green-500/10 px-1.5 py-0.5 rounded">
                    <ArrowUpRight className="w-3 h-3 mr-1" /> New this week
                  </span>
                  recently added
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card border-white/5 bg-card/40">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">TV Series</CardTitle>
            <div className="p-2 bg-pink-500/10 rounded-lg">
              <Tv className="h-4 w-4 text-pink-500" />
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
