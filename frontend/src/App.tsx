import "@radix-ui/themes/styles.css";
import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import NavigationMenuDemo from "./navbar/Navbar";
import HeroSection from "./hero/herosection";
import UserList from "./components/useList";
import FindFood from "./components/food/FindFood";
import OrderList from "./components/food/Oderlist";
import UserOrders from "./components/food/UserOrders";

export default function App() {
  return (
    <Router>
      {/* ✅ Navigation Always Present */}
      <NavigationMenuDemo />

      {/* ✅ Page Content Changes, but Navigation Stays */}
      <Routes>
        <Route path="/" element={<HeroSection />} />
        <Route path="/manage-users" element={<UserList />} />
        <Route path = '/find-food' element={<FindFood/>}/>
        <Route path="/pending_orders" element={<OrderList/>}/>
        <Route path="/old" element={<UserOrders userId="0f0f8193-08f2-45a8-8476-29a1dd5052c5" />
}/>
      </Routes>
    </Router>
  );
}
