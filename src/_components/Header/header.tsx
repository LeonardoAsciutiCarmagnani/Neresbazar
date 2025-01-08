import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
// import voidCart from "../assets/cart-xmark-svgrepo-com.svg";
import { useZustandContext } from "../../Contexts/cartContext";
import { Button } from "../../components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../components/ui/sheet";
import logo from "../../assets/neresbazar_logo.svg";
import Sidebar from "../Sidebar/sidebar";

const Header: React.FC = () => {
  // const [userName, setUserName] = useState<string | null>(null);
  const {
    countItemsInCart,
    listProductsInCart,
    totalValue,
    setTotalValue,
    setBuyLimit,
  } = useZustandContext();

  useEffect(() => {
    setTotalValue();
    setBuyLimit();
    console.log("Contando os itens no carrinho: ", countItemsInCart);
    console.log("Valor total do carrinho R$ 250,00 => ", totalValue);
  }, [listProductsInCart]);

  useEffect(() => {}, [countItemsInCart]);

  return (
    <header className="flex items-center justify-between p-4 bg-white shadow-md fixed top-0 w-full z-10">
      {/* Sidebar and Logo Section */}
      <div className="flex items-center gap-4">
        <Sidebar />
        <img src={logo} alt="Kyoto" className="w-16 h-16 rounded-full" />
      </div>

      {/* Cart Section */}
      <div className="flex items-center gap-3">
        <Sheet>
          <SheetTrigger>
            <div className="flex items-center relative gap-2">
              <span className="text-lg font-semibold">
                {totalValue.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </span>
              <ShoppingCart className="text-gray-800" size={32} />
              {countItemsInCart > 0 && (
                <span className="absolute right-0 top-0 transform translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 text-sm font-bold text-white bg-red-600 border-2 border-white rounded-full">
                  {countItemsInCart}
                </span>
              )}
            </div>
          </SheetTrigger>

          <SheetContent className="flex flex-col p-6 bg-gray-50 shadow-lg rounded-lg overflow-y-auto max-h-[80vh] w-full sm:w-[600px] mt-[4.5rem]">
            <SheetHeader className="mb-4">
              <SheetTitle className="text-2xl font-bold text-gray-900">
                Vamos conferir todos os produtos selecionados?
              </SheetTitle>
              <SheetDescription className="text-base text-gray-700 mt-2">
                Total de itens:{" "}
                <span className="font-semibold underline">
                  {countItemsInCart}
                </span>
              </SheetDescription>
            </SheetHeader>

            {listProductsInCart.length < 1 ? (
              <div className="flex flex-col items-center mt-6 space-y-4">
                <ShoppingCart size={64} className="text-gray-300" />
                <span className="text-gray-600">
                  Nenhum produto adicionado ao carrinho. 😢
                </span>
              </div>
            ) : (
              <div className="grid gap-6 mt-4 sm:grid-cols-2 lg:grid-cols-3 md:grid-cols-3">
                {listProductsInCart.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col items-center p-4 text-center border border-gray-300 rounded-lg shadow-md bg-white space-y-3"
                  >
                    {item.imagem ? (
                      <img
                        src={item.imagem}
                        alt={`Imagem do produto ${item.nome}`}
                        className="w-36 h-36 object-cover rounded-md border border-gray-200"
                      />
                    ) : (
                      <div className="w-full h-36 bg-gray-100 rounded-lg flex items-center justify-center text-sm text-gray-500">
                        Sem imagem
                      </div>
                    )}
                    <h3 className="md:text-xs text-lg font-semibold text-gray-800">
                      {item.nome.split(" ").slice(0, 3).join(" ")}
                    </h3>
                    <p className="text-sm text-gray-600">{item.categoria}</p>
                    <p className="text-sm text-gray-600">
                      Quantidade:{" "}
                      <span className="font-medium">{item.quantidade}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Valor unitário:{" "}
                      <span className="font-semibold text-green-600">
                        {item.preco.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            )}

            {listProductsInCart.length > 0 ? (
              <Link to="/buyList" className="mt-6">
                <Button className="w-full py-2 text-lg font-semibold text-white bg-green-600 rounded-lg hover:bg-green-500">
                  Pedido conferido!
                </Button>
              </Link>
            ) : (
              <Button
                disabled
                className="mt-6 w-full py-2 text-lg font-semibold text-gray-400 bg-gray-200 rounded-lg"
              >
                Pedido conferido!
              </Button>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Header;
