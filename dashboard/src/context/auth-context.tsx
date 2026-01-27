import { useAuth0 } from "@auth0/auth0-react";
import { createContext, useContext, useEffect, ReactNode } from "react";
import { apiClient } from "@/lib/api-client";

interface AuthContextType {
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { getAccessTokenSilently, logout, isAuthenticated } = useAuth0();

  useEffect(() => {
    apiClient.registerAuthHelpers({
      getToken: () => getAccessTokenSilently(),
      logout: () => logout({ logoutParams: { returnTo: window.location.origin } }),
    });
  }, [getAccessTokenSilently, logout]);

  return (
    <AuthContext.Provider value={{ isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
