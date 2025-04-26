import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, XCircle } from "lucide-react";
import { Button } from "@radix-ui/themes/components/button";

interface Order {
  id: string;
  total_price: number;
  status: string;
  user_id: string;
  order_items: { name: string; quantity: number; price: number }[];
}

const UserOrders = ({ userId }: { userId: string }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:5000/orders");
        const userOrders = response.data.filter((order: Order) => order.user_id === userId);
        setOrders(userOrders);
      } catch (error) {
        console.error("Failed to fetch orders", error);
      }
    };
    fetchOrders();
  }, [userId]);

  const generateReceiptHTML = (order: Order) => {
    return `
      <div class="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <!-- Header with Restaurant Name -->
        <div class="text-center mb-4">
          <h1 class="text-3xl font-semibold text-gray-800">Restaurant Name</h1>
          <p class="text-lg text-gray-600">Food and Spirits</p>
        </div>
  
        <!-- Order Details -->
        <h2 class="text-3xl font-semibold text-center mb-4 text-gray-800">Receipt for Order #${order.id}</h2>
        <p class="text-xl text-center mb-6 text-gray-600">Total: $${order.total_price.toFixed(2)}</p>
        
        <h3 class="text-2xl font-semibold mb-3 text-gray-800">Items:</h3>
        <ul class="list-disc pl-6 space-y-2 text-gray-700">
          ${order.order_items
            .map(
              (item) => `
            <li class="text-lg">
              ${item.name} - ${item.quantity} x $${item.price.toFixed(2)} = $${(item.quantity * item.price).toFixed(2)}
            </li>`
            )
            .join("")}
        </ul>
        
        <div class="mt-6 text-center">
          <p class="font-medium ${order.status === "Pending" ? "text-yellow-500" : "text-green-500"}">
            Status: ${order.status}
          </p>
        </div>
        
        <!-- Footer with Restaurant Name -->
        <div class="mt-6 text-center text-sm text-gray-500">
          <p>Food and Spirits | Thank you for your order!</p>
        </div>
      </div>
    `;
  };
  

  const printReceipt = () => {
    if (!selectedOrder) return;
    const receiptHTML = generateReceiptHTML(selectedOrder);

    // Create a new window for printing
    const printWindow = window.open("", "_blank", "width=600,height=800");
    printWindow?.document.write(`
      <html>
        <head>
          <title>Print Receipt</title>
          <style>
            body { font-family: Arial, sans-serif; }
            .text-center { text-align: center; }
            .text-lg { font-size: 1.125rem; }
            .font-semibold { font-weight: 600; }
            .text-xl { font-size: 1.25rem; }
            .text-2xl { font-size: 1.5rem; }
            .space-y-2 { margin-bottom: 0.5rem; }
            .mt-6 { margin-top: 1.5rem; }
            .px-4 { padding-left: 1rem; padding-right: 1rem; }
            .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
            .bg-white { background-color: #fff; }
            .rounded-lg { border-radius: 0.5rem; }
            .shadow-lg { box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); }
            .list-disc { list-style-type: disc; }
            .pl-6 { padding-left: 1.5rem; }
          </style>
        </head>
        <body>
          ${receiptHTML}
        </body>
      </html>
    `);

    printWindow?.document.close();
    printWindow?.print();
  };

  const closeReceipt = () => {
    setSelectedOrder(null);
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-6">Your Orders</h2>

      <div className="space-y-6">
        {orders.length === 0 ? (
          <p className="text-gray-500">No orders found.</p>
        ) : (
          orders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white shadow-md rounded-lg p-6"
            >
              <h3 className="font-semibold text-lg">Order ID: {order.id}</h3>
              <p className="text-gray-500">Total: ${order.total_price.toFixed(2)}</p>
              <p className={`text-sm font-medium ${order.status === "Pending" ? "text-yellow-500" : "text-green-500"}`}>
                Status: {order.status}
              </p>

              {/* Order Items */}
              <div className="mt-4">
                <h4 className="text-md font-semibold">Items:</h4>
                <ul className="list-disc pl-5 text-gray-700">
                  {order.order_items.map((item, index) => (
                    <li key={index}>
                      {item.name} - {item.quantity} x ${item.price.toFixed(2)} = ${(item.quantity * item.price).toFixed(2)}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Print Receipt Button */}
              <Button onClick={() => setSelectedOrder(order)} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md flex items-center">
                <FileText className="mr-2" size={20} /> View Receipt
              </Button>
            </motion.div>
          ))
        )}
      </div>

      {/* Receipt Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-white p-6 rounded-lg shadow-lg relative max-w-2xl w-full"
            >
              <button onClick={closeReceipt} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">
                <XCircle size={24} />
              </button>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Order Receipt</h3>
              <div className="h-96 overflow-auto border border-gray-300 p-2">
                <h4 className="text-xl font-semibold mb-2">Order ID: {selectedOrder.id}</h4>
                <p className="text-lg font-medium mb-4">Total: ${selectedOrder.total_price.toFixed(2)}</p>

                <h4 className="text-lg font-semibold mb-2">Items</h4>
                <ul className="list-disc pl-5 space-y-2 text-gray-700">
                  {selectedOrder.order_items.map((item, index) => (
                    <li key={index}>
                      {item.name} - {item.quantity} x ${item.price.toFixed(2)} = ${(item.quantity * item.price).toFixed(2)}
                    </li>
                  ))}
                </ul>

                <div className="mt-6">
                  <p className={`font-medium text-xl ${selectedOrder.status === "Pending" ? "text-yellow-500" : "text-green-500"}`}>
                    Status: {selectedOrder.status}
                  </p>
                </div>
              </div>

              {/* Print Button */}
              <Button onClick={printReceipt} className="mt-6 px-4 py-2 bg-green-600 text-white rounded-md flex items-center">
                Print Receipt
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserOrders;
