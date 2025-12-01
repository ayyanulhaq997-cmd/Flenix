import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import AdminDashboard from "@/pages/admin-dashboard";
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
import TVHome from "@/pages/tv-home";
import TVDetails from "@/pages/tv-details";
import TVProfiles from "@/pages/tv-profiles";
import { isAdmin, isAuthenticated } from "@/lib/auth-utils";

/**
 * Protected route wrapper for admin routes
 * Checks if user is authenticated AND has admin role
 * Redirects to home page for subscribers, to login for unauthenticated
 */
function AdminRoute({ component: Component, ...props }: any) {
  // Check if user is authenticated
  if (!isAuthenticated()) {
    return <Login />;
  }

  // Check if user has admin role
  if (!isAdmin()) {
    // Redirect subscribers/non-admins to home page
    window.location.href = "/";
    return null;
  }

  return <Component {...props} />;
}

function Router() {
  return (
    <Switch>
      {/* TV Application - Primary Platform */}
      <Route path="/tv" component={TVHome} />
      <Route path="/tv/details" component={TVDetails} />
      <Route path="/tv/profiles" component={TVProfiles} />

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
      
      {/* Admin Routes (Protected - requires admin role) */}
      <Route path="/admin/dashboard" component={(props) => <AdminRoute component={AdminDashboard} {...props} />} />
      <Route path="/admin" component={(props) => <AdminRoute component={AdminDashboard} {...props} />} />
      <Route path="/admin/users" component={(props) => <AdminRoute component={Users} {...props} />} />
      <Route path="/admin/api-keys" component={(props) => <AdminRoute component={ApiKeys} {...props} />} />
      <Route path="/admin/migration" component={(props) => <AdminRoute component={Migration} {...props} />} />
      <Route path="/admin/bulk-import" component={(props) => <AdminRoute component={BulkImport} {...props} />} />
      <Route path="/admin/settings" component={(props) => <AdminRoute component={Settings} {...props} />} />
      
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
