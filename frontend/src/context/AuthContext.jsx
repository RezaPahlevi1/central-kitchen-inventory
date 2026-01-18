import { createContext, useContext } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // SEMENTARA (tanpa login)
  const admin = {
    id: 1,
    role: "superadmin",
  };

  return (
    <AuthContext.Provider value={{ admin }}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
