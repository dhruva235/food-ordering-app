import * as React from "react";
import { Link } from "react-router-dom";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import { BellIcon } from "@radix-ui/react-icons";
import fastFoodLogo from "../assets/fastfood.png";
import "./styles.css";
import SignInModal from "@/components/LoginComponent";

const getUserFromStorage = () => {
  const userData = sessionStorage.getItem("user");
  return userData ? JSON.parse(userData) : null;
};

const NavigationMenuDemo = () => {
  const [isSignInOpen, setSignInOpen] = React.useState(false);
  const [isSignUp, setIsSignUp] = React.useState(false);
  const [user, setUser] = React.useState(getUserFromStorage());

  const handleAuthClick = (signUp = false) => {
    setIsSignUp(signUp);
    setSignInOpen(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("user"); // Clear user data
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

          {/* Show Pending Orders for users */}
          {user && (
            <NavigationMenu.Item>
              <Link to="/pending_orders" className="nav-link">Pending Orders</Link>
            </NavigationMenu.Item>
          )}

          {/* Show "old" link for all authenticated users */}
          {user && (
            <NavigationMenu.Item>
              <Link to="/old" className="nav-link">Old</Link>
            </NavigationMenu.Item>
          )}

          {/* Show "Tables" for all authenticated users */}
          { (
            <NavigationMenu.Item>
              <Link to="/tables" className="nav-link">Tables</Link>
            </NavigationMenu.Item>
          )}

          {/* Show "Bookings" for all authenticated users */}
          {  (
            <NavigationMenu.Item>
              <Link to="/bookings" className="nav-link">Bookings</Link>
            </NavigationMenu.Item>
          )}

{  (
            <NavigationMenu.Item>
              <Link to="/create" className="nav-link">Add Food</Link>
            </NavigationMenu.Item>
          )}

          {/* Show "Manage Users" only for admins */}
          {user && user.role === "admin" && (
            <NavigationMenu.Item>
              <Link to="/manage-users" className="nav-link">Manage Users</Link>
            </NavigationMenu.Item>
          )}

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
            <>
              <NavigationMenu.Item>
                <button className="auth-button sign-in" onClick={() => handleAuthClick(false)}>
                  Sign In
                </button>
              </NavigationMenu.Item>
              <NavigationMenu.Item>
                <button className="auth-button sign-up" onClick={() => handleAuthClick(true)}>
                  Sign Up
                </button>
              </NavigationMenu.Item>
            </>
          )}
        </NavigationMenu.List>
      </NavigationMenu.Root>

      {/* Sign In / Sign Up Modal */}
      <SignInModal
        open={isSignInOpen}
        onClose={() => setSignInOpen(false)}
        onLoginSuccess={setUser}
        isSignUp={isSignUp}
      />
    </>
  );
};

export default NavigationMenuDemo;
