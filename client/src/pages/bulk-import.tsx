import { Layout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Upload, CheckCircle, AlertCircle } from "lucide-react";

export default function BulkImport() {
  const [jsonData, setJsonData] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleImport = async () => {
    if (!jsonData.trim()) {
      toast({ title: "Error", description: "Please paste JSON data", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const data = JSON.parse(jsonData);
      const token = localStorage.getItem("auth_token");
      
      const response = await fetch("/api/admin/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      setResult(result);

      if (response.ok) {
        toast({
          title: "Success!",
          description: `Added ${result.moviesImported} movies, ${result.seriesImported} series, ${result.channelsImported} channels`,
          className: "bg-green-600 border-green-700 text-white",
        });
        setJsonData("");
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const exampleData = {
    movies: [
      {
        title: "Avatar 2",
        genre: "Sci-Fi",
        year: 2022,
        description: "Epic sequel",
        posterUrl: "https://example.com/avatar.jpg",
        videoUrl: "https://wasabi.com/avatar.mp4",
        requiredPlan: "free",
        rating: "PG-13",
      },
      {
        title: "Inception",
        genre: "Drama",
        year: 2010,
        description: "Mind-bending thriller",
        posterUrl: "https://example.com/inception.jpg",
        videoUrl: "https://wasabi.com/inception.mp4",
        requiredPlan: "premium",
        rating: "PG-13",
      },
    ],
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Bulk Import Movies</h1>
          <p className="text-muted-foreground">
            Import all your movies at once by pasting JSON data below
          </p>
        </div>

        <div className="grid gap-6">
          {/* Instructions */}
          <Card className="bg-card/50 border-white/5">
            <CardHeader>
              <CardTitle className="text-white">How to Use</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div>
                <h3 className="font-semibold text-white mb-2">1. Create your movie list as JSON:</h3>
                <pre className="bg-black/20 p-4 rounded overflow-auto text-xs">
{JSON.stringify(exampleData, null, 2)}
                </pre>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">2. Paste the JSON below</h3>
                <p>Include movies, series, channels, or users</p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">3. Click "Import All"</h3>
                <p>All data will be added at once!</p>
              </div>
            </CardContent>
          </Card>

          {/* Import Form */}
          <Card className="bg-card/50 border-white/5">
            <CardHeader>
              <CardTitle className="text-white">Paste Your Movie Data (JSON)</CardTitle>
              <CardDescription>
                You can paste your entire movie collection here
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder={'{\n  "movies": [\n    {\n      "title": "Movie Name",\n      "genre": "Action",\n      ...\n    }\n  ]\n}'}
                value={jsonData}
                onChange={(e) => setJsonData(e.target.value)}
                className="font-mono text-xs bg-black/20 border-white/10 min-h-[300px]"
              />
              <Button
                onClick={handleImport}
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/90 text-white h-12 text-base"
              >
                <Upload className="w-5 h-5 mr-2" />
                {isLoading ? "Importing..." : "Import All"}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          {result && (
            <Card className={`bg-card/50 border-white/5 ${result.moviesImported > 0 ? "border-green-500/20" : "border-red-500/20"}`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  {result.moviesImported > 0 ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                  Import Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>✅ Movies added: <span className="font-bold text-green-400">{result.moviesImported}</span></div>
                <div>✅ Series added: <span className="font-bold text-green-400">{result.seriesImported}</span></div>
                <div>✅ Channels added: <span className="font-bold text-green-400">{result.channelsImported}</span></div>
                <div>✅ Users added: <span className="font-bold text-green-400">{result.usersImported}</span></div>
                {result.errors.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-red-400 font-semibold mb-2">Errors:</p>
                    {result.errors.map((err: string, i: number) => (
                      <p key={i} className="text-xs text-red-300">• {err}</p>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
