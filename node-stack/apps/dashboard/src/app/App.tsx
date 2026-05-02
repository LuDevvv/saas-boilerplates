import { QueryProvider, AuthProvider } from "./providers";
import { AppRoutes } from "./router";
import { Toasts } from "@/components/alerts/Toasts";

const App = () => {
  return (
    <QueryProvider>
      <AuthProvider>
        <Toasts />
        <AppRoutes />
      </AuthProvider>
    </QueryProvider>
  );
};

export default App;