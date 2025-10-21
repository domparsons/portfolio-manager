import { useAuth0 } from "@auth0/auth0-react";
import { jwtDecode } from "jwt-decode";
import { useEffect } from "react";
import { apiClient } from "@/lib/api-client";

export const useAuthInit = () => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  useEffect(() => {
    const initUser = async () => {
      try {
        const token = await getAccessTokenSilently();
        const decoded = jwtDecode(token);
        const auth0UserId = decoded.sub;

        // Set auth token for all subsequent API calls
        apiClient.setAuthToken(token);

        await apiClient.post(`/user/create_or_get/${auth0UserId}`);
      } catch (error) {
        console.error("Failed to initialize user:", error);
        // Clear auth token on error
        apiClient.setAuthToken(null);
      }
    };

    if (isAuthenticated) {
      initUser();
    }
  }, [isAuthenticated, getAccessTokenSilently]);
};
