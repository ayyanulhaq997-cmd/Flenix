import { Layout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Search, LayoutGrid, List } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function Series() {
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: series = [], isLoading } = useQuery({
    queryKey: ['series'],
    queryFn: async () => {
      const response = await fetch('/api/series');
      if (!response.ok) throw new Error('Failed to fetch series');
      return response.json();
    },
  });

  const filteredSeries = series.filter((show: any) => 
    show.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">TV Series</h1>
          <p className="text-muted-foreground">Browse TV shows, seasons, and episodes.</p>
        </div>
      </div>

      <div className="bg-card/50 backdrop-blur-md border border-white/5 rounded-xl overflow-hidden">
        {/* ... rest of the component remains the same ... */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search series..." 
              className="pl-9 bg-black/20 border-white/10 focus:border-primary/50 transition-colors"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="input-search-series"
            />
          </div>
          <div className="flex items-center gap-1 bg-black/20 p-1 rounded-lg border border-white/5">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`h-8 w-8 p-0 ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-muted-foreground hover:text-white'}`}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={`h-8 w-8 p-0 ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-muted-foreground hover:text-white'}`}
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {viewMode === 'list' ? (
          <Table>
            <TableHeader className="bg-black/20">
              <TableRow className="hover:bg-transparent border-white/5">
                <TableHead className="w-[400px]">Title</TableHead>
                <TableHead>Seasons</TableHead>
                <TableHead>Episodes</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSeries.map((show: any) => (
                <TableRow key={show.id} className="border-white/5 hover:bg-white/5 transition-colors" data-testid={`row-series-${show.id}`}>
                  <TableCell className="font-medium text-white">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-14 bg-muted rounded-sm flex items-center justify-center shrink-0 overflow-hidden relative group">
                        {show.posterUrl && <img src={show.posterUrl} alt={show.title} className="w-full h-full object-cover" />}
                      </div>
                      <span>{show.title}</span>
                    </div>
                  </TableCell>
                  <TableCell>{show.totalSeasons}</TableCell>
                  <TableCell data-testid={`text-episodes-${show.id}`}>TBD</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <span>★</span> {show.rating || "N/A"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={
                        show.status === "active" 
                          ? "bg-green-500/10 text-green-400 border-green-500/20" 
                          : "bg-muted text-muted-foreground border-muted-foreground/20"
                      }
                      data-testid={`status-${show.id}`}
                    >
                      {show.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 p-0 hover:bg-white/10">
                          <span className="sr-only">Open menu</span>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-card border-white/10">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem className="cursor-pointer hover:bg-white/10">
                          <Edit className="mr-2 h-4 w-4" /> Edit Series
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer hover:bg-white/10">
                          <Tv className="mr-2 h-4 w-4" /> Manage Episodes
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-white/10" />
                        <DropdownMenuItem className="cursor-pointer text-destructive hover:bg-destructive/10">
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {filteredSeries.map((show: any) => (
              <div key={show.id} className="group relative flex flex-col gap-2">
                <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-muted shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-primary/20 group-hover:ring-2 ring-primary/50 ring-offset-2 ring-offset-background">
                  <img 
                    src={show.image} 
                    alt={show.title} 
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <div className="flex gap-2 mb-2">
                      <Button size="icon" className="h-8 w-8 rounded-full bg-white text-black hover:bg-white/90">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full bg-primary text-white border-0 hover:bg-primary/90">
                        <Tv className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-white/80">
                      {show.seasons} Seasons • {show.episodes} Eps
                    </p>
                  </div>
                  <div className="absolute top-2 right-2">
                    <Badge 
                      className={`backdrop-blur-md border-0 ${
                        show.status === "Active" ? "bg-green-500/80 text-white" : "bg-gray-500/80 text-white"
                      }`}
                    >
                      {show.status}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="font-medium text-white leading-none truncate">{show.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="text-yellow-500 flex items-center gap-1">★ {show.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
