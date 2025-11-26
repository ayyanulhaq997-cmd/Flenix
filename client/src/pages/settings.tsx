import { Layout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Save, Database, Server } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MigrationWizard } from "@/components/migration/MigrationWizard";

export default function Settings() {
  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-muted-foreground">Configure your streaming platform parameters.</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="general" className="data-[state=active]:bg-primary data-[state=active]:text-white">General</TabsTrigger>
          <TabsTrigger value="migration" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            <Database className="w-4 h-4 mr-2" />
            Data Migration
          </TabsTrigger>
          <TabsTrigger value="servers" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            <Server className="w-4 h-4 mr-2" />
            Servers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="grid gap-6 max-w-4xl">
            {/* General Settings */}
            <Card className="glass-card border-white/5 bg-card/40">
              <CardHeader>
                <CardTitle className="text-white">General Configuration</CardTitle>
                <CardDescription>Basic settings for your application.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="app-name">App Name</Label>
                  <Input id="app-name" defaultValue="Fenix" className="bg-black/20 border-white/10" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="support-email">Support Email</Label>
                  <Input id="support-email" defaultValue="support@fenix.com" className="bg-black/20 border-white/10" />
                </div>
              </CardContent>
            </Card>

            {/* API Configuration */}
            <Card className="glass-card border-white/5 bg-card/40">
              <CardHeader>
                <CardTitle className="text-white">API Integration</CardTitle>
                <CardDescription>Manage external service connections.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="tmdb-key">TMDB API Key</Label>
                  <Input id="tmdb-key" type="password" value="sk_live_xxxxxxxxxxxxx" readOnly className="bg-black/20 border-white/10 font-mono" />
                  <p className="text-xs text-muted-foreground">Used for fetching movie metadata automatically.</p>
                </div>
                <Separator className="bg-white/10" />
                <div className="grid gap-2">
                  <Label htmlFor="firebase-key">Firebase Server Key</Label>
                  <Input id="firebase-key" type="password" value="AAAAxxxxxxxxxxxxx" readOnly className="bg-black/20 border-white/10 font-mono" />
                  <p className="text-xs text-muted-foreground">Required for push notifications to Android/iOS apps.</p>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button className="bg-primary hover:bg-primary/90 text-white gap-2">
                <Save className="w-4 h-4" /> Save Changes
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="migration" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <MigrationWizard />
        </TabsContent>
        
        <TabsContent value="servers">
           <Card className="glass-card border-white/5 bg-card/40 max-w-4xl">
              <CardHeader>
                <CardTitle className="text-white">Server Nodes</CardTitle>
                <CardDescription>Manage your content delivery nodes.</CardDescription>
              </CardHeader>
              <CardContent>
                 <div className="text-center py-12 text-muted-foreground">
                    Server management capabilities coming soon.
                 </div>
              </CardContent>
           </Card>
        </TabsContent>
      </Tabs>
    </Layout>
  );
}
