import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";

/**
 * Detect if an error is a refresh token failure that requires re-authentication
 * Auth0 throws these specific error codes when the session cannot be silently restored
 */
const isRefreshTokenError = (error: any): boolean => {
  const errorCode = error?.error;
  const recoveryRequiredErrors = [
    "login_required",
    "consent_required",
    "invalid_grant",
    "interaction_required",
  ];
  return recoveryRequiredErrors.includes(errorCode);
};

export const useAuthInit = () => {
  const { getAccessTokenSilently, isAuthenticated, user, logout } = useAuth0();
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
        console.log(">>> Error code:", error?.error);

        // Check if this is a refresh token failure - user needs to re-authenticate
        if (isRefreshTokenError(error)) {
          console.log(">>> Refresh token expired, triggering logout");
          logout({ logoutParams: { returnTo: window.location.origin } });
          return; // Don't set error status, logout will handle redirect
        }

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
