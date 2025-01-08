import React, { useCallback, useEffect, useState } from "react";
import { Plus, Minus, SearchIcon, LoaderPinwheelIcon } from "lucide-react";
import { Product, useZustandContext } from "../../Contexts/cartContext";
import OptimizedProductImage from "../ImageComponent/imagecomponent";

const Uniforms: React.FC = () => {
  const {
    handleAddItemInList,
    handleRemoveItemFromCart,
    products,
    loading,
    setProducts,
    buyLimit,
  } = useZustandContext();

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);

  useEffect(() => {
    setProducts("UNIFORME");
  }, [setProducts]);

  useEffect(() => {
    if (searchTerm === "") {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(
        products.filter((product) =>
          product.nome.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [searchTerm, products]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
    },
    []
  );

  console.log("buyLimit: ", buyLimit);

  return (
    <div className="p-4 bg-gray-50 h-screen mt-[6rem]">
      {buyLimit && (
        <div className="flex justify-center border-2 border-red-600">
          {" "}
          <h1 className="text-2xl font-bold mb-3">
            O Limite de compra de R$250,00 foi atingido, porfavor finalize a
            compra
          </h1>
        </div>
      )}
      <div className="flex justify-center">
        <h1 className="text-2xl font-bold mb-3">Uniformes</h1>
      </div>
      <div className="mb-4 flex items-center border rounded-lg">
        <SearchIcon className="w-5 h-5 ml-3 text-gray-500" />
        <input
          type="text"
          placeholder="Pesquisar por nome do produto..."
          className="w-full p-2 pl-3 focus:outline-none"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      {loading ? (
        <LoadingSkeleton />
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              handleAddItemInList={handleAddItemInList}
              handleRemoveItemFromCart={handleRemoveItemFromCart}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const LoadingSkeleton: React.FC = () => (
  <div className="grid grid-cols-2 gap-4 p-4">
    {Array(8)
      .fill(null)
      .map((_, index) => (
        <div
          key={index}
          className="w-full h-[350px] bg-gray-200 rounded-md animate-pulse"
        />
      ))}
  </div>
);

interface ProductCardProps {
  product: Product;
  handleAddItemInList: (product: Product, variation: string) => void;
  handleRemoveItemFromCart: (id: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  handleAddItemInList,
  handleRemoveItemFromCart,
}) => {
  const { buyLimit } = useZustandContext();

  const [isLoading, setIsLoading] = useState(true);
  const [selectedVariation, setSelectedVariation] = useState<string | null>(
    null
  );

  const handleVariationSelect = (variation: string) => {
    console.log("variationId: ", variation);
    setSelectedVariation(variation);
  };

  return (
    <div className="flex flex-col w-[165px] sm:w-[180px] p-4 bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300">
      <div className="relative mb-3 group">
        {product.imagem && isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 rounded-lg">
            <LoaderPinwheelIcon className="w-8 h-8 text-yellow-500 animate-spin" />
          </div>
        )}
        {product.imagem ? (
          <OptimizedProductImage
            src={product.imagem}
            alt={product.nome}
            className="hover:opacity-90"
            onLoadComplete={() => setIsLoading(false)}
            height="lg"
          />
        ) : (
          <div className="w-full h-28 sm:h-32 bg-gray-100 rounded-lg flex items-center justify-center text-sm text-gray-500">
            Sem imagem
          </div>
        )}
      </div>
      <h3 className="text-sm font-semibold text-gray-900">{product.nome}</h3>

      {/* Variações  */}
      <div className="flex flex-wrap gap-2 mt-2">
        {product.variacao?.map((variacao) => (
          <span
            key={variacao.id}
            onClick={() => handleVariationSelect(variacao.nomeVariacaoA)} // Seleciona a variação
            className={`px-4 py-1 rounded-lg cursor-pointer text-sm font-medium
              transition-all duration-300 ease-in-out
              ${
                selectedVariation === variacao.nomeVariacaoA
                  ? "bg-yellow-500 text-white shadow-lg"
                  : "bg-gray-200 text-gray-700 hover:bg-yellow-100"
              }
              hover:scale-105`}
          >
            {variacao.nomeVariacaoA}
          </span>
        ))}
      </div>

      <p className="text-lg font-bold text-green-600 mt-3">
        {product.preco.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })}
      </p>

      {/* Controle de estoque e quantidade */}
      {selectedVariation && (
        <div className="flex items-center justify-between gap-2 mt-3">
          <button
            onClick={() => handleRemoveItemFromCart(product.id)}
            className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium">{product.quantidade}</span>
          <button
            disabled={buyLimit}
            onClick={() => handleAddItemInList(product, selectedVariation)}
            className="w-8 h-8 bg-yellow-500 hover:bg-yellow-600 rounded-full text-white flex items-center justify-center"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Uniforms;
