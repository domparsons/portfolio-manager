import { apiClient, ApiError } from "@/lib/api-client";

export const getUsername = async () => {
  try {
    return await apiClient.get(`/user/name`);
  } catch (error) {
    const apiError = error as ApiError;
    console.error("Error fetching username:", apiError);
    return null;
  }
};

export const updateUsername = async (username: string) => {
  try {
    return await apiClient.put(`/user/name?username=${username}`);
  } catch (error) {
    const apiError = error as ApiError;
    console.error("Error updating username:", apiError);
    return null;
  }
};
