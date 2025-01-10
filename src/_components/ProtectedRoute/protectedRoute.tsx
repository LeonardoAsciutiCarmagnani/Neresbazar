import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../Contexts/authStore"; // Ajuste o path se necessário

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user } = useAuthStore();

  if (!user) {
    // Redireciona para o login se não houver usuário logado,
    // passando a localização atual como 'from' no state.
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
