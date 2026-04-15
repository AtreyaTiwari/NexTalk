import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ChatHome from "./pages/ChatHome";

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token")
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setIsLogin(true);
  };

  if (isAuthenticated) {
    return <ChatHome onLogout={handleLogout} />;
  }

  return (
    <AnimatePresence mode="wait">
      {isLogin ? (
        <motion.div
          key="login"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
          transition={{ duration: 0.3 }}
        >
          <Login
            switchToRegister={() => setIsLogin(false)}
            onLoginSuccess={() => setIsAuthenticated(true)}
          />
        </motion.div>
      ) : (
        <motion.div
          key="register"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          <Register switchToLogin={() => setIsLogin(true)} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default App;