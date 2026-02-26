import { createContext, useContext, useState, useEffect } from "react";
import API from "../utils/api";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [], totalAmount: 0 });
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!user || user.role === "admin") return;
    try {
      setLoading(true);
      const { data } = await API.get("/cart");
      setCart(data);
    } catch {
      setCart({ items: [], totalAmount: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role !== "admin") {
      fetchCart();
    } else {
      setCart({ items: [], totalAmount: 0 });
    }
  }, [user]);

  // addToCart: sets the item to an explicit quantity (used by Cart page +/- controls)
  const addToCart = async (foodId, quantity) => {
    const { data } = await API.post("/cart/add", { foodId, quantity });
    setCart(data);
    return data;
  };

  // incrementItem: no quantity sent → backend does currentQty + 1 naturally
  // Use this from Home / RestaurantMenu "Add" buttons to avoid resetting qty to 1
  const incrementItem = async (foodId) => {
    const { data } = await API.post("/cart/add", { foodId });
    setCart(data);
    return data;
  };

  const removeFromCart = async (foodId) => {
    const { data } = await API.delete(`/cart/remove/${foodId}`);
    setCart(data);
    return data;
  };

  const clearCart = async () => {
    await API.delete("/cart/clear");
    setCart({ items: [], totalAmount: 0 });
  };

  const cartCount = cart.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  return (
    <CartContext.Provider
      value={{ cart, addToCart, incrementItem, removeFromCart, clearCart, fetchCart, cartCount, loading }}
    >
      {children}
    </CartContext.Provider>
  );
};
