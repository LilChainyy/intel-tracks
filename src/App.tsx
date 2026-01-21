import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { StockDataProvider } from "@/context/StockDataContext";
import { QuizProvider } from "@/context/QuizContext";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import HomePage from "./pages/HomePage";
import SavedPage from "./pages/SavedPage";
import EmptyCategory from "./pages/EmptyCategory";
import StocksApp from "./pages/stocks/StocksApp";
import NewsPage from "./pages/stocks/NewsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <StockDataProvider>
          <QuizProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Landing page with signup */}
                <Route path="/" element={<LandingPage />} />
                
                {/* Protected routes */}
                <Route path="/home" element={
                  <ProtectedRoute>
                    <HomePage />
                  </ProtectedRoute>
                } />
                
                {/* Stocks - existing content */}
                <Route path="/stocks/news" element={
                  <ProtectedRoute>
                    <NewsPage />
                  </ProtectedRoute>
                } />
                <Route path="/stocks/*" element={
                  <ProtectedRoute>
                    <StocksApp />
                  </ProtectedRoute>
                } />
                
                {/* Saved page */}
                <Route path="/saved" element={
                  <ProtectedRoute>
                    <SavedPage />
                  </ProtectedRoute>
                } />
                
                {/* All other categories - empty placeholder */}
                <Route path="/:category/*" element={
                  <ProtectedRoute>
                    <EmptyCategory />
                  </ProtectedRoute>
                } />
                
                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </QuizProvider>
        </StockDataProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
