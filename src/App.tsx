import React from "react";
import { lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useSearchParams } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/hooks/useAuth";
import { DDoSProtection } from "@/components/DDoSProtection";
import ScrollToTop from "@/components/ScrollToTop";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import Articles from "./pages/admin/Articles";
import Analytics from "./pages/admin/Analytics";
import Users from "./pages/admin/Users";
import Comments from "./pages/admin/Comments";
import ArticlesPublic from "./pages/ArticlesPublic";
import ArticleDetail from "./pages/ArticleDetail";
import BreakingNewsDetail from "./pages/BreakingNewsDetail";
import Donate from "./pages/Donate";
import Checkout from "./pages/Checkout";
import Unsubscribe from "./pages/Unsubscribe";
import AdminAnalytics from "./pages/Analytics";

const queryClient = new QueryClient();

// Wrapper component to handle redirects from edge function
const IndexWithRedirect = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  React.useEffect(() => {
    const redirectPath = searchParams.get('redirect');
    if (redirectPath) {
      // Remove the redirect param and navigate to the intended path
      navigate(redirectPath, { replace: true });
    }
  }, [searchParams, navigate]);

  return <Index />;
};

const App = () => {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TooltipProvider>
            <AuthProvider>
              <DDoSProtection>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <ScrollToTop />
                  <Routes>
                    <Route path="/" element={<IndexWithRedirect />} />
                    <Route path="/articles" element={<ArticlesPublic />} />
                    <Route path="/donate" element={<Donate />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/unsubscribe" element={<Unsubscribe />} />
                    <Route path="/newsletter/confirmation" element={lazy(() => import("./pages/NewsletterConfirmation"))} />
                    <Route path="/admin/login" element={<Login />} />
                    <Route path="/admin" element={<Dashboard />} />
                    <Route path="/admin/articles" element={<Articles />} />
                    <Route path="/admin/analytics" element={<Analytics />} />
                    <Route path="/admin/newsletter-templates" element={lazy(() => import("./pages/admin/NewsletterTemplates"))} />
                    <Route path="/admin/users" element={<Users />} />
                    <Route path="/admin/comments" element={<Comments />} />
                    <Route path="/articles/:id" element={<ArticleDetail />} />
                    <Route path="/breaking-news/:id" element={<BreakingNewsDetail />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </DDoSProtection>
            </AuthProvider>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;
