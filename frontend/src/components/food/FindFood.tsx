import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Card } from "@radix-ui/themes/components/card";
import { Button } from "@radix-ui/themes/components/button";
import { ScrollArea } from "@radix-ui/themes/components/scroll-area";
import { CheckCircle, Truck } from "lucide-react";

const questions = [
  "🍔 Craving Something Delicious?",
  "🍕 Looking for Your Favorite Dish?",
  "🍜 Hungry? We've Got You Covered!",
];

interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
}

interface CartItem extends FoodItem {
  quantity: number;
}

const FindFood = () => {
  const [menu, setMenu] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [processingOrder, setProcessingOrder] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:5000/menu")
      .then((response) => {
        setMenu(response.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch menu. Please try again later.");
        setLoading(false);
      });

    const interval = setInterval(() => {
      setQuestionIndex((prev) => (prev + 1) % questions.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const addToCart = (item: FoodItem) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => (item.id === id ? { ...item, quantity: item.quantity - 1 } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const checkout = async () => {
    if (cart.length === 0) return;
  
    setProcessingOrder(true);
  
    const orderData = {
      user_id: "0f0f8193-08f2-45a8-8476-29a1dd5052c5",
      order_items: cart.map(({ name, price, quantity }) => ({
        name,
        price,
        quantity,
      })),
    };
  
    try {
      await axios.post("http://127.0.0.1:5000/orders/", orderData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      setProcessingOrder(false);
      setOrderPlaced(true);
      setCart([]);
    } catch (error) {
      setProcessingOrder(false);
      console.error("Checkout failed:", error);
    }
  };
  

  return (
    <div className="min-h-screen flex flex-col items-center text-white p-6 bg-gray-900">
      {/* Animated Heading */}
      <motion.h1
        className="text-4xl font-extrabold text-center mb-6"
        key={questionIndex}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7 }}
        style={{
          background: "linear-gradient(90deg, #ff7eb3, #ff758c, #ffae42)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        {questions[questionIndex]}
      </motion.h1>

      {/* Layout */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Food Menu Section */}
        <div className="col-span-2">
          <ScrollArea className="max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {menu.map((item) => (
                <motion.div
                  key={item.id}
                  className="cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="shadow-lg bg-white rounded-lg p-4 flex flex-col items-center text-black">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-32 h-32 object-cover rounded-lg mb-3"
                    />
                    <h3 className="text-lg font-semibold">{item.name}</h3>
                    <p className="text-gray-700 text-sm text-center">{item.description}</p>
                    <p className="text-lg font-bold text-yellow-500 mt-2">${item.price.toFixed(2)}</p>
                    <Button
                      className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded-lg px-4 py-2 mt-3"
                      onClick={() => addToCart(item)}
                    >
                      + Add to Cart
                    </Button>
                  </Card>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Cart Section (Sticky Sidebar) */}
        <div className="sticky top-6 bg-gray-800 p-5 rounded-lg shadow-lg h-fit">
          <h2 className="text-xl font-bold text-white mb-4">🛒 Your Cart</h2>

          {/* Checkout Animation */}
          {orderPlaced ? (
            <motion.div
              className="flex flex-col items-center text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7 }}
            >
              <CheckCircle className="text-green-500 w-16 h-16 mb-4" />
              <p className="text-lg font-semibold text-white">Order Placed Successfully!</p>
              <motion.div
                className="mt-4"
                initial={{ x: -50 }}
                animate={{ x: 50 }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              >
                <Truck className="text-yellow-500 w-12 h-12" />
              </motion.div>
            </motion.div>
          ) : cart.length === 0 ? (
            <p className="text-gray-400">Your cart is empty.</p>
          ) : (
            <>
              <ul className="text-white space-y-3">
                {cart.map((item) => (
                  <li
                    key={item.id}
                    className="bg-gray-700 p-3 rounded-lg flex justify-between items-center shadow-md"
                  >
                    <div>
                      <span className="font-semibold">{item.name}</span>
                      <span className="ml-2 text-gray-400">x{item.quantity}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                      <Button
                        className="bg-red-500 hover:bg-red-600 text-white rounded-lg px-2 py-1 text-sm"
                        onClick={() => removeFromCart(item.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>

              <Button
                className="bg-green-500 hover:bg-green-600 text-white font-bold w-full mt-4 py-2 rounded-lg"
                onClick={checkout}
                disabled={processingOrder}
              >
                {processingOrder ? "Processing..." : "Proceed to Checkout"}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FindFood;
