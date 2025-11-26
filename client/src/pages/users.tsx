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
import { Search, MoreVertical, Shield, ShieldAlert, CheckCircle, Ban, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

const mockUsers = [
  { id: 1, name: "Alice Johnson", email: "alice@example.com", plan: "Premium", status: "Active", joined: "2023-11-15" },
  { id: 2, name: "Bob Smith", email: "bob@example.com", plan: "Standard", status: "Active", joined: "2024-01-10" },
  { id: 3, name: "Charlie Brown", email: "charlie@example.com", plan: "Free", status: "Suspended", joined: "2023-08-05" },
  { id: 4, name: "Diana Prince", email: "diana@example.com", plan: "Premium", status: "Active", joined: "2024-02-20" },
  { id: 5, name: "Evan Wright", email: "evan@example.com", plan: "Standard", status: "Active", joined: "2024-03-01" },
];

export default function Users() {
  const [search, setSearch] = useState("");

  const filteredUsers = mockUsers.filter(user => 
    user.name.toLowerCase().includes(search.toLowerCase()) || 
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
          <p className="text-muted-foreground">Monitor user activity and manage subscriptions.</p>
        </div>
        <Button variant="outline" className="border-white/10 hover:bg-white/5 text-primary gap-2">
          <Download className="w-4 h-4" /> Export CSV
        </Button>
      </div>

      <div className="bg-card/50 backdrop-blur-md border border-white/5 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search users by name or email..." 
              className="pl-9 bg-black/20 border-white/10 focus:border-primary/50 transition-colors"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="input-search-users"
            />
          </div>
        </div>

        <Table>
          <TableHeader className="bg-black/20">
            <TableRow className="hover:bg-transparent border-white/5">
              <TableHead className="w-[300px]">User</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Joined Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id} className="border-white/5 hover:bg-white/5 transition-colors">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 bg-muted border border-white/10">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} />
                      <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium text-white">{user.name}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={`
                    ${user.plan === 'Premium' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 
                      user.plan === 'Standard' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                      'bg-white/5 text-muted-foreground border-white/10'}
                  `}>
                    {user.plan}
                  </Badge>
                </TableCell>
                <TableCell>{user.joined}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {user.status === "Active" ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <Ban className="w-4 h-4 text-red-500" />
                    )}
                    <span className={user.status === "Active" ? "text-green-500" : "text-red-500"}>
                      {user.status}
                    </span>
                  </div>
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
                        <Shield className="mr-2 h-4 w-4" /> Change Plan
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-white/10" />
                      <DropdownMenuItem className="cursor-pointer text-destructive hover:bg-destructive/10">
                        <ShieldAlert className="mr-2 h-4 w-4" /> Ban User
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
