import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import "@/config/i18n";
import App from "./app/App";

async function startApp() {
  const container = document.getElementById("root");

  if (!container) {
    throw new Error("React root element doesn't exist!");
  }

  const root = createRoot(container);

  root.render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

startApp();
