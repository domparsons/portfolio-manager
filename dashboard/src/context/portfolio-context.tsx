import React, { createContext, useContext, useState, useEffect } from "react";
import { apiClient, ApiError } from "@/lib/api-client";
import { toast } from "sonner";
import { PortfolioMetrics, PortfolioContextType } from "@/types/custom-types";

const PortfolioContext = createContext<PortfolioContextType | undefined>(
  undefined,
);

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [portfolioMetrics, setPortfolioMetrics] =
    useState<PortfolioMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const user_id = localStorage.getItem("user_id");

  const fetchMetrics = async () => {
    if (!user_id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await apiClient.get<PortfolioMetrics>(
        `/portfolio/portfolio_metrics/${user_id}`,
      );
      setPortfolioMetrics(data);
      setError(null);
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.status === 404) {
        setPortfolioMetrics(null);
        setError(null);
      } else {
        toast.error("Failed to load portfolio history");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [user_id]);

  return (
    <PortfolioContext.Provider
      value={{
        portfolioMetrics,
        loading,
        error,
        refreshMetrics: fetchMetrics,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolioMetrics = () => {
  const context = useContext(PortfolioContext);
  if (context === undefined) {
    throw new Error(
      "usePortfolioMetrics must be used within PortfolioProvider",
    );
  }
  return context;
};
