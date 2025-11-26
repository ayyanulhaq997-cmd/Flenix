import { Layout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Save } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function Settings() {
  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-muted-foreground">Configure your streaming platform parameters.</p>
      </div>

      <div className="grid gap-6 max-w-4xl">
        {/* General Settings */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-white">General Configuration</CardTitle>
            <CardDescription>Basic settings for your application.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="app-name">App Name</Label>
              <Input id="app-name" defaultValue="StreamFlix" className="bg-background border-border" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="support-email">Support Email</Label>
              <Input id="support-email" defaultValue="support@streamflix.com" className="bg-background border-border" />
            </div>
          </CardContent>
        </Card>

        {/* API Configuration */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-white">API Integration</CardTitle>
            <CardDescription>Manage external service connections.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="tmdb-key">TMDB API Key</Label>
              <Input id="tmdb-key" type="password" value="sk_live_xxxxxxxxxxxxx" readOnly className="bg-background border-border font-mono" />
              <p className="text-xs text-muted-foreground">Used for fetching movie metadata automatically.</p>
            </div>
            <Separator className="bg-border" />
            <div className="grid gap-2">
              <Label htmlFor="firebase-key">Firebase Server Key</Label>
              <Input id="firebase-key" type="password" value="AAAAxxxxxxxxxxxxx" readOnly className="bg-background border-border font-mono" />
              <p className="text-xs text-muted-foreground">Required for push notifications to Android/iOS apps.</p>
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-white">System Status</CardTitle>
            <CardDescription>Control app availability and maintenance.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base text-white">Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Disable access to the app for all users except admins.
                </p>
              </div>
              <Switch />
            </div>
            <Separator className="bg-border" />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base text-white">User Registration</Label>
                <p className="text-sm text-muted-foreground">
                  Allow new users to sign up via the mobile app.
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button className="bg-primary hover:bg-primary/90 text-white gap-2">
            <Save className="w-4 h-4" /> Save Changes
          </Button>
        </div>
      </div>
    </Layout>
  );
}
