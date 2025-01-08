import React, { useCallback, useEffect, useState } from "react";
import { Plus, Minus, SearchIcon } from "lucide-react";
import { Product, useZustandContext } from "../../Contexts/cartContext";
import OptimizedProductImage from "../ImageComponent/imagecomponent";
import Loader from "../Loader/ImageLoader/loader";
import ToastNotifications from "../Toasts/toasts";

const SchoolSupplies: React.FC = () => {
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
    setProducts("CADERNOS");
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

  useEffect(() => {
    console.log("buyLimit em uniforms: ", buyLimit);
  }, [buyLimit]);

  return (
    <div className="p-4 bg-gray-50 h-screen mt-[6rem]">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Material Escolar
        </h1>
      </div>
      <div className="max-w-xl mx-auto mb-8">
        <div className="flex items-center h-12 bg-white rounded-full border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
          <SearchIcon className="w-5 h-5 ml-4 text-gray-400" />
          <input
            type="text"
            placeholder="Pesquisar por nome do produto..."
            className="w-full h-full px-4 rounded-full focus:outline-none text-gray-700 placeholder-gray-400"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
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
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
    {Array(8)
      .fill(null)
      .map((_, index) => (
        <div
          key={index}
          className="aspect-[4/5] bg-gray-100 rounded-xl animate-pulse"
        />
      ))}
  </div>
);

interface ProductCardProps {
  product: Product;
  handleAddItemInList: (product: Product, variation: string | null) => void;
  handleRemoveItemFromCart: (id: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  handleAddItemInList,
  handleRemoveItemFromCart,
}) => {
  const { toastError } = ToastNotifications();
  const { buyLimit } = useZustandContext();

  const [isLoading, setIsLoading] = useState(true);
  const [selectedVariation, setSelectedVariation] = useState<string | null>(
    null
  );
  const [showAllVariations, setShowAllVariations] = useState(false);

  const visibleVariations = showAllVariations
    ? product.variacao
    : product.variacao?.slice(0, 3);

  const handleVariationSelect = (variation: string) => {
    console.log("variationId: ", variation);
    setSelectedVariation(variation);
  };

  const handleAddToCart = () => {
    if (product.variacao && product.variacao.length > 0 && !selectedVariation) {
      toastError("Selecione um tamanho para adicionar ao carrinho.");
      return;
    }
    handleAddItemInList(product, selectedVariation || null);
  };

  return (
    <div className="flex flex-col w-[165px] sm:w-[180px] p-4 bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300 justify-between">
      {/* Imagem do Produto */}
      <div className="relative mb-3 group">
        {product.imagem && isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-lg z-10">
            <Loader />
          </div>
        )}
        {product.imagem ? (
          <OptimizedProductImage
            src={product.imagem}
            alt={product.nome}
            className="hover:opacity-90 transition-opacity duration-300 rounded-lg"
            onLoadComplete={() => setIsLoading(false)}
            height="lg"
          />
        ) : (
          <div className="w-full h-28 sm:h-32 bg-gray-100 rounded-lg flex items-center justify-center text-sm text-gray-500">
            Sem imagem
          </div>
        )}
      </div>

      {/* Nome do Produto */}
      <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
        {product.nome}
      </h3>

      {/* Variações */}
      {product.variacao && product.variacao.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mt-2">
          {visibleVariations?.map((variacao) => (
            <span
              key={variacao.id}
              onClick={() => handleVariationSelect(variacao.nomeVariacaoA)}
              className={`flex items-center justify-center rounded-lg cursor-pointer font-medium
                transition-all duration-300 ease-in-out h-[1.8rem] text-xs text-center text-ellipsis
                ${
                  selectedVariation === variacao.nomeVariacaoA
                    ? "bg-[#f7633d] text-white shadow-md"
                    : "bg-gray-200 text-[#f7633d] hover:bg-[#f7633d]/20"
                }`}
            >
              {variacao.nomeVariacaoA}
            </span>
          ))}
          {/* Botão "Ver mais" ou "Ver menos" */}
          {product.variacao.length > 4 && (
            <button
              onClick={() => setShowAllVariations(!showAllVariations)}
              className="col-span-2 text-sm font-medium text-[#f7633d] hover:underline mt-2"
            >
              {showAllVariations
                ? "Ver menos"
                : `+${product.variacao.length - 3} Ver mais`}
            </button>
          )}
        </div>
      )}

      {/* Preço */}
      <p className="text-lg font-bold text-green-600 mt-3">
        {product.preco.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })}
      </p>

      {/* Controle de Estoque e Quantidade */}
      <div className="flex items-center justify-between gap-2 mt-3">
        <button
          onClick={() => handleRemoveItemFromCart(product.id)}
          className="w-8 h-8 bg-gray-100 border-[0.12rem] border-[#f7633d] hover:bg-gray-200 rounded-full text-gray-600 flex items-center justify-center"
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="text-sm font-medium">{product.quantidade}</span>
        <button
          disabled={buyLimit}
          onClick={handleAddToCart}
          className={`w-8 h-8 ${
            buyLimit ? "bg-gray-300" : "bg-[#f7633d] hover:bg-[#e55c2d]"
          } rounded-full text-white flex items-center justify-center transition-colors duration-300`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default SchoolSupplies;
