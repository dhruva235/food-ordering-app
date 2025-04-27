import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import "./HeroSection.css";
import burgerImage from "../assets/burger.avif";
import SelectDemo from "./bookingForm";
// import { useNavigate } from "react-router-dom";
import { useLocation, useNavigate } from "react-router-dom";

const getUserFromStorage = () => {
  const userData = sessionStorage.getItem("user");
  return userData ? JSON.parse(userData) : null;
};



// Changing text animations
const messages = [
  "🍔 Order Your Favorite Meals!",
  "🥗 Fresh & Healthy Choices!",
  "🚀 Fastest Delivery in Town!",
];

const HeroSection = () => {
  const user = getUserFromStorage();
  const [messageIndex, setMessageIndex] = useState(0);
  const navigate = useNavigate();

  // Change hero text every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Toaster position="top-right" />
      <section className="hero-section">
        {/* Hero Content */}
        <motion.div
          className="hero-content"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.span
            className="small-text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
          >
            🍔 EASY WAY TO ORDER YOUR FOOD
          </motion.span>

          <motion.h1
            key={messageIndex} // Key change triggers re-render
            className="dynamic-text"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.7 }}
          >
            {messages[messageIndex]}
          </motion.h1>

          <motion.p
            className="hero-description"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
          >
            Just confirm your order and enjoy our delicious fastest delivery.
          </motion.p>

          {user ? (
            <motion.p
              className="welcome-message"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2 }}
            >
              👋 Welcome, <strong>{user.name}</strong>!
            </motion.p>
          ) : (
            <motion.p
              className="welcome-message"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2 }}
            >
              Sign in to get personalized offers!
            </motion.p>
          )}

          <motion.div
            className="button-group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <motion.button
              className="order-now"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/find-food")}
            >
              Order Now 🚀
            </motion.button>

            <motion.button
              className="see-menu"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/menus")}
             
            >
              See Menu 📖
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Hero Image */}
        <motion.div
          className="hero-image"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
        >
          <motion.img
            src={burgerImage}
            alt="Delicious Burger"
            className="food-image"
            whileHover={{ scale: 1.05 }}
          />
        </motion.div>
      </section>

      <SelectDemo />
    </>
  );
};

export default HeroSection;
