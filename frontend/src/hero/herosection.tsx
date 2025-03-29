import React from "react";
import { Button } from "@radix-ui/themes";
import toast, { Toaster } from "react-hot-toast";
import "./HeroSection.css";
import burgerImage from "../assets/burger.avif";
import SelectDemo from "./bookingForm";
import UserList from "../components/useList";

const getUserFromStorage = () => {
  const userData = localStorage.getItem("user");
  return userData ? JSON.parse(userData) : null;
};

const HeroSection = () => {
  const user = getUserFromStorage();

  return (
    <>
      <Toaster position="top-right" /> {/* 🔔 Add toast notifications */}
      <section className="hero-section">
        <div className="hero-content">
          <span className="small-text">🍔 EASY WAY TO ORDER YOUR FOOD</span>
          <h1>Choosing Healthy & Fresh Food</h1>
          <p>Just confirm your order and enjoy our delicious fastest delivery.</p>

          {user ? (
            <p className="welcome-message">👋 Welcome, <strong>{user.name}</strong>!</p>
          ) : (
            <p className="welcome-message">Sign in to get personalized offers!</p>
          )}

          <div className="button-group">
            <Button className="order-now">Order Now</Button>
            <Button className="see-menu">See Menu</Button>
          </div>
        </div>

        <div className="hero-image">
          <img src={burgerImage} alt="Delicious Burger" />
        </div>
      </section>

      <SelectDemo />
      <UserList />
    </>
  );
};

export default HeroSection;
