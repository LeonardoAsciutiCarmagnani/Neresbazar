/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import {
  Home,
  LogOut,
  LogIn,
  Menu,
  User,
  X,
  NotepadTextIcon,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../../firebaseConfig";
import ToastNotifications from "../Toasts/toasts";
import useUserStore from "../../Contexts/UserStore";
import { useZustandContext } from "@/Contexts/cartContext";

interface UserData {
  email: string;
}

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // State para controlar se o usuário está logado
  const {
    username,
    setUserName,
    setTypeUser,
    typeUser,
    fetchTypeUser,
    fetchUserName,
  } = useUserStore();
  const navigate = useNavigate();
  const { toastSuccess, toastError } = ToastNotifications();
  const { clearListProductsInCart, listProductsInCart } = useZustandContext();

  function handleClearListProductsInCart() {
    clearListProductsInCart(listProductsInCart);
  }

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setTypeUser(null);
      setUserName(null); // Limpa o nome do usuário
      setIsLoggedIn(false); // Atualiza o estado de login
      toastSuccess("Logout realizado com sucesso!");
      localStorage.clear();
      navigate("/"); // Redireciona para a home após o logout
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      toastError("Erro ao fazer logout");
    }
  };

  useEffect(() => {
    const userJSON = localStorage.getItem("loggedUser");
    const storedUsername = localStorage.getItem("username");
    if (userJSON) {
      const user = JSON.parse(userJSON) as UserData;
      setIsLoggedIn(true); // Usuário está logado
      setUserName(storedUsername);
      fetchTypeUser();
      fetchUserName();
      console.log(user, storedUsername, "Aqui dados do sidebar");
    } else {
      setUserName(null);
      setTypeUser(null);
      setIsLoggedIn(false); // Usuário não está logado
    }
  }, []);

  return (
    <div className="relative">
      {/* Botão para abrir a Sidebar */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 focus:outline-none"
        aria-label="Abrir menu"
      >
        <Menu className="text-gray-800" size={32} />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/50"
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-gray-100 text-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Cabeçalho da Sidebar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Menu</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-800 focus:outline-none"
            aria-label="Fechar menu"
          >
            <X size={24} />
          </button>
        </div>

        {/* Conteúdo da Sidebar */}
        <div className="p-4">
          {/* Informações do Usuário */}
          {isLoggedIn && (
            <div className="flex items-center gap-x-4 mb-6">
              <User className="text-[#f06139]" size={32} />
              <div>
                <p className="font-semibold text-gray-800 flex justify-start">
                  {username}
                </p>
                <p className="text-sm text-gray-500">
                  {localStorage.getItem("loggedUser") &&
                    (
                      JSON.parse(
                        localStorage.getItem("loggedUser")!
                      ) as UserData
                    ).email}
                </p>
              </div>
            </div>
          )}

          <ul className="space-y-4">
            {/* Itens do Menu */}

            <li>
              <Link
                to="/"
                onClick={() => {
                  handleClearListProductsInCart();
                  setIsOpen(false);
                }}
                className="block text-gray-800 hover:text-white hover:bg-gray-700 rounded-md px-3 py-2 transition-colors"
              >
                <span className="flex items-center gap-x-4">
                  <Home className="text-[#f06139]" size={24} />
                  Home
                </span>
              </Link>
            </li>

            {/* Botão de Login/Logout */}
            <li>
              <Link
                to={typeUser === "adm" ? "/orders" : "/orders-client"}
                className="block w-full text-gray-800 hover:text-white hover:bg-gray-700 rounded-md px-3 py-2 transition-colors"
              >
                <span className="flex items-center gap-x-4">
                  <NotepadTextIcon className="text-[#f06139]" size={24} />{" "}
                  Pedidos
                </span>
              </Link>
            </li>
            <li>
              {isLoggedIn ? (
                <button
                  onClick={() => {
                    handleLogout();
                    handleClearListProductsInCart();
                  }}
                  className="block w-full text-gray-800 hover:text-white hover:bg-gray-700 rounded-md px-3 py-2 transition-colors"
                >
                  <span className="flex items-center gap-x-4">
                    <LogOut className="text-red-600" size={24} /> Sair
                  </span>
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block text-gray-800 hover:text-white hover:bg-gray-700 rounded-md px-3 py-2 transition-colors"
                >
                  <span className="flex items-center gap-x-4">
                    <LogIn className="text-[#f06139]" size={24} /> Login
                  </span>
                </Link>
              )}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
