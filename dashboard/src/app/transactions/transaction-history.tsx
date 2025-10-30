import { TableSkeleton } from "@/app/table-skeleton";
import React from "react";
import { getTransactionHistory } from "@/api/transaction";
import { TransactionHistoryTable } from "@/app/transactions/transaction-history-table";
import { Transaction } from "@/types/custom-types";

const TransactionHistory = () => {
  const [transactionHistory, setTransactionHistory] = React.useState<
    Transaction[]
  >([]);
  const user_id = localStorage.getItem("user_id");

  React.useEffect(() => {
    getTransactionHistory(user_id, setTransactionHistory);
  }, []);

  const refreshHistory = React.useCallback(() => {
    if (!user_id) return;
    getTransactionHistory(user_id, setTransactionHistory);
  }, [user_id]);

  React.useEffect(() => {
    refreshHistory();
  }, [refreshHistory]);

  return (
    <div>
      <div className={"flex items-center justify-between"}>
        <h1 className="text-2xl font-semibold">Transaction History</h1>
      </div>

      {transactionHistory.length === 0 ? (
        <TableSkeleton />
      ) : (
        <TransactionHistoryTable
          transactions={transactionHistory}
          onDelete={refreshHistory}
        />
      )}
    </div>
  );
};

export { TransactionHistory };
