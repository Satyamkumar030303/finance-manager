import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { Toaster } from "react-hot-toast";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext";
import { CurrencyProvider } from "./context/CurrencyContext";
import { ThemeProvider } from "./context/ThemeContext";
import { HelmetProvider } from "react-helmet-async";
import "./i18n/index.js";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,         // 30s default stale time (was 0)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HelmetProvider>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <CurrencyProvider>
              <App />
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: "var(--toast-bg, #fff)",
                    color: "var(--toast-color, #111)",
                    borderRadius: "12px",
                    border: "1px solid var(--toast-border, #e5e7eb)",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    fontSize: "14px",
                  },
                }}
              />
            </CurrencyProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </HelmetProvider>
  </React.StrictMode>
);
