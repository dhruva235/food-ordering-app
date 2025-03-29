import "@radix-ui/themes/styles.css";
import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import NavigationMenuDemo from "./navbar/Navbar";
import HeroSection from "./hero/herosection";
import UserList from "./components/useList";


export default function App() {
  return (
    <Router>
      <NavigationMenuDemo />
      <Routes>
        <Route path="/" element={<HeroSection />} />
        <Route path="/manage-users" element={<UserList />} />
      </Routes>
    </Router>
  );
}
