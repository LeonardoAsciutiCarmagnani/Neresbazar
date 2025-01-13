import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
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
import { useAuthStore } from "@/Contexts/authStore";

const Header: React.FC = () => {
  const {
    countItemsInCart,
    listProductsInCart,
    totalValue,
    setTotalValue,
    setBuyLimit,
  } = useZustandContext();

  const { setRedirectToAuth } = useAuthStore();

  useEffect(() => {
    setTotalValue();
    setBuyLimit();
  }, [listProductsInCart, setBuyLimit, setTotalValue]);

  const navigate = useNavigate();

  async function handleNavigateToCheckoutPage() {
    const userIsAutenticated = localStorage.getItem("loggedUser");

    if (!userIsAutenticated) {
      // Usuário não autenticado
      setRedirectToAuth(true);
      setTimeout(() => {
        setRedirectToAuth(false);
        navigate("/login");
      }, 5000);
    } else {
      // Usuário autenticado
      navigate("/checkout");
    }
  }

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
          <SheetTrigger asChild>
            <button className="flex items-center relative gap-2">
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
            </button>
          </SheetTrigger>

          <SheetContent className="flex flex-col p-6 bg-white shadow-lg rounded-lg overflow-y-auto max-h-[80vh] w-full sm:w-[600px] mt-[4.5rem] font-poppins">
            <SheetHeader className="flex items-center justify-between">
              <div>
                <SheetTitle className="text-lg font-bold text-gray-900">
                  Confira todos os produtos selecionados.
                </SheetTitle>
                <SheetDescription className="text-base text-gray-700 mt-2">
                  <div className="flex items-center justify-between py-1 border-y-2 ">
                    <div>
                      Total de itens:{" "}
                      <span className="font-semibold text-[#f7633d]">
                        {countItemsInCart}
                      </span>
                    </div>
                    <div>
                      Valor total:{" "}
                      <span className="font-semibold text-green-600">
                        {totalValue.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </span>
                    </div>
                  </div>
                </SheetDescription>
              </div>
            </SheetHeader>

            {listProductsInCart.length < 1 ? (
              <div className="flex flex-col items-center mt-3 space-y-4">
                <ShoppingCart size={64} className="text-gray-300" />
                <span className="text-gray-600 text-center">
                  Nenhum produto adicionado ao carrinho. 😢
                </span>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {listProductsInCart.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row items-center p-4 text-center sm:text-left border border-gray-200 rounded-lg shadow-md bg-white space-y-3 sm:space-y-0 sm:space-x-4"
                  >
                    <div className="w-36 h-36 sm:w-24 sm:h-24 relative">
                      {item.imagem ? (
                        <img
                          src={item.imagem}
                          alt={`Imagem do produto ${item.nome}`}
                          className="w-full h-full object-cover rounded-md border border-gray-200"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center text-sm text-gray-500">
                          Sem imagem
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col flex-grow">
                      <h3 className="text-md font-semibold text-gray-800 line-clamp-2 antialiased font-poppins">
                        {item.nome}
                      </h3>
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                        {item.variacao && (
                          <div>
                            <span className="text-sm text-gray-600">
                              Tamanhos selecionados:{" "}
                              {item.variantSelected?.map((variation, index) => (
                                <span key={index} className="ml-1">
                                  {variation.variant}{" "}
                                  <span className="text-[#f7633d]">
                                    ({variation.count})
                                  </span>
                                </span>
                              ))}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center mt-2 sm:mt-0 justify-center">
                          <span className="text-sm text-gray-600 mr-2">
                            Quantidade:{" "}
                            <span className="font-semibold text-[#f7633d]">
                              {item.quantidade}
                            </span>
                          </span>
                          <span className="text-sm text-gray-600">
                            Valor unitário:{" "}
                            <span className="font-semibold text-green-600">
                              {item.preco.toLocaleString("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              })}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {listProductsInCart.length > 0 ? (
              <Button
                onClick={() => handleNavigateToCheckoutPage()}
                className="w-full py-3 text-lg font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors duration-200 mt-6"
              >
                Pedido conferido!
              </Button>
            ) : (
              <Button
                disabled
                className="mt-6 w-full py-3 text-lg font-semibold text-gray-400 bg-gray-200 rounded-lg cursor-not-allowed"
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
