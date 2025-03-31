import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import "./styles.css";

const getUserFromStorage = () => {
  const userData = localStorage.getItem("user");
  return userData ? JSON.parse(userData) : null;
};

const loginUser = async (credentials: { email: string; password: string }) => {
  const response = await fetch("http://127.0.0.1:5000/users/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    throw new Error("Invalid email or password");
  }

  return response.json(); // Expected { message, role, user_id, name }
};

const signUpUser = async (credentials: {
  name: string;
  email: string;
  password: string;
  role: string;
}) => {
  const response = await fetch("http://127.0.0.1:5000/users/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    throw new Error("Signup failed. Please try again.");
  }

  return response.json(); // Expected { message, role, user_id, name }
};

interface SignInModalProps {
  open: boolean;
  onClose: () => void;
  onLoginSuccess: (user: any) => void;
  isSignUp?: boolean;
}

const SignInModal: React.FC<SignInModalProps> = ({ open, onClose, onLoginSuccess, isSignUp = false }) => {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [role, setRole] = React.useState("user");
  const [errorMessage, setErrorMessage] = React.useState("");

  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      sessionStorage.setItem("user", JSON.stringify(data));
      onLoginSuccess(data);
      toast.success(`Welcome back, ${data.name}!`);
      setErrorMessage("");
      onClose();
    },
    onError: () => {
      setErrorMessage("Invalid email or password.");
      toast.error("Login failed. Please check your credentials.");
    },
  });

  const signUpMutation = useMutation({
    mutationFn: signUpUser,
    onSuccess: (data) => {
      sessionStorage.setItem("user", JSON.stringify(data));
      onLoginSuccess(data);
      toast.success(`Account created! Welcome, ${data.name}!`);
      setErrorMessage("");
      onClose();
    },
    onError: () => {
      setErrorMessage("Signup failed. Please check your details and try again.");
      toast.error("Signup failed. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (isSignUp) {
      if (password !== confirmPassword) {
        setErrorMessage("Passwords do not match.");
        toast.error("Passwords do not match.");
        return;
      }
      signUpMutation.mutate({ name, email, password, role });
    } else {
      const existingUser = getUserFromStorage();
      if (existingUser && existingUser.email === email) {
        setErrorMessage("You are already logged in.");
        toast("You are already logged in!", { icon: "ℹ️" });
        return;
      }
      loginMutation.mutate({ email, password });
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="dialog-content">
          <Dialog.Title className="dialog-title">{isSignUp ? "Sign Up" : "Sign In"}</Dialog.Title>
          <Dialog.Description className="dialog-description">
            {isSignUp ? "Create a new account." : "Enter your credentials to sign in."}
          </Dialog.Description>

          <form onSubmit={handleSubmit}>
            {isSignUp && (
              <>
                <div className="input-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="role">Role</label>
                  <select id="role" name="role" value={role} onChange={(e) => setRole(e.target.value)} required>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </>
            )}

            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {isSignUp && (
              <div className="input-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            )}

            {errorMessage && <p className="error-message" aria-live="polite">{errorMessage}</p>}

            <button type="submit" className="submit-button" disabled={loginMutation.isPending || signUpMutation.isPending}>
              {isSignUp
                ? signUpMutation.isPending
                  ? "Signing up..."
                  : "Sign Up"
                : loginMutation.isPending
                  ? "Logging in..."
                  : "Log In"}
            </button>
          </form>

          <Dialog.Close asChild>
            <button className="close-button">
              <Cross2Icon />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default SignInModal;
