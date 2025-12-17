import React from "react";
import { getTransactionHistory } from "@/api/transaction";
import { TransactionHistoryTable } from "@/app/transactions/transaction-history-table";
import { Transaction } from "@/types/custom-types";
import { EmptyComponent } from "@/app/empty-component";
import { useAuth0 } from "@auth0/auth0-react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api-client";
import { Spinner } from "@/components/ui/spinner";

const TransactionHistory = () => {
  const [transactionHistory, setTransactionHistory] = React.useState<
    Transaction[]
  >([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  const { user } = useAuth0();
  const user_id = user?.sub ?? null;

  const loadHistory = async () => {
    if (!user_id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await getTransactionHistory(setTransactionHistory);
    } catch (error) {
      const apiError = error as ApiError;
      console.error("Failed to load transaction history:", apiError);
      setError("Failed to load transaction history");

      if (apiError.status >= 500) {
        toast.error("Server error loading transactions");
      } else {
        toast.error("Failed to load transactions");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const refreshHistory = React.useCallback(() => {
    loadHistory();
  }, [user_id]);

  React.useEffect(() => {
    refreshHistory();
  }, [refreshHistory]);

  if (isLoading) {
    return (
      <div>
        <h1 className="text-2xl font-semibold mb-4">Transaction History</h1>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Spinner className={"size-5"} />
            <p className="text-gray-500">Loading transactions...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-semibold mb-4">Transaction History</h1>
        <EmptyComponent
          title="Failed to Load Transactions"
          description={error}
        />
      </div>
    );
  }

  return (
    <div>
      <div className={"flex items-center justify-between"}>
        <h1 className="text-2xl font-semibold">Transaction History</h1>
      </div>

      {transactionHistory.length === 0 ? (
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
