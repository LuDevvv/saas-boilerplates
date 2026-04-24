import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClientWrapper } from "@/lib/query-client";
import { Toasts } from "@/components/alerts/Toasts";
import { ConnectivityBanner } from "@/components/shared/ConnectivityStatus";
import "./index.css";
import App from "./App.js";

const container = document.getElementById("root");

if (!container) {
  throw new Error("React root element doesn't exist!");
}

const root = createRoot(container);

root.render(
  <QueryClientWrapper>
    <BrowserRouter>
      <Toasts />
      <ConnectivityBanner />
      <App />
    </BrowserRouter>
  </QueryClientWrapper>
);