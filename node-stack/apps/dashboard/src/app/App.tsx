import { QueryProvider, AuthProvider } from "./providers";
import { AppRoutes } from "./router";

import { Toasts } from "@/components/alerts/Toasts";
import { GlobalProgressBar } from "@/components/loading/GlobalProgressBar";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";

const App = () => {
  return (
    <ErrorBoundary moduleName="Dashboard">
      <QueryProvider>
        <AuthProvider>
          <GlobalProgressBar />
          <Toasts />
          <AppRoutes />
        </AuthProvider>
      </QueryProvider>
    </ErrorBoundary>
  );
};

export default App;