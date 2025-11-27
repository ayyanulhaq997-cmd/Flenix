import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Browse from "@/pages/browse";
import Movies from "@/pages/movies";
import Series from "@/pages/series";
import Channels from "@/pages/channels";
import Users from "@/pages/users";
import Settings from "@/pages/settings";
import ApiKeys from "@/pages/api-keys";
import Migration from "@/pages/migration";
import Login from "@/pages/login";
import Signup from "@/pages/signup";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={Login} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      
      <Route path="/" component={Dashboard} />
      <Route path="/browse" component={Browse} />
      <Route path="/movies" component={Movies} />
      <Route path="/series" component={Series} />
      <Route path="/channels" component={Channels} />
      <Route path="/users" component={Users} />
      <Route path="/api-keys" component={ApiKeys} />
      <Route path="/migration" component={Migration} />
      <Route path="/settings" component={Settings} />
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
