import apiBaseUrl from "../lib/apiConfig";
import axios from "axios";
import { create } from "zustand";
// import { useAuthStore } from "./authStore";

export interface Product {
  ativo?: boolean;
  categoria?: string;
  codigo?: string;
  id: string;
  imagem?: string;
  nome: string;
  preco: number;
  quantidade: number;
  id_seq?: number;
  disponivel: boolean;
  variacao?: Variacao[];
}

export interface Variacao {
  id: string;
  nomeVariacaoA: string;
  nomeVariacaoB: string | null;
}

interface ContextStates {
  totalValue: number;
  loading: boolean;
  error: string | null;
  products: Product[];
  countItemsInCart: number;
  listProductsInCart: Product[];
  isMobile: boolean;
  setIsMobile: (type: boolean) => void;
  setProducts: (category?: string) => void;
  clearListProductsInCart: (list: Product[]) => void;
  setTotalValue: () => void;
  setCountItemsInCart: (count: number) => void;
  handleAddItemInList: (newProduct: Product) => void;
  handleRemoveItemFromCart: (productId: string) => void;
}

export const useZustandContext = create<ContextStates>((set) => ({
  countItemsInCart: 0,
  testCount: 0,
  listProductsInCart: [],
  loading: true,
  error: null,
  products: [],
  totalValue: 0,
  isMobile: false,

  setIsMobile: () => set({ isMobile: true }),

  clearListProductsInCart: () =>
    set(() => {
      return {
        listProductsInCart: [],
        countItemsInCart: 0,
      };
    }),

  setTotalValue: () =>
    set((state) => {
      const totalValue = state.listProductsInCart.reduce((acc, product) => {
        if (product.preco) {
          acc += product.preco * product.quantidade;
          return acc;
        }
        return acc;
      }, 0);

      return {
        totalValue: totalValue,
      };
    }),

  setProducts: async (category?: string) => {
    try {
      console.log(
        `Requisitando produtos da categoria '${
          category || "todas as categorias"
        }'...`
      );
      const response = await axios.get(
        `${apiBaseUrl}/products?categoria=UNIFORME`,
        {
          headers: {},
        }
      );
      console.log(response.data.filteredProducts);
      let initialIdSeq = 0;
      const updateProductsList = response.data.filteredProducts.map(
        (product: Product) => ({
          ...product,
          quantidade: 0,
          id_seq: (initialIdSeq += 1),
        })
      );

      set({
        products: updateProductsList,
        loading: false,
        error: null,
      });

      console.log(updateProductsList);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      set({ loading: true, error: "Erro ao buscar produtos" });
    }
  },

  setCountItemsInCart: (count: number) =>
    set(() => ({ countItemsInCart: count + 1 })),

  handleAddItemInList: (newProduct) =>
    set((state) => {
      const { id, nome, preco, imagem, categoria, disponivel } = newProduct;

      const existingProductIndex = state.listProductsInCart.findIndex(
        (product) => product.id === id
      );

      const updateList = [...state.listProductsInCart];
      let updateCountInCart = state.countItemsInCart;

      if (existingProductIndex !== -1) {
        updateList[existingProductIndex] = {
          ...updateList[existingProductIndex],
          quantidade: updateList[existingProductIndex].quantidade + 1,
        };
      } else {
        updateList.push({
          id,
          nome,
          preco,
          categoria,
          quantidade: 1,
          imagem,
          disponivel,
        });
      }

      const updateProducts = state.products.map((product) =>
        product.id === id
          ? { ...product, quantidade: product.quantidade + 1 }
          : product
      );

      updateCountInCart += 1;
      console.log(updateList);
      return {
        listProductsInCart: updateList,
        products: updateProducts,
        countItemsInCart: updateCountInCart,
      };
    }),

  handleRemoveItemFromCart: (productId) =>
    set((state) => {
      let updateCountInCard = state.countItemsInCart;

      const newList = state.listProductsInCart
        .map((item) => {
          if (item.id === productId) {
            updateCountInCard -= 1;

            return {
              ...item,
              quantidade: item.quantidade - 1,
            };
          }
          return item;
        })
        .filter((item) => item.quantidade > 0);

      const updateProducts = state.products.map((product) => {
        if (product.id === productId) {
          if (product.quantidade > 0) {
            return {
              ...product,
              quantidade: product.quantidade - 1,
            };
          } else {
            return {
              ...product,
              quantidade: 0,
            };
          }
        } else {
          return product;
        }
      });

      return {
        listProductsInCart: newList,
        products: updateProducts,
        countItemsInCart: Math.max(updateCountInCard, 0),
      };
    }),
}));
