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
import { Plus, Search, MoreVertical, Film, Edit, Trash2 } from "lucide-react";
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

const mockMovies = [
  { id: 1, title: "Inception", genre: "Sci-Fi", year: 2010, status: "Active", views: "1.2M" },
  { id: 2, title: "The Dark Knight", genre: "Action", year: 2008, status: "Active", views: "2.4M" },
  { id: 3, title: "Interstellar", genre: "Sci-Fi", year: 2014, status: "Active", views: "1.8M" },
  { id: 4, title: "Dune: Part Two", genre: "Sci-Fi", year: 2024, status: "Processing", views: "0" },
  { id: 5, title: "Oppenheimer", genre: "Biography", year: 2023, status: "Active", views: "900K" },
  { id: 6, title: "Barbie", genre: "Comedy", year: 2023, status: "Active", views: "1.1M" },
];

export default function Movies() {
  const [search, setSearch] = useState("");
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
          <h1 className="text-3xl font-bold text-white mb-2">Movies</h1>
          <p className="text-muted-foreground">Manage your movie catalog and metadata.</p>
        </div>
        
        <Sheet open={isAddOpen} onOpenChange={setIsAddOpen}>
          <SheetTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-white gap-2" data-testid="button-add-movie">
              <Plus className="w-4 h-4" /> Add Movie
            </Button>
          </SheetTrigger>
          <SheetContent className="bg-card border-l border-border text-foreground sm:max-w-md">
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

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search movies..." 
              className="pl-9 bg-background border-border"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="input-search-movies"
            />
          </div>
        </div>

        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent border-border">
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
              <TableRow key={movie.id} className="border-border hover:bg-muted/30">
                <TableCell className="font-medium text-white">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-14 bg-muted rounded flex items-center justify-center shrink-0 overflow-hidden">
                      <Film className="w-5 h-5 text-muted-foreground" />
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
                        ? "bg-green-500/10 text-green-500 border-green-500/20" 
                        : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                    }
                  >
                    {movie.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-popover border-border">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem className="cursor-pointer text-foreground focus:bg-muted">
                        <Edit className="mr-2 h-4 w-4" /> Edit Details
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-border" />
                      <DropdownMenuItem className="cursor-pointer text-destructive focus:bg-destructive/10">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Layout>
  );
}
