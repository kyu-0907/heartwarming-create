import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import MenteeDetail from "./pages/MenteeDetail";
import WeeklyReportDetail from "./pages/WeeklyReportDetail";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import DevelopmentInProgress from "./pages/DevelopmentInProgress";
import LearningFeedback from "./pages/LearningFeedback";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const user = localStorage.getItem('user');
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mentee/:id"
            element={
              <ProtectedRoute>
                <MenteeDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mentee/:id/report"
            element={
              <ProtectedRoute>
                <WeeklyReportDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mentee/:id/report/:reportId"
            element={
              <ProtectedRoute>
                <WeeklyReportDetail />
              </ProtectedRoute>
            }
          />
          <Route path="/learning" element={<ProtectedRoute><LearningFeedback /></ProtectedRoute>} />
          <Route path="/schedule" element={<ProtectedRoute><DevelopmentInProgress /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><DevelopmentInProgress /></ProtectedRoute>} />
          <Route path="/stats" element={<ProtectedRoute><DevelopmentInProgress /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><DevelopmentInProgress /></ProtectedRoute>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
