import AuthPanel from "./components/AuthPanel";
import { AuthProvider, useAuth } from "./context/AuthContext";
import DashboardPage from "./pages/DashboardPage";

function AppContent() {
  const { session } = useAuth();
  return session ? <DashboardPage /> : <AuthPanel />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
