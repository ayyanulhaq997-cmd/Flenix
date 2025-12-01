import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "@/components/ErrorBoundary";
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
import Watch from "@/pages/watch";
import AdminDashboardMetrics from "@/pages/admin-dashboard-metrics";
import AdminContentList from "@/pages/admin-content-list";
import AdminUserManagement from "@/pages/admin-user-management";
import AdminBilling from "@/pages/admin-billing";
import UnifiedHome from "@/pages/unified-home";
import PlanSelection from "@/pages/plan-selection";
import PaymentPage from "@/pages/payment";
import { isAdmin, isAuthenticated } from "@/lib/auth-utils";

/**
 * Admin Route Protection - Redirects non-admins to Browse
 * Required for CRITICAL SECURITY TEST: Non-admins typing /admin must be redirected
 */
function AdminRoute({ component: Component, ...props }: any) {
  if (!isAdmin()) {
    return <Browse />;
  }
  return <Component {...props} />;
}

function Router() {
  return (
    <Switch>
      {/* Unified Home - Detects device and routes to TV or Web */}
      <Route path="/" component={UnifiedHome} />

      {/* TV Application - Primary Platform */}
      <Route path="/tv" component={TVHome} />
      <Route path="/tv/details" component={TVDetails} />
      <Route path="/tv/profiles" component={TVProfiles} />
      <Route path="/watch" component={Watch} />

      {/* Public Routes - All Accessible */}
      <Route path="/home" component={Home} />
      <Route path="/auth" component={Login} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/profiles" component={ProfileSelector} />
      <Route path="/plans" component={PlanSelection} />
      <Route path="/payment" component={PaymentPage} />
      <Route path="/browse" component={Browse} />
      <Route path="/movies" component={Movies} />
      <Route path="/series" component={Series} />
      <Route path="/channels" component={Channels} />
      <Route path="/account" component={AccountSettings} />
      
      {/* Admin Routes - Protected (redirects non-admins to Browse) */}
      <Route path="/admin/dashboard" component={(props) => <AdminRoute component={AdminDashboardMetrics} {...props} />} />
      <Route path="/admin" component={(props) => <AdminRoute component={AdminDashboardMetrics} {...props} />} />
      <Route path="/admin/content" component={(props) => <AdminRoute component={AdminContentList} {...props} />} />
      <Route path="/admin/users" component={(props) => <AdminRoute component={AdminUserManagement} {...props} />} />
      <Route path="/admin/billing" component={(props) => <AdminRoute component={AdminBilling} {...props} />} />
      <Route path="/admin/api-keys" component={(props) => <AdminRoute component={ApiKeys} {...props} />} />
      <Route path="/admin/migration" component={(props) => <AdminRoute component={Migration} {...props} />} />
      <Route path="/admin/bulk-import" component={(props) => <AdminRoute component={BulkImport} {...props} />} />
      <Route path="/admin/settings" component={(props) => <AdminRoute component={Settings} {...props} />} />
      <Route path="/admin/dashboard/metrics" component={(props) => <AdminRoute component={AdminDashboardMetrics} {...props} />} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
