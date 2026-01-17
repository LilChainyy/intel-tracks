import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { StockDataProvider } from "@/context/StockDataContext";
import { QuizProvider } from "@/context/QuizContext";
import HomePage from "./pages/HomePage";
import SavedPage from "./pages/SavedPage";
import EmptyCategory from "./pages/EmptyCategory";
import StocksApp from "./pages/stocks/StocksApp";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <StockDataProvider>
        <QuizProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Homepage with category grid */}
              <Route path="/" element={<HomePage />} />
              
              {/* Stocks - existing content */}
              <Route path="/stocks/*" element={<StocksApp />} />
              
              {/* Saved page */}
              <Route path="/saved" element={<SavedPage />} />
              
              {/* All other categories - empty placeholder */}
              <Route path="/:category/*" element={<EmptyCategory />} />
              
              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </QuizProvider>
      </StockDataProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
