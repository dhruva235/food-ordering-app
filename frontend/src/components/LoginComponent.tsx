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

interface SignInModalProps {
  open: boolean;
  onClose: () => void;
  onLoginSuccess: (user: any) => void;
}

const SignInModal: React.FC<SignInModalProps> = ({ open, onClose, onLoginSuccess }) => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");

  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      localStorage.setItem("user", JSON.stringify(data));
      onLoginSuccess(data);
      toast.success(`Welcome back, ${data.name}!`); // 🎉 Show success message
      setErrorMessage(""); 
      onClose();
    },
    onError: () => {
      setErrorMessage("Invalid email or password.");
      toast.error("Login failed. Please check your credentials."); // ❌ Show error message
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    
    e.preventDefault();
    setErrorMessage("");

    const existingUser = getUserFromStorage();
    if (existingUser && existingUser.email === email) {
      setErrorMessage("You are already logged in.");
      toast("You are already logged in!", { icon: "ℹ️" });
      return;
    }

    loginMutation.mutate({ email, password });
  };

  return (
    <Dialog.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="dialog-content">
          <Dialog.Title className="dialog-title">Sign In</Dialog.Title>
          <Dialog.Description className="dialog-description">
            Enter your email and password to sign in.
          </Dialog.Description>

          <form onSubmit={handleLogin}>
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

            {errorMessage && <p className="error-message" aria-live="polite">{errorMessage}</p>}

            <button type="submit" className="submit-button" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? "Logging in..." : "Log In"}
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
