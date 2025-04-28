import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify"; // Importing toast and ToastContainer
import "react-toastify/dist/ReactToastify.css"; // Import the default styles for toasts

interface Table {
  id: string;
  table_number: number;
  status: string;
  booked: boolean;
  booking_id: string | null;
  date: string | null;
  time: string | null;
  user_id: string | null;
}

const TablesView: React.FC = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [bookingTableId, setBookingTableId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [createPopupOpen, setCreatePopupOpen] = useState(false);
  const [newTableNumber, setNewTableNumber] = useState<number | "">("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const getUserFromStorage = () => {
    const userData = sessionStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  };
  const [user, setUser] = React.useState(getUserFromStorage());  

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    const res = await axios.get("http://127.0.0.1:5000/tables");
    setTables(res.data);
  };

  const freeTable = async (id: string) => {
    try {
      await axios.put(`http://127.0.0.1:5000/tables/free/${id}`);
      fetchTables();
      toast.success("Table freed successfully!"); // Success toast for freeing table
    } catch (error) {
      toast.error("Failed to free table.");
    }
  };

  const bookTable = async () => {
    if (!selectedDate || !selectedTime || !bookingTableId) return;
  
    try {
      const response = await axios.post("http://127.0.0.1:5000/bookings/", {
        user_id: user.user_id,
        date: selectedDate.split("-").reverse().join("-"),
        time: selectedTime,
      });
  
      // Check if the response contains a message about the booking limit
      if (response.data.message) {
        toast.error(response.data.message); // Show the exact message from the API
        return;
      }
  
      setBookingTableId(null);
      setSelectedDate("");
      setSelectedTime("");
      fetchTables();
      toast.success("Table booked successfully!"); // Success toast for booking table
    } catch (error) {
      toast.error("Failed to book table.");
    }
  };
  
  
  const createTable = async () => {
    if (newTableNumber === "") return;
  
    // Check if the table number already exists
    const tableExists = tables.some((table) => table.table_number === newTableNumber);
    if (tableExists) {
      setErrorMessage("Table number already exists!");
      toast.error("Table number already exists!"); // Error toast for existing table number
      return; // Prevent further execution if the table number is a duplicate
    }
  
    // Check if the table limit has been reached (100 tables)
    if (tables.length >= 100) {
      setErrorMessage("Table limit reached. You can only create up to 100 tables.");
      toast.error("Table limit reached. You can only create up to 100 tables.");
      return; // Prevent further execution if the table limit is reached
    }
  
    setErrorMessage(""); // Clear error message if the table number is valid
  
    try {
      await axios.post("http://127.0.0.1:5000/tables/create", {
        table_number: newTableNumber,
      });
      setNewTableNumber("");
      setCreatePopupOpen(false);
      fetchTables(); // Refresh table list after creating a new table
      toast.success("Table created successfully!"); // Success toast for creating table
    } catch (error) {
      toast.error("Failed to create table.");
    }
  };
  
  const getTableNumber = (id: string | null) => {
    const table = tables.find((t) => t.id === id);
    return table?.table_number ?? "";
  };

  return (
    <div className="min-h-screen bg-gray-100 p-10 relative">
      <h1 className="text-4xl font-bold text-center mb-10 text-purple-600">Table Booking</h1>

      {/* Create Table Button */}
   {user?.role === "admin" &&
    <div className="flex justify-center mb-8">
    <button
      onClick={() => setCreatePopupOpen(true)}
      className="bg-purple-500 hover:bg-purple-600 text-white font-semibold px-6 py-3 rounded-full shadow-lg transition-transform transform hover:scale-105"
    >
      Create New Table
    </button>
  
  </div>
   }  

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 justify-center">
        {/* Sort tables by table number */}
        {tables
          .sort((a, b) => a.table_number - b.table_number)
          .map((table) => (
            <motion.div
              key={table.id}
              whileHover={{
                scale: 1.1,
                rotate: 5,
                transition: { type: "spring", stiffness: 300 },
              }}
              className={`rounded-xl p-4 flex flex-col items-center text-center cursor-pointer shadow-lg transform transition duration-300
                ${table.booked ? "bg-red-200" : "bg-green-200"}`}
            >
              <div className="text-2xl font-bold text-gray-700 mb-2">
                Table {table.table_number}
              </div>
              <div className="text-sm text-gray-600 mb-2">{table.status}</div>

              {table.booked && (
                <>
                  <div className="text-xs text-gray-600 mb-1">
                    Date: {table.date || "-"}
                  </div>
                  <div className="text-xs text-gray-600 mb-4">
                    Time: {table.time ? table.time.slice(0, 5) : "-"}
                  </div>
                </>
              )}

              {table.booked ? (
                <button
                  onClick={() => freeTable(table.id)}
                  className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-1 rounded-lg text-sm"
                >
                  Free Table
                </button>
              ) : (
                <button
                  onClick={() => setBookingTableId(table.id)}
                  className="bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-1 rounded-lg text-sm"
                >
                  Book Table
                </button>
              )}
            </motion.div>
          ))}
      </div>

      {/* Booking Popup */}
      <AnimatePresence>
        {bookingTableId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-white/60 z-50"
          >
            <motion.div
              initial={{ scale: 0.7 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.7 }}
              className="bg-white p-8 rounded-2xl shadow-2xl w-96 flex flex-col items-center border border-purple-300 relative"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Book Table</h2>
            

              <div className="text-lg font-semibold text-purple-700 mb-6">
                Table {getTableNumber(bookingTableId)}
              </div>

              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="mb-4 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
              <input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="mb-6 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
              />

              <div className="flex gap-4">
                <button
                  onClick={bookTable}
                  className="bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded-lg"
                >
                  Confirm
                </button>
                <button
                  onClick={() => {
                    setBookingTableId(null);
                    setSelectedDate("");
                    setSelectedTime("");
                  }}
                  className="bg-gray-400 hover:bg-gray-500 text-white font-semibold px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Table Popup */}
      <AnimatePresence>
        {createPopupOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-white/60 z-50"
          >
            <motion.div
              initial={{ scale: 0.7 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.7 }}
              className="bg-white p-8 rounded-2xl shadow-2xl w-96 flex flex-col items-center border border-purple-300 relative"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Table</h2>

              {errorMessage && (
                <div className="text-red-500 text-sm mb-4">{errorMessage}</div>
              )}

              <input
                type="number"
                value={newTableNumber}
                onChange={(e) => setNewTableNumber(Number(e.target.value))}
                placeholder="Enter Table Number"
                className="mb-6 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
              />

              <div className="flex gap-4">
                <button
                  onClick={createTable}
                  className="bg-purple-500 hover:bg-purple-600 text-white font-semibold px-4 py-2 rounded-lg"
                >
                  Create
                </button>
                <button
                  onClick={() => {
                    setCreatePopupOpen(false);
                    setNewTableNumber("");
                  }}
                  className="bg-gray-400 hover:bg-gray-500 text-white font-semibold px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <ToastContainer /> {/* Container for displaying toasts */}
    </div>
  );
};

export default TablesView;
