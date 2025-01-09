import { Button } from "@/components/ui/button";
import { useZustandContext } from "@/Contexts/cartContext";
import { useLocation, useNavigate } from "react-router-dom";

export function Checkout() {
  const { listProductsInCart, clearListProductsInCart } = useZustandContext();
  const navigate = useNavigate();
  const location = useLocation();
  const previousURL = location.state.from || "selected-category";

  function handleClickButton() {
    clearListProductsInCart(listProductsInCart);

    navigate(previousURL);
  }
  return (
    <div className="flex flex-col items-center">
      <span>CHECKOUT</span>
      <div className="">
        {listProductsInCart.map((product) => {
          return (
            <div
              key={product.id}
              className="flex flex-col border-2 items-center border-black w-fit p-2"
            >
              <img src={product.imagem} className="size-28" />
              <span>{product.nome}</span>
              <span>quantidade: {product.quantidade}</span>
              <span>Preço: {product.preco}</span>
            </div>
          );
        })}
      </div>

      <Button onClick={() => handleClickButton()}>Voltar</Button>
    </div>
  );
}
