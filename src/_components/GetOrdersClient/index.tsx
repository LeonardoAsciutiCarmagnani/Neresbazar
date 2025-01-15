import { collection, getDocs, query, where } from "firebase/firestore";
import { firestore } from "../../../firebaseConfig";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
                    Link
                  </PopoverTrigger>
                  <PopoverContent>
                    <div id="linkPayment" className="flex flex-col gap-2">
                      <span>Disponibilize o link de pagamento do pedido:</span>
                      <Input
                        form="linkPayment"
                        type="text"
                        disabled
                        placeholder="Link de pagamento"
                        value={order.paymentLink}
                        className="border px-4 py-2 rounded w-full text-sm  placeholder:text-sm"
                      />
                    </div>
                  </PopoverContent>
                </Popover>
              </td>
              <td className="border px-4 py-2 text-sm md:text-base">
                <Dialog>
                  <DialogTrigger>
                    <span className="bg-amber-500 text-white px-2  text-xs md:text-base py-1 rounded hover:bg-amber-600">
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
                      <div className="flex justify-between rounded-lg items-center p-1">
                        <span className="text-md font-semibold">
                          Valor total do pedido:
                        </span>
                        <span>
                          {order.total?.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </span>
                      </div>
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
