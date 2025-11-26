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
import { Plus, Search, MoreVertical, Tv, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

const mockSeries = [
  { id: 1, title: "Stranger Things", seasons: 4, episodes: 34, status: "Active", rating: "9.2" },
  { id: 2, title: "Breaking Bad", seasons: 5, episodes: 62, status: "Ended", rating: "9.5" },
  { id: 3, title: "The Mandalorian", seasons: 3, episodes: 24, status: "Active", rating: "8.7" },
  { id: 4, title: "House of the Dragon", seasons: 2, episodes: 18, status: "Active", rating: "8.8" },
  { id: 5, title: "The Last of Us", seasons: 1, episodes: 9, status: "Active", rating: "9.1" },
];

export default function Series() {
  const [search, setSearch] = useState("");

  const filteredSeries = mockSeries.filter(show => 
    show.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">TV Series</h1>
          <p className="text-muted-foreground">Manage TV shows, seasons, and episodes.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-white gap-2" data-testid="button-add-series">
          <Plus className="w-4 h-4" /> Add Series
        </Button>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search series..." 
              className="pl-9 bg-background border-border"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="input-search-series"
            />
          </div>
        </div>

        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent border-border">
              <TableHead className="w-[400px]">Title</TableHead>
              <TableHead>Seasons</TableHead>
              <TableHead>Episodes</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSeries.map((show) => (
              <TableRow key={show.id} className="border-border hover:bg-muted/30">
                <TableCell className="font-medium text-white">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-14 bg-muted rounded flex items-center justify-center shrink-0 overflow-hidden">
                      <Tv className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <span>{show.title}</span>
                  </div>
                </TableCell>
                <TableCell>{show.seasons}</TableCell>
                <TableCell>{show.episodes}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-500">★</span> {show.rating}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={
                      show.status === "Active" 
                        ? "bg-green-500/10 text-green-500 border-green-500/20" 
                        : "bg-muted text-muted-foreground border-muted-foreground/20"
                    }
                  >
                    {show.status}
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
                        <Edit className="mr-2 h-4 w-4" /> Edit Series
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer text-foreground focus:bg-muted">
                        <Tv className="mr-2 h-4 w-4" /> Manage Episodes
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
