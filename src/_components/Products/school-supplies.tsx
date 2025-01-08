import React, { useCallback, useEffect, useState } from "react";
import { Plus, Minus, SearchIcon } from "lucide-react";
import { useZustandContext } from "../../Contexts/cartContext";
import Loader from "../Loader/ImageLoader/loader";
import OptimizedProductImage from "../ImageComponent/imagecomponent";

interface Product {
  id: string;
  nome: string;
  preco: number;
  quantidade: number;
  imagem?: string;
  disponivel: boolean;
}

const SchoolSupplies: React.FC = () => {
  const {
    handleAddItemInList,
    handleRemoveItemFromCart,
    products,
    loading,
    setProducts,
  } = useZustandContext();

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);

  useEffect(() => {
    // Filtra apenas produtos da categoria "Uniformes"
    setProducts("CADERNO");
  }, [setProducts]);

  useEffect(() => {
    // Atualiza a lista de produtos filtrados com base no termo de pesquisa
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-4 pt-20 pb-8">
      <div className="max-w-7xl mx-auto mt-[2rem]">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Material escolar
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
  handleAddItemInList: (product: Product) => void;
  handleRemoveItemFromCart: (id: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  handleAddItemInList,
  handleRemoveItemFromCart,
}) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="flex flex-col w-full max-w-[180px] min-h-fit p-4 bg-white rounded-xl shadow-lg border border-gray-100 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl mx-auto justify-evenly">
      <div className="relative mb-4 overflow-hidden rounded-lg group">
        {product.imagem && isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-lg z-10">
            <Loader />
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
      <h3 className="text-[0.6rem] font-semibold text-gray-900 ">
        {product.nome.split(" ").slice(0, 3).join(" ")}
      </h3>
      <p className="text-sm font-semibold text-green-600">
        {product.preco.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })}
      </p>
      <div className="flex items-center justify-between gap-2 mt-3">
        <button
          onClick={() => handleRemoveItemFromCart(product.id)}
          className="w-8 h-8 bg-gray-50 hover:bg-gray-100 rounded-full border-[0.12rem] border-[#e97a5b] text-[#e97a5b] flex items-center justify-center "
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="text-sm font-medium">{product.quantidade}</span>
        <button
          onClick={() => handleAddItemInList(product)}
          className="w-8 h-8 bg-[#e97a5b] hover:bg-[#e6623e] rounded-full text-white flex items-center justify-center"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default SchoolSupplies;
