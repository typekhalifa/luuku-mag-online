
import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
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
import NewsletterConfirmation from "./pages/NewsletterConfirmation";

const queryClient = new QueryClient();

// Component to handle redirects from social preview
const RedirectHandler = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    const redirectArticle = sessionStorage.getItem('redirectToArticle');
    if (redirectArticle) {
      sessionStorage.removeItem('redirectToArticle');
      navigate(`/articles/${redirectArticle}`, { replace: true });
    }
  }, [navigate]);
  
  return null;
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
                  <RedirectHandler />
                  <ScrollToTop />
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/articles" element={<ArticlesPublic />} />
                    <Route path="/donate" element={<Donate />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/newsletter/confirmation" element={<NewsletterConfirmation />} />
                    <Route path="/admin/login" element={<Login />} />
                    <Route path="/admin" element={<Dashboard />} />
                    <Route path="/admin/articles" element={<Articles />} />
                    <Route path="/admin/analytics" element={<Analytics />} />
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
