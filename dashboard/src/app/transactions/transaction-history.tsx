import { TableSkeleton } from "@/app/table-skeleton";
import React from "react";
import { getTransactionHistory } from "@/api/transaction";
import { TransactionHistoryTable } from "@/app/transactions/transaction-history-table";
import { Transaction } from "@/types/custom-types";
import { EmptyComponent } from "@/app/empty-component";

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
        // <TableSkeleton />
        <EmptyComponent
          title={"No Transactions Yet"}
          description={
            "You haven't created any transactions yet. Get started by creating\n" +
            "your first transaction in the Assets List."
          }
        />
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
