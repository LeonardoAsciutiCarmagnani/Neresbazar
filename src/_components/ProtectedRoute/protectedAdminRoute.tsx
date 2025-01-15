import React, { useEffect } from "react";
import useUserStore from "@/Contexts/UserStore";
import ToastNotifications from "../Toasts/toasts";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedAdminRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { toastError } = ToastNotifications();
  const { typeUser } = useUserStore();

  useEffect(() => {
    if (typeUser !== "adm") {
      toastError("Acesso negado!");
    }
  }, [typeUser]);

  return <>{children}</>;
};

export default ProtectedAdminRoute;
