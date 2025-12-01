import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Dashboard from "@/pages/dashboard";
import Browse from "@/pages/browse";
import Movies from "@/pages/movies";
import Series from "@/pages/series";
import Channels from "@/pages/channels";
import Users from "@/pages/users";
import Settings from "@/pages/settings";
import ApiKeys from "@/pages/api-keys";
import Migration from "@/pages/migration";
import BulkImport from "@/pages/bulk-import";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import ProfileSelector from "@/pages/profile-selector";
import AccountSettings from "@/pages/account-settings";

// Protected route wrapper for admin routes
function ProtectedRoute({ component: Component, ...props }: any) {
  // In production, check JWT token here
  const token = localStorage.getItem("adminToken");
  if (!token) {
    return <Login />;
  }
  return <Component {...props} />;
}

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={Home} />
      <Route path="/auth" component={Login} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/profiles" component={ProfileSelector} />
      
      {/* Public Content Routes */}
      <Route path="/browse" component={Browse} />
      <Route path="/movies" component={Movies} />
      <Route path="/series" component={Series} />
      <Route path="/channels" component={Channels} />
      <Route path="/account" component={AccountSettings} />
      
      {/* Admin Routes (Protected) */}
      <Route path="/admin/dashboard" component={Dashboard} />
      <Route path="/admin/users" component={Users} />
      <Route path="/admin/api-keys" component={ApiKeys} />
      <Route path="/admin/migration" component={Migration} />
      <Route path="/admin/bulk-import" component={BulkImport} />
      <Route path="/admin/settings" component={Settings} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
