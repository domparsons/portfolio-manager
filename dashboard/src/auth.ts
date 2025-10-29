import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";
import { apiClient } from "@/lib/api-client";

export const useAuthInit = () => {
  const { getAccessTokenSilently, isAuthenticated, user } = useAuth0();

  useEffect(() => {
    const initUser = async () => {
      try {
        const token = await getAccessTokenSilently();
        const auth0UserId = user?.sub;

        if (!auth0UserId) {
          throw new Error("No user ID available");
        }

        apiClient.setAuthToken(token);
        localStorage.setItem("user_id", auth0UserId);

        await apiClient.post(`/user/create_or_get/${auth0UserId}`);
      } catch (error) {
        console.error("Failed to initialize user:", error);
        apiClient.setAuthToken(null);
      }
    };

    if (isAuthenticated) {
      initUser();
    }
  }, [isAuthenticated, getAccessTokenSilently]);
};
