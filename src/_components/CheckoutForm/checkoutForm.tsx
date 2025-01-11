import { collection, getDocs, query, where } from "firebase/firestore";
import { firestore } from "../../../firebaseConfig";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useZustandContext } from "@/Contexts/cartContext";

interface UserData {
  cpf: string;
  email: string;
  uid: string;
}

const Checkout: React.FC = () => {
  const [cpf, setCpf] = useState<string | null>(null);
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
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Checkout
        </h1>

        {cpf ? (
          <div className="mb-3 flex flex-col md:flex md:flex-col gap-1">
            <div className=" ">
              <p className="text-gray-700 font-medium mb-2">CPF do Cliente:</p>
              <p className="text-gray-900 text-xl font-semibold">
                {formatCPF(cpf)}
              </p>
            </div>
            <div className="space-y-2 h-96 overflow-y-scroll scrollbar-thin w-full ">
              {listProductsInCart.map((product) => {
                return (
                  <div
                    key={product.id}
                    className="flex flex-col items-center justify-center border-2 rounded-lg flex-1"
                  >
                    <img
                      src={product.imagem}
                      alt="Imagem do produto"
                      className="size-20"
                    />
                    <span className=" text-center">{product.nome}</span>
                    <span>Quantidade: {product.quantidade}</span>
                    <span>
                      Tamanhos:
                      {product.variantSelected?.map((variation, index) => {
                        return (
                          <span key={index}>
                            {" "}
                            {variation.variant}({variation.count})
                          </span>
                        );
                      })}
                    </span>
                    <span>Preço: {product.preco}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="text-gray-700">
            Não foi possível carregar o CPF do cliente.
          </p>
        )}

        <div className="flex gap-1">
          <button
            onClick={() => navigate(-1)}
            className="w-full bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Finalizar pedido
          </button>

          <button
            onClick={() => navigate(-1)}
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
