/* eslint-disable react-hooks/exhaustive-deps */
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { firestore } from "../../../firebaseConfig";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useZustandContext } from "@/Contexts/cartContext";
import ToastNotifications from "../Toasts/toasts";
import axios from "axios";
import apiBaseUrl from "@/lib/apiConfig";
import type { Product } from "@/Contexts/cartContext";
import { format } from "date-fns";
import UseAdminOrderCompleted from "../PushNotification/adminOrderCompleted";
import UseOrderCompleted from "../PushNotification/orderCompleted";
import SubmittingOrder from "../SubmitingOrder";

interface UserData {
  cpf: string;
  email: string;
  user_id: string;
  name: string;
  type_user: string;
  CEP: string;
  IBGE: number;
  numberHouse: string;
  phoneNumber: string;
  bairro: string;
  complement: string;
  logradouro: string;
}

export type OrderProps = {
  IdClient?: string;
  order_code: string;
  status_order: number;
  created_at?: string;
  updated_at?: string;
  id?: string;
  total: number;
  cliente: ClientData;
  enderecoDeCobranca: EnderecoDeEntrega | null;
  enderecoDeEntrega: EnderecoDeEntrega;
  itens: {
    produtoId?: string;
    nome?: string;
    preco?: number;
    categoria?: string;
    quantidade: number;
    precoUnitarioBruto?: number;
    precoUnitarioLiquido?: number;
  }[];
  meiosDePagamento: MeioDePagamento[];
  numeroPedidoDeVenda: string;
  observacaoDoPedidoDeVenda: string;
  valorDoFrete: number;
};

export type ClientData = {
  documento: string;
  email: string;
  inscricaoEstadual?: string;
  nomeDoCliente: string;
  nomeFantasia?: string;
};

export type EnderecoDeEntrega = {
  bairro: string;
  cep: string;
  codigoIbge: number;
  complemento: string;
  logradouro: string;
  numero: string;
};

export type MeioDePagamento = {
  idMeioDePagamento: number;
  parcelas: number;
  valor: number;
};

const Checkout: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cpf, setCpf] = useState<string | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const navigate = useNavigate();
  const { listProductsInCart, clearListProductsInCart } = useZustandContext();
  const { toastSuccess, toastError } = ToastNotifications();
  const sendAdminOrderCompletedPush = UseAdminOrderCompleted();
  const sendOrderCompletedPush = UseOrderCompleted();

  useEffect(() => {
    const storedUser = localStorage.getItem("loggedUser");
    console.log("Produtos no carrinho:", listProductsInCart);
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

  useEffect(() => {
    console.log(user?.IBGE);
    if (user) {
      const data = createOrderObject(user, listProductsInCart);
      console.log("Dados para o backEnd", data);
    }
  }, [user]);

  const formatCPF = (cpf: string | null): string => {
    if (!cpf) return "";
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  // Verifica se o usuário está logado na renderização
  if (!localStorage.getItem("loggedUser")) {
    navigate("/login");
    return null; // Não renderiza nada se o usuário não estiver logado
  }

  const createOrderObject = (
    user: UserData,
    listProductsInCart: Product[]
  ): OrderProps => {
    const formattedDate = format(new Date(), "yyyy-MM-dd HH:mm:ss");

    return {
      IdClient: user.user_id,
      order_code: "",
      status_order: 0,
      created_at: formattedDate,
      total: parseFloat(
        listProductsInCart
          .reduce(
            (total, product) =>
              total + (product.preco ?? 0) * product.quantidade,
            0
          )
          .toFixed(2)
      ),
      cliente: {
        documento: user.cpf,
        email: user.email,
        inscricaoEstadual: "",
        nomeDoCliente: user.name,
        nomeFantasia: "",
      },
      enderecoDeCobranca: {
        bairro: user.bairro,
        cep: user.CEP,
        codigoIbge: Number(user.IBGE),
        complemento: user.complement,
        logradouro: user.logradouro,
        numero: user.numberHouse,
      },
      enderecoDeEntrega: {
        bairro: user.bairro,
        cep: user.CEP,
        codigoIbge: Number(user.IBGE),
        complemento: user.complement,
        logradouro: user.logradouro,
        numero: user.numberHouse,
      },
      itens: listProductsInCart.map((product) => ({
        produtoId: product.id,
        nome: product.nome,
        preco: product.preco,
        categoria: product.categoria,
        quantidade: product.quantidade,
        precoUnitarioBruto: product.preco,
        precoUnitarioLiquido: product.preco,
      })),
      meiosDePagamento: [
        {
          idMeioDePagamento: 1,
          parcelas: 1,
          valor: parseFloat(
            listProductsInCart
              .reduce(
                (total, product) =>
                  total + (product.preco ?? 0) * product.quantidade,
                0
              )
              .toFixed(2)
          ),
        },
      ],
      numeroPedidoDeVenda: "",
      observacaoDoPedidoDeVenda: "Pedido gerado pelo WEB APP",
      valorDoFrete: 0,
    };
  };

  const handleFinishOrder = async () => {
    setIsSubmitting(true);
    if (!user) {
      toastError("Usuário não encontrado.");
      return;
    }

    const order = createOrderObject(user, listProductsInCart);

    try {
      const response = await axios.post(`${apiBaseUrl}/post-order`, order, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 201) {
        toastSuccess("Pedido realizado com sucesso.");

        try {
          if (!order.IdClient || typeof order.IdClient !== "string") {
            toastError("ID do cliente inválido.");
            return;
          }

          const clientRef = doc(firestore, "clients", order.IdClient);
          const clientDoc = await getDoc(clientRef);

          if (clientDoc.exists()) {
            const phoneNumber = clientDoc.data().phoneNumber;

            await Promise.all([
              sendOrderCompletedPush({
                orderCode: order.order_code,
                customerName: order.cliente?.nomeDoCliente,
                phoneNumber: Number(phoneNumber),
              }),
              sendAdminOrderCompletedPush({
                orderCode: order.order_code,
                totalValue: order.total,
                phoneNumber: Number(phoneNumber),
              }),
            ]);
            console.log("Notificações push enviadas com sucesso.");
            clearListProductsInCart(listProductsInCart);
            navigate("/select-category");
          } else {
            console.error("Documento do cliente não encontrado.");
            toastError(
              "Erro ao enviar notificações: Documento do cliente não encontrado."
            );
          }
        } catch (error) {
          console.error(
            "Erro ao buscar dados do cliente ou enviar notificações:",
            error
          );
          toastError("Erro ao enviar notificações.");
        }
      } else {
        toastError("Erro ao realizar o pedido.");
      }
    } catch (error) {
      console.error("Erro ao enviar o pedido:", error);
      toastError("Erro ao enviar o pedido.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center px-4 py-12 font-poppins">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md ">
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
                    <p className="text-sm">{product.nome}</p>
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
            disabled={isSubmitting}
            onClick={() => handleFinishOrder()} // Substituído por navigate(-1)
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
      <SubmittingOrder isSubmitting={isSubmitting} />
    </div>
  );
};

export default Checkout;
