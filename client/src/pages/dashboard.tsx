import { Layout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  Film, 
  Tv, 
  Activity, 
  TrendingUp,
  AlertCircle,
  Database
} from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Overview</h1>
        <p className="text-muted-foreground">Welcome back, Admin. Here's what's happening today.</p>
      </div>

      {/* Migration Alert */}
      <div className="mb-8 p-4 border border-yellow-500/20 bg-yellow-500/10 rounded-lg flex items-start gap-4">
        <Database className="w-5 h-5 text-yellow-500 mt-0.5 shrink-0" />
        <div>
          <h4 className="text-sm font-semibold text-yellow-500 mb-1">Migration Required</h4>
          <p className="text-sm text-muted-foreground">
            Content transfer from legacy crack server is pending. Please initiate the migration wizard in Settings to move all assets to the new secure infrastructure.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">12,345</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
              +15% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Movies</CardTitle>
            <Film className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">2,845</div>
            <p className="text-xs text-muted-foreground mt-1">
              +12 new this week
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Series</CardTitle>
            <Tv className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">432</div>
            <p className="text-xs text-muted-foreground mt-1">
              85 active shows
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Streams</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">573</div>
            <p className="text-xs text-muted-foreground mt-1">
              Current concurrent users
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mb-8">
        {/* Chart */}
        <Card className="col-span-4 bg-card border-border">
          <CardHeader>
            <CardTitle className="text-white">Streaming Activity</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <XAxis 
                    dataKey="name" 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `${value}`} 
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f1f1f', border: 'none', borderRadius: '4px', color: '#fff' }}
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  />
                  <Bar 
                    dataKey="streams" 
                    fill="currentColor" 
                    radius={[4, 4, 0, 0]} 
                    className="fill-primary" 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="col-span-3 bg-card border-border">
          <CardHeader>
            <CardTitle className="text-white">System Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-3 rounded-lg bg-background/50 border border-border">
                <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-white">Server Load High</h4>
                  <p className="text-xs text-muted-foreground">CDN usage spiked to 85% in EU-West region.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-3 rounded-lg bg-background/50 border border-border">
                <Activity className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-white">New Content Processed</h4>
                  <p className="text-xs text-muted-foreground">"Dune: Part Two" has finished transcoding.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-3 rounded-lg bg-background/50 border border-border">
                <Users className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-white">New User Spike</h4>
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
