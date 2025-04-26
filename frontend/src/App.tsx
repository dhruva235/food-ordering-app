import "@radix-ui/themes/styles.css";
import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import NavigationMenuDemo from "./navbar/Navbar";
import HeroSection from "./hero/herosection";
import UserList from "./components/useList";
import FindFood from "./components/food/FindFood";
import OrderList from "./components/food/Oderlist";
import UserOrders from "./components/food/UserOrders";
import TableView from "./components/tables/tableview";
import BookingsView from "./components/bookings/Bookings";

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
        <Route path="/old" element={<UserOrders userId="9daa1b20-2f99-4c35-8f77-2f390adab1f8" />
       
}/>
 <Route path="/tables" element={<TableView/>}/>
 <Route path="/bookings" element={<BookingsView/>}/>
      </Routes>
    </Router>
  );
}
