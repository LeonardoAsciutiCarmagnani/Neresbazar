import apiBaseUrl from "../lib/apiConfig";
import axios from "axios";
import { create } from "zustand";

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
  variantSelected: { variant: string | null; count: number }[] | null;
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
  buyLimit: boolean;
  isMobile: boolean;
  variationSelectedList: string[] | null;
  pageURL: string;
  setBuyLimit: () => void;
  setTotalValue: () => void;
  setIsMobile: (type: boolean) => void;
  setProducts: (category?: string) => void;
  clearListProductsInCart: (list: Product[]) => void;
  setCountItemsInCart: (count: number) => void;
  handleAddItemInList: (newProduct: Product, variation: string | null) => void;
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
  variationSelectedList: [],
  buyLimit: false,
  pageURL: "",
  setIsMobile: () => set({ isMobile: true }),
  setBuyLimit: () =>
    set((state) => {
      let currentState: boolean;
      if (state.totalValue < 250) {
        currentState = false;
      } else {
        currentState = true;
      }
      return {
        buyLimit: currentState,
      };
    }),

  clearListProductsInCart: () =>
    set(() => {
      return {
        listProductsInCart: [],
        countItemsInCart: 0,
      };
    }),

  setProducts: async (category?: string) => {
    const itensInArray: Product[] = [];
    try {
      set({ loading: true });
      console.log(
        `Requisitando produtos da categoria '${
          category || "todas as categorias"
        }'...`
      );
      const response = await axios.get(
        `${apiBaseUrl}/products?categoria=${category}`,
        {
          headers: {},
        }
      );
      const data = response.data.data;
      let initialIdSeq = 0;

      data.map((product: Product) => {
        const validation = itensInArray.some(
          (item) => item.codigo === product.codigo
        );

        if (validation) {
          return;
        }

        itensInArray.push({
          ...product,
          quantidade: 0,
          id_seq: (initialIdSeq += 1),
        });
      });
      set({
        products: itensInArray,
        error: null,
      });
      setTimeout(() => {
        set({ loading: false });
      }, 300);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      set({ loading: true, error: "Erro ao buscar produtos" });
    }
  },

  setCountItemsInCart: (count: number) =>
    set(() => ({ countItemsInCart: count + 1 })),
  setTotalValue: () =>
    set((state) => {
      const currentTotalValue = state.listProductsInCart.reduce(
        (acc, product) => {
          if (product.preco) {
            acc += product.preco * product.quantidade;
          }

          return acc;
        },
        0
      );
      return { totalValue: currentTotalValue };
    }),

  handleAddItemInList: (newProduct, variation) =>
    set((state) => {
      const { id, nome, preco, imagem, categoria, disponivel } = newProduct;

      const existingProductIndex = state.listProductsInCart.findIndex(
        (product) => product.id === id
      );

      const updateList = [...state.listProductsInCart];
      let updateCountInCart = state.countItemsInCart;

      let updateProducts = state.products;

      const additionalValue = preco;

      if (state.totalValue + additionalValue > 250) {
        console.log("Limite de valor alcançado. Produto não adicionado.");
        state.setBuyLimit();
        return {};
      }

      if (existingProductIndex !== -1) {
        const existingProduct = updateList[existingProductIndex];
        const existingVariants = existingProduct.variantSelected || [];

        const variantIndex = existingVariants.findIndex(
          (variant) => variant.variant === variation
        );

        if (variantIndex >= 0) {
          existingVariants[variantIndex].count += 1;
        } else {
          existingVariants.push({ variant: variation, count: 1 });
        }

        updateList[existingProductIndex] = {
          ...existingProduct,
          quantidade: existingProduct.quantidade + 1,
          variantSelected: existingVariants,
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
          variantSelected: variation ? [{ variant: variation, count: 1 }] : [],
        });
      }

      updateCountInCart += 1;

      updateProducts = state.products.map((product) =>
        product.id === id
          ? { ...product, quantidade: (product.quantidade || 0) + 1 }
          : product
      );

      const currentTotalValue = updateList.reduce((acc, product) => {
        if (product.preco) {
          acc += product.preco * product.quantidade;
        }
        return acc;
      }, 0);

      console.log(
        "Produto adicionado. Valor total atualizado:",
        currentTotalValue
      );
      console.log(updateList);

      return {
        listProductsInCart: updateList,
        products: updateProducts,
        countItemsInCart: updateCountInCart,
        totalValue: currentTotalValue,
      };
    }),

  handleRemoveItemFromCart: (productId) =>
    set((state) => {
      let updateCountInCart = state.countItemsInCart;

      const newList = state.listProductsInCart
        .map((item) => {
          if (item.id === productId) {
            updateCountInCart -= 1;

            // Atualiza a quantidade total do produto
            const updatedQuantidade = item.quantidade - 1;

            const updatedVariants = [...(item.variantSelected || [])];

            // Verifica o último item de variantSelected
            if (updatedVariants.length > 0) {
              const lastVariant = updatedVariants[updatedVariants.length - 1];

              if (lastVariant.count > 1) {
                // Subtrai o count do último item se for maior que 1
                updatedVariants[updatedVariants.length - 1] = {
                  ...lastVariant,
                  count: lastVariant.count - 1,
                };
              } else {
                // Remove o último item se o count for 1
                updatedVariants.pop();
              }
            }

            return {
              ...item,
              quantidade: updatedQuantidade,
              variantSelected: updatedVariants,
            };
          }
          return item;
        })
        .filter((item) => item.quantidade > 0); // Remove produtos com quantidade zero

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

      const currentValue = newList.reduce((acc, product) => {
        acc += product.preco * product.quantidade;
        return acc;
      }, 0);

      console.log(newList);

      return {
        listProductsInCart: newList,
        products: updateProducts,
        countItemsInCart: Math.max(updateCountInCart, 0),
        totalValue: currentValue,
      };
    }),
}));
