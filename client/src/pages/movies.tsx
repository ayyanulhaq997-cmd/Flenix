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
import { Skeleton } from "@/components/ui/skeleton";

export default function Movies() {
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { toast } = useToast();

  const { data: movies = [], isLoading } = useQuery({
    queryKey: ['movies'],
    queryFn: async () => {
      const response = await fetch('/api/movies');
      if (!response.ok) throw new Error('Failed to fetch movies');
      return response.json();
    },
  });

  const filteredMovies = movies.filter((movie: any) => 
    movie.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Movies Catalog</h1>
          <p className="text-muted-foreground">Browse our streaming library.</p>
        </div>
      </div>

      <div className="bg-card/50 backdrop-blur-md border border-white/5 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search titles, genres..." 
              className="pl-9 bg-black/20 border-white/10 focus:border-primary/50 transition-colors"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="input-search-movies"
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

        {isLoading ? (
          <div className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className="aspect-[2/3] bg-white/5" />
              ))}
            </div>
          </div>
        ) : filteredMovies.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Film className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No Movies Found</h3>
            <p className="text-muted-foreground mb-4">
              {search ? "No movies match your search criteria." : "Get started by adding your first movie."}
            </p>
            {!search && (
              <Button onClick={() => setIsAddOpen(true)} className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" /> Add Movie
              </Button>
            )}
          </div>
        ) : viewMode === 'list' ? (
          <Table>
            <TableHeader className="bg-black/20">
              <TableRow className="hover:bg-transparent border-white/5">
                <TableHead className="w-[400px]">Title</TableHead>
                <TableHead>Genre</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMovies.map((movie: any) => (
                <TableRow key={movie.id} className="border-white/5 hover:bg-white/5 transition-colors">
                  <TableCell className="font-medium text-white">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-14 bg-muted rounded-sm flex items-center justify-center shrink-0 overflow-hidden relative group">
                        {movie.posterUrl ? (
                          <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
                        ) : (
                          <Film className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      <span>{movie.title}</span>
                    </div>
                  </TableCell>
                  <TableCell>{movie.genre}</TableCell>
                  <TableCell>{movie.year}</TableCell>
                  <TableCell>{movie.views?.toLocaleString() || 0}</TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={
                        movie.status === "active" 
                          ? "bg-green-500/10 text-green-400 border-green-500/20" 
                          : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                      }
                    >
                      {movie.status}
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
                          <Edit className="mr-2 h-4 w-4" /> Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-white/10" />
                        <DropdownMenuItem 
                          className="cursor-pointer text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(movie.id)}
                        >
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
            {filteredMovies.map((movie: any) => (
              <div key={movie.id} className="group relative flex flex-col gap-2">
                <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-muted shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-primary/20 group-hover:ring-2 ring-primary/50 ring-offset-2 ring-offset-background">
                  {movie.posterUrl ? (
                    <img 
                      src={movie.posterUrl} 
                      alt={movie.title} 
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" 
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-muted/20">
                      <Film className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <div className="flex gap-2 mb-2">
                      <Button size="icon" className="h-8 w-8 rounded-full bg-white text-black hover:bg-white/90">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="destructive" 
                        className="h-8 w-8 rounded-full"
                        onClick={() => handleDelete(movie.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-white/80 line-clamp-2">
                      {movie.genre} • {movie.year}
                    </p>
                  </div>
                  <div className="absolute top-2 right-2">
                    <Badge 
                      className={`backdrop-blur-md border-0 ${
                        movie.status === "active" ? "bg-green-500/80 text-white" : "bg-yellow-500/80 text-black"
                      }`}
                    >
                      {movie.status}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="font-medium text-white leading-none truncate">{movie.title}</h3>
                  <p className="text-xs text-muted-foreground">{movie.views?.toLocaleString() || 0} views</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
