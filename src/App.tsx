import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminRoute } from "./components/AdminRoute";
import Auth from "./pages/Auth.tsx";
import Index from "./pages/Index.tsx";
import Prospecting from "./pages/Prospecting.tsx";
import DashboardAdmin from "./pages/DashboardAdmin.tsx";
import NotFound from "./pages/NotFound.tsx";
import { AppHeader } from "./components/AppHeader.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Auth />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <AppHeader />
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/prospectar" element={<Prospecting />} />
                    <Route
                      path="/dashboard"
                      element={
                        <AdminRoute>
                          <DashboardAdmin />
                        </AdminRoute>
                      }
                    />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
