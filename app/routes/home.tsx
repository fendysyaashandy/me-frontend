import type { Route } from "./+types/home";
import { useAuth } from "~/contexts/auth-context"
import { Navigate } from "react-router"
import Dashboard from "./dashboard";
// import Login from "./login";
// import { Welcome } from "../welcome/welcome";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) return <div>Loading...</div>
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return <Dashboard />;
}
