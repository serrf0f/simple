import { ThemeProvider } from "@shadcn/components/theme-provider";
import { useEffect, useState } from "react";
import { hydrateRoot } from "react-dom/client";
import { setUseLoaderData } from "simple.tsx";
import { Router } from "wouter";
import { useHistoryState } from "wouter/use-browser-location";
import { App } from "./app.tsx";

setUseLoaderData(() => {
  const [state] = useState(window.__loaderDataContext ?? useHistoryState());

  useEffect(() => {
    window.__loaderDataContext = null;
  }, []);

  return state;
});

hydrateRoot(
  document,
  <ThemeProvider defaultTheme="system" storageKey="theme">
    <Router>
      <App />
    </Router>
  </ThemeProvider>,
);
