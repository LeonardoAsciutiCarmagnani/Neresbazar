import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface UserData {
  cpf: string;
}

const Checkout: React.FC = () => {
  const [cpf, setCpf] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("loggedUser");

    if (storedUser) {
      const user = JSON.parse(storedUser) as UserData;
      setCpf(user.cpf);
    }
  }, []);

  const formatCPF = (cpf: string | null): string => {
    if (!cpf) return "";
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  // Verifica se o usuário está logado na renderização
  if (!localStorage.getItem("loggedUser")) {
    navigate("/login");
    return null; // Não renderiza nada se o usuário não estiver logado
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center px-4 py-12">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Checkout
        </h1>

        {cpf ? (
          <div className="mb-6">
            <p className="text-gray-700 font-medium mb-2">CPF do Cliente:</p>
            <p className="text-gray-900 text-xl font-semibold">
              {formatCPF(cpf)}
            </p>
          </div>
        ) : (
          <p className="text-gray-700">
            Não foi possível carregar o CPF do cliente.
          </p>
        )}

        <button
          onClick={() => navigate(-1)}
          className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Voltar
        </button>
      </div>
    </div>
  );
};

export default Checkout;
