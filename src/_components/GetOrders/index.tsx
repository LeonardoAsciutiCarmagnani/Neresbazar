import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SubmitHandler, useForm } from "react-hook-form";
// import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { Calendar } from "@/components/ui/calendar";
import { ptBR } from "date-fns/locale";
import { Trash } from "lucide-react";
import { firestore } from "../../../firebaseConfig";
import Sidebar from "../Sidebar/sidebar";

interface StatusProps {
  [key: number]: string;
}

interface IFormInput {
  dateRange: { from: string; to: string };
  inputText: string;
  selectDate: string;
  selectStatus: StatusProps;
  selectData?: string;
}

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
  numero: number;
};

export type MeioDePagamento = {
  idMeioDePagamento: number;
  parcelas: number;
  valor: number;
};

export type OrderSaleTypes = {
  IdClient?: string;
  order_code: number;
  status_order: number;
  created_at?: string;
  updated_at?: string;
  id?: string;
  total?: number;
  cliente: ClientData | null;
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

export default function GetOrdersComponent() {
  const [orderList, setOrderList] = useState<OrderSaleTypes[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OrderSaleTypes[]>([]);
  const [selectedOrderList, setSelectedOrderList] = useState<OrderSaleTypes[]>(
    []
  );
  const [range, setRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });
  const [check, setCheck] = useState(false);
  const [isCleared, setIsCleared] = useState(false);

  /* Alterar o valor da createAt pelo timestamp  */

  const { register, handleSubmit } = useForm<IFormInput>();
  // const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      const queryList: OrderSaleTypes[] = [];
      const docRef = collection(firestore, "sales_orders");
      const docSnap = await getDocs(docRef);
      if (!docSnap.empty) {
        docSnap.docs.map((item) => {
          const data = item.data() as OrderSaleTypes;

          const total = data.itens.reduce(
            (acc, item) => acc + (item.preco || 0) * item.quantidade,
            0
          );

          queryList.push({ ...data, total });

          queryList.sort((a, b) => {
            const numA = Number(a.order_code.toString().match(/\d+/)?.[0]);
            const numB = Number(b.order_code.toString().match(/\d+/)?.[0]);
            return numB - numA;
          });
        });
        console.log(queryList);
        setOrderList(queryList);
        setFilteredOrders(queryList);
      }
    } catch (e) {
      console.log(e);
      console.log("Ocorreu um erro ao buscar os pedidos !");
    }
  };

  const handleUpdatedStatusOrder = async (
    orderId: string,
    newStatus: number
  ) => {
    try {
      const orderUpdateDate = format(new Date(), "yyyy/MM/dd HH:mm:ss");
      const orderRef = doc(firestore, "sales_orders", orderId);

      await updateDoc(orderRef, {
        status_order: newStatus,
        updated_at: orderUpdateDate,
      });

      setOrderList((prevList) => {
        return prevList.map((order) => {
          if (order.id === orderId) {
            return {
              ...order,
              status_order: newStatus,
            };
          }
          return order;
        });
      });

      setFilteredOrders((prevList) => {
        return prevList.map((order) => {
          if (order.id === orderId) {
            return {
              ...order,
              status_order: newStatus,
            };
          }
          return order;
        });
      });
    } catch {
      console.error("Ocorreu um erro ao atualizar o status do pedido !");
    }

    console.log("Verificando a atualização da propriedade: ", orderList);
  };

  const handleSearchOrders: SubmitHandler<IFormInput> = (data) => {
    const searchName = data.inputText.trim();
    const selectStatus = isNaN(Number(data.selectStatus))
      ? 0
      : Number(data.selectStatus);

    console.log(range);

    // Desestruturação do `range`
    const { from, to } = range || {}; // Garantindo que `range` pode estar vazio

    console.log("from", from);
    console.log("to", to);

    const filteredList = orderList.filter((order) => {
      // Filtro por nome
      const matchesName =
        searchName.length > 1 && order.cliente
          ? searchName
              .toLowerCase()
              .includes(searchName.toLocaleLowerCase()) ===
            order.cliente?.nomeDoCliente
              ?.toLowerCase()
              .includes(searchName.toLowerCase())
          : true;

      const matchesStatus =
        selectStatus > 0 ? order.status_order === selectStatus : true;

      const matchesDateRange =
        from && to
          ? (() => {
              if (order.created_at) {
                const orderDate = new Date(order.created_at);
                const startDate = new Date(
                  from.getFullYear(),
                  from.getMonth(),
                  from.getDate()
                );
                const endDate = new Date(
                  to.getFullYear(),
                  to.getMonth(),
                  to.getDate() + 1
                );
                return orderDate >= startDate && orderDate < endDate;
              }
              return false;
            })()
          : true; // Se `from` ou `to` não estiverem definidos, ignora o filtro de data

      return matchesName && matchesStatus && matchesDateRange;
    });

    if (filteredList.length > 0) {
      setFilteredOrders(filteredList);
    } else {
      console.log("Nenhum pedido encontrado!");
    }
  };

  /*   const handlePrintItens = (pedido: OrderSaleTypes, type: string) => {
    console.log("type: ", type);

    let arrayForPrint: {
      produtoId?: string;
      nome?: string;
      preco?: number;
      categoria?: string;
      quantidade: number;
      precoUnitarioBruto?: number;
      precoUnitarioLiquido?: number;
    }[] = [];

    const orderNumber = pedido.order_code;

    arrayForPrint = pedido.itens.map((item, index) => {
      console.log(item.categoria);
      return { ...item, id_seq: index + 1 };
    });

    const user = pedido.cliente &&
      pedido.created_at && {
        IdClient: pedido.IdClient,
        document: pedido.cliente?.documento,
        userName: pedido.cliente?.nomeDoCliente,
        userEmail: pedido.cliente?.email,
        userIE: pedido.cliente.inscricaoEstadual,
        date: pedido?.created_at,
      };

    navigate("/printPage", {
      state: { arrayForPrint, user, type, orderNumber },
    });
  };
 */
  const handleSelectAllOrders = () => {
    const allSelected =
      filteredOrders.length > 0
        ? filteredOrders.every((order) =>
            selectedOrderList.some(
              (selectedOrder) => selectedOrder.id === order.id
            )
          )
        : orderList.every((order) =>
            selectedOrderList.some(
              (selectedOrder) => selectedOrder.id === order.id
            )
          );

    if (allSelected) {
      // Remove todos os pedidos da lista
      setSelectedOrderList([]);
    } else {
      // Adiciona todos os pedidos à lista
      if (filteredOrders.length > 0) {
        setSelectedOrderList(filteredOrders);
      } else {
        setSelectedOrderList(orderList);
      }
    }
  };

  const handleClearSelectList = () => {
    setSelectedOrderList([]);
    setCheck(false);
    setIsCleared(true); // Sinaliza que os checkboxes devem ser desmarcados
    setTimeout(() => setIsCleared(false), 0); // Reseta o estado após a atualização
  };

  const handleSelectOrder = (orderSelected: OrderSaleTypes) => {
    const isAlreadySelected = selectedOrderList.some(
      (order) => order.id === orderSelected.id
    );

    if (isAlreadySelected) {
      setSelectedOrderList((prev) =>
        prev.filter((selectOrder) => selectOrder.id !== orderSelected.id)
      );
      console.log(selectedOrderList);
    } else {
      setSelectedOrderList((prev) => [...prev, orderSelected]);
      console.log(selectedOrderList);
    }
  };

  const handleBatchChange: SubmitHandler<IFormInput> = async (data) => {
    try {
      const updateList = selectedOrderList.map((order) => {
        const newValueStatus = Number(data.selectData);

        return {
          ...order,
          status_order: newValueStatus,
        };
      });

      setSelectedOrderList(updateList);

      setOrderList(updateList);
      setFilteredOrders(updateList);

      const collectionRef = collection(firestore, "sales_orders");

      const updatePromises = updateList.map((order) => {
        updateDoc(doc(collectionRef, order.id), {
          status_order: order.status_order,
        });
      });

      await Promise.all(updatePromises);
      setCheck(false);
      setSelectedOrderList([]);
      await fetchOrders();
    } catch (e) {
      console.error("Ocorreu um erro ao atualizar os status dos pedidos !", e);
    }
  };

  const fetchTypeUser = async (): Promise<string | null> => {
    const getUserCredentials = localStorage.getItem("loggedUser");
    const userCredentials =
      getUserCredentials && JSON.parse(getUserCredentials);

    const id = userCredentials.uid;

    if (!id) {
      console.error("ID não encontrado no localStorage.");
      return null;
    }

    try {
      const clientDoc = doc(firestore, "clients", id);
      const docSnap = await getDoc(clientDoc);
      console.log("Tipo do usuário encontrado.");

      if (docSnap.exists()) {
        const typeUser = docSnap.data()?.type_user || null;

        return typeUser;
      } else {
        console.error("Usuário não encontrado.");
        return null;
      }
    } catch (error) {
      console.error("Erro ao buscar user_name no Firestore:", error);
      return null;
    }
  };

  const selectOptions = [
    { value: 1, label: "Pedido recebido" },
    { value: 2, label: "Aguardando pagamento" },
    { value: 3, label: "Pagamento confirmado" },
    { value: 5, label: "Em separação" },
    { value: 6, label: "Entregue/Retirada" },
  ];

  const formattedFrom = range?.from
    ? format(range.from, "dd/MM/yyyy")
    : "--/--/----";
  const formattedTo = range?.to ? format(range.to, "dd/MM/yyyy") : "--/--/----";

  useEffect(() => {
    fetchOrders();
    fetchTypeUser();
  }, []);

  return (
    <>
      <div className="flex flex-col text-center">
        <header className="flex  w-full items-center justify-between  p-4 bg-gray-100">
          <Sidebar />
          <div className="flex w-full text-center items-center justify-center">
            <h1 className="text-xl font-bold">Lista de Pedidos</h1>
          </div>
        </header>
        <form
          onSubmit={handleSubmit(handleSearchOrders)}
          className="flex flex-wrap items-center gap-4 p-4 bg-gray-50"
        >
          <Input
            type="text"
            placeholder="Buscar por cliente ou número do pedido"
            {...register("inputText")}
            className="border px-4 py-2 rounded w-full text-sm md:w-1/3 placeholder:text-sm"
          />
          <select
            className="border px-4 py-2 rounded"
            {...register("selectStatus")}
          >
            <option value="0">Todos os status</option>
            <option value="1">Pedido recebido</option>
            <option value="2">Aguardando pagamento</option>
            <option value="3">Pagamento confirmado</option>
            <option value="5">Em separação</option>
            <option value="6">Entregue/Retirada</option>
          </select>

          <Popover>
            <PopoverTrigger asChild>
              <div className="w-[200px] border p-2 rounded-lg cursor-pointer hover:bg-gray-200">
                {formattedTo !== "--/--/----" ? (
                  <span className="text-sm">
                    {formattedFrom} || {formattedTo}
                  </span>
                ) : (
                  <span>Selecione o periodo</span>
                )}
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={range}
                onSelect={setRange}
                footer={
                  formattedFrom &&
                  formattedTo &&
                  `${formattedFrom} a ${formattedTo}`
                }
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>

          <button
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700"
            type="submit"
          >
            Filtrar
          </button>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Alteração em lote</Button>
            </DialogTrigger>
            <DialogContent
              aria-describedby={undefined}
              className="flex flex-col "
            >
              <DialogHeader>
                <DialogTitle>
                  Produtos Selecionados para a alteração em lote :
                </DialogTitle>
              </DialogHeader>
              <form
                id="batchChange"
                onSubmit={handleSubmit(handleBatchChange)}
                className="space-y-3 w-full"
              >
                <select
                  className="border-2 px-4 py-2 rounded"
                  {...register("selectData")}
                  disabled={selectedOrderList.length === 0}
                >
                  <option value="1">Pedido recebido</option>
                  <option value="2">Aguardando pagamento</option>
                  <option value="3">Pagamento confirmado</option>
                  <option value="5">Em separação</option>
                  <option value="6">Entregue/Retirada</option>
                </select>
                <div className="space-y-2 overflow-y-scroll h-56">
                  {selectedOrderList.length > 0 ? (
                    <>
                      {selectedOrderList.map((order, index) => (
                        <div
                          key={index}
                          className="flex flex-col md:flex-row items-center border-2 rounded-lg p-2 justify-between w-full"
                        >
                          <div className="flex items-center overflow-hidden">
                            <span className=" px-4 py-2 text-sm md:text-base">
                              {order.order_code}
                            </span>
                            <span className=" px-4 py-2 text-center items-center text-sm md:text-base">
                              {order.created_at
                                ? format(
                                    order.created_at,
                                    "dd/MM/yyyy HH:mm:ss"
                                  )
                                : "Data indisponível"}
                            </span>
                            <span className=" px-4 py-2 text-sm md:text-base text-nowrap truncate">
                              {order.cliente?.nomeDoCliente}
                            </span>
                          </div>
                          <div
                            className={`px-2 py-1 rounded ${
                              order.status_order === 1
                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                : order.status_order === 2
                                ? "bg-yellow-200 text-yellow-800 hover:bg-yellow-300"
                                : order.status_order === 3
                                ? "bg-blue-200 text-blue-800 hover:bg-blue-300"
                                : order.status_order === 4
                                ? "bg-orange-200 text-orange-800 hover:bg-orange-300"
                                : order.status_order === 6
                                ? "bg-green-300 text-green-900 "
                                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                            }`}
                          >
                            <span className="text-sm md:text-base text-nowrap">
                              {order.status_order === 1
                                ? "Pedido recebido"
                                : order.status_order === 2
                                ? "Aguardando pagamento"
                                : order.status_order === 3
                                ? "Pagamento confirmado"
                                : order.status_order === 5
                                ? "Em separação"
                                : order.status_order === 6 &&
                                  "Entregue/Retirada"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <>
                      <h1 className="font-semibold">
                        Você ainda não tem items para alterar
                      </h1>
                    </>
                  )}
                </div>
                <DialogFooter>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button disabled={selectedOrderList.length === 0}>
                        Atualizar Status
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="flex flex-col">
                        <span>Deseja confirmar as alterações de status ?</span>
                        <div className="flex justify-between">
                          <DialogClose asChild>
                            <Button>Cancelar</Button>
                          </DialogClose>
                          <DialogClose asChild>
                            <Button type="submit" form="batchChange">
                              Confirmar
                            </Button>
                          </DialogClose>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <Button variant={"outline"} onClick={handleClearSelectList}>
            <Trash />
            {selectedOrderList.length}
          </Button>
        </form>
      </div>
      <table className="w-full border-collapse text-center border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="border md:px-4 py-2 text-xs md:text-base">
              <input
                type="checkbox"
                name=""
                id=""
                checked={check}
                onChange={() => {
                  setCheck(!check);
                  handleSelectAllOrders();
                }}
              />
            </th>
            <th className="border md:px-4 py-2 hidden text-xs md:text-base md:table-cell">
              Número do pedido
            </th>
            <th className="border md:px-4 py-2 hidden text-sm md:text-base md:table-cell">
              Data de criação
            </th>
            <th className="border md:px-4 py-2 text-xs md:text-base">
              Cliente
            </th>
            <th className="border md:px-4 py-2 text-xs md:text-base">Status</th>
            <th className="border md:px-4 py-2 text-xs md:text-base">
              Detalhes
            </th>
            <th className={`border md:px-4 py-2 hidden md:table-cell`}>
              Valor
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.length > 0 ? (
            <>
              {filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  className={
                    order.created_at === undefined
                      ? "hidden"
                      : "hover:bg-gray-50"
                  }
                >
                  <td className="border px-4 py-2 text-sm md:text-base ">
                    <input
                      type="checkbox"
                      name=""
                      id=""
                      checked={selectedOrderList.includes(order) && !isCleared}
                      onChange={() => {
                        handleSelectOrder(order);
                      }}
                    />
                  </td>
                  <td className="border px-4 py-2 hidden md:table-cell text-sm md:text-base">
                    {order.order_code}
                  </td>

                  <td className="border px-4 py-2 hidden md:table-cell text-sm md:text-base">
                    {order.created_at
                      ? format(order.created_at, "dd/MM/yyyy 'ás' HH:mm:ss")
                      : "Data indisponível"}
                  </td>
                  <td className="border px-4 py-2 text-xs md:text-base">
                    {order.cliente?.nomeDoCliente}
                  </td>
                  <td className="border px-4 py-2 ">
                    <select
                      value={order.status_order}
                      onChange={(e) => {
                        if (order.status_order && order.id) {
                          const nextStatus = Number(e.target.value);
                          handleUpdatedStatusOrder(order.id, nextStatus);
                        }
                      }}
                      disabled={(order.status_order ?? 0) >= 6}
                      className={`px-2 py-1 rounded text-xs md:text-base  ${
                        order.status_order === 1
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : order.status_order === 2
                          ? "bg-yellow-200 text-yellow-800 hover:bg-yellow-300"
                          : order.status_order === 3
                          ? "bg-blue-200 text-blue-800 hover:bg-blue-300"
                          : order.status_order === 5
                          ? "bg-orange-200 text-orange-800 hover:bg-orange-300"
                          : order.status_order === 6
                          ? "bg-green-300 text-green-900 "
                          : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                      }`}
                    >
                      {selectOptions.map((option, index) => {
                        return (
                          <option key={index} value={option.value}>
                            {option.label}
                          </option>
                        );
                      })}
                    </select>
                  </td>
                  <td className="border px-4 py-2 text-sm md:text-base">
                    <Dialog>
                      <DialogTrigger>
                        <span className="bg-[#f7633d] text-white px-2  text-xs md:text-base py-1 rounded hover:bg-amber-600">
                          Ver
                        </span>
                      </DialogTrigger>
                      <DialogContent className="overflow-y-auto max-h-[90vh] bg-gray-50 p-6 sm:p-8 md:p-10">
                        <div className="space-y-8">
                          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 md:p-10 border border-gray-200">
                            <div className="flex flex-col items-center mb-6">
                              <span className="text-4xl font-bold text-gray-800">
                                {order.total?.toLocaleString("pt-BR", {
                                  style: "currency",
                                  currency: "BRL",
                                })}
                              </span>
                              <span className="text-sm text-gray-500 mt-1">
                                ({order.itens.length}{" "}
                                {order.itens.length === 1 ? "item" : "itens"})
                              </span>
                            </div>

                            <div>
                              <h3 className="text-lg font-semibold text-gray-700 pl-4 border-l-4 border-[#f7633d] mb-4">
                                Produtos:
                              </h3>
                              <div className="bg-white rounded-2xl shadow-xl divide-y divide-gray-200 border border-gray-200 overflow-hidden">
                                {order.itens.map((product) => (
                                  <div
                                    key={product.produtoId}
                                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6"
                                  >
                                    <div className="flex flex-col space-y-2 col-span-2">
                                      <div className="flex items-center">
                                        <span className="font-bold text-xl text-gray-800">
                                          {product.nome}
                                        </span>
                                      </div>
                                      <span className="text-gray-50 text-sm bg-[#f7633d] px-3 py-1 rounded-full self-start font-semibold">
                                        {product.categoria}
                                      </span>
                                    </div>
                                    <div className="flex flex-col md:flex-row items-end md:items-center gap-4 md:gap-6 md:justify-end">
                                      <span className="text-gray-600 text-base">
                                        Qtd:{" "}
                                        <span className="font-medium">
                                          {product.quantidade}
                                        </span>
                                      </span>
                                      <span className="font-semibold text-lg text-gray-800">
                                        {product.preco?.toLocaleString(
                                          "pt-BR",
                                          {
                                            style: "currency",
                                            currency: "BRL",
                                          }
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </td>
                  <td className="border px-4 py-2 hidden md:table-cell">
                    {order.total?.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </td>
                  {/* <td className="border px-4 py-2 hidden md:table-cell">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button className="bg-amber-500 hover:bg-amber-600 text-white px-2 py-1 rounded">
                          Imprimir
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent>
                        <div className="flex flex-col">
                          <span>Escolha o tipo de impressão:</span>
                          <div className="flex gap-2">
                            <Button className="bg-amber-500 hover:bg-amber-600 text-white px-2 py-1 rounded">
                              Imprimir A4
                            </Button>
                            <Button className="bg-amber-500 hover:bg-amber-600 text-white px-2 py-1 rounded">
                              Imprimir Térmica
                            </Button>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </td> */}
                </tr>
              ))}
            </>
          ) : (
            <>
              {orderList.map((order) => (
                <tr
                  key={order.id}
                  className={
                    order.created_at === undefined
                      ? "hidden"
                      : "hover:bg-gray-50"
                  }
                >
                  <td className="border px-4 py-2 text-sm md:text-base ">
                    <input
                      type="checkbox"
                      name=""
                      id=""
                      checked={selectedOrderList.includes(order) && !isCleared}
                      onChange={() => {
                        handleSelectOrder(order);
                      }}
                    />
                  </td>
                  <td className="border px-4 py-2 hidden md:table-cell text-sm md:text-base">
                    {order.order_code}
                  </td>

                  <td className="border px-4 py-2 hidden md:table-cell text-sm md:text-base">
                    {order.created_at
                      ? format(order.created_at, "dd/MM/yyyy 'ás' HH:mm:ss")
                      : "Data indisponível"}
                  </td>
                  <td className="border px-4 py-2 text-xs md:text-base">
                    {order.cliente?.nomeDoCliente}
                  </td>
                  <td className="border px-4 py-2 ">
                    <select
                      value={order.status_order}
                      onChange={(e) => {
                        if (order.status_order && order.id) {
                          const nextStatus = Number(e.target.value);
                          handleUpdatedStatusOrder(order.id, nextStatus);
                        }
                      }}
                      disabled={(order.status_order ?? 0) >= 6}
                      className={`px-2 py-1 rounded text-xs md:text-base  ${
                        order.status_order === 1
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : order.status_order === 2
                          ? "bg-yellow-200 text-yellow-800 hover:bg-yellow-300"
                          : order.status_order === 3
                          ? "bg-blue-200 text-blue-800 hover:bg-blue-300"
                          : order.status_order === 4
                          ? "bg-purple-200 text-purple-800 hover:bg-purple-300"
                          : order.status_order === 5
                          ? "bg-orange-200 text-orange-800 hover:bg-orange-300"
                          : order.status_order === 6
                          ? "bg-green-300 text-green-900 "
                          : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                      }`}
                    >
                      {selectOptions.map((option, index) => {
                        return (
                          <option key={index} value={option.value}>
                            {option.label}
                          </option>
                        );
                      })}
                    </select>
                  </td>
                  <td className="border px-4 py-2 text-sm md:text-base">
                    <Dialog>
                      <DialogTrigger>
                        <span className="bg-amber-500 hover:bg-amber-600 text-white px-2  text-xs md:text-base py-1 rounded ">
                          Ver
                        </span>
                      </DialogTrigger>
                      <DialogContent
                        className="overflow-y-scroll h-96"
                        aria-describedby={undefined}
                      >
                        <DialogHeader className="items-center">
                          <DialogTitle>Detalhes</DialogTitle>
                        </DialogHeader>
                        <div className=" md:hidden space-y-2 flex flex-col items-center justify-center">
                          <div className="flex gap-1 justify-between rounded-lg items-center p-1">
                            <span className="text-base font-semibold">
                              Valor total do pedido:
                            </span>
                            <span>
                              {order.total?.toLocaleString("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              })}
                            </span>
                          </div>
                          {/*  <Popover>
                            <PopoverTrigger asChild>
                              <Button className="bg-amber-500 hover:bg-amber-600 text-white px-2 py-1 rounded">
                                Imprimir
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent>
                              <div className="flex flex-col">
                                <span>Escolha o tipo de impressão:</span>
                                <div className="flex gap-2">
                                  <Button className="bg-amber-500 hover:bg-amber-600 text-white px-2 py-1 rounded">
                                    Imprimir A4
                                  </Button>
                                  <Button className="bg-amber-500 hover:bg-amber-600 text-white px-2 py-1 rounded">
                                    Imprimir Térmica
                                  </Button>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover> */}
                        </div>
                        <div className="text-lg font-semibold text-center">
                          Lista de produtos:
                        </div>
                        <div className=" rounded-lg text-sm space-y-2 p-2 md:text-base">
                          {order.itens.map((product) => (
                            <div
                              key={product.produtoId}
                              className="flex flex-col border-2 space-y-2 p-2 rounded-lg items-center"
                            >
                              <div>
                                <span className="font-semibold">
                                  {product.nome}
                                </span>{" "}
                                -{" "}
                                <span className="font-semibold">
                                  {product.categoria}
                                </span>
                              </div>
                              <span>Quantidade: {product.quantidade}</span>
                              <span>
                                {product.preco?.toLocaleString("pt-BR", {
                                  style: "currency",
                                  currency: "BRL",
                                })}
                              </span>
                            </div>
                          ))}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </td>
                  <td className="border px-4 py-2 hidden md:table-cell">
                    {order.total?.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </td>
                  {/*   <td className="border px-4 py-2 hidden md:table-cell">
                    <div>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button className="bg-amber-500 hover:bg-amber-600 text-white px-2 py-1 rounded">
                            Imprimir
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent>
                          <div className="flex flex-col">
                            <span>Escolha o tipo de impressão:</span>
                            <div className="flex gap-2">
                              <Button className="bg-amber-500 hover:bg-amber-600 text-white px-2 py-1 rounded">
                                Imprimir A4
                              </Button>
                              <Button className="bg-amber-500 hover:bg-amber-600 text-white px-2 py-1 rounded">
                                Imprimir Térmica
                              </Button>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </td> */}
                </tr>
              ))}
            </>
          )}
        </tbody>
      </table>
    </>
  );
}
