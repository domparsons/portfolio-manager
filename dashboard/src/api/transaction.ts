import React from "react";
import { apiClient, ApiError } from "@/lib/api-client";
import { toast } from "sonner";
import { Asset, Transaction } from "@/types/custom-types";

export const deleteTransaction = async (
  transactionId: number | undefined | null,
  refreshHistory: () => void,
  refreshMetrics: (() => Promise<void>) | (() => void),
) => {
  try {
    await apiClient.delete("/transaction/", {
      params: {
        transaction_id: transactionId,
      },
    });
    toast("Transaction successfully deleted.");
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
  setTransactionHistory: React.Dispatch<React.SetStateAction<Transaction[]>>,
) => {
  try {
    const data = await apiClient.get<Transaction[]>("/transaction/", {
      params: { limit: 5 },
    });
    setTransactionHistory(data);
  } catch (error) {
    const apiError = error as ApiError;
    console.error("Error fetching transaction history:", apiError);
    toast("There was an error fetching transaction history.");
  }
};

export const getTransactionsByAsset = async (
  asset_id: number | null,
  setTransactionHistory: React.Dispatch<React.SetStateAction<Transaction[]>>,
) => {
  try {
    const data = await apiClient.get<Transaction[]>(
      `/transaction/by_asset/${asset_id}`,
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

export const createTransaction = async (
  asset: Asset,
  transactionType: "buy" | "sell",
  numberOfShares: number,
  executionPrice: number,
  executionDate: Date | undefined,
) => {
  await apiClient.post("/transaction/create", null, {
    params: {
      portfolio_name: "Placeholder",
      asset_id: asset.id,
      type: transactionType,
      quantity: numberOfShares,
      price: executionPrice,
      purchase_date: executionDate?.toISOString(),
      user_timezone: "Europe/London",
    },
  });
};
