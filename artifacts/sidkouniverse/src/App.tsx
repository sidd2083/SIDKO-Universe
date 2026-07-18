import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { ThemeProvider } from 'next-themes';

import { Layout } from '@/components/layout/Layout';
import { AuthProvider } from '@/contexts/AuthContext';
import { MusicProvider } from '@/contexts/MusicContext';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

// Public Pages
import Home from '@/pages/Home';
import Memories from '@/pages/Memories';
import MemoryDetail from '@/pages/MemoryDetail';
import Thoughts from '@/pages/Thoughts';
import ThoughtDetail from '@/pages/ThoughtDetail';
import Blog from '@/pages/Blog';
import BlogPost from '@/pages/BlogPost';
import About from '@/pages/About';
import Goals from '@/pages/Goals';
import Achievements from '@/pages/Achievements';
import Anonymous from '@/pages/Anonymous';
import Guestbook from '@/pages/Guestbook';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Profile from '@/pages/Profile';
import Messages from '@/pages/Messages';
import Timeline from '@/pages/Timeline';
import Learning from '@/pages/Learning';
import NotFound from '@/pages/not-found';

// Admin secret entry
import AdminLogin from '@/pages/AdminLogin';

// Admin Pages
import Dashboard from '@/pages/dashboard/Dashboard';
import MemoryManager from '@/pages/dashboard/MemoryManager';
import ThoughtEditor from '@/pages/dashboard/ThoughtEditor';
import BlogEditor from '@/pages/dashboard/BlogEditor';
import GoalManager from '@/pages/dashboard/GoalManager';
import AnonymousCenter from '@/pages/dashboard/AnonymousCenter';
import MusicManager from '@/pages/dashboard/MusicManager';
import Settings from '@/pages/dashboard/Settings';
import Journal from '@/pages/dashboard/Journal';
import TimelineManager from '@/pages/dashboard/TimelineManager';

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      {/* Admin login — accessible at /admin (primary), /balen, /admi */}
      <Route path="/admin" component={AdminLogin} />
      <Route path="/balen" component={AdminLogin} />
      <Route path="/admi" component={AdminLogin} />

      {/* All other routes use the main layout */}
      <Route>
        <Layout>
          <ErrorBoundary>
            <Switch>
              {/* Public Routes */}
              <Route path="/" component={Home} />
              <Route path="/memories" component={Memories} />
              <Route path="/memories/:id" component={MemoryDetail} />
              <Route path="/thoughts" component={Thoughts} />
              <Route path="/thoughts/:id" component={ThoughtDetail} />
              <Route path="/blog" component={Blog} />
              <Route path="/blog/:slug" component={BlogPost} />
              <Route path="/about" component={About} />
              <Route path="/goals" component={Goals} />
              <Route path="/achievements" component={Achievements} />
              <Route path="/anonymous" component={Anonymous} />
              <Route path="/guestbook" component={Guestbook} />
              <Route path="/timeline" component={Timeline} />
              <Route path="/learning" component={Learning} />

              {/* Auth & User */}
              <Route path="/login" component={Login} />
              <Route path="/register" component={Register} />
              <Route path="/profile" component={Profile} />
              <Route path="/messages" component={Messages} />

              {/* Admin Dashboard */}
              <Route path="/dashboard" component={Dashboard} />
              <Route path="/dashboard/memories" component={MemoryManager} />
              <Route path="/dashboard/thoughts" component={ThoughtEditor} />
              <Route path="/dashboard/blog" component={BlogEditor} />
              <Route path="/dashboard/goals" component={GoalManager} />
              <Route path="/dashboard/anonymous" component={AnonymousCenter} />
              <Route path="/dashboard/music" component={MusicManager} />
              <Route path="/dashboard/settings" component={Settings} />
              <Route path="/dashboard/journal" component={Journal} />
              <Route path="/dashboard/timeline" component={TimelineManager} />

              <Route component={NotFound} />
            </Switch>
          </ErrorBoundary>
        </Layout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <MusicProvider>
              <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
                <Router />
              </WouterRouter>
            </MusicProvider>
          </AuthProvider>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
