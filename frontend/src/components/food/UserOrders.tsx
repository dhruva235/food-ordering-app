import React, { useState, useEffect } from "react";
import axios from "axios";
import { Document, Page, pdfjs } from "react-pdf";
// import { Button } from "@/components/ui/button"; // Using Radix UI
import { motion, AnimatePresence } from "framer-motion";
import { FileText, XCircle } from "lucide-react";
import { Button } from "@radix-ui/themes/components/button";
// import pdfWorker from "pdfjs-dist/build/pdf.worker.min.js";

// pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

// Load PDF worker from CDN
pdfjs.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.9.179/pdf.worker.min.js";


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
  const [pdfData, setPdfData] = useState<string | null>(null);

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

  const fetchReceipt = async (orderId: string) => {
    try {
      const response = await axios.get(`http://127.0.0.1:5000/orders/${orderId}/receipt`, {
        responseType: "blob", // Fetch as a binary PDF file
      });

      const pdfBlob = new Blob([response.data], { type: "application/pdf" });
      const pdfUrl = URL.createObjectURL(pdfBlob);

      setPdfData(pdfUrl);
      setSelectedOrder(orders.find((order) => order.id === orderId) || null);
    } catch (error) {
      console.error("Failed to load PDF", error);
    }
  };

  const closePdf = () => {
    if (pdfData) URL.revokeObjectURL(pdfData);
    setSelectedOrder(null);
    setPdfData(null);
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
                      {item.name} - {item.quantity} x ${item.price.toFixed(2)}
                    </li>
                  ))}
                </ul>
              </div>

              {/* View Receipt Button */}
              <Button onClick={() => fetchReceipt(order.id)} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md flex items-center">
                <FileText className="mr-2" size={20} /> View Receipt
              </Button>
            </motion.div>
          ))
        )}
      </div>

      {/* PDF Viewer Modal */}
      <AnimatePresence>
        {selectedOrder && pdfData && (
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
              <button onClick={closePdf} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">
                <XCircle size={24} />
              </button>
              <h3 className="text-lg font-semibold mb-3">Order Receipt</h3>
              <div className="h-96 overflow-auto border border-gray-300 p-2">
                <Document file={pdfData} onLoadError={(error) => console.error("PDF Load Error:", error)}>
                  <Page pageNumber={1} />
                </Document>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserOrders;
