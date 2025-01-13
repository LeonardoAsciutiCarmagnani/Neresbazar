import { collection, getDocs, query, where } from "firebase/firestore";
import { firestore } from "../../../firebaseConfig";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useZustandContext } from "@/Contexts/cartContext";

interface UserData {
  cpf: string;
  email: string;
  uid: string;
  name: string;
}

const Checkout: React.FC = () => {
  const [cpf, setCpf] = useState<string | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const navigate = useNavigate();
  const { listProductsInCart } = useZustandContext();
  useEffect(() => {
    const storedUser = localStorage.getItem("loggedUser");

    if (storedUser) {
      const formattedStoreUser = JSON.parse(storedUser);
      console.log("Usuário logado:", formattedStoreUser);

      const collectionRef = collection(firestore, "clients");
      const queryRef = query(
        collectionRef,
        where("user_id", "==", formattedStoreUser.uid)
      );

      const fetchClient = async () => {
        try {
          const querySnapshot = await getDocs(queryRef);
          const clients = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as UserData),
          }));

          console.log("Clientes encontrados:", clients[0].cpf);
          const user = clients[0];
          setUser(user);
          const getUserCpf = clients[0].cpf;
          setCpf(getUserCpf);
        } catch (error) {
          console.error("Erro ao buscar clientes:", error);
        }
      };

      fetchClient();

      // Atualiza o estado com o CPF do usuário logado
      setCpf(formattedStoreUser.cpf);
    } else {
      console.warn("Nenhum usuário encontrado no localStorage.");
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
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Checkout
        </h1>

        {cpf ? (
          <div className="mb-4">
            <div className="flex justify-start mb-2">
              <h2 className="text-gray-600 text-md font-semibold uppercase">
                Informações{" "}
              </h2>
            </div>
            <div className="grid grid-cols-2 border-b-2 border-gray-200 pb-3 mb-2">
              <div>
                <label
                  htmlFor="nome"
                  className="block text-gray-700 font-medium mb-1"
                >
                  Nome:
                </label>
                <p
                  id="nome"
                  className="text-gray-900 text-base font-semibold truncate"
                >
                  {user?.name}
                </p>
              </div>

              <div>
                <label
                  htmlFor="cpf"
                  className="block text-gray-700 font-medium mb-1"
                >
                  CPF:
                </label>
                <p id="cpf" className="text-gray-900 text-md font-semibold">
                  {formatCPF(cpf)}
                </p>
              </div>
            </div>

            <div className="h-72 overflow-y-auto scrollbar-thin pr-2">
              {" "}
              {/* Ajuste a altura conforme necessário */}
              {listProductsInCart.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center border-b border-gray-200 py-2"
                >
                  <img
                    src={product.imagem}
                    alt="Imagem do produto"
                    className="w-16 h-16 object-cover rounded-md mr-4"
                  />
                  <div>
                    <p className="font-medium">{product.nome}</p>
                    <p className="text-sm text-gray-600">
                      Quantidade: {product.quantidade}
                    </p>
                    <p className="text-sm text-gray-600">
                      Tamanhos:
                      {product.variantSelected?.map((variation, index) => (
                        <span key={index}>
                          {" "}
                          {variation.variant}({variation.count})
                        </span>
                      ))}
                    </p>
                    <p className="text-sm text-gray-600">
                      Preço: {product.preco}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-gray-700 text-center">
            Não foi possível carregar o CPF do cliente.
          </p>
        )}

        <div className="flex flex-col gap-2 mt-4">
          {" "}
          {/* Alterado para flex-col */}
          <button
            onClick={() => navigate(-1)} // Substituído por navigate(-1)
            className="w-full bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Finalizar pedido
          </button>
          <button
            onClick={() => navigate(-1)} // Substituído por navigate(-1)
            className="w-full bg-amber-600 text-white font-semibold py-3 rounded-lg hover:bg-amber-700 transition-colors"
          >
            Voltar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
