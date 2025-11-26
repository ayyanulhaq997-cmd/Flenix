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
import { Search, MoreVertical, Shield, ShieldAlert, CheckCircle, Ban } from "lucide-react";
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
        <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
          Export CSV
        </Button>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search users by name or email..." 
              className="pl-9 bg-background border-border"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="input-search-users"
            />
          </div>
        </div>

        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent border-border">
              <TableHead className="w-[300px]">User</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Joined Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id} className="border-border hover:bg-muted/30">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 bg-muted border border-border">
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
                  <Badge variant="secondary" className="bg-muted hover:bg-muted">
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
                      <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-popover border-border">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem className="cursor-pointer text-foreground focus:bg-muted">
                        <Shield className="mr-2 h-4 w-4" /> Change Plan
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-border" />
                      <DropdownMenuItem className="cursor-pointer text-destructive focus:bg-destructive/10">
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
