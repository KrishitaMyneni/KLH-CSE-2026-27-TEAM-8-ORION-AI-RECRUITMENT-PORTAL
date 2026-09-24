import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

function getStoredUser() {
  const storedUser = localStorage.getItem("orion_user");

  if (!storedUser) {
    return null;
  }

  return JSON.parse(storedUser);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);
  const [token, setToken] = useState(null);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);

    localStorage.setItem("orion_user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);

    localStorage.removeItem("orion_user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}