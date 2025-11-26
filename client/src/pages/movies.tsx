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
import { Plus, Search, MoreVertical, Film, Edit, Trash2, LayoutGrid, List } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";
import { MovieForm } from "@/components/forms/MovieForm";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";

// Import images - using placeholders if real ones aren't available
// In a real app, these would come from the backend
import poster1 from "@assets/stock_images/movie_poster_action__e218cd90.jpg";
import poster2 from "@assets/stock_images/movie_poster_action__935d5c7f.jpg";
import poster3 from "@assets/stock_images/movie_poster_action__05982a50.jpg";
import poster4 from "@assets/stock_images/movie_poster_action__eff85d72.jpg";
import poster5 from "@assets/stock_images/movie_poster_action__b7cb3e87.jpg";
import poster6 from "@assets/stock_images/movie_poster_action__3003ddee.jpg";

const mockMovies = [
  { id: 1, title: "Inception Protocol", genre: "Sci-Fi", year: 2024, status: "Active", views: "1.2M", image: poster1 },
  { id: 2, title: "Dark Knight Rises", genre: "Action", year: 2023, status: "Active", views: "2.4M", image: poster2 },
  { id: 3, title: "Stellar Void", genre: "Sci-Fi", year: 2024, status: "Active", views: "1.8M", image: poster3 },
  { id: 4, title: "Dune: Messiah", genre: "Sci-Fi", year: 2025, status: "Processing", views: "0", image: poster4 },
  { id: 5, title: "Atomic Sky", genre: "Thriller", year: 2023, status: "Active", views: "900K", image: poster5 },
  { id: 6, title: "Neon City", genre: "Action", year: 2024, status: "Active", views: "1.1M", image: poster6 },
];

export default function Movies() {
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const { toast } = useToast();

  const filteredMovies = mockMovies.filter(movie => 
    movie.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddSubmit = () => {
    setIsAddOpen(false);
    toast({
      title: "Movie Added",
      description: "The movie has been successfully added to the catalog.",
      className: "bg-green-600 border-green-700 text-white",
    });
  };

  return (
    <Layout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Movies Catalog</h1>
          <p className="text-muted-foreground">Manage your streaming library.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Sheet open={isAddOpen} onOpenChange={setIsAddOpen}>
            <SheetTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-white gap-2 shadow-lg shadow-primary/20" data-testid="button-add-movie">
                <Plus className="w-4 h-4" /> Add Movie
              </Button>
            </SheetTrigger>
            <SheetContent className="bg-card border-l border-white/10 text-foreground sm:max-w-md backdrop-blur-xl">
              <SheetHeader>
                <SheetTitle className="text-white">Add New Movie</SheetTitle>
                <SheetDescription>
                  Add a new movie to your streaming catalog. Fill in the metadata below.
                </SheetDescription>
              </SheetHeader>
              <MovieForm onSubmit={handleAddSubmit} />
            </SheetContent>
          </Sheet>
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

        {viewMode === 'list' ? (
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
              {filteredMovies.map((movie) => (
                <TableRow key={movie.id} className="border-white/5 hover:bg-white/5 transition-colors">
                  <TableCell className="font-medium text-white">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-14 bg-muted rounded-sm flex items-center justify-center shrink-0 overflow-hidden relative group">
                        <img src={movie.image} alt={movie.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center">
                          <Film className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <span>{movie.title}</span>
                    </div>
                  </TableCell>
                  <TableCell>{movie.genre}</TableCell>
                  <TableCell>{movie.year}</TableCell>
                  <TableCell>{movie.views}</TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={
                        movie.status === "Active" 
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
            {filteredMovies.map((movie) => (
              <div key={movie.id} className="group relative flex flex-col gap-2">
                <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-muted shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-primary/20 group-hover:ring-2 ring-primary/50 ring-offset-2 ring-offset-background">
                  <img 
                    src={movie.image} 
                    alt={movie.title} 
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <div className="flex gap-2 mb-2">
                      <Button size="icon" className="h-8 w-8 rounded-full bg-white text-black hover:bg-white/90">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="destructive" className="h-8 w-8 rounded-full">
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
                        movie.status === "Active" ? "bg-green-500/80 text-white" : "bg-yellow-500/80 text-black"
                      }`}
                    >
                      {movie.status}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="font-medium text-white leading-none truncate">{movie.title}</h3>
                  <p className="text-xs text-muted-foreground">{movie.views} views</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
