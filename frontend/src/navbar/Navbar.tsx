import * as React from "react";
import { Link } from "react-router-dom";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import { BellIcon } from "@radix-ui/react-icons";
import fastFoodLogo from "../assets/fastfood.png";
import "./styles.css";
import SignInModal from "@/components/LoginComponent";

const getUserFromStorage = () => {
  const userData = localStorage.getItem("user");
  return userData ? JSON.parse(userData) : null;
};

const NavigationMenuDemo = () => {
  const [isSignInOpen, setSignInOpen] = React.useState(false);
  const [user, setUser] = React.useState(getUserFromStorage());

  const handleSignInClick = () => setSignInOpen(true);

  const handleLogout = () => {
    localStorage.removeItem("user"); // Clear user data
    setUser(null); // Update state
  };

  return (
    <>
      <NavigationMenu.Root className="nav-menu">
        <NavigationMenu.NavigationMenuItem>
          <Link to="/">
            <img src={fastFoodLogo} alt="Fast Food Logo" className="logo" />
          </Link>
        </NavigationMenu.NavigationMenuItem>

        <NavigationMenu.List className="nav-list">
          <NavigationMenu.Item>
            <Link to="/find-food" className="nav-link">Find Food</Link>
          </NavigationMenu.Item>

       { user && user.role == "admin" &&  <NavigationMenu.Item>
            <Link to="/manage-users" className="nav-link">Manage Users</Link>
          </NavigationMenu.Item>}

          <NavigationMenu.Item>
            <button className="icon-button">
              <BellIcon className="notification-icon" />
            </button>
          </NavigationMenu.Item>

          {/* Conditional rendering based on login status */}
          {user ? (
            <NavigationMenu.Item>
              <button className="auth-button logout" onClick={handleLogout}>
                Logout
              </button>
            </NavigationMenu.Item>
          ) : (
            <NavigationMenu.Item>
              <button className="auth-button sign-in" onClick={handleSignInClick}>
                Sign In
              </button>
            </NavigationMenu.Item>
            //   <NavigationMenu.Item>
            //   <button className="auth-button sign-in" onClick={handleSignInClick}>
            //     Sign Up
            //   </button>
            // </NavigationMenu.Item>
          )}
        </NavigationMenu.List>
      </NavigationMenu.Root>

      {/* Sign In Modal */}
      <SignInModal open={isSignInOpen} onClose={() => setSignInOpen(false)} onLoginSuccess={setUser} />
    </>
  );
};

export default NavigationMenuDemo;
