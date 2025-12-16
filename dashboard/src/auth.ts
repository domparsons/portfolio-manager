import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";

export const useAuthInit = () => {
  const { getAccessTokenSilently, isAuthenticated, user } = useAuth0();
  const [status, setStatus] = useState<
    "loading" | "approved" | "denied" | "error"
  >("loading");

  useEffect(() => {
    console.log("=== Effect fired ===");
    console.log("isAuthenticated:", isAuthenticated);
    console.log("user object:", user);
    console.log("user?.sub:", user?.sub);

    const initUser = async () => {
      console.log(">>> initUser started");
      try {
        console.log(">>> Getting token...");
        const token = await getAccessTokenSilently();
        console.log(">>> Got token");

        apiClient.setAuthToken(token);
        console.log("✅ Auth token set in API client");

        const auth0UserId = user?.sub;
        console.log(">>> auth0UserId:", auth0UserId);

        if (!auth0UserId) {
          console.log(">>> No user ID, returning");
          return;
        }

        console.log(">>> Making API call...");
        await apiClient.post("/user/create_or_get");
        console.log(">>> API SUCCESS");
        setStatus("approved");
        console.log(">>> Status set to approved");
      } catch (error: any) {
        console.error(">>> ERROR CAUGHT:", error);
        console.log(">>> Error status:", error?.status);
        if (error?.status === 403) {
          console.log(">>> Setting denied");
          setStatus("denied");
        } else {
          console.log(">>> Setting error");
          setStatus("error");
        }
      }
    };

    if (isAuthenticated) {
      console.log(">>> Calling initUser");
      initUser();
    } else {
      console.log(">>> Not authenticated, skipping");
    }
  }, [isAuthenticated, user, getAccessTokenSilently]);

  return { status }; // Return the status
};
