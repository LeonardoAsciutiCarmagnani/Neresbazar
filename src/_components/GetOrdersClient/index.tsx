import { collection, getDocs, query, where } from "firebase/firestore";
import { firestore } from "../../../firebaseConfig";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { SubmitHandler, useForm } from "react-hook-form";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ptBR } from "date-fns/locale";
// import { useNavigate } from "react-router-dom";
import { OrderSaleTypes } from "../GetOrders";
import Sidebar from "../Sidebar/sidebar";
import { Input } from "@/components/ui/input";
import { ExternalLinkIcon, LinkIcon } from "lucide-react";

interface StatusProps {
  [key: number]: string;
}

interface IFormInput {
  inputText: string;
  selectDate: string;
  selectStatus: StatusProps;
}

export function GetOrdersClientComponent() {
  const [orderList, setOrderList] = useState<OrderSaleTypes[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OrderSaleTypes[]>([]);
  const listToUse = filteredOrders.length > 0 ? filteredOrders : orderList;
  const [range, setRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });
  const { register, handleSubmit } = useForm<IFormInput>();
  //   const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      const getUserCredentials = localStorage.getItem("loggedUser");
      let userCredentials: { uid: string } | null = null;
      if (getUserCredentials) {
        userCredentials = JSON.parse(getUserCredentials);
        console.log(userCredentials?.uid);
      }

      const queryList: OrderSaleTypes[] = [];
      const docRef = collection(firestore, "sales_orders");
      const q = query(docRef, where("IdClient", "==", userCredentials?.uid));
      const docSnap = await getDocs(q);
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
      }
    } catch (e) {
      console.error("Ocorreu um erro ao buscar os pedidos !", e);
    }
  };

  useEffect(() => {
    console.log("listToUse", listToUse);
  }, [listToUse]);
  const handleSearchOrders: SubmitHandler<IFormInput> = (data) => {
    const selectStatus = isNaN(Number(data.selectStatus))
      ? 0
      : Number(data.selectStatus);

    console.log(range);

    // Desestruturação do `range`
    const { from, to } = range || {}; // Garantindo que `range` pode estar vazio

    console.log("from", from);
    console.log("to", to);

    const filteredList = orderList.filter((order) => {
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

      return matchesStatus && matchesDateRange;
    });

    if (filteredList.length > 0) {
      setFilteredOrders(filteredList);
    } else {
      console.error("Nenhum pedido encontrado!");
    }
  };

  const formattedFrom = range?.from
    ? format(range.from, "dd/MM/yyyy")
    : "--/--/----";
  const formattedTo = range?.to ? format(range.to, "dd/MM/yyyy") : "--/--/----";

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="flex flex-col text-center">
      <header className="flex  w-full items-center justify-between  p-4 bg-gray-100">
        <Sidebar />
        <div className="flex w-full text-center items-center justify-center">
          <h1 className="text-xl font-bold">Lista de Pedidos</h1>
        </div>
      </header>
      <form
        onSubmit={handleSubmit(handleSearchOrders)}
        className="flex flex-wrap items-center gap-4 p-4 ml-2 bg-gray-50"
      >
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
      </form>
      <table className="w-full border-collapse text-center border-gray-200">
        <thead className="bg-gray-100 ">
          <tr>
            <th className="border md:px-4 py-2 hidden text-sm md:text-base md:table-cell">
              Número do pedido
            </th>
            <th className="border md:px-4 py-2 hidden md:table-cell text-sm md:text-base md:table-cel">
              Data de criação
            </th>
            <th className="border md:px-4 py-2 text-sm md:text-base">
              Cliente
            </th>
            <th className="border md:px-4 py-2 text-sm md:text-base">Status</th>
            <th className="border md:px-4 py-2 text-sm md:text-base">
              Pagamento
            </th>
            <th className="border md:px-4 py-2 text-sm md:text-base">
              Detalhes
            </th>
            <th className="border md:px-4 py-2 text-sm md:text-base hidden md:table-cell">
              Valor
            </th>
          </tr>
        </thead>
        <tbody>
          {listToUse.map((order) => (
            <tr
              key={order.id}
              className={
                order.created_at === undefined ? "hidden" : "hover:bg-gray-50"
              }
            >
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
                <div
                  className={` opacity-100   rounded text-xs text-nowrap p-2 md:text-base  ${
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
                  {order.status_order === 1
                    ? "Pedido recebido"
                    : order.status_order === 2
                    ? "Aguardando pagamento"
                    : order.status_order === 3
                    ? "Pagamento confirmado"
                    : order.status_order === 5
                    ? "Em separação"
                    : order.status_order === 6 && "Entregue/Retirada"}
                </div>
              </td>
              <td className="border px-4 py-2 text-sm md:text-base">
                <Popover>
                  <PopoverTrigger className="bg-amber-500 hover:bg-amber-600 text-white px-2 py-1 rounded">
                    <LinkIcon />
                  </PopoverTrigger>
                  <PopoverContent>
                    <div id="linkPayment" className="flex flex-col gap-2">
                      <div className="flex gap-x-2 items-center">
                        <span>Acesse o link para pagamento:</span>
                        <a href={order.paymentLink} target="_blank">
                          <ExternalLinkIcon
                            className="w-6 h-6"
                            color="#3b82f6"
                          />
                        </a>
                      </div>
                      <Input
                        form="linkPayment"
                        type="text"
                        placeholder="Link de pagamento"
                        value={order.paymentLink}
                        className="border px-4 py-2 rounded w-full text-sm  placeholder:text-sm"
                        readOnly
                      />
                    </div>
                  </PopoverContent>
                </Popover>
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
                                    <span className="font-bold text-sm text-gray-800 w-[10rem] truncate">
                                      {product.nome}
                                    </span>
                                  </div>
                                  <span className="text-gray-50 text-xs bg-[#f7633d] px-3 py-1 rounded-full self-start font-semibold">
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
                                    {product.preco?.toLocaleString("pt-BR", {
                                      style: "currency",
                                      currency: "BRL",
                                    })}
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
