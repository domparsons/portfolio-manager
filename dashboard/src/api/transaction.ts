import React from "react";
import { apiClient, ApiError } from "@/lib/api-client";
import { toast } from "sonner";
import { Transaction } from "@/types/custom-types";

export const deleteTransaction = async (
  transactionId: number | undefined | null,
  user_id: string | null,
  refreshHistory: () => void,
  refreshMetrics: (() => Promise<void>) | (() => void),
) => {
  if (!user_id) return;

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
    try {
      await refreshMetrics();
    } catch (e) {
      console.error("Failed to refresh metrics:", e);
    }
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

export const getTransactionsByAsset = async (
  user_id: string | null,
  asset_id: number | null,
  setTransactionHistory: React.Dispatch<React.SetStateAction<Transaction[]>>,
) => {
  if (!user_id) return;

  try {
    const data = await apiClient.get<Transaction[]>(
      `/transaction/by_asset/${user_id}/${asset_id}`,
      {
        params: { limit: 10 },
      },
    );
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
    const data = await apiClient.get<Transaction[]>(
      `/transaction/${user_id}`,
      {},
    );
    setTransactionHistory(data);
  } catch (error) {
    const apiError = error as ApiError;
    console.error("Error fetching transaction history:", apiError);
    toast("There was an error fetching transaction history.");
  }
};
