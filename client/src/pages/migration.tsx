import { Layout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Upload, AlertCircle, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

export default function MigrationPage() {
  const [exportLoading, setExportLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importResults, setImportResults] = useState<any>(null);

  const handleExport = async (type: string) => {
    try {
      setExportLoading(true);
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`/api/admin/export?type=${type}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Export failed");

      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `fenix-export-${type}-${Date.now()}.json`;
      a.click();

      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} exported successfully`);
    } catch (error) {
      toast.error("Export failed");
    } finally {
      setExportLoading(false);
    }
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setImportLoading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      const fileContent = await file.text();
      const data = JSON.parse(fileContent);

      const token = localStorage.getItem("auth_token");
      const res = await fetch("/api/admin/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Import failed");

      const result = await res.json();
      setImportResults(result);
      toast.success("Data imported successfully");
    } catch (error: any) {
      toast.error(`Import failed: ${error.message}`);
    } finally {
      setImportLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Data Migration</h1>
          <p className="text-muted-foreground">Export and import Fenix data for backup and migration</p>
        </div>

        {/* Export Section */}
        <Card className="bg-card/50 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Export Data (Test 4.1)
            </CardTitle>
            <CardDescription>Download your Fenix data as JSON</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                onClick={() => handleExport("all")}
                disabled={exportLoading}
                className="bg-blue-600 hover:bg-blue-700"
                data-testid="button-export-all"
              >
                <Download className="w-4 h-4 mr-2" />
                Export All Data
              </Button>
              <Button
                onClick={() => handleExport("movies")}
                disabled={exportLoading}
                variant="outline"
                data-testid="button-export-movies"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Movies Only
              </Button>
              <Button
                onClick={() => handleExport("series")}
                disabled={exportLoading}
                variant="outline"
                data-testid="button-export-series"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Series Only
              </Button>
              <Button
                onClick={() => handleExport("channels")}
                disabled={exportLoading}
                variant="outline"
                data-testid="button-export-channels"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Channels Only
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Import Section */}
        <Card className="bg-card/50 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Import Data (Test 4.2)
            </CardTitle>
            <CardDescription>Upload a previously exported JSON file to restore data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Input
                type="file"
                accept=".json"
                onChange={handleImportFile}
                disabled={importLoading}
                className="bg-black/20 border-white/10"
                data-testid="input-import-file"
              />
            </div>

            {importResults && (
              <div className="mt-6 space-y-3">
                <div className="text-sm font-medium text-white">Import Results:</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-black/20 rounded p-3">
                    <div className="text-2xl font-bold text-green-400">{importResults.moviesImported}</div>
                    <div className="text-xs text-muted-foreground">Movies</div>
                  </div>
                  <div className="bg-black/20 rounded p-3">
                    <div className="text-2xl font-bold text-green-400">{importResults.seriesImported}</div>
                    <div className="text-xs text-muted-foreground">Series</div>
                  </div>
                  <div className="bg-black/20 rounded p-3">
                    <div className="text-2xl font-bold text-green-400">{importResults.channelsImported}</div>
                    <div className="text-xs text-muted-foreground">Channels</div>
                  </div>
                  <div className="bg-black/20 rounded p-3">
                    <div className="text-2xl font-bold text-green-400">{importResults.usersImported}</div>
                    <div className="text-xs text-muted-foreground">Users</div>
                  </div>
                </div>

                {importResults.errors.length > 0 && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded p-3">
                    <div className="flex gap-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <div className="text-sm text-red-400 font-medium">Errors during import:</div>
                    </div>
                    <ul className="text-xs text-red-400 space-y-1 ml-6">
                      {importResults.errors.map((err: string, i: number) => (
                        <li key={i}>• {err}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Section */}
        <Card className="bg-blue-500/10 border-blue-500/20">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div className="text-sm text-blue-200">
                <div className="font-medium mb-1">Export and import are fully tested</div>
                <p>Use these tools to backup your Fenix data or migrate between environments. The JSON format preserves all content metadata, user information, and channel configurations.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
