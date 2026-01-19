import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { useCodeLockState } from "@/hooks/useCodeLockState";
import { formatSeconds } from "@/lib/state";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  // ✅ SINGLE SOURCE OF STATE (CRITICAL)
  const { state, actions, canOverride } = useCodeLockState();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        {/* 🔴 TEMP DEBUG – REMOVE LATER */}
        

        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                <Index
                  state={state}
                  actions={actions}
                  canOverride={canOverride}
                />
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
