import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle, Truck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@radix-ui/themes/components/button';
// import { Button } from 'radix-ui/react-button';

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  order_items: OrderItem[];
  status: string;
  total_price: number;
  user_id: string;
}

const OrderList = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [sentOrders, setSentOrders] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showBus, setShowBus] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5000/orders');
        const pendingOrders = response.data.filter((order: Order) => order.status === "Pending");
        setOrders(pendingOrders);
      } catch (error) {
        console.error('Failed to fetch orders');
      }
    };
    fetchOrders();
  }, []);

  const handleSendOrder = async (orderId: string) => {
    setLoading(orderId);
    try {
      const response = await axios.post(`http://127.0.0.1:5000/orders/${orderId}/send`);
      if (response.status === 200) {
        setSentOrders((prev) => [...prev, orderId]);
        setSuccessMessage(`Order ${orderId} sent successfully!`);
        
        // Show Bus Icon after Success Message
        setTimeout(() => setShowBus(true), 500);

        // Hide success message & bus after 3 sec
        setTimeout(() => {
          setSuccessMessage(null);
          setShowBus(false);
        }, 3000);

        // Remove order smoothly
        setTimeout(() => {
          setOrders((prevOrders) => prevOrders.filter(order => order.id !== orderId));
        }, 500);
      }
    } catch (error) {
      console.error('Failed to send order');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-6">Pending Orders</h2>

      {/* Animated Success Message */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="flex items-center justify-center bg-green-500 text-white py-2 px-4 rounded-md mb-4 shadow-md"
          >
            <CheckCircle className="mr-2" size={24} />
            {successMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bus Animation */}
      <AnimatePresence>
        {showBus && (
          <motion.div
            initial={{ x: "-100vw" }}
            animate={{ x: 0 }}
            exit={{ x: "100vw", opacity: 0 }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="flex justify-center items-center mt-4 text-lg"
          >
            🚌 Order is on the way!
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {orders.length === 0 ? (
          <p className="text-gray-500">No pending orders.</p>
        ) : (
          orders.map((order) => (
            <AnimatePresence key={order.id}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="bg-white shadow-md rounded-lg p-4"
              >
                <h3 className="font-semibold">Order ID: {order.id}</h3>
                <ul className="space-y-2">
                  {order.order_items.map((item, index) => (
                    <li key={index} className="flex justify-between">
                      <span>{item.name}</span>
                      <span>{item.quantity} x ${item.price.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex justify-between mt-4">
                  <span>Total Price: ${order.total_price.toFixed(2)}</span>
                  <motion.div whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }}>
                    <Button
                      onClick={() => handleSendOrder(order.id)}
                      disabled={loading === order.id || sentOrders.includes(order.id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center"
                    >
                      {loading === order.id ? (
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1 }}
                          className="mr-2"
                        >
                          🔄
                        </motion.span>
                      ) : (
                        <Truck className="mr-2" size={20} />
                      )}
                      Send Order
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>
          ))
        )}
      </div>
    </div>
  );
};

export default OrderList;
