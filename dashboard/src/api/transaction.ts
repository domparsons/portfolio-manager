import React from "react";

export interface Transaction {
  id: number;
  timestamp: string;
  quantity: number;
  asset_name: string;
  ticker: string;
  type: TransactionType;
  price: number;
}

export interface TransactionTableProps {
  transactions: Transaction[];
  onDelete: (transactionId: string) => void;
}

type TransactionType = "buy" | "sell";

export const deleteTransaction = async (
  transactionId: number,
  user_id: string | null,
  refreshHistory: () => void,
) => {
  await fetch(
    `http://localhost:8000/transaction/?user_id=${user_id}&transaction_id=${transactionId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  refreshHistory();
};

export const getTransactionHistory = async (
  user_id: string | null,
  setTransactionHistory: React.Dispatch<React.SetStateAction<Transaction[]>>,
) => {
  const response = await fetch(
    `http://localhost:8000/transaction/${user_id}?limit=${10}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  const data = await response.json();
  setTransactionHistory(data);
};
