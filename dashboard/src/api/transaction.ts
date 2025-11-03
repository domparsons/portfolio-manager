import React from "react";
import { apiClient, ApiError } from "@/lib/api-client";
import { toast } from "sonner";
import { Transaction } from "@/types/custom-types";
import { usePortfolioMetrics } from "@/context/portfolio-context";

export const deleteTransaction = async (
  transactionId: number | undefined | null,
  user_id: string | null,
  refreshHistory: () => void,
) => {
  if (!user_id) return;
  const { refreshMetrics } = usePortfolioMetrics();

  try {
    await apiClient.delete("/transaction/", {
      params: {
        user_id,
        transaction_id: transactionId,
      },
    });
    refreshHistory();
  } catch (error) {
    const apiError = error as ApiError;
    console.error("Failed to delete transaction:", apiError);
    toast("Failed to delete transaction.");
  } finally {
    await refreshMetrics();
  }
};

export const getTransactionHistory = async (
  user_id: string | null,
  setTransactionHistory: React.Dispatch<React.SetStateAction<Transaction[]>>,
) => {
  if (!user_id) return;

  try {
    const data = await apiClient.get<Transaction[]>(`/transaction/${user_id}`, {
      params: { limit: 10 },
    });
    setTransactionHistory(data);
  } catch (error) {
    const apiError = error as ApiError;
    console.error("Error fetching transaction history:", apiError);
    toast("There was an error fetching transaction history.");
  }
};

export const useTransactionHistory = async (
  user_id: string,
  setTransactionHistory: (transactions: Transaction[]) => void,
) => {
  try {
    const data = await apiClient.get<Transaction[]>(`/transaction/${user_id}`, {
      params: { limit: 10 },
    });
    setTransactionHistory(data);
  } catch (error) {
    const apiError = error as ApiError;
    console.error("Error fetching transaction history:", apiError);
    toast("There was an error fetching transaction history.");
  }
};
