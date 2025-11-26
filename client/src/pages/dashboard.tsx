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
  PlayCircle
} from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Button } from "@/components/ui/button";

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

      {/* Migration Alert */}
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

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="glass-card border-white/5 bg-card/40">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Users className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">12,345</div>
            <p className="text-xs text-muted-foreground flex items-center mt-2">
              <span className="text-green-500 flex items-center mr-2 bg-green-500/10 px-1.5 py-0.5 rounded">
                <TrendingUp className="w-3 h-3 mr-1" /> +15%
              </span>
              vs last month
            </p>
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
            <div className="text-3xl font-bold text-white">2,845</div>
            <p className="text-xs text-muted-foreground flex items-center mt-2">
              <span className="text-green-500 flex items-center mr-2 bg-green-500/10 px-1.5 py-0.5 rounded">
                <ArrowUpRight className="w-3 h-3 mr-1" /> +12
              </span>
              new this week
            </p>
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
            <div className="text-3xl font-bold text-white">432</div>
            <p className="text-xs text-muted-foreground mt-2">
              85 active shows
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/5 bg-card/40">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Streams</CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg">
              <Activity className="h-4 w-4 text-primary animate-pulse" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">573</div>
            <p className="text-xs text-muted-foreground mt-2">
              Current concurrent users
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 mb-8">
        {/* Chart */}
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
                      <stop offset="5%" stopColor="#E50914" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#E50914" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    dy={10}
                  />
                  <YAxis 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `${value}`} 
                    dx={-10}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#09090b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                    cursor={{ stroke: 'rgba(255,255,255,0.1)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="streams" 
                    stroke="#E50914" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorStreams)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="col-span-3 bg-card/40 border-white/5 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">System Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                <div className="p-2 bg-yellow-500/10 rounded-lg group-hover:bg-yellow-500/20 transition-colors">
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white mb-1">Server Load High</h4>
                  <p className="text-xs text-muted-foreground">CDN usage spiked to 85% in EU-West region.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                <div className="p-2 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition-colors">
                  <PlayCircle className="w-4 h-4 text-green-500" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white mb-1">Content Processed</h4>
                  <p className="text-xs text-muted-foreground">"Dune: Part Two" is now available for streaming.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                  <Users className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white mb-1">New User Spike</h4>
                  <p className="text-xs text-muted-foreground">150 new registrations in the last hour.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
